const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Content = require('../models/Content');
const Chapter = require('../models/Chapter');
const Rating = require('../models/Rating');
const AdViewLog = require('../models/AdViewLog');
const { auth, optionalAuth, requirePro } = require('../middleware/auth');
const realtimeService = require('../services/realtimeService');

const router = express.Router();

// @route   GET /api/content
// @desc    Get all content with filtering and pagination
// @access  Public
router.get('/', [
  query('type').optional().isIn(['novel', 'ebook', 'comic', 'manga']),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'rating']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().isLength({ max: 100 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      type,
      sort = 'newest',
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build filter query
    const filter = { status: 'published' };
    if (type) filter.contentType = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort query
    let sortQuery = {};
    switch (sort) {
      case 'newest':
        sortQuery = { publishedAt: -1 };
        break;
      case 'oldest':
        sortQuery = { publishedAt: 1 };
        break;
      case 'popular':
        sortQuery = { weeklyViewCount: -1 };
        break;
      case 'rating':
        sortQuery = { averageRating: -1, ratingCount: -1 };
        break;
      default:
        sortQuery = { publishedAt: -1 };
    }

    const skip = (page - 1) * limit;

    const content = await Content.find(filter)
      .populate('authorId', 'username profileImage')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments(filter);

    // Add accessibility info for each content
    const contentWithAccess = content.map(item => ({
      ...item.toObject(),
      isAccessible: item.isAccessibleTo(req.user),
      isInMyList: req.user ? req.user.myList.includes(item._id) : false
    }));

    res.json({
      content: contentWithAccess,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content/:id
// @desc    Get single content by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('authorId', 'username profileImage bio')
      .populate({
        path: 'chapters',
        match: { isPublished: true },
        options: { sort: { chapterNumber: 1 } }
      });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has access
    if (!content.isAccessibleTo(req.user)) {
      return res.status(403).json({ 
        message: 'Content requires purchase',
        price: content.price,
        monetizationType: content.monetizationType
      });
    }

    // Increment view count
    await content.incrementViewCount();

    // Log ad view for content open (if not pro user)
    if (req.user && !req.user.isPro()) {
      await AdViewLog.create({
        userId: req.user._id,
        contentId: content._id,
        adType: 'content_open',
        adRevenueAmount: 0.01, // Placeholder - would be calculated by ad provider
        adId: `content_open_${content._id}_${Date.now()}`,
        pageUrl: req.originalUrl
      });
    }

    res.json({
      ...content.toObject(),
      isAccessible: true,
      isInMyList: req.user ? req.user.myList.includes(content._id) : false
    });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content/:id/chapters
// @desc    Get chapters for content
// @access  Public
router.get('/:id/chapters', optionalAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has access
    if (!content.isAccessibleTo(req.user)) {
      return res.status(403).json({ 
        message: 'Content requires purchase',
        price: content.price,
        monetizationType: content.monetizationType
      });
    }

    const chapters = await Chapter.find({
      contentId: req.params.id,
      isPublished: true
    }).sort({ chapterNumber: 1 });

    res.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content/:id/chapters/:chapterNumber
// @desc    Get specific chapter
// @access  Public
router.get('/:id/chapters/:chapterNumber', optionalAuth, async (req, res) => {
  try {
    const { id, chapterNumber } = req.params;
    
    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has access
    if (!content.isAccessibleTo(req.user)) {
      return res.status(403).json({ 
        message: 'Content requires purchase',
        price: content.price,
        monetizationType: content.monetizationType
      });
    }

    const chapter = await Chapter.findOne({
      contentId: id,
      chapterNumber: parseInt(chapterNumber),
      isPublished: true
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Log ad view for per-chapter (if not pro user and not first chapter)
    if (req.user && !req.user.isPro() && parseInt(chapterNumber) > 1) {
      await AdViewLog.create({
        userId: req.user._id,
        contentId: content._id,
        adType: 'per_chapter',
        adRevenueAmount: 0.005, // Placeholder - would be calculated by ad provider
        adId: `per_chapter_${content._id}_${chapterNumber}_${Date.now()}`,
        chapterNumber: parseInt(chapterNumber),
        pageUrl: req.originalUrl
      });
    }

    // Get next and previous chapters
    const [nextChapter, previousChapter] = await Promise.all([
      chapter.getNextChapter(),
      chapter.getPreviousChapter()
    ]);

    res.json({
      ...chapter.toObject(),
      readingContent: chapter.getReadingContent(),
      nextChapter: nextChapter ? {
        chapterNumber: nextChapter.chapterNumber,
        chapterTitle: nextChapter.chapterTitle
      } : null,
      previousChapter: previousChapter ? {
        chapterNumber: previousChapter.chapterNumber,
        chapterTitle: previousChapter.chapterTitle
      } : null
    });
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('contentType').isIn(['novel', 'ebook', 'comic', 'manga']).withMessage('Invalid content type'),
  body('monetizationType').isIn(['free_ad_share', 'premium_to_buy']).withMessage('Invalid monetization type'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      coverImageURL,
      contentType,
      monetizationType,
      price = 0,
      tags = []
    } = req.body;

    // Check if user can create premium content
    if (monetizationType === 'premium_to_buy' && !req.user.isPro()) {
      return res.status(403).json({ 
        message: 'Pro subscription required for premium content',
        code: 'PRO_REQUIRED'
      });
    }

    const content = new Content({
      title,
      description,
      coverImageURL,
      authorId: req.user._id,
      contentType,
      monetizationType,
      price: monetizationType === 'premium_to_buy' ? price : 0,
      tags
    });

    await content.save();

    // Emit realtime event
    realtimeService.emitContentCreated(content);

    res.status(201).json({
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private (Author only)
router.put('/:id', auth, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('monetizationType').optional().isIn(['free_ad_share', 'premium_to_buy']).withMessage('Invalid monetization type'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user is the author
    if (!content.authorId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }

    const updateData = req.body;
    
    // Check if user can create premium content
    if (updateData.monetizationType === 'premium_to_buy' && !req.user.isPro()) {
      return res.status(403).json({ 
        message: 'Pro subscription required for premium content',
        code: 'PRO_REQUIRED'
      });
    }

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Emit realtime event
    realtimeService.emitContentUpdated(updatedContent);

    res.json({
      message: 'Content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user is the author
    if (!content.authorId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }

    // Delete associated chapters
    await Chapter.deleteMany({ contentId: req.params.id });
    
    // Delete associated ratings
    await Rating.deleteMany({ contentId: req.params.id });
    
    // Delete associated ad logs
    await AdViewLog.deleteMany({ contentId: req.params.id });

    await Content.findByIdAndDelete(req.params.id);

    // Emit realtime event
    realtimeService.emitContentDeleted(req.params.id);

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content/:id/rate
// @desc    Rate content
// @access  Private
router.post('/:id/rate', auth, [
  body('ratingValue').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 1000 }).withMessage('Review must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { ratingValue, review = '' } = req.body;
    const contentId = req.params.id;

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has access to rate
    if (!content.isAccessibleTo(req.user)) {
      return res.status(403).json({ message: 'Content requires purchase to rate' });
    }

    // Create or update rating
    const rating = await Rating.findOneAndUpdate(
      { userId: req.user._id, contentId },
      { ratingValue, review },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Rating submitted successfully',
      rating
    });
  } catch (error) {
    console.error('Rate content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content/:id/add-to-list
// @desc    Add content to user's list
// @access  Private
router.post('/:id/add-to-list', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    req.user.addToList(req.params.id);
    await req.user.save();

    res.json({ message: 'Content added to list successfully' });
  } catch (error) {
    console.error('Add to list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/content/:id/remove-from-list
// @desc    Remove content from user's list
// @access  Private
router.delete('/:id/remove-from-list', auth, async (req, res) => {
  try {
    req.user.removeFromList(req.params.id);
    await req.user.save();

    res.json({ message: 'Content removed from list successfully' });
  } catch (error) {
    console.error('Remove from list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
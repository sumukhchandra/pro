import express from 'express';
import Content from '../models/Content.js';
import Chapter from '../models/Chapter.js';
import Rating from '../models/Rating.js';
import PurchasedContent from '../models/PurchasedContent.js';
import auth from '../middleware/auth.js';
import realtimeService from '../services/realtimeService.js';

const router = express.Router();

const isPro = (user) => user?.userRole === 'pro';

// Create new content (Creator Studio) - all users can create, but only Pro can set premium_to_buy
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, coverImageURL, contentType, monetizationType, price, tags } = req.body;
    const authorId = req.user.id;

    const effectiveMonetization = monetizationType === 'premium_to_buy' && isPro(req.user)
      ? 'premium_to_buy'
      : 'free_ad_share';

    const content = await Content.create({
      title,
      description,
      coverImageURL,
      authorId,
      contentType,
      monetizationType: effectiveMonetization,
      price: effectiveMonetization === 'premium_to_buy' ? Math.max(0, Number(price || 0)) : 0,
      tags,
      isPublished: false,
    });

    // Emit realtime event
    realtimeService.emitContentCreated(content);

    res.status(201).json(content);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create content' });
  }
});

// Update content metadata (only author)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const content = await Content.findById(id);
    if (!content) return res.status(404).json({ message: 'Not found' });
    if (content.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (updates.monetizationType === 'premium_to_buy' && !isPro(req.user)) {
      updates.monetizationType = 'free_ad_share';
      updates.price = 0;
    }

    Object.assign(content, updates);
    await content.save();
    
    // Emit realtime event
    realtimeService.emitContentUpdated(content);
    
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update content' });
  }
});

// Publish content (toggle)
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Not found' });
    if (content.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { isPublished } = req.body;
    content.isPublished = !!isPublished;
    await content.save();
    
    // Emit realtime event
    realtimeService.emitContentUpdated(content);
    
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to publish content' });
  }
});

// Query content list with filters and search
router.get('/', auth, async (req, res) => {
  try {
    const { type, q, monetization, tags, page = 1, limit = 24 } = req.query;
    const filter = { isPublished: true };
    if (type) filter.contentType = type;
    if (monetization) filter.monetizationType = monetization;
    if (tags) filter.tags = { $in: (Array.isArray(tags) ? tags : String(tags).split(',')).map((t) => t.trim()) };
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Content.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Content.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

// List my content (author dashboard)
router.get('/mine', auth, async (req, res) => {
  try {
    const items = await Content.find({ authorId: req.user.id }).sort({ updatedAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch my content' });
  }
});

// Top 10 weekly by type
router.get('/top', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isPublished: true };
    if (type) filter.contentType = type;
    const items = await Content.find(filter).sort({ weeklyViewCount: -1 }).limit(10).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch top content' });
  }
});

// Get content detail with purchase/access info
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id).lean();
    if (!content) return res.status(404).json({ message: 'Not found' });

    const isAuthor = content.authorId.toString() === req.user.id;
    let hasPurchased = false;
    if (content.monetizationType === 'premium_to_buy') {
      const purchase = await PurchasedContent.findOne({ userId: req.user.id, contentId: id });
      hasPurchased = !!purchase;
    }

    res.json({ ...content, isAuthor, hasPurchased });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch content detail' });
  }
});

// Rate content
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { ratingValue } = req.body;
    const { id } = req.params;
    const value = Math.max(1, Math.min(5, Number(ratingValue)));
    await Rating.findOneAndUpdate(
      { userId: req.user.id, contentId: id },
      { $set: { ratingValue: value } },
      { upsert: true }
    );
    // Recompute average
    const agg = await Rating.aggregate([
      { $match: { contentId: new (await import('mongoose')).default.Types.ObjectId(id) } },
      { $group: { _id: '$contentId', avg: { $avg: '$ratingValue' }, count: { $sum: 1 } } },
    ]);
    const avg = agg[0]?.avg || 0;
    const count = agg[0]?.count || 0;
    await Content.findByIdAndUpdate(id, { $set: { averageRating: avg, ratingsCount: count } });
    
    // Emit realtime event
    realtimeService.emitContentRated(id, { ratingValue: value, averageRating: avg, ratingsCount: count });
    
    res.json({ message: 'Rated', averageRating: avg, ratingsCount: count });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to rate content' });
  }
});

// Purchase premium content (stub)
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);
    if (!content) return res.status(404).json({ message: 'Not found' });
    if (content.monetizationType !== 'premium_to_buy') return res.status(400).json({ message: 'Content is not premium' });

    const existing = await PurchasedContent.findOne({ userId: req.user.id, contentId: id });
    if (existing) return res.json({ message: 'Already purchased' });

    const pricePaid = content.price;
    await PurchasedContent.create({ userId: req.user.id, contentId: id, pricePaid, paymentRef: 'sandbox' });
    
    // Emit realtime event
    realtimeService.emitPaymentCompleted(req.user.id, { contentId: id, pricePaid, type: 'content_purchase' });
    
    res.json({ message: 'Purchased', pricePaid });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to purchase' });
  }
});

// Toggle my list
router.post('/:id/my-list', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = (await import('mongoose')).default;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const contentId = new mongoose.Types.ObjectId(id);
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(userId);
    const exists = user.myList.some((c) => c.toString() === id);
    if (exists) {
      user.myList = user.myList.filter((c) => c.toString() !== id);
      await user.save();
      
      // Emit realtime event
      realtimeService.emitNotification(req.user.id, { 
        type: 'list_update', 
        message: 'Content removed from your list',
        contentId: id 
      });
      
      return res.json({ message: 'Removed from list' });
    } else {
      user.myList.push(contentId);
      await user.save();
      
      // Emit realtime event
      realtimeService.emitNotification(req.user.id, { 
        type: 'list_update', 
        message: 'Content added to your list',
        contentId: id 
      });
      
      return res.json({ message: 'Added to list' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update list' });
  }
});

// Increment view count on content open (for weekly top)
router.post('/:id/open', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Content.findByIdAndUpdate(id, { $inc: { weeklyViewCount: 1 } });
    
    // Emit realtime event
    realtimeService.emitContentViewed(id, req.user.id);
    
    res.json({ message: 'Open recorded' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to record open' });
  }
});

// Provide full content+chapters for offline download (Pro only)
router.get('/:id/download', auth, async (req, res) => {
  try {
    if (!isPro(req.user)) return res.status(403).json({ message: 'Pro required' });
    const { id } = req.params;
    const content = await Content.findById(id).lean();
    if (!content) return res.status(404).json({ message: 'Not found' });

    if (content.monetizationType === 'premium_to_buy') {
      const purchase = await PurchasedContent.findOne({ userId: req.user.id, contentId: id });
      const isAuthor = content.authorId.toString() === req.user.id;
      if (!purchase && !isAuthor) return res.status(403).json({ message: 'Not purchased' });
    }

    const chapters = await Chapter.find({ contentId: id }).sort({ chapterNumber: 1 }).lean();
    res.json({ content, chapters });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to download' });
  }
});

export default router;

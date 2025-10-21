import express from 'express';
import Chapter from '../models/Chapter.js';
import Content from '../models/Content.js';
import PurchasedContent from '../models/PurchasedContent.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const canAccessPremium = async (userId, content) => {
  const isAuthor = content.authorId.toString() === userId;
  if (isAuthor) return true;
  const purchase = await PurchasedContent.findOne({ userId, contentId: content._id });
  return !!purchase;
};

// List chapters metadata for a content
router.get('/:contentId/list', auth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const content = await Content.findById(contentId);
    if (!content || !content.isPublished) return res.status(404).json({ message: 'Not found' });

    const chapters = await Chapter.find({ contentId }).sort({ chapterNumber: 1 }).select('chapterNumber chapterTitle chapterType').lean();
    res.json(chapters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list chapters' });
  }
});

// Get a chapter (enforces monetization rules)
router.get('/:contentId', auth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { chapter: chapterNumber } = req.query;
    const content = await Content.findById(contentId);
    if (!content || !content.isPublished) return res.status(404).json({ message: 'Not found' });

    if (content.monetizationType === 'premium_to_buy') {
      const ok = await canAccessPremium(req.user.id, content);
      if (!ok) return res.status(402).json({ message: 'Payment required' });
    }

    const chapter = await Chapter.findOne({ contentId, chapterNumber: Number(chapterNumber) });
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chapter' });
  }
});

// Create chapter (author only)
router.post('/:contentId', auth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { chapterTitle, chapterNumber, chapterType, textContent, imageURLs } = req.body;
    const content = await Content.findById(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    if (content.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const chapter = await Chapter.create({
      contentId,
      chapterTitle,
      chapterNumber,
      chapterType,
      textContent,
      imageURLs,
    });
    res.status(201).json(chapter);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create chapter' });
  }
});

// Update chapter (author only)
router.put('/:chapterId', auth, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { chapterTitle, chapterNumber, chapterType, textContent, imageURLs } = req.body;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Not found' });
    const content = await Content.findById(chapter.contentId);
    if (!content || content.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (chapterTitle !== undefined) chapter.chapterTitle = chapterTitle;
    if (chapterNumber !== undefined) chapter.chapterNumber = chapterNumber;
    if (chapterType !== undefined) chapter.chapterType = chapterType;
    if (textContent !== undefined) chapter.textContent = textContent;
    if (imageURLs !== undefined) chapter.imageURLs = imageURLs;

    await chapter.save();
    res.json(chapter);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update chapter' });
  }
});

export default router;

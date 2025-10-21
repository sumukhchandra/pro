import express from 'express';
import { Content } from '../models/Content.js';
import { Like } from '../models/Like.js';
import { authMiddleware } from '../util/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { type, sort } = req.query;
  const filter = {};
  if (type) filter.type = type;
  let query = Content.find(filter);
  if (sort === 'newest') {
    query = query.sort({ createdAt: -1 });
  }
  const items = await query.limit(100).lean();
  res.json(items);
});

router.get('/most-liked', async (req, res) => {
  const { type } = req.query;
  const matchStage = type ? { $match: { type } } : { $match: {} };
  const pipeline = [
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'contentId',
        as: 'likes'
      }
    },
    { $addFields: { likeCount: { $size: '$likes' } } },
    matchStage,
    { $sort: { likeCount: -1 } },
    { $limit: 50 },
    { $project: { likes: 0 } }
  ];
  const results = await Content.aggregate(pipeline);
  res.json(results);
});

router.post('/:id/save', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  await Like.updateOne({ userId: user._id, contentId: id }, {}, { upsert: true, setDefaultsOnInsert: true });
  await Content.findById(id); // ensure exists
  await user.updateOne({ $addToSet: { savedList: id } });
  res.json({ ok: true });
});

router.delete('/:id/save', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  await Like.deleteOne({ userId: user._id, contentId: id });
  await user.updateOne({ $pull: { savedList: id } });
  res.json({ ok: true });
});

export default router;

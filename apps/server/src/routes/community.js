import express from 'express';
import { Channel } from '../models/Channel.js';
import { Message } from '../models/Message.js';
import { DirectMessage } from '../models/DirectMessage.js';
import { authMiddleware } from '../util/authMiddleware.js';

const router = express.Router();

router.get('/channels', authMiddleware, async (req, res) => {
  const channels = await Channel.find({}).lean();
  res.json(channels);
});

router.get('/channels/:id/messages', authMiddleware, async (req, res) => {
  const messages = await Message.find({ channelId: req.params.id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json(messages.reverse());
});

router.post('/channels/:id/messages', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const message = await Message.create({ channelId: req.params.id, senderId: req.user._id, content });
  res.status(201).json(message);
});

router.post('/dm', authMiddleware, async (req, res) => {
  const { userId } = req.body;
  const participants = [req.user._id, userId].sort();
  let dm = await DirectMessage.findOne({ participants });
  if (!dm) dm = await DirectMessage.create({ participants });
  res.json(dm);
});

router.get('/dm/:id/messages', authMiddleware, async (req, res) => {
  const messages = await Message.find({ directMessageId: req.params.id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json(messages.reverse());
});

router.post('/dm/:id/messages', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const message = await Message.create({ directMessageId: req.params.id, senderId: req.user._id, content });
  res.status(201).json(message);
});

export default router;

import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Placeholder route for testing authentication and router setup
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Chat API test successful', user: req.user });
});

router.get('/messages/:recipientId', auth, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
      .sort('timestamp')
      .populate('sender', 'username profile.avatar')
      .populate('recipient', 'username profile.avatar');

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TODO: Implement actual chat management routes here:
// - Get chat room message history (if ChatRoom model is implemented)

export default router;

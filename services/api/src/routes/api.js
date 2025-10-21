import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// This is a placeholder test route
router.get('/test', auth, (req, res) => {
  res.json({ message: 'API test successful', user: req.user });
});

// Route to get all users
router.get('/users', auth, async (req, res) => {
  try {
    // Find all users, but only select their id and email fields
    // Also, exclude the current user from the list
    const users = await User.find({ _id: { $ne: req.user.id } }).select('id email');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
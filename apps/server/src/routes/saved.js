import express from 'express';
import { authMiddleware } from '../util/authMiddleware.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const me = await User.findById(req.user._id).populate('savedList');
  res.json(me.savedList || []);
});

export default router;

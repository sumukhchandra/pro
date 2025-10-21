import express from 'express';
import AdViewLog from '../models/AdViewLog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Log an ad view
router.post('/log', auth, async (req, res) => {
  try {
    const { contentId, adPlacement, adRevenueAmount = 0 } = req.body;
    const log = await AdViewLog.create({
      userId: req.user.id,
      contentId,
      adPlacement,
      adRevenueAmount: Number(adRevenueAmount) || 0,
    });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to log ad view' });
  }
});

export default router;

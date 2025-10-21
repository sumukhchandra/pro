import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Placeholder route for testing authentication and router setup
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Games API test successful', user: req.user });
});

router.get('/activities', auth, (req, res) => {
  // For now, a static list of activities/games
  const activities = [
    { id: '1', name: 'Couple\'s Quiz', description: 'Test your knowledge about each other!', type: 'quiz' },
    { id: '2', name: 'Date Night Idea Generator', description: 'Get random date ideas.', type: 'generator' },
    { id: '3', name: 'Shared To-Do List', description: 'Plan tasks together.', type: 'list' },
    { id: '4', name: 'Never Have I Ever', description: 'A fun game to learn more about friends/partner.', type: 'game' },
  ];
  res.status(200).json(activities);
});

router.post('/activities/:activityId/result', auth, async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;
    const { score, details } = req.body; // Example: score for a quiz, details for a generated idea

    // In a real application, you would save this result to a database
    // For now, we'll just log it and send a success response.
    console.log(`User ${userId} submitted result for activity ${activityId}: Score - ${score}, Details - ${JSON.stringify(details)}`);

    res.status(200).json({ message: 'Activity result submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TODO: Implement actual game/activity management routes here:
// - Start a new game session (if applicable)
// - Retrieve leaderboards
// - AI-powered activity suggestions

export default router;

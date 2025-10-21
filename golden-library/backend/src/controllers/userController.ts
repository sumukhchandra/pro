import { Response } from 'express';
import User from '../models/User';
import Content from '../models/Content';
import { AuthRequest } from '../middleware/auth';

export const getSavedList = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).populate('savedList');
    res.json(user?.savedList || []);
  } catch (error) {
    console.error('Get saved list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addToSavedList = async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const userId = req.user!._id;

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if already saved
    const user = await User.findById(userId);
    if (user?.savedList.includes(contentId as any)) {
      return res.status(400).json({ message: 'Content already saved' });
    }

    // Add to saved list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedList: contentId }
    });

    res.json({ message: 'Content added to saved list' });
  } catch (error) {
    console.error('Add to saved list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeFromSavedList = async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const userId = req.user!._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { savedList: contentId }
    });

    res.json({ message: 'Content removed from saved list' });
  } catch (error) {
    console.error('Remove from saved list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
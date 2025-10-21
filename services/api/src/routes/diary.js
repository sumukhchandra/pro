import express from 'express';
import Diary from '../models/Diary.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import realtimeService from '../services/realtimeService.js';

const router = express.Router();

// Placeholder route for testing authentication and router setup
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Diary API test successful', user: req.user });
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, visibility, media } = req.body;
    const owner = req.user.id;

    const newEntry = await Diary.create({
      owner,
      title,
      content,
      visibility,
      media,
      contributors: [owner], // Owner is automatically a contributor
    });

    // Emit realtime event
    realtimeService.emitDiaryEntryCreated(newEntry);

    res.status(201).json({ message: 'Diary entry created successfully', entry: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const entries = await Diary.find({
      $or: [
        { owner: userId },
        { contributors: userId },
      ],
    })
      .populate('owner', 'username profile.avatar')
      .populate('contributors', 'username profile.avatar');

    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await Diary.findById(id)
      .populate('owner', 'username profile.avatar')
      .populate('contributors', 'username profile.avatar');

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    // Check permissions
    const isOwner = entry.owner._id.toString() === userId;
    const isContributor = entry.contributors.some(c => c._id.toString() === userId);

    if (entry.visibility === 'private' && !isOwner && !isContributor) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Further checks for 'friends' or 'partner' visibility can be added here if needed

    res.status(200).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, visibility, media } = req.body;

    const entry = await Diary.findById(id);

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    const isOwner = entry.owner.toString() === userId;
    const isContributor = entry.contributors.some(c => c.toString() === userId);

    if (!isOwner && !isContributor) {
      return res.status(403).json({ message: 'Access denied: Not owner or contributor' });
    }

    entry.title = title || entry.title;
    entry.content = content || entry.content;
    entry.visibility = visibility || entry.visibility;
    entry.media = media || entry.media;

    await entry.save();

    res.status(200).json({ message: 'Diary entry updated successfully', entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await Diary.findById(id);

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not owner' });
    }

    await entry.deleteOne();

    res.status(200).json({ message: 'Diary entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/contributors', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { contributorId } = req.body;
    const userId = req.user.id;

    const entry = await Diary.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not entry owner' });
    }

    if (entry.contributors.includes(contributorId)) {
      return res.status(400).json({ message: 'User is already a contributor' });
    }

    entry.contributors.push(contributorId);
    await entry.save();

    res.status(200).json({ message: 'Contributor added successfully', entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id/contributors/:contributorId', auth, async (req, res) => {
  try {
    const { id, contributorId } = req.params;
    const userId = req.user.id;

    const entry = await Diary.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not entry owner' });
    }

    if (entry.owner.toString() === contributorId) {
      return res.status(400).json({ message: 'Cannot remove owner as contributor' });
    }

    entry.contributors = entry.contributors.filter(c => c.toString() !== contributorId);
    await entry.save();

    res.status(200).json({ message: 'Contributor removed successfully', entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

import express from 'express';
import Calendar from '../models/Calendar.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Placeholder route for testing authentication and router setup
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Calendar API test successful', user: req.user });
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, start, end, allDay, visibility } = req.body;
    const owner = req.user.id;

    const newEvent = await Calendar.create({
      owner,
      title,
      description,
      location,
      start,
      end,
      allDay,
      visibility,
      participants: [owner], // Owner is automatically a participant
    });

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Calendar.find({
      $or: [
        { owner: userId },
        { participants: userId },
      ],
    })
      .populate('owner', 'username profile.avatar')
      .populate('participants', 'username profile.avatar');

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Calendar.findById(id)
      .populate('owner', 'username profile.avatar')
      .populate('participants', 'username profile.avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const isOwner = event.owner._id.toString() === userId;
    const isParticipant = event.participants.some(p => p._id.toString() === userId);

    if (event.visibility === 'private' && !isOwner && !isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Further checks for 'friends' or 'partner' visibility can be added here if needed

    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, location, start, end, allDay, visibility } = req.body;

    const event = await Calendar.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not event owner' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.start = start || event.start;
    event.end = end || event.end;
    event.allDay = allDay !== undefined ? allDay : event.allDay;
    event.visibility = visibility || event.visibility;

    await event.save();

    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Calendar.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not event owner' });
    }

    await event.deleteOne();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientId } = req.body;
    const userId = req.user.id;

    const event = await Calendar.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not event owner' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Check if already invited or participant
    if (event.participants.includes(recipientId) || event.invitations.some(inv => inv.recipient.toString() === recipientId && inv.status === 'pending')) {
      return res.status(400).json({ message: 'User already invited or is a participant' });
    }

    event.invitations.push({ recipient: recipientId, status: 'pending' });
    await event.save();

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/invite/:inviteId/accept', auth, async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;

    const event = await Calendar.findOne({
      'invitations._id': inviteId,
      'invitations.recipient': userId,
      'invitations.status': 'pending',
    });

    if (!event) {
      return res.status(404).json({ message: 'Invitation not found or not pending' });
    }

    const invitation = event.invitations.id(inviteId);
    invitation.status = 'accepted';

    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
    }

    await event.save();

    res.status(200).json({ message: 'Invitation accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/invite/:inviteId/reject', auth, async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;

    const event = await Calendar.findOne({
      'invitations._id': inviteId,
      'invitations.recipient': userId,
      'invitations.status': 'pending',
    });

    if (!event) {
      return res.status(404).json({ message: 'Invitation not found or not pending' });
    }

    const invitation = event.invitations.id(inviteId);
    invitation.status = 'rejected';

    await event.save();

    res.status(200).json({ message: 'Invitation rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

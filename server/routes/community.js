const express = require('express');
const { body, validationResult } = require('express-validator');
const { Channel, Message, Conversation } = require('../models/Chat');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/community/channels
// @desc    Get all public channels
// @access  Public
router.get('/channels', async (req, res) => {
  try {
    const channels = await Channel.find({ 
      type: 'public', 
      isActive: true 
    })
    .populate('createdBy', 'username profileImage')
    .populate('members', 'username profileImage')
    .sort({ createdAt: -1 });

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/community/channels
// @desc    Create new channel
// @access  Private
router.post('/channels', auth, [
  body('name').notEmpty().withMessage('Channel name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('type').isIn(['public', 'private']).withMessage('Invalid channel type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, type } = req.body;

    // Check if channel name already exists
    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel name already exists' });
    }

    const channel = new Channel({
      name,
      description,
      type,
      createdBy: req.user._id,
      members: [req.user._id],
      moderators: [req.user._id]
    });

    await channel.save();
    await channel.populate('createdBy', 'username profileImage');

    res.status(201).json({
      message: 'Channel created successfully',
      channel
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/community/channels/:id
// @desc    Get channel by ID
// @access  Private
router.get('/channels/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('createdBy', 'username profileImage')
      .populate('members', 'username profileImage')
      .populate('moderators', 'username profileImage');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is member (for private channels)
    if (channel.type === 'private' && !channel.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(channel);
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/community/channels/:id/join
// @desc    Join channel
// @access  Private
router.post('/channels/:id/join', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.isMember(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this channel' });
    }

    channel.addMember(req.user._id);
    await channel.save();

    res.json({ message: 'Successfully joined channel' });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/community/channels/:id/leave
// @desc    Leave channel
// @access  Private
router.post('/channels/:id/leave', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (!channel.isMember(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this channel' });
    }

    channel.removeMember(req.user._id);
    await channel.save();

    res.json({ message: 'Successfully left channel' });
  } catch (error) {
    console.error('Leave channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/community/channels/:id/messages
// @desc    Get channel messages
// @access  Private
router.get('/channels/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is member
    if (!channel.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      channelId: req.params.id,
      isDeleted: false
    })
    .populate('senderId', 'username profileImage')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get channel messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/community/channels/:id/messages
// @desc    Send message to channel
// @access  Private
router.post('/channels/:id/messages', auth, [
  body('content').notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is member
    if (!channel.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content, messageType = 'text', attachments = [], replyTo } = req.body;

    const message = new Message({
      senderId: req.user._id,
      channelId: req.params.id,
      messageType,
      content,
      attachments,
      replyTo
    });

    await message.save();
    await message.populate('senderId', 'username profileImage');

    res.status(201).json({
      message: 'Message sent successfully',
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/community/conversations
// @desc    Get user's private conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'username profileImage')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/community/conversations
// @desc    Start new conversation
// @access  Private
router.post('/conversations', auth, [
  body('participantId').notEmpty().withMessage('Participant ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participantId } = req.body;

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    const conversation = await Conversation.createConversation(req.user._id, participantId);
    await conversation.populate('participants', 'username profileImage');

    res.status(201).json({
      message: 'Conversation started successfully',
      conversation
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/community/conversations/:id/messages
// @desc    Get conversation messages
// @access  Private
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [
        { channelId: null, recipientId: req.user._id },
        { channelId: null, senderId: req.user._id }
      ],
      isDeleted: false
    })
    .populate('senderId', 'username profileImage')
    .populate('recipientId', 'username profileImage')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/community/conversations/:id/messages
// @desc    Send message to conversation
// @access  Private
router.post('/conversations/:id/messages', auth, [
  body('content').notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content, messageType = 'text', attachments = [], replyTo } = req.body;

    // Get recipient ID
    const recipientId = conversation.participants.find(
      id => !id.equals(req.user._id)
    );

    const message = new Message({
      senderId: req.user._id,
      recipientId,
      messageType,
      content,
      attachments,
      replyTo
    });

    await message.save();
    await message.populate('senderId', 'username profileImage');

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({
      message: 'Message sent successfully',
      message
    });
  } catch (error) {
    console.error('Send conversation message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
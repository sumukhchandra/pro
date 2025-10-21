import { Request, Response } from 'express';
import Channel from '../models/Channel';
import DirectMessage from '../models/DirectMessage';
import Message from '../models/Message';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await Channel.find().populate('members', 'username');
    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    const channel = new Channel({
      name,
      description,
      members: []
    });

    await channel.save();
    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChannelMessages = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ channelId })
      .populate('senderId', 'username')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get channel messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDirectMessages = async (req: Request, res: Response) => {
  try {
    const { dmId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ directMessageId: dmId })
      .populate('senderId', 'username')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || query.toString().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('username email').limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
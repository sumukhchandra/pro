import { Request, Response } from 'express';
import Content from '../models/Content';
import Like from '../models/Like';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const { type, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let query = {};
    if (type && ['novel', 'ebook', 'comic', 'manga'].includes(type as string)) {
      query = { type };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = order === 'desc' ? -1 : 1;

    const content = await Content.find(query).sort(sortOptions);
    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getContentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMostLikedContent = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    let matchQuery = {};
    if (type && ['novel', 'ebook', 'comic', 'manga'].includes(type as string)) {
      matchQuery = { type };
    }

    const mostLiked = await Content.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'contentId',
          as: 'likes'
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' }
        }
      },
      { $sort: { likeCount: -1 } },
      { $limit: 10 }
    ]);

    res.json(mostLiked);
  } catch (error) {
    console.error('Get most liked content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const likeContent = async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const userId = req.user!._id;

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ userId, contentId });
    if (existingLike) {
      return res.status(400).json({ message: 'Content already liked' });
    }

    // Create like
    const like = new Like({ userId, contentId });
    await like.save();

    res.json({ message: 'Content liked successfully' });
  } catch (error) {
    console.error('Like content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unlikeContent = async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const userId = req.user!._id;

    const like = await Like.findOneAndDelete({ userId, contentId });
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    res.json({ message: 'Content unliked successfully' });
  } catch (error) {
    console.error('Unlike content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { title, author, coverImageURL, description, type, tags } = req.body;

    const content = new Content({
      title,
      author,
      coverImageURL,
      description,
      type,
      tags: tags || []
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
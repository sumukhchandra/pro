const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Content = require('../models/Content');
const AdViewLog = require('../models/AdViewLog');
const { auth, requirePro } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/my-content
// @desc    Get user's published content
// @access  Private
router.get('/my-content', auth, async (req, res) => {
  try {
    const content = await Content.find({ authorId: req.user._id })
      .populate('authorId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    console.error('Get my content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/my-list
// @desc    Get user's saved content list
// @access  Private
router.get('/my-list', auth, async (req, res) => {
  try {
    const content = await Content.find({ _id: { $in: req.user.myList } })
      .populate('authorId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    console.error('Get my list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/earnings
// @desc    Get user's ad share earnings
// @access  Private
router.get('/earnings', auth, async (req, res) => {
  try {
    // Get user's content
    const userContent = await Content.find({ authorId: req.user._id });
    const contentIds = userContent.map(content => content._id);

    // Get earnings from ad views
    const earnings = await AdViewLog.aggregate([
      {
        $match: {
          contentId: { $in: contentIds }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$adRevenueAmount' },
          totalViews: { $sum: 1 },
          byContent: {
            $push: {
              contentId: '$contentId',
              revenue: '$adRevenueAmount',
              adType: '$adType'
            }
          }
        }
      }
    ]);

    // Get earnings by content
    const earningsByContent = await AdViewLog.aggregate([
      {
        $match: {
          contentId: { $in: contentIds }
        }
      },
      {
        $group: {
          _id: '$contentId',
          totalEarnings: { $sum: '$adRevenueAmount' },
          totalViews: { $sum: 1 },
          adTypeBreakdown: {
            $push: {
              type: '$adType',
              revenue: '$adRevenueAmount'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'contents',
          localField: '_id',
          foreignField: '_id',
          as: 'content'
        }
      },
      {
        $unwind: '$content'
      },
      {
        $project: {
          contentId: '$_id',
          title: '$content.title',
          coverImageURL: '$content.coverImageURL',
          totalEarnings: 1,
          totalViews: 1,
          adTypeBreakdown: 1
        }
      }
    ]);

    res.json({
      totalEarnings: earnings.length > 0 ? earnings[0].totalEarnings : 0,
      totalViews: earnings.length > 0 ? earnings[0].totalViews : 0,
      currentBalance: req.user.adShareBalance,
      earningsByContent
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/downloads
// @desc    Get user's downloaded content (Pro only)
// @access  Private (Pro only)
router.get('/downloads', auth, requirePro, async (req, res) => {
  try {
    const content = await Content.find({ _id: { $in: req.user.purchasedContent } })
      .populate('authorId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    console.error('Get downloads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/download/:contentId
// @desc    Download content for offline reading (Pro only)
// @access  Private (Pro only)
router.post('/download/:contentId', auth, requirePro, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has access
    if (!content.isAccessibleTo(req.user)) {
      return res.status(403).json({ message: 'Content requires purchase' });
    }

    // Add to user's purchased content (for offline access)
    req.user.addPurchasedContent(contentId);
    await req.user.save();

    // Get all chapters for the content
    const chapters = await Content.findById(contentId)
      .populate({
        path: 'chapters',
        match: { isPublished: true },
        options: { sort: { chapterNumber: 1 } }
      });

    res.json({
      message: 'Content downloaded successfully',
      content,
      chapters: chapters.chapters
    });
  } catch (error) {
    console.error('Download content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get content stats
    const contentStats = await Content.aggregate([
      { $match: { authorId: req.user._id } },
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          totalViews: { $sum: '$totalViewCount' },
          averageRating: { $avg: '$averageRating' },
          byType: {
            $push: {
              type: '$contentType',
              views: '$totalViewCount',
              rating: '$averageRating'
            }
          }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await AdViewLog.find({ userId: req.user._id })
      .populate('contentId', 'title coverImageURL')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      contentStats: contentStats.length > 0 ? contentStats[0] : {
        totalContent: 0,
        totalViews: 0,
        averageRating: 0,
        byType: []
      },
      recentActivity,
      userStats: {
        myListCount: req.user.myList.length,
        purchasedCount: req.user.purchasedContent.length,
        adShareBalance: req.user.adShareBalance,
        isPro: req.user.isPro()
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/withdraw-earnings
// @desc    Request earnings withdrawal
// @access  Private
router.post('/withdraw-earnings', auth, [
  body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal amount is $10'),
  body('paymentMethod').isIn(['paypal', 'bank_transfer']).withMessage('Invalid payment method'),
  body('paymentDetails').notEmpty().withMessage('Payment details are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, paymentMethod, paymentDetails } = req.body;

    if (amount > req.user.adShareBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create withdrawal request (in a real app, this would be stored in a WithdrawalRequest model)
    const withdrawalRequest = {
      userId: req.user._id,
      amount,
      paymentMethod,
      paymentDetails,
      status: 'pending',
      requestedAt: new Date()
    };

    // Update user balance
    req.user.adShareBalance -= amount;
    await req.user.save();

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawalRequest,
      newBalance: req.user.adShareBalance
    });
  } catch (error) {
    console.error('Withdraw earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
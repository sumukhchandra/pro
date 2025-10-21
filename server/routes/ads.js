const express = require('express');
const AdViewLog = require('../models/AdViewLog');
const Content = require('../models/Content');
const { auth, optionalAuth } = require('../middleware/auth');
const realtimeService = require('../services/realtimeService');

const router = express.Router();

// @route   GET /api/ads/placement
// @desc    Get ad placement configuration
// @access  Public
router.get('/placement', optionalAuth, async (req, res) => {
  try {
    const { type, contentId, chapterNumber } = req.query;

    // If user is pro, no ads should be shown
    if (req.user && req.user.isPro()) {
      return res.json({
        showAd: false,
        reason: 'pro_user'
      });
    }

    // If no user, show ads
    if (!req.user) {
      return res.json({
        showAd: true,
        adType: type || 'banner',
        adConfig: getAdConfig(type)
      });
    }

    // For standard users, determine ad placement
    let showAd = true;
    let adType = type || 'banner';

    switch (type) {
      case 'content_open':
        showAd = true;
        adType = 'content_open';
        break;
      
      case 'per_chapter':
        showAd = chapterNumber && parseInt(chapterNumber) > 1;
        adType = 'per_chapter';
        break;
      
      case 'banner':
        showAd = true;
        adType = 'banner';
        break;
      
      default:
        showAd = true;
        adType = 'banner';
    }

    res.json({
      showAd,
      adType,
      adConfig: showAd ? getAdConfig(adType) : null
    });
  } catch (error) {
    console.error('Get ad placement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ads/log-view
// @desc    Log ad view for revenue tracking
// @access  Private
router.post('/log-view', auth, async (req, res) => {
  try {
    const {
      contentId,
      adType,
      adId,
      adRevenueAmount,
      chapterNumber,
      pageUrl
    } = req.body;

    // Don't log for pro users
    if (req.user.isPro()) {
      return res.json({ message: 'Ad view not logged for pro user' });
    }

    const adViewLog = new AdViewLog({
      userId: req.user._id,
      contentId,
      adType,
      adRevenueAmount: adRevenueAmount || calculateAdRevenue(adType),
      adId: adId || `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chapterNumber,
      pageUrl: pageUrl || req.get('Referer') || 'unknown'
    });

    await adViewLog.save();

    // Update content view count
    if (contentId) {
      await Content.findByIdAndUpdate(contentId, {
        $inc: { weeklyViewCount: 1, totalViewCount: 1 }
      });
    }

    // Emit realtime event
    realtimeService.emitAdViewLogged(req.user?._id, {
      contentId,
      adType,
      adRevenueAmount: adViewLog.adRevenueAmount,
      adId: adViewLog.adId
    });

    res.json({ message: 'Ad view logged successfully' });
  } catch (error) {
    console.error('Log ad view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/stats
// @desc    Get ad statistics for content creators
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { contentId, startDate, endDate } = req.query;

    // Get user's content
    const userContent = await Content.find({ authorId: req.user._id });
    const contentIds = userContent.map(content => content._id);

    let matchQuery = { contentId: { $in: contentIds } };
    
    if (contentId) {
      matchQuery.contentId = contentId;
    }

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await AdViewLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            contentId: '$contentId',
            adType: '$adType'
          },
          totalViews: { $sum: 1 },
          totalRevenue: { $sum: '$adRevenueAmount' },
          averageRevenue: { $avg: '$adRevenueAmount' }
        }
      },
      {
        $lookup: {
          from: 'contents',
          localField: '_id.contentId',
          foreignField: '_id',
          as: 'content'
        }
      },
      {
        $unwind: '$content'
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$totalViews' },
          totalRevenue: { $sum: '$totalRevenue' },
          byContent: {
            $push: {
              contentId: '$_id.contentId',
              title: '$content.title',
              adType: '$_id.adType',
              views: '$totalViews',
              revenue: '$totalRevenue',
              averageRevenue: '$averageRevenue'
            }
          }
        }
      }
    ]);

    res.json({
      stats: stats.length > 0 ? stats[0] : {
        totalViews: 0,
        totalRevenue: 0,
        byContent: []
      },
      userBalance: req.user.adShareBalance
    });
  } catch (error) {
    console.error('Get ad stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/revenue-breakdown
// @desc    Get detailed revenue breakdown
// @access  Private
router.get('/revenue-breakdown', auth, async (req, res) => {
  try {
    const { contentId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user's content
    const userContent = await Content.find({ authorId: req.user._id });
    const contentIds = userContent.map(content => content._id);

    let matchQuery = { 
      contentId: { $in: contentIds },
      createdAt: { $gte: startDate }
    };
    
    if (contentId) {
      matchQuery.contentId = contentId;
    }

    const breakdown = await AdViewLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            adType: '$adType'
          },
          views: { $sum: 1 },
          revenue: { $sum: '$adRevenueAmount' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Group by date
    const dailyBreakdown = breakdown.reduce((acc, item) => {
      const date = item._id.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalViews: 0,
          totalRevenue: 0,
          byAdType: {}
        };
      }
      acc[date].totalViews += item.views;
      acc[date].totalRevenue += item.revenue;
      acc[date].byAdType[item._id.adType] = {
        views: item.views,
        revenue: item.revenue
      };
      return acc;
    }, {});

    res.json({
      dailyBreakdown: Object.values(dailyBreakdown),
      period: {
        startDate,
        endDate: new Date(),
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error('Get revenue breakdown error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
function getAdConfig(adType) {
  const configs = {
    content_open: {
      type: 'display',
      size: '728x90',
      position: 'top',
      frequency: 'every_open'
    },
    per_chapter: {
      type: 'display',
      size: '728x90',
      position: 'between_chapters',
      frequency: 'every_chapter'
    },
    banner: {
      type: 'display',
      size: '728x90',
      position: 'bottom',
      frequency: 'continuous'
    }
  };

  return configs[adType] || configs.banner;
}

function calculateAdRevenue(adType) {
  const revenueRates = {
    content_open: 0.01,    // $0.01 per content open
    per_chapter: 0.005,    // $0.005 per chapter view
    banner: 0.001          // $0.001 per banner view
  };

  return revenueRates[adType] || 0.001;
}

module.exports = router;
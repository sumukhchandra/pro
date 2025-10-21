const mongoose = require('mongoose');

const adViewLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  adType: {
    type: String,
    enum: ['content_open', 'per_chapter', 'banner'],
    required: true
  },
  adTime: {
    type: Date,
    default: Date.now
  },
  adRevenueAmount: {
    type: Number,
    required: true,
    min: 0
  },
  adProvider: {
    type: String,
    default: 'google_adsense' // or other ad providers
  },
  adId: {
    type: String,
    required: true
  },
  chapterNumber: {
    type: Number,
    default: null // Only for per_chapter ads
  },
  pageUrl: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to calculate creator earnings for a content
adViewLogSchema.statics.getCreatorEarnings = async function(contentId, startDate, endDate) {
  const matchQuery = { contentId: mongoose.Types.ObjectId(contentId) };
  
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const result = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$contentId',
        totalRevenue: { $sum: '$adRevenueAmount' },
        totalViews: { $sum: 1 },
        adTypeBreakdown: {
          $push: {
            type: '$adType',
            revenue: '$adRevenueAmount'
          }
        }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : null;
};

// Method to get user's ad view history
adViewLogSchema.statics.getUserAdHistory = async function(userId, limit = 50) {
  return this.find({ userId })
    .populate('contentId', 'title coverImageURL')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Method to get daily ad revenue
adViewLogSchema.statics.getDailyRevenue = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$adRevenueAmount' },
        totalViews: { $sum: 1 },
        byAdType: {
          $push: {
            type: '$adType',
            revenue: '$adRevenueAmount'
          }
        }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { totalRevenue: 0, totalViews: 0, byAdType: [] };
};

// Index for better query performance
adViewLogSchema.index({ contentId: 1, createdAt: -1 });
adViewLogSchema.index({ userId: 1, createdAt: -1 });
adViewLogSchema.index({ adType: 1, createdAt: -1 });
adViewLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdViewLog', adViewLogSchema);
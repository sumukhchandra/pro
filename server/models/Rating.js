const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
  ratingValue: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
ratingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure one rating per user per content
ratingSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Method to update content's average rating
ratingSchema.statics.updateContentRating = async function(contentId) {
  const Content = mongoose.model('Content');
  
  const result = await this.aggregate([
    { $match: { contentId: mongoose.Types.ObjectId(contentId) } },
    {
      $group: {
        _id: '$contentId',
        averageRating: { $avg: '$ratingValue' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length > 0) {
    await Content.findByIdAndUpdate(contentId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
      ratingCount: result[0].ratingCount
    });
  }
};

// Call updateContentRating after save
ratingSchema.post('save', async function() {
  await this.constructor.updateContentRating(this.contentId);
});

// Call updateContentRating after remove
ratingSchema.post('remove', async function() {
  await this.constructor.updateContentRating(this.contentId);
});

module.exports = mongoose.model('Rating', ratingSchema);
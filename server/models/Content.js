const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  coverImageURL: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['novel', 'ebook', 'comic', 'manga'],
    required: true
  },
  monetizationType: {
    type: String,
    enum: ['free_ad_share', 'premium_to_buy'],
    required: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  weeklyViewCount: {
    type: Number,
    default: 0
  },
  totalViewCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  totalChapters: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
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
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total earnings from ads
contentSchema.virtual('totalAdEarnings').get(function() {
  // This would be calculated from AdViewLog model
  return 0; // Placeholder
});

// Method to update view count
contentSchema.methods.incrementViewCount = function() {
  this.weeklyViewCount += 1;
  this.totalViewCount += 1;
  return this.save();
};

// Method to update rating
contentSchema.methods.updateRating = function(newRating) {
  // This would be called when a new rating is added
  // The actual calculation would be done in the rating route
};

// Method to check if content is accessible to user
contentSchema.methods.isAccessibleTo = function(user) {
  if (this.monetizationType === 'free_ad_share') {
    return true;
  }
  
  if (this.monetizationType === 'premium_to_buy') {
    return user && user.hasPurchased(this._id);
  }
  
  return false;
};

// Index for better query performance
contentSchema.index({ contentType: 1, status: 1 });
contentSchema.index({ authorId: 1 });
contentSchema.index({ weeklyViewCount: -1 });
contentSchema.index({ averageRating: -1 });
contentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Content', contentSchema);
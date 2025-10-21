const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  chapterTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  chapterNumber: {
    type: Number,
    required: true,
    min: 1
  },
  chapterType: {
    type: String,
    enum: ['text', 'gallery'],
    required: true
  },
  textContent: {
    type: String,
    default: '',
    maxlength: 100000 // 100k characters max per chapter
  },
  imageURLs: [{
    type: String,
    validate: {
      validator: function(v) {
        return this.chapterType === 'gallery' ? v.length > 0 : true;
      },
      message: 'Gallery chapters must have at least one image'
    }
  }],
  wordCount: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
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
chapterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate word count for text chapters
  if (this.chapterType === 'text' && this.textContent) {
    this.wordCount = this.textContent.split(/\s+/).filter(word => word.length > 0).length;
    // Estimate read time (average 200 words per minute)
    this.readTime = Math.ceil(this.wordCount / 200);
  }
  
  // Calculate read time for gallery chapters (estimate 30 seconds per image)
  if (this.chapterType === 'gallery' && this.imageURLs.length > 0) {
    this.readTime = Math.ceil(this.imageURLs.length * 0.5); // 30 seconds per image
  }
  
  next();
});

// Method to get next chapter
chapterSchema.methods.getNextChapter = async function() {
  return this.constructor.findOne({
    contentId: this.contentId,
    chapterNumber: this.chapterNumber + 1,
    isPublished: true
  }).sort('chapterNumber');
};

// Method to get previous chapter
chapterSchema.methods.getPreviousChapter = async function() {
  return this.constructor.findOne({
    contentId: this.contentId,
    chapterNumber: this.chapterNumber - 1,
    isPublished: true
  }).sort('chapterNumber');
};

// Method to get chapter content for reading
chapterSchema.methods.getReadingContent = function() {
  if (this.chapterType === 'text') {
    return {
      type: 'text',
      content: this.textContent,
      wordCount: this.wordCount,
      readTime: this.readTime
    };
  } else {
    return {
      type: 'gallery',
      images: this.imageURLs,
      readTime: this.readTime
    };
  }
};

// Index for better query performance
chapterSchema.index({ contentId: 1, chapterNumber: 1 });
chapterSchema.index({ contentId: 1, isPublished: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
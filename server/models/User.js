const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  userRole: {
    type: String,
    enum: ['standard', 'pro'],
    default: 'standard'
  },
  subscriptionId: {
    type: String,
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'inactive'
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  adShareBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  myList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  purchasedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Check if user is pro
userSchema.methods.isPro = function() {
  return this.userRole === 'pro' && 
         this.subscriptionStatus === 'active' && 
         this.subscriptionEndDate > new Date();
};

// Check if user has purchased content
userSchema.methods.hasPurchased = function(contentId) {
  return this.purchasedContent.includes(contentId);
};

// Add content to my list
userSchema.methods.addToList = function(contentId) {
  if (!this.myList.includes(contentId)) {
    this.myList.push(contentId);
  }
};

// Remove content from my list
userSchema.methods.removeFromList = function(contentId) {
  this.myList = this.myList.filter(id => !id.equals(contentId));
};

// Add purchased content
userSchema.methods.addPurchasedContent = function(contentId) {
  if (!this.purchasedContent.includes(contentId)) {
    this.purchasedContent.push(contentId);
  }
};

module.exports = mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    enum: ['standard', 'pro'],
    default: 'standard',
    index: true,
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  adShareBalance: {
    type: Number,
    default: 0,
  },
  myList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  friendRequests: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['friend', 'partner'],
      default: 'friend',
    },
  }],
  profile: {
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['single', 'in_relationship', 'complicated'],
      default: 'single',
    },
  },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;

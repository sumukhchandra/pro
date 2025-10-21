const mongoose = require('mongoose');

// Channel/Room schema for group chats
const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Message schema
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: null
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  attachments: [{
    type: String, // URL to uploaded file
    originalName: String,
    fileSize: Number,
    mimeType: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Private conversation schema
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
channelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

messageSchema.pre('save', function(next) {
  if (this.isModified('content') && this.isEdited) {
    this.editedAt = Date.now();
  }
  next();
});

// Method to check if user is member of channel
channelSchema.methods.isMember = function(userId) {
  return this.members.some(memberId => memberId.equals(userId));
};

// Method to check if user is moderator
channelSchema.methods.isModerator = function(userId) {
  return this.moderators.some(modId => modId.equals(userId));
};

// Method to add member to channel
channelSchema.methods.addMember = function(userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
  }
};

// Method to remove member from channel
channelSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(memberId => !memberId.equals(userId));
  this.moderators = this.moderators.filter(modId => !modId.equals(userId));
};

// Method to add moderator
channelSchema.methods.addModerator = function(userId) {
  if (this.isMember(userId) && !this.isModerator(userId)) {
    this.moderators.push(userId);
  }
};

// Method to get conversation between two users
conversationSchema.statics.getConversation = async function(userId1, userId2) {
  return this.findOne({
    participants: { $all: [userId1, userId2] },
    isActive: true
  });
};

// Method to create conversation between two users
conversationSchema.statics.createConversation = async function(userId1, userId2) {
  const existingConversation = await this.getConversation(userId1, userId2);
  if (existingConversation) {
    return existingConversation;
  }
  
  return this.create({
    participants: [userId1, userId2]
  });
};

// Indexes for better performance
channelSchema.index({ name: 1 });
channelSchema.index({ createdBy: 1 });
channelSchema.index({ isActive: 1 });

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Channel = mongoose.model('Channel', channelSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Channel, Message, Conversation };
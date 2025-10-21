import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  caption: {
    type: String,
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  },
  visibility: {
    type: String,
    enum: ['private', 'friends', 'partner', 'public'],
    default: 'private',
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: String, // e.g., 'like', 'heart', 'laugh'
  }],
}, { timestamps: true });

const Media = mongoose.model('Media', MediaSchema);

export default Media;

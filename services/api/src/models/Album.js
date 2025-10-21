import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  visibility: {
    type: String,
    enum: ['private', 'friends', 'partner', 'public'],
    default: 'private',
  },
}, { timestamps: true });

const Album = mongoose.model('Album', AlbumSchema);

export default Album;

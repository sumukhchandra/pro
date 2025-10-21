import mongoose from 'mongoose';

const DiarySchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  visibility: {
    type: String,
    enum: ['private', 'friends', 'partner'],
    default: 'private',
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video'],
    },
  }],
}, { timestamps: true });

const Diary = mongoose.model('Diary', DiarySchema);

export default Diary;

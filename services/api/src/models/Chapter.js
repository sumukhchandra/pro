import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  chapterTitle: { type: String, required: true },
  chapterNumber: { type: Number, required: true, index: true },
  chapterType: { type: String, enum: ['text', 'gallery'], required: true },
  textContent: { type: String, default: '' },
  imageURLs: [{ type: String }],
}, { timestamps: true });

ChapterSchema.index({ contentId: 1, chapterNumber: 1 }, { unique: true });

const Chapter = mongoose.model('Chapter', ChapterSchema);

export default Chapter;

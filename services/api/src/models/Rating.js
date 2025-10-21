import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  ratingValue: { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

RatingSchema.index({ userId: 1, contentId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', RatingSchema);

export default Rating;

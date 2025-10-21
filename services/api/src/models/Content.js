import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  coverImageURL: { type: String, default: '' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contentType: { type: String, enum: ['novel', 'ebook', 'comic', 'manga'], required: true, index: true },
  monetizationType: { type: String, enum: ['free_ad_share', 'premium_to_buy'], default: 'free_ad_share', index: true },
  price: { type: Number, default: 0 },
  weeklyViewCount: { type: Number, default: 0, index: true },
  tags: [{ type: String, index: true }],
  averageRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now, index: true },
  isPublished: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const Content = mongoose.model('Content', ContentSchema);

export default Content;

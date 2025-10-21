import mongoose from 'mongoose';

const PurchasedContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  purchasedAt: { type: Date, default: Date.now },
  pricePaid: { type: Number, required: true },
  paymentRef: { type: String, default: '' },
}, { timestamps: true });

PurchasedContentSchema.index({ userId: 1, contentId: 1 }, { unique: true });

const PurchasedContent = mongoose.model('PurchasedContent', PurchasedContentSchema);

export default PurchasedContent;

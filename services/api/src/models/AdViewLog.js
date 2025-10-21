import mongoose from 'mongoose';

const AdViewLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  adTime: { type: Date, default: Date.now },
  adPlacement: { type: String, enum: ['onContentOpen', 'onChapterBreak', 'onPageLoad', 'banner'], required: true },
  adRevenueAmount: { type: Number, default: 0 },
}, { timestamps: true });

const AdViewLog = mongoose.model('AdViewLog', AdViewLogSchema);

export default AdViewLog;

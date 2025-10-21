import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  }
}, {
  timestamps: true
});

// Create unique index to prevent duplicate likes
LikeSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.model<ILike>('Like', LikeSchema);
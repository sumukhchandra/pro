import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
  },
  { timestamps: true }
);

directMessageSchema.index({ participants: 1 });

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);

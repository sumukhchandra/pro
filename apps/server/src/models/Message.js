import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    directMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);

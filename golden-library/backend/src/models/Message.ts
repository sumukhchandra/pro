import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  channelId?: mongoose.Types.ObjectId;
  directMessageId?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel'
  },
  directMessageId: {
    type: Schema.Types.ObjectId,
    ref: 'DirectMessage'
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Ensure either channelId or directMessageId is provided, but not both
MessageSchema.pre('validate', function(next) {
  if ((this.channelId && this.directMessageId) || (!this.channelId && !this.directMessageId)) {
    next(new Error('Message must have either channelId or directMessageId, but not both'));
  } else {
    next();
  }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IDirectMessage extends Document {
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DirectMessageSchema = new Schema<IDirectMessage>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, {
  timestamps: true
});

// Ensure exactly 2 participants
DirectMessageSchema.pre('validate', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('DirectMessage must have exactly 2 participants'));
  } else {
    next();
  }
});

// Create unique index to prevent duplicate direct message conversations
DirectMessageSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    savedList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }]
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    coverImageURL: { type: String },
    description: { type: String },
    type: { type: String, enum: ['novel', 'ebook', 'comic', 'manga'], required: true },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export const Content = mongoose.model('Content', contentSchema);

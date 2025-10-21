import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  author: string;
  coverImageURL: string;
  description: string;
  type: 'novel' | 'ebook' | 'comic' | 'manga';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  coverImageURL: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['novel', 'ebook', 'comic', 'manga'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export default mongoose.model<IContent>('Content', ContentSchema);
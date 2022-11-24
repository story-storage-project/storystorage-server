import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    css: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('Story', storySchema);

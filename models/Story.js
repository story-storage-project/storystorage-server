import mongoose from 'mongoose';

const cssSchema = new mongoose.Schema({
  mode: {
    type: String,
    required: true,
  },
  className: {
    type: String,
  },
  property: {
    key: {
      type: String,
    },
  },
});

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    css: [cssSchema],
  },
  { timestamps: true },
);

export default mongoose.model('Story', storySchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: 'String',
    required: 'true',
  },
  email: {
    type: 'String',
    required: 'true',
    index: true,
  },
  picture: {
    type: 'String',
    required: 'true',
  },
  elementList: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
    default: [],
  },
});

export default mongoose.model('User', userSchema);

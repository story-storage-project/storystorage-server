import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: {
    type: 'String',
    required: 'true',
  },
  email: {
    type: 'String',
    required: 'true',
    index: true,
  },
  profileImageUrl: {
    type: 'String',
    required: 'true',
  },
  elementList: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
});

export default mongoose.model('User', userSchema);

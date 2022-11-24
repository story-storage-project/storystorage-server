import mongoose from 'mongoose';
import config from '../config.js';

const { db } = config;
const DB_HOST = `mongodb+srv://${db.id}:${db.password}@cluster0.${db.cluster}.mongodb.net/${db.name}`;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_HOST);
    console.log('Success DB Connection');
    return;
  } catch (err) {
    console.log(`Fail DB Connection. error: ${err}`);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

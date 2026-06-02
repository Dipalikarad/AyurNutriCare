const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb+srv://Dipali_T_Karad:dipali123@cluster0.lrwlvr8.mongodb.net/ayurnutricare?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

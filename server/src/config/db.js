const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_task_manager';
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't kill process immediately during initial setup to allow clear debugging
    console.warn('⚠️ Warning: Server is running, but database connection failed. Please ensure MongoDB is running or check MONGODB_URI in .env');
  }
};

module.exports = connectDB;

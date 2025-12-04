const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Các options này đã được deprecate trong mongoose 6+
      // nhưng có thể thêm nếu cần
    });

    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Xử lý các events
    mongoose.connection.on('error', (err) => {
      console.error('❌ Lỗi MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB đã ngắt kết nối');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
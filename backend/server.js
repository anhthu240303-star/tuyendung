require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB();

// Khởi động server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📝 Môi trường: ${process.env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

// Xử lý lỗi không bắt được
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Đang tắt server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM nhận được. Đang tắt server một cách graceful...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
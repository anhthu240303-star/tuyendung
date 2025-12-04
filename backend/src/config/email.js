const nodemailer = require('nodemailer');

// Tạo transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Kiểm tra kết nối email
const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service đã sẵn sàng');
    return true;
  } catch (error) {
    console.error('❌ Lỗi email service:', error.message);
    return false;
  }
};

module.exports = {
  createTransporter,
  verifyEmailConnection
};
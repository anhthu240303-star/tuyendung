const { verifyToken } = require('../config/jwt');
const NguoiDung = require('../models/NguoiDung');
const { VAI_TRO } = require('../utils/constants');

// Middleware xác thực JWT
const xacThuc = async (req, res, next) => {
  try {
    // Lấy token từ header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Lấy thông tin user từ DB
    const user = await NguoiDung.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }
    
    if (user.trangThai === 'Khoa') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }
    
    // Gắn user vào request
    req.user = user;
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

// Middleware kiểm tra vai trò
const kiemTraVaiTro = (...vaiTroChoPhep) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }
    
    if (!vaiTroChoPhep.includes(req.user.vaiTro)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này'
      });
    }
    
    next();
  };
};

// Middleware chỉ cho phép Admin
const chiAdmin = kiemTraVaiTro(VAI_TRO.ADMIN);

// Middleware cho phép Admin và HR
const adminVaHR = kiemTraVaiTro(VAI_TRO.ADMIN, VAI_TRO.HR);

// Middleware cho phép Admin, HR và Interviewer
const tatCaNhanVien = kiemTraVaiTro(VAI_TRO.ADMIN, VAI_TRO.HR, VAI_TRO.INTERVIEWER);

// Optional auth - không bắt buộc đăng nhập
const xacThucTuyChon = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await NguoiDung.findById(decoded.id);
      
      if (user && user.trangThai !== 'Khoa') {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Không throw error, chỉ bỏ qua
    next();
  }
};

module.exports = {
  xacThuc,
  kiemTraVaiTro,
  chiAdmin,
  adminVaHR,
  tatCaNhanVien,
  xacThucTuyChon
};
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureDir } = require('../utils/helpers');

// Đảm bảo thư mục upload tồn tại
const uploadDirs = {
  cv: path.join(__dirname, '../../uploads/cv'),
  offer: path.join(__dirname, '../../uploads/offer'),
  temp: path.join(__dirname, '../../uploads/temp')
};

// Tạo các thư mục nếu chưa tồn tại
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration cho CV
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.cv);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `cv-${uniqueSuffix}-${sanitizedName}${ext}`);
  }
});

// Storage configuration cho Offer PDF
const offerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.offer);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `offer-${uniqueSuffix}.pdf`);
  }
});

// File filter cho CV (chỉ cho phép PDF)
const cvFileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF cho CV'), false);
  }
};

// File filter cho Offer
const offerFileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF'), false);
  }
};

// File filter cho hình ảnh
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPG, JPEG, PNG, GIF)'), false);
  }
};

// Cấu hình upload CV
const uploadCV = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

// Cấu hình upload Offer
const uploadOffer = multer({
  storage: offerStorage,
  fileFilter: offerFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Cấu hình upload avatar
const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads/avatars');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// Middleware xử lý lỗi upload
const xuLyLoiUpload = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 5MB'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Số lượng file vượt quá giới hạn'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Lỗi upload file: ' + err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Lỗi upload file'
    });
  }
  
  next();
};

// Middleware kiểm tra file đã upload
const kiemTraFileUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file'
      });
    }
    
    next();
  };
};

module.exports = {
  uploadCV,
  uploadOffer,
  uploadAvatar,
  xuLyLoiUpload,
  kiemTraFileUpload,
  uploadDirs
};
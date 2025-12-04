const { validationResult } = require('express-validator');

// Middleware kiểm tra kết quả validation
const kiemTraValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errorMessages
    });
  }
  
  next();
};

// Middleware kiểm tra ObjectId hợp lệ
const kiemTraObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `ID không hợp lệ: ${id}`
      });
    }
    
    next();
  };
};

// Middleware kiểm tra các ObjectId trong body
const kiemTraObjectIdTrongBody = (...fields) => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    
    for (const field of fields) {
      const value = req.body[field];
      
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} không hợp lệ`
        });
      }
    }
    
    next();
  };
};

// Middleware kiểm tra ngày tháng hợp lệ
const kiemTraNgayThang = (...fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      const value = req.body[field];
      
      if (value) {
        const date = new Date(value);
        
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: `${field} không phải là ngày hợp lệ`
          });
        }
      }
    }
    
    next();
  };
};

// Middleware kiểm tra email hợp lệ
const kiemTraEmail = (fieldName = 'email') => {
  return (req, res, next) => {
    const email = req.body[fieldName];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }
    
    next();
  };
};

// Middleware kiểm tra số điện thoại Việt Nam
const kiemTraSoDienThoai = (fieldName = 'soDienThoai') => {
  return (req, res, next) => {
    const phone = req.body[fieldName];
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại là bắt buộc'
      });
    }
    
    const phoneRegex = /^[0-9]{10,11}$/;
    
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ (10-11 chữ số)'
      });
    }
    
    next();
  };
};

// Middleware sanitize input
const sanitizeInput = (req, res, next) => {
  // Loại bỏ các ký tự nguy hiểm
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Loại bỏ HTML tags
        obj[key] = obj[key].replace(/<[^>]*>/g, '');
        // Trim whitespace
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Middleware giới hạn kích thước body
const giamHanKichThuocBody = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeInMB = parseInt(maxSize);
      
      if (sizeInMB > maxSizeInMB) {
        return res.status(413).json({
          success: false,
          message: `Dữ liệu quá lớn. Tối đa ${maxSize}`
        });
      }
    }
    
    next();
  };
};

module.exports = {
  kiemTraValidation,
  kiemTraObjectId,
  kiemTraObjectIdTrongBody,
  kiemTraNgayThang,
  kiemTraEmail,
  kiemTraSoDienThoai,
  sanitizeInput,
  giamHanKichThuocBody
};
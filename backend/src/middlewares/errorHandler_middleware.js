// Error handler middleware - phải đặt cuối cùng
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi ra console
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Dữ liệu không hợp lệ';
    error = {
      statusCode: 400,
      message
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let field = Object.keys(err.keyPattern)[0];
    let message = `${field} đã tồn tại trong hệ thống`;
    
    // Custom message cho từng field
    if (field === 'email') {
      message = 'Email này đã được đăng ký';
    } else if (field === 'slug') {
      message = 'Slug này đã tồn tại';
    }
    
    error = {
      statusCode: 400,
      message
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = {
      statusCode: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: messages
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token không hợp lệ'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token đã hết hạn'
    };
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = {
        statusCode: 400,
        message: 'File quá lớn'
      };
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = {
        statusCode: 400,
        message: 'Số lượng file vượt quá giới hạn'
      };
    } else {
      error = {
        statusCode: 400,
        message: err.message
      };
    }
  }

  // Lỗi không đủ quyền
  if (err.message && err.message.includes('không có quyền')) {
    error.statusCode = 403;
  }

  // Response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi máy chủ',
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    }),
    ...(error.errors && { errors: error.errors })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found error
const notFound = (req, res, next) => {
  const error = new AppError(
    `Không tìm thấy - ${req.originalUrl}`,
    404
  );
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFound
};
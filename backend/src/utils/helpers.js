const fs = require('fs').promises;
const path = require('path');

// Format ngày tháng
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Format ngày giờ
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Tạo slug từ tiêu đề
const createSlug = (text) => {
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Highlight từ khóa trong text
const highlightKeywords = (text, keywords) => {
  if (!text || !keywords || keywords.length === 0) return text;
  
  let highlightedText = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    highlightedText = highlightedText.replace(regex, `<mark>${keyword}</mark>`);
  });
  
  return highlightedText;
};

// Kiểm tra file tồn tại
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Xóa file
const deleteFile = async (filePath) => {
  try {
    if (await fileExists(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Lỗi xóa file:', error);
    return false;
  }
};

// Tạo thư mục nếu chưa tồn tại
const ensureDir = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('Lỗi tạo thư mục:', error);
    return false;
  }
};

// Generate mã ngẫu nhiên
const generateCode = (prefix = '', length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Pagination helper
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Response helper
const sendSuccess = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Có lỗi xảy ra', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  formatDate,
  formatDateTime,
  createSlug,
  highlightKeywords,
  fileExists,
  deleteFile,
  ensureDir,
  generateCode,
  getPaginationParams,
  sendSuccess,
  sendError
};
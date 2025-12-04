const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { VAI_TRO } = require('../utils/constants');

const nguoiDungSchema = new mongoose.Schema({
  hoTen: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    maxlength: [100, 'Họ tên không được quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  matKhauHash: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về mật khẩu khi query
  },
  vaiTro: {
    type: String,
    enum: Object.values(VAI_TRO),
    default: VAI_TRO.HR,
    required: true
  },
  soDienThoai: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  avatar: {
    type: String,
    default: null
  },
  trangThai: {
    type: String,
    enum: ['Hoat_dong', 'Khoa'],
    default: 'Hoat_dong'
  },
  lanDangNhapCuoi: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'nguoi_dung'
});

// Index
nguoiDungSchema.index({ email: 1 });
nguoiDungSchema.index({ vaiTro: 1 });

// Hash mật khẩu trước khi lưu
nguoiDungSchema.pre('save', async function(next) {
  if (!this.isModified('matKhauHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.matKhauHash = await bcrypt.hash(this.matKhauHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method so sánh mật khẩu
nguoiDungSchema.methods.kiemTraMatKhau = async function(matKhauNhap) {
  return await bcrypt.compare(matKhauNhap, this.matKhauHash);
};

// Ẩn thông tin nhạy cảm khi trả về JSON
nguoiDungSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.matKhauHash;
  delete obj.__v;
  return obj;
};

const NguoiDung = mongoose.model('NguoiDung', nguoiDungSchema);

module.exports = NguoiDung;
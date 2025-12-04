const mongoose = require('mongoose');
const { VAI_TRO_HOI_DONG } = require('../utils/constants');

const thanhVienSchema = new mongoose.Schema({
  nguoiDungId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  vaiTro: {
    type: String,
    enum: Object.values(VAI_TRO_HOI_DONG),
    required: true
  },
  ngayThamGia: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const hoiDongPhongVanSchema = new mongoose.Schema({
  ten: {
    type: String,
    required: [true, 'Vui lòng nhập tên hội đồng'],
    trim: true,
    maxlength: [200, 'Tên hội đồng không được quá 200 ký tự']
  },
  moTa: {
    type: String,
    trim: true
  },
  thanhVien: {
    type: [thanhVienSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Hội đồng phải có ít nhất 1 thành viên'
    }
  },
  trangThai: {
    type: String,
    enum: ['Hoat_dong', 'Khong_hoat_dong'],
    default: 'Hoat_dong'
  },
  taoBoi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  soLuocPhongVan: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'hoi_dong_phong_van'
});

// Index
hoiDongPhongVanSchema.index({ ten: 1 });
hoiDongPhongVanSchema.index({ trangThai: 1 });
hoiDongPhongVanSchema.index({ 'thanhVien.nguoiDungId': 1 });

// Virtual để đếm số thành viên
hoiDongPhongVanSchema.virtual('soThanhVien').get(function() {
  return this.thanhVien.length;
});

// Validate: Chỉ có 1 chủ tịch
hoiDongPhongVanSchema.pre('save', function(next) {
  const chuTichCount = this.thanhVien.filter(
    tv => tv.vaiTro === VAI_TRO_HOI_DONG.CHU_TICH
  ).length;
  
  if (chuTichCount > 1) {
    return next(new Error('Hội đồng chỉ có thể có 1 chủ tịch'));
  }
  
  // Check trùng thành viên
  const nguoiDungIds = this.thanhVien.map(tv => tv.nguoiDungId.toString());
  const uniqueIds = new Set(nguoiDungIds);
  
  if (nguoiDungIds.length !== uniqueIds.size) {
    return next(new Error('Không thể thêm trùng thành viên trong hội đồng'));
  }
  
  next();
});

// Method thêm thành viên
hoiDongPhongVanSchema.methods.themThanhVien = function(nguoiDungId, vaiTro) {
  const exists = this.thanhVien.some(
    tv => tv.nguoiDungId.toString() === nguoiDungId.toString()
  );
  
  if (exists) {
    throw new Error('Thành viên đã tồn tại trong hội đồng');
  }
  
  this.thanhVien.push({ nguoiDungId, vaiTro });
};

// Method xóa thành viên
hoiDongPhongVanSchema.methods.xoaThanhVien = function(nguoiDungId) {
  this.thanhVien = this.thanhVien.filter(
    tv => tv.nguoiDungId.toString() !== nguoiDungId.toString()
  );
  
  if (this.thanhVien.length === 0) {
    throw new Error('Hội đồng phải có ít nhất 1 thành viên');
  }
};

const HoiDongPhongVan = mongoose.model('HoiDongPhongVan', hoiDongPhongVanSchema);

module.exports = HoiDongPhongVan;
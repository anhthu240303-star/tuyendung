const mongoose = require('mongoose');
const { TRANG_THAI_UNG_VIEN } = require('../utils/constants');

const lichSuSchema = new mongoose.Schema({
  trangThaiCu: {
    type: String,
    enum: Object.values(TRANG_THAI_UNG_VIEN)
  },
  trangThaiMoi: {
    type: String,
    enum: Object.values(TRANG_THAI_UNG_VIEN),
    required: true
  },
  nguoiThayDoi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung'
  },
  ghiChu: {
    type: String,
    trim: true
  },
  thoiGian: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const goiYSchema = new mongoose.Schema({
  tieuChi: {
    type: String,
    required: true,
    trim: true
  },
  ketQua: {
    type: String,
    enum: ['Dat', 'Khong_dat', 'Chua_danh_gia'],
    default: 'Chua_danh_gia'
  },
  ghiChu: {
    type: String,
    trim: true
  }
}, { _id: false });

const ungVienSchema = new mongoose.Schema({
  hoTen: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    maxlength: [100, 'Họ tên không được quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  soDienThoai: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  ngaySinh: {
    type: Date
  },
  gioiTinh: {
    type: String,
    enum: ['Nam', 'Nu', 'Khac']
  },
  diaChi: {
    type: String,
    trim: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TinTuyenDung',
    required: true
  },
  cvUrl: {
    type: String,
    required: [true, 'Vui lòng upload CV']
  },
  cvFileName: {
    type: String
  },
  thuUngTuyen: {
    type: String,
    trim: true
  },
  kinhNghiem: {
    type: Number,
    default: 0,
    min: 0
  },
  kyNangNoiBat: [{
    type: String,
    trim: true
  }],
  hocVan: {
    type: String,
    trim: true
  },
  trangThai: {
    type: String,
    enum: Object.values(TRANG_THAI_UNG_VIEN),
    default: TRANG_THAI_UNG_VIEN.MOI_NOP
  },
  goiY: {
    type: [goiYSchema],
    default: []
  },
  diemSangLoc: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  nhanXetSangLoc: {
    type: String,
    trim: true
  },
  nguoiSangLoc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung'
  },
  ngaySangLoc: {
    type: Date
  },
  lichSu: {
    type: [lichSuSchema],
    default: []
  },
  ngayNop: {
    type: Date,
    default: Date.now
  },
  nguonUngTuyen: {
    type: String,
    enum: ['Website', 'Email', 'Gioi_thieu', 'Mang_xa_hoi', 'Khac'],
    default: 'Website'
  }
}, {
  timestamps: true,
  collection: 'ung_vien'
});

// Index
ungVienSchema.index({ jobId: 1 });
ungVienSchema.index({ email: 1, jobId: 1 });
ungVienSchema.index({ trangThai: 1 });
ungVienSchema.index({ ngayNop: -1 });

// Thêm vào lịch sử khi thay đổi trạng thái
ungVienSchema.pre('save', function(next) {
  if (this.isModified('trangThai')) {
    const lichSuMoi = {
      trangThaiCu: this._previousTrangThai || null,
      trangThaiMoi: this.trangThai,
      nguoiThayDoi: this._nguoiThayDoi || null,
      ghiChu: this._ghiChuThayDoi || null,
      thoiGian: new Date()
    };
    
    this.lichSu.push(lichSuMoi);
    
    // Cleanup temporary fields
    delete this._previousTrangThai;
    delete this._nguoiThayDoi;
    delete this._ghiChuThayDoi;
  }
  next();
});

// Method để cập nhật trạng thái với thông tin người thay đổi
ungVienSchema.methods.capNhatTrangThai = function(trangThaiMoi, nguoiThayDoiId, ghiChu = null) {
  this._previousTrangThai = this.trangThai;
  this._nguoiThayDoi = nguoiThayDoiId;
  this._ghiChuThayDoi = ghiChu;
  this.trangThai = trangThaiMoi;
};

const UngVien = mongoose.model('UngVien', ungVienSchema);

module.exports = UngVien;
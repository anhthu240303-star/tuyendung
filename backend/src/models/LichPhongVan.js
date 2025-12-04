const mongoose = require('mongoose');
const { TRANG_THAI_LICH_PV, HINH_THUC_PHONG_VAN } = require('../utils/constants');

const lichPhongVanSchema = new mongoose.Schema({
  ungVienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UngVien',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TinTuyenDung',
    required: true
  },
  hoiDongId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoiDongPhongVan',
    required: true
  },
  thoiGianBatDau: {
    type: Date,
    required: [true, 'Vui lòng chọn thời gian bắt đầu']
  },
  thoiGianKetThuc: {
    type: Date,
    required: [true, 'Vui lòng chọn thời gian kết thúc']
  },
  diaDiem: {
    type: String,
    trim: true
  },
  linkOnline: {
    type: String,
    trim: true
  },
  hinhThuc: {
    type: String,
    enum: Object.values(HINH_THUC_PHONG_VAN),
    required: true
  },
  trangThai: {
    type: String,
    enum: Object.values(TRANG_THAI_LICH_PV),
    default: TRANG_THAI_LICH_PV.CHO_XAC_NHAN
  },
  noiDung: {
    type: String,
    trim: true
  },
  ghiChu: {
    type: String,
    trim: true
  },
  taoBoi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  ngayXacNhan: {
    type: Date
  },
  nguoiXacNhan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung'
  },
  lyDoTuChoi: {
    type: String,
    trim: true
  },
  lyDoHuy: {
    type: String,
    trim: true
  },
  nguoiHuy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung'
  },
  ngayHuy: {
    type: Date
  },
  emailDaGui: {
    type: Boolean,
    default: false
  },
  tokenXacNhan: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  collection: 'lich_phong_van'
});

// Index
lichPhongVanSchema.index({ ungVienId: 1 });
lichPhongVanSchema.index({ jobId: 1 });
lichPhongVanSchema.index({ hoiDongId: 1 });
lichPhongVanSchema.index({ thoiGianBatDau: 1 });
lichPhongVanSchema.index({ trangThai: 1 });
lichPhongVanSchema.index({ tokenXacNhan: 1 });

// Validate thời gian
lichPhongVanSchema.pre('save', function(next) {
  if (this.thoiGianKetThuc <= this.thoiGianBatDau) {
    return next(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
  }
  
  // Validate địa điểm hoặc link online
  if (this.hinhThuc === HINH_THUC_PHONG_VAN.TRUC_TIEP && !this.diaDiem) {
    return next(new Error('Vui lòng nhập địa điểm phỏng vấn'));
  }
  
  if (this.hinhThuc === HINH_THUC_PHONG_VAN.ONLINE && !this.linkOnline) {
    return next(new Error('Vui lòng nhập link phỏng vấn online'));
  }
  
  next();
});

// Virtual để kiểm tra đã qua
lichPhongVanSchema.virtual('daQua').get(function() {
  return new Date() > this.thoiGianKetThuc;
});

// Virtual để tính thời lượng (phút)
lichPhongVanSchema.virtual('thoiLuong').get(function() {
  const diff = this.thoiGianKetThuc - this.thoiGianBatDau;
  return Math.round(diff / (1000 * 60));
});

// Method xác nhận lịch
lichPhongVanSchema.methods.xacNhan = function(nguoiXacNhanId) {
  this.trangThai = TRANG_THAI_LICH_PV.DA_XAC_NHAN;
  this.ngayXacNhan = new Date();
  this.nguoiXacNhan = nguoiXacNhanId;
};

// Method từ chối lịch
lichPhongVanSchema.methods.tuChoi = function(lyDo) {
  this.trangThai = TRANG_THAI_LICH_PV.TU_CHOI;
  this.lyDoTuChoi = lyDo;
};

// Method hủy lịch
lichPhongVanSchema.methods.huy = function(nguoiHuyId, lyDo) {
  this.trangThai = TRANG_THAI_LICH_PV.HUY;
  this.nguoiHuy = nguoiHuyId;
  this.ngayHuy = new Date();
  this.lyDoHuy = lyDo;
};

const LichPhongVan = mongoose.model('LichPhongVan', lichPhongVanSchema);

module.exports = LichPhongVan;
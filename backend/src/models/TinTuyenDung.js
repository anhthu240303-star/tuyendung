const mongoose = require('mongoose');
const { TRANG_THAI_TIN } = require('../utils/constants');

const tinTuyenDungSchema = new mongoose.Schema({
  tieuDe: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề tin tuyển dụng'],
    trim: true,
    maxlength: [300, 'Tiêu đề không được quá 300 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  moTa: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả công việc'],
    trim: true
  },
  yeuCau: {
    type: String,
    required: [true, 'Vui lòng nhập yêu cầu ứng viên'],
    trim: true
  },
  quyenLoi: {
    type: String,
    trim: true
  },
  kyNangBatBuoc: [{
    type: String,
    trim: true
  }],
  kyNangMongMuon: [{
    type: String,
    trim: true
  }],
  kinhNghiemToiThieu: {
    type: Number,
    default: 0,
    min: [0, 'Kinh nghiệm không được âm']
  },
  capBac: {
    type: String,
    enum: ['Thuc_tap', 'Nhan_vien', 'Truong_nhom', 'Quan_ly', 'Giam_doc'],
    default: 'Nhan_vien'
  },
  hinhThucLamViec: {
    type: String,
    enum: ['Toan_thoi_gian', 'Ban_thoi_gian', 'Thuc_tap', 'Hop_dong'],
    default: 'Toan_thoi_gian'
  },
  mucLuong: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    donVi: {
      type: String,
      default: 'VND'
    },
    hienThi: {
      type: Boolean,
      default: true
    }
  },
  diaDiem: {
    type: String,
    required: [true, 'Vui lòng nhập địa điểm làm việc'],
    trim: true
  },
  soLuongTuyen: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tuyển'],
    min: [1, 'Số lượng tuyển phải lớn hơn 0']
  },
  soLuongDaTuyen: {
    type: Number,
    default: 0,
    min: 0
  },
  hanNop: {
    type: Date,
    required: [true, 'Vui lòng nhập hạn nộp hồ sơ']
  },
  quyTrinhId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuyTrinhTuyenDung',
    required: true
  },
  trangThai: {
    type: String,
    enum: Object.values(TRANG_THAI_TIN),
    default: TRANG_THAI_TIN.NHAP
  },
  taoBoi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  ngayDang: {
    type: Date,
    default: null
  },
  luotXem: {
    type: Number,
    default: 0
  },
  soLuongUngTuyen: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'tin_tuyen_dung'
});

// Index
tinTuyenDungSchema.index({ slug: 1 });
tinTuyenDungSchema.index({ trangThai: 1 });
tinTuyenDungSchema.index({ hanNop: 1 });
tinTuyenDungSchema.index({ taoBoi: 1 });
tinTuyenDungSchema.index({ createdAt: -1 });

// Virtual để kiểm tra còn hạn
tinTuyenDungSchema.virtual('conHan').get(function() {
  return new Date() < new Date(this.hanNop);
});

// Virtual để kiểm tra đã tuyển đủ
tinTuyenDungSchema.virtual('daTuyenDu').get(function() {
  return this.soLuongDaTuyen >= this.soLuongTuyen;
});

// Tự động tạo slug từ tiêu đề
tinTuyenDungSchema.pre('save', async function(next) {
  if (this.isModified('tieuDe') && !this.slug) {
    const { createSlug } = require('../utils/helpers');
    let slug = createSlug(this.tieuDe);
    
    // Kiểm tra trùng lặp
    let slugExists = await this.constructor.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${createSlug(this.tieuDe)}-${counter}`;
      slugExists = await this.constructor.findOne({ slug });
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Set ngày đăng khi chuyển sang trạng thái Dang_tuyen
  if (this.isModified('trangThai') && this.trangThai === TRANG_THAI_TIN.DANG_TUYEN && !this.ngayDang) {
    this.ngayDang = new Date();
  }
  
  next();
});

const TinTuyenDung = mongoose.model('TinTuyenDung', tinTuyenDungSchema);

module.exports = TinTuyenDung;
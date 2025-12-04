const mongoose = require('mongoose');

const thuMoiNhanViecSchema = new mongoose.Schema({
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
  maOffer: {
    type: String,
    unique: true,
    required: true
  },
  viTri: {
    type: String,
    required: true,
    trim: true
  },
  phongBan: {
    type: String,
    trim: true
  },
  mucLuong: {
    coban: {
      type: Number,
      required: true,
      min: 0
    },
    phucap: {
      type: Number,
      default: 0
    },
    thuong: {
      type: String,
      trim: true
    },
    donVi: {
      type: String,
      default: 'VND'
    }
  },
  ngayBatDau: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày bắt đầu làm việc']
  },
  thoiGianThuViec: {
    soThang: {
      type: Number,
      default: 2,
      min: 0
    },
    mucLuongThuViec: {
      type: Number,
      default: 85,
      min: 0,
      max: 100
    }
  },
  dieuKhoan: [{
    type: String,
    trim: true
  }],
  quyenLoi: [{
    type: String,
    trim: true
  }],
  diaDiemLamViec: {
    type: String,
    required: true,
    trim: true
  },
  nguoiLienHe: {
    hoTen: String,
    chucVu: String,
    email: String,
    soDienThoai: String
  },
  hanTraLoi: {
    type: Date,
    required: [true, 'Vui lòng chọn hạn trả lời']
  },
  trangThai: {
    type: String,
    enum: ['Cho_tra_loi', 'Da_chap_nhan', 'Da_tu_choi', 'Het_han', 'Da_huy'],
    default: 'Cho_tra_loi'
  },
  pdfUrl: {
    type: String
  },
  pdfFileName: {
    type: String
  },
  taoBoi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  ngayGui: {
    type: Date,
    default: null
  },
  emailDaGui: {
    type: Boolean,
    default: false
  },
  ngayTraLoi: {
    type: Date
  },
  lyDoTuChoi: {
    type: String,
    trim: true
  },
  ghiChu: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'thu_moi_nhan_viec'
});

// Index
thuMoiNhanViecSchema.index({ ungVienId: 1 });
thuMoiNhanViecSchema.index({ jobId: 1 });
thuMoiNhanViecSchema.index({ maOffer: 1 });
thuMoiNhanViecSchema.index({ trangThai: 1 });
thuMoiNhanViecSchema.index({ ngayGui: -1 });

// Virtual để kiểm tra hết hạn
thuMoiNhanViecSchema.virtual('hetHan').get(function() {
  return new Date() > new Date(this.hanTraLoi);
});

// Tự động tạo mã offer
thuMoiNhanViecSchema.pre('save', async function(next) {
  if (!this.maOffer) {
    const { generateCode } = require('../utils/helpers');
    let maOffer;
    let exists = true;
    
    while (exists) {
      maOffer = generateCode('OFF', 8);
      exists = await this.constructor.findOne({ maOffer });
    }
    
    this.maOffer = maOffer;
  }
  next();
});

// Method chấp nhận offer
thuMoiNhanViecSchema.methods.chapNhan = function() {
  this.trangThai = 'Da_chap_nhan';
  this.ngayTraLoi = new Date();
};

// Method từ chối offer
thuMoiNhanViecSchema.methods.tuChoi = function(lyDo) {
  this.trangThai = 'Da_tu_choi';
  this.ngayTraLoi = new Date();
  this.lyDoTuChoi = lyDo;
};

const ThuMoiNhanViec = mongoose.model('ThuMoiNhanViec', thuMoiNhanViecSchema);

module.exports = ThuMoiNhanViec;
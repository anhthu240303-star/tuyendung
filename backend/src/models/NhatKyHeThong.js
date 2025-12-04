const mongoose = require('mongoose');
const { LOAI_HANH_DONG, DOI_TUONG_LOG } = require('../utils/constants');

const nhatKyHeThongSchema = new mongoose.Schema({
  doiTuong: {
    type: String,
    enum: Object.values(DOI_TUONG_LOG),
    required: true
  },
  doiTuongId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  hanhDong: {
    type: String,
    enum: Object.values(LOAI_HANH_DONG),
    required: true
  },
  moTa: {
    type: String,
    trim: true
  },
  thucHienBoi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  chiTiet: {
    type: mongoose.Schema.Types.Mixed
  },
  duLieuCu: {
    type: mongoose.Schema.Types.Mixed
  },
  duLieuMoi: {
    type: mongoose.Schema.Types.Mixed
  },
  thoiGian: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'nhat_ky_he_thong'
});

// Index
nhatKyHeThongSchema.index({ doiTuong: 1, doiTuongId: 1 });
nhatKyHeThongSchema.index({ thucHienBoi: 1 });
nhatKyHeThongSchema.index({ hanhDong: 1 });
nhatKyHeThongSchema.index({ thoiGian: -1 });

// TTL Index: Tự động xóa log sau 1 năm (optional)
nhatKyHeThongSchema.index({ thoiGian: 1 }, { expireAfterSeconds: 31536000 });

// Static method để tạo log
nhatKyHeThongSchema.statics.taoLog = async function({
  doiTuong,
  doiTuongId,
  hanhDong,
  moTa,
  thucHienBoi,
  chiTiet = null,
  duLieuCu = null,
  duLieuMoi = null,
  req = null
}) {
  const logData = {
    doiTuong,
    doiTuongId,
    hanhDong,
    moTa,
    thucHienBoi,
    chiTiet,
    duLieuCu,
    duLieuMoi
  };

  // Lấy thông tin từ request nếu có
  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('user-agent');
  }

  return await this.create(logData);
};

// Static method để lấy lịch sử của đối tượng
nhatKyHeThongSchema.statics.layLichSu = async function(doiTuong, doiTuongId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.find({ doiTuong, doiTuongId })
      .populate('thucHienBoi', 'hoTen email')
      .sort({ thoiGian: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ doiTuong, doiTuongId })
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const NhatKyHeThong = mongoose.model('NhatKyHeThong', nhatKyHeThongSchema);

module.exports = NhatKyHeThong;
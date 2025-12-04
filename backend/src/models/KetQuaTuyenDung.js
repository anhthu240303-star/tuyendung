const mongoose = require('mongoose');
const { KET_QUA_TUYEN_DUNG } = require('../utils/constants');

const ketQuaTuyenDungSchema = new mongoose.Schema({
  ungVienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UngVien',
    required: true,
    unique: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TinTuyenDung',
    required: true
  },
  ketQua: {
    type: String,
    enum: Object.values(KET_QUA_TUYEN_DUNG),
    required: true
  },
  diemTongHop: {
    type: Number,
    min: 0,
    max: 100
  },
  lyDo: {
    type: String,
    trim: true
  },
  nguoiQuyetDinh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  ngayQuyetDinh: {
    type: Date,
    default: Date.now
  },
  ghiChu: {
    type: String,
    trim: true
  },
  danhGiaChung: {
    type: String,
    trim: true
  },
  cacBuocDaHoanThanh: [{
    tenBuoc: String,
    trangThai: String,
    ngayHoanThanh: Date
  }],
  fileDinhKem: [{
    tenFile: String,
    duongDan: String,
    loai: String
  }]
}, {
  timestamps: true,
  collection: 'ket_qua_tuyen_dung'
});

// Index
ketQuaTuyenDungSchema.index({ ungVienId: 1 });
ketQuaTuyenDungSchema.index({ jobId: 1 });
ketQuaTuyenDungSchema.index({ ketQua: 1 });
ketQuaTuyenDungSchema.index({ nguoiQuyetDinh: 1 });
ketQuaTuyenDungSchema.index({ ngayQuyetDinh: -1 });

const KetQuaTuyenDung = mongoose.model('KetQuaTuyenDung', ketQuaTuyenDungSchema);

module.exports = KetQuaTuyenDung;
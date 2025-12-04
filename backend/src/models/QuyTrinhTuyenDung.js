const mongoose = require('mongoose');

const buocQuyTrinhSchema = new mongoose.Schema({
  thuTu: {
    type: Number,
    required: true
  },
  tenBuoc: {
    type: String,
    required: [true, 'Vui lòng nhập tên bước'],
    trim: true
  },
  moTa: {
    type: String,
    trim: true
  },
  batBuoc: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const quyTrinhTuyenDungSchema = new mongoose.Schema({
  ten: {
    type: String,
    required: [true, 'Vui lòng nhập tên quy trình'],
    trim: true,
    maxlength: [200, 'Tên quy trình không được quá 200 ký tự']
  },
  moTa: {
    type: String,
    trim: true
  },
  cacBuoc: {
    type: [buocQuyTrinhSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Quy trình phải có ít nhất 1 bước'
    }
  },
  macDinh: {
    type: Boolean,
    default: false
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
  }
}, {
  timestamps: true,
  collection: 'quy_trinh_tuyen_dung'
});

// Index
quyTrinhTuyenDungSchema.index({ ten: 1 });
quyTrinhTuyenDungSchema.index({ macDinh: 1 });

// Virtual để đếm số bước
quyTrinhTuyenDungSchema.virtual('soBuoc').get(function() {
  return this.cacBuoc.length;
});

// Đảm bảo chỉ có 1 quy trình mặc định
quyTrinhTuyenDungSchema.pre('save', async function(next) {
  if (this.macDinh && this.isModified('macDinh')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { macDinh: false }
    );
  }
  next();
});

const QuyTrinhTuyenDung = mongoose.model('QuyTrinhTuyenDung', quyTrinhTuyenDungSchema);

module.exports = QuyTrinhTuyenDung;
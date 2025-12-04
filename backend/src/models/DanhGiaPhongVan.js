const mongoose = require('mongoose');

const tieuChiDanhGiaSchema = new mongoose.Schema({
  tenTieuChi: {
    type: String,
    required: true,
    trim: true
  },
  diem: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  trongSo: {
    type: Number,
    default: 1,
    min: 0
  },
  ghiChu: {
    type: String,
    trim: true
  }
}, { _id: false });

const danhGiaPhongVanSchema = new mongoose.Schema({
  lichPhongVanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LichPhongVan',
    required: true
  },
  ungVienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UngVien',
    required: true
  },
  nguoiDanhGiaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NguoiDung',
    required: true
  },
  cacTieuChi: {
    type: [tieuChiDanhGiaSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Phải có ít nhất 1 tiêu chí đánh giá'
    }
  },
  tongDiem: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  nhanXet: {
    type: String,
    trim: true
  },
  diemManh: {
    type: String,
    trim: true
  },
  diemYeu: {
    type: String,
    trim: true
  },
  deXuat: {
    type: String,
    enum: ['Tuyen', 'Khong_tuyen', 'Can_them_phong_van', 'Chua_quyet_dinh'],
    default: 'Chua_quyet_dinh'
  },
  thoiGianDanhGia: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'danh_gia_phong_van'
});

// Index
danhGiaPhongVanSchema.index({ lichPhongVanId: 1 });
danhGiaPhongVanSchema.index({ ungVienId: 1 });
danhGiaPhongVanSchema.index({ nguoiDanhGiaId: 1 });

// Unique constraint: Mỗi người chỉ đánh giá 1 lần cho 1 lịch phỏng vấn
danhGiaPhongVanSchema.index(
  { lichPhongVanId: 1, nguoiDanhGiaId: 1 },
  { unique: true }
);

// Tự động tính tổng điểm trước khi lưu
danhGiaPhongVanSchema.pre('save', function(next) {
  if (this.isModified('cacTieuChi')) {
    let tongDiem = 0;
    let tongTrongSo = 0;
    
    this.cacTieuChi.forEach(tc => {
      tongDiem += tc.diem * tc.trongSo;
      tongTrongSo += tc.trongSo;
    });
    
    // Chuẩn hóa về thang điểm 100
    this.tongDiem = tongTrongSo > 0 
      ? Math.round((tongDiem / tongTrongSo) * 10) 
      : 0;
  }
  next();
});

// Method để thêm tiêu chí
danhGiaPhongVanSchema.methods.themTieuChi = function(tenTieuChi, diem, trongSo = 1, ghiChu = '') {
  this.cacTieuChi.push({ tenTieuChi, diem, trongSo, ghiChu });
};

// Static method để lấy điểm trung bình của ứng viên
danhGiaPhongVanSchema.statics.layDiemTrungBinh = async function(ungVienId) {
  const result = await this.aggregate([
    { $match: { ungVienId: mongoose.Types.ObjectId(ungVienId) } },
    {
      $group: {
        _id: null,
        diemTrungBinh: { $avg: '$tongDiem' },
        soLuotDanhGia: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { diemTrungBinh: 0, soLuotDanhGia: 0 };
};

const DanhGiaPhongVan = mongoose.model('DanhGiaPhongVan', danhGiaPhongVanSchema);

module.exports = DanhGiaPhongVan;
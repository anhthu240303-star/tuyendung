const DanhGiaPhongVan = require('../models/DanhGiaPhongVan');
const LichPhongVan = require('../models/LichPhongVan');
const UngVien = require('../models/UngVien');
const HoiDongPhongVan = require('../models/HoiDongPhongVan');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const nhatKyService = require('../services/nhatKy_service');
const excelService = require('../services/excel_service');

// @desc    Tạo đánh giá phỏng vấn
// @route   POST /api/danh-gia
// @access  Private (Interviewer)
const taoMoi = asyncHandler(async (req, res) => {
  const {
    lichPhongVanId,
    ungVienId,
    cacTieuChi,
    nhanXet,
    diemManh,
    diemYeu,
    deXuat
  } = req.body;

  // Validate lịch phỏng vấn
  const lich = await LichPhongVan.findById(lichPhongVanId)
    .populate('hoiDongId');

  if (!lich) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch phỏng vấn'
    });
  }

  // Kiểm tra người dùng có trong hội đồng không
  const hoiDong = lich.hoiDongId;
  const laThanhVien = hoiDong.thanhVien.some(
    tv => tv.nguoiDungId.toString() === req.user._id.toString()
  );

  if (!laThanhVien) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không phải thành viên của hội đồng phỏng vấn này'
    });
  }

  // Kiểm tra đã đánh giá chưa
  const daDanhGia = await DanhGiaPhongVan.findOne({
    lichPhongVanId,
    nguoiDanhGiaId: req.user._id
  });

  if (daDanhGia) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã đánh giá phỏng vấn này rồi'
    });
  }

  // Validate tiêu chí
  if (!cacTieuChi || cacTieuChi.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Phải có ít nhất 1 tiêu chí đánh giá'
    });
  }

  const danhGia = await DanhGiaPhongVan.create({
    lichPhongVanId,
    ungVienId,
    nguoiDanhGiaId: req.user._id,
    cacTieuChi,
    nhanXet,
    diemManh,
    diemYeu,
    deXuat
  });

  // Log
  await nhatKyService.logDanhGia(
    ungVienId,
    req.user._id,
    lichPhongVanId,
    danhGia.tongDiem,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Đánh giá phỏng vấn thành công',
    data: danhGia
  });
});

// @desc    Lấy danh sách đánh giá của ứng viên
// @route   GET /api/danh-gia/ung-vien/:ungVienId
// @access  Private (Admin, HR, Interviewer)
const layTheoUngVien = asyncHandler(async (req, res) => {
  const { ungVienId } = req.params;

  const danhGia = await DanhGiaPhongVan.find({ ungVienId })
    .populate('nguoiDanhGiaId', 'hoTen email vaiTro')
    .populate('lichPhongVanId')
    .sort({ thoiGianDanhGia: -1 });

  // Tính điểm trung bình
  const diemTB = danhGia.length > 0
    ? danhGia.reduce((sum, dg) => sum + dg.tongDiem, 0) / danhGia.length
    : 0;

  res.json({
    success: true,
    data: {
      danhGia,
      thongKe: {
        soLuotDanhGia: danhGia.length,
        diemTrungBinh: diemTB.toFixed(2)
      }
    }
  });
});

// @desc    Lấy danh sách đánh giá của lịch phỏng vấn
// @route   GET /api/danh-gia/lich/:lichPhongVanId
// @access  Private (Admin, HR, Interviewer)
const layTheoLich = asyncHandler(async (req, res) => {
  const { lichPhongVanId } = req.params;

  const danhGia = await DanhGiaPhongVan.find({ lichPhongVanId })
    .populate('nguoiDanhGiaId', 'hoTen email vaiTro')
    .populate('ungVienId', 'hoTen email')
    .sort({ thoiGianDanhGia: -1 });

  // Tính điểm trung bình
  const diemTB = danhGia.length > 0
    ? danhGia.reduce((sum, dg) => sum + dg.tongDiem, 0) / danhGia.length
    : 0;

  res.json({
    success: true,
    data: {
      danhGia,
      thongKe: {
        soLuotDanhGia: danhGia.length,
        diemTrungBinh: diemTB.toFixed(2)
      }
    }
  });
});

// @desc    Lấy chi tiết đánh giá
// @route   GET /api/danh-gia/:id
// @access  Private (Admin, HR, Interviewer)
const layChiTiet = asyncHandler(async (req, res) => {
  const danhGia = await DanhGiaPhongVan.findById(req.params.id)
    .populate('nguoiDanhGiaId', 'hoTen email vaiTro')
    .populate('ungVienId')
    .populate('lichPhongVanId');

  if (!danhGia) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đánh giá'
    });
  }

  res.json({
    success: true,
    data: danhGia
  });
});

// @desc    Cập nhật đánh giá
// @route   PUT /api/danh-gia/:id
// @access  Private (Interviewer - chỉ người tạo)
const capNhat = asyncHandler(async (req, res) => {
  const danhGia = await DanhGiaPhongVan.findById(req.params.id);

  if (!danhGia) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đánh giá'
    });
  }

  // Chỉ người tạo mới được cập nhật
  if (danhGia.nguoiDanhGiaId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật đánh giá này'
    });
  }

  const duLieuCu = { ...danhGia.toObject() };

  const fieldsToUpdate = [
    'cacTieuChi', 'nhanXet', 'diemManh', 'diemYeu', 'deXuat'
  ];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      danhGia[field] = req.body[field];
    }
  });

  await danhGia.save();

  // Log
  await nhatKyService.logCapNhat(
    'DanhGiaPhongVan',
    danhGia._id,
    req.user._id,
    duLieuCu,
    danhGia.toObject(),
    'Cập nhật đánh giá phỏng vấn',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật đánh giá thành công',
    data: danhGia
  });
});

// @desc    Xóa đánh giá
// @route   DELETE /api/danh-gia/:id
// @access  Private (Admin hoặc người tạo)
const xoa = asyncHandler(async (req, res) => {
  const danhGia = await DanhGiaPhongVan.findById(req.params.id);

  if (!danhGia) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đánh giá'
    });
  }

  // Chỉ Admin hoặc người tạo mới được xóa
  if (
    req.user.vaiTro !== 'Admin' &&
    danhGia.nguoiDanhGiaId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa đánh giá này'
    });
  }

  await danhGia.deleteOne();

  // Log
  await nhatKyService.logXoa(
    'DanhGiaPhongVan',
    danhGia._id,
    req.user._id,
    'Xóa đánh giá phỏng vấn',
    req
  );

  res.json({
    success: true,
    message: 'Xóa đánh giá thành công'
  });
});

// @desc    Tổng hợp điểm của ứng viên
// @route   GET /api/danh-gia/tong-hop/:ungVienId
// @access  Private (Admin, HR)
const tongHopDiem = asyncHandler(async (req, res) => {
  const { ungVienId } = req.params;

  const ungVien = await UngVien.findById(ungVienId)
    .populate('jobId', 'tieuDe');

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  const danhGia = await DanhGiaPhongVan.find({ ungVienId })
    .populate('nguoiDanhGiaId', 'hoTen email vaiTro')
    .populate('lichPhongVanId', 'thoiGianBatDau hinhThuc');

  if (danhGia.length === 0) {
    return res.json({
      success: true,
      data: {
        ungVien: {
          hoTen: ungVien.hoTen,
          email: ungVien.email,
          viTri: ungVien.jobId.tieuDe
        },
        danhGia: [],
        tongHop: {
          soLuotDanhGia: 0,
          diemTrungBinh: 0,
          diemCaoNhat: 0,
          diemThapNhat: 0
        }
      }
    });
  }

  // Tính toán thống kê
  const cacDiem = danhGia.map(dg => dg.tongDiem);
  const diemTB = cacDiem.reduce((sum, d) => sum + d, 0) / cacDiem.length;
  const diemCaoNhat = Math.max(...cacDiem);
  const diemThapNhat = Math.min(...cacDiem);

  // Đếm đề xuất
  const deXuatCount = {
    tuyen: danhGia.filter(dg => dg.deXuat === 'Tuyen').length,
    khongTuyen: danhGia.filter(dg => dg.deXuat === 'Khong_tuyen').length,
    canThem: danhGia.filter(dg => dg.deXuat === 'Can_them_phong_van').length,
    chuaQuyetDinh: danhGia.filter(dg => dg.deXuat === 'Chua_quyet_dinh').length
  };

  res.json({
    success: true,
    data: {
      ungVien: {
        _id: ungVien._id,
        hoTen: ungVien.hoTen,
        email: ungVien.email,
        viTri: ungVien.jobId.tieuDe
      },
      danhGia,
      tongHop: {
        soLuotDanhGia: danhGia.length,
        diemTrungBinh: diemTB.toFixed(2),
        diemCaoNhat,
        diemThapNhat,
        deXuat: deXuatCount,
        deXuatPhoThong: deXuatCount.tuyen > danhGia.length / 2 ? 'Tuyen' :
                        deXuatCount.khongTuyen > danhGia.length / 2 ? 'Khong_tuyen' :
                        'Can_them_danh_gia'
      }
    }
  });
});

// @desc    Export kết quả đánh giá ra Excel
// @route   GET /api/danh-gia/export/:ungVienId
// @access  Private (Admin, HR)
const exportExcel = asyncHandler(async (req, res) => {
  const { ungVienId } = req.params;

  const ungVien = await UngVien.findById(ungVienId).populate('jobId');
  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  const danhGia = await DanhGiaPhongVan.find({ ungVienId })
    .populate('nguoiDanhGiaId', 'hoTen email');

  const result = await excelService.exportKetQuaPhongVan(
    danhGia,
    ungVien,
    ungVien.jobId
  );

  res.download(result.filePath, result.fileName);
});

module.exports = {
  taoMoi,
  layTheoUngVien,
  layTheoLich,
  layChiTiet,
  capNhat,
  xoa,
  tongHopDiem,
  exportExcel
};
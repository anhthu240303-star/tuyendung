const TinTuyenDung = require('../models/TinTuyenDung');
const QuyTrinhTuyenDung = require('../models/QuyTrinhTuyenDung');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams } = require('../utils/helpers');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG, TRANG_THAI_TIN } = require('../utils/constants');

// @desc    Lấy danh sách tin tuyển dụng
// @route   GET /api/tin-tuyen-dung
// @access  Public / Private
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { trangThai, timKiem, capBac, hinhThucLamViec } = req.query;

  const query = {};
  
  // Nếu không đăng nhập, chỉ hiển thị tin đang tuyển
  if (!req.user) {
    query.trangThai = TRANG_THAI_TIN.DANG_TUYEN;
    query.hanNop = { $gte: new Date() };
  } else if (trangThai) {
    query.trangThai = trangThai;
  }
  
  if (capBac) query.capBac = capBac;
  if (hinhThucLamViec) query.hinhThucLamViec = hinhThucLamViec;
  
  if (timKiem) {
    query.$or = [
      { tieuDe: { $regex: timKiem, $options: 'i' } },
      { moTa: { $regex: timKiem, $options: 'i' } }
    ];
  }

  const [tinTuyenDung, total] = await Promise.all([
    TinTuyenDung.find(query)
      .populate('quyTrinhId', 'ten')
      .populate('taoBoi', 'hoTen email')
      .sort({ ngayDang: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TinTuyenDung.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: tinTuyenDung,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết tin tuyển dụng
// @route   GET /api/tin-tuyen-dung/:id
// @access  Public / Private
const layChiTiet = asyncHandler(async (req, res) => {
  const tin = await TinTuyenDung.findById(req.params.id)
    .populate('quyTrinhId')
    .populate('taoBoi', 'hoTen email');

  if (!tin) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tin tuyển dụng'
    });
  }

  // Tăng lượt xem
  tin.luotXem += 1;
  await tin.save();

  res.json({
    success: true,
    data: tin
  });
});

// @desc    Tạo tin tuyển dụng mới
// @route   POST /api/tin-tuyen-dung
// @access  Private (Admin, HR)
const taoMoi = asyncHandler(async (req, res) => {
  const {
    tieuDe,
    moTa,
    yeuCau,
    quyenLoi,
    kyNangBatBuoc,
    kyNangMongMuon,
    kinhNghiemToiThieu,
    capBac,
    hinhThucLamViec,
    mucLuong,
    diaDiem,
    soLuongTuyen,
    hanNop,
    quyTrinhId
  } = req.body;

  // Kiểm tra quy trình tồn tại
  const quyTrinh = await QuyTrinhTuyenDung.findById(quyTrinhId);
  if (!quyTrinh) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy quy trình tuyển dụng'
    });
  }

  const tinTuyenDung = await TinTuyenDung.create({
    tieuDe,
    moTa,
    yeuCau,
    quyenLoi,
    kyNangBatBuoc,
    kyNangMongMuon,
    kinhNghiemToiThieu,
    capBac,
    hinhThucLamViec,
    mucLuong,
    diaDiem,
    soLuongTuyen,
    hanNop,
    quyTrinhId,
    taoBoi: req.user._id,
    trangThai: TRANG_THAI_TIN.NHAP
  });

  // Log
  await nhatKyService.logTaoMoi(
    DOI_TUONG_LOG.TIN_TUYEN_DUNG,
    tinTuyenDung._id,
    req.user._id,
    `Tạo tin tuyển dụng: ${tieuDe}`,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Tạo tin tuyển dụng thành công',
    data: tinTuyenDung
  });
});

// @desc    Cập nhật tin tuyển dụng
// @route   PUT /api/tin-tuyen-dung/:id
// @access  Private (Admin, HR)
const capNhat = asyncHandler(async (req, res) => {
  const tin = await TinTuyenDung.findById(req.params.id);

  if (!tin) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tin tuyển dụng'
    });
  }

  const duLieuCu = { ...tin.toObject() };

  // Cập nhật các field
  const fieldsToUpdate = [
    'tieuDe', 'moTa', 'yeuCau', 'quyenLoi',
    'kyNangBatBuoc', 'kyNangMongMuon', 'kinhNghiemToiThieu',
    'capBac', 'hinhThucLamViec', 'mucLuong', 'diaDiem',
    'soLuongTuyen', 'hanNop', 'quyTrinhId'
  ];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      tin[field] = req.body[field];
    }
  });

  await tin.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.TIN_TUYEN_DUNG,
    tin._id,
    req.user._id,
    duLieuCu,
    tin.toObject(),
    'Cập nhật tin tuyển dụng',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật thành công',
    data: tin
  });
});

// @desc    Xóa tin tuyển dụng
// @route   DELETE /api/tin-tuyen-dung/:id
// @access  Private (Admin, HR)
const xoa = asyncHandler(async (req, res) => {
  const tin = await TinTuyenDung.findById(req.params.id);

  if (!tin) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tin tuyển dụng'
    });
  }

  // Kiểm tra có ứng viên không
  const UngVien = require('../models/UngVien');
  const coUngVien = await UngVien.countDocuments({ jobId: tin._id });

  if (coUngVien > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa. Có ${coUngVien} ứng viên đã nộp hồ sơ`
    });
  }

  await tin.deleteOne();

  // Log
  await nhatKyService.logXoa(
    DOI_TUONG_LOG.TIN_TUYEN_DUNG,
    tin._id,
    req.user._id,
    `Xóa tin tuyển dụng: ${tin.tieuDe}`,
    req
  );

  res.json({
    success: true,
    message: 'Xóa tin tuyển dụng thành công'
  });
});

// @desc    Đổi trạng thái tin tuyển dụng
// @route   PUT /api/tin-tuyen-dung/:id/trang-thai
// @access  Private (Admin, HR)
const doiTrangThai = asyncHandler(async (req, res) => {
  const { trangThai } = req.body;

  if (!Object.values(TRANG_THAI_TIN).includes(trangThai)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const tin = await TinTuyenDung.findById(req.params.id);

  if (!tin) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tin tuyển dụng'
    });
  }

  const trangThaiCu = tin.trangThai;
  tin.trangThai = trangThai;
  
  // Nếu chuyển sang Dang_tuyen, set ngày đăng
  if (trangThai === TRANG_THAI_TIN.DANG_TUYEN && !tin.ngayDang) {
    tin.ngayDang = new Date();
  }

  await tin.save();

  // Log
  await nhatKyService.logThayDoiTrangThai(
    DOI_TUONG_LOG.TIN_TUYEN_DUNG,
    tin._id,
    req.user._id,
    trangThaiCu,
    trangThai,
    `Đổi trạng thái tin tuyển dụng: ${tin.tieuDe}`,
    req
  );

  res.json({
    success: true,
    message: 'Đổi trạng thái thành công',
    data: tin
  });
});

// @desc    Lấy thống kê tin tuyển dụng
// @route   GET /api/tin-tuyen-dung/:id/thong-ke
// @access  Private (Admin, HR)
const layThongKe = asyncHandler(async (req, res) => {
  const tin = await TinTuyenDung.findById(req.params.id);

  if (!tin) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tin tuyển dụng'
    });
  }

  const UngVien = require('../models/UngVien');

  // Thống kê ứng viên
  const [
    tongUngVien,
    moiNop,
    datSangLoc,
    khongDatSangLoc,
    dangPhongVan,
    daTuyen,
    khongTuyen
  ] = await Promise.all([
    UngVien.countDocuments({ jobId: tin._id }),
    UngVien.countDocuments({ jobId: tin._id, trangThai: 'Moi_nop' }),
    UngVien.countDocuments({ jobId: tin._id, trangThai: 'Dat_sang_loc' }),
    UngVien.countDocuments({ jobId: tin._id, trangThai: 'Khong_dat_sang_loc' }),
    UngVien.countDocuments({ 
      jobId: tin._id, 
      trangThai: { $in: ['Cho_phong_van', 'Dang_phong_van', 'Hoan_thanh_phong_van'] }
    }),
    UngVien.countDocuments({ jobId: tin._id, trangThai: 'Da_tuyen' }),
    UngVien.countDocuments({ jobId: tin._id, trangThai: 'Khong_tuyen' })
  ]);

  res.json({
    success: true,
    data: {
      tin: {
        tieuDe: tin.tieuDe,
        soLuongTuyen: tin.soLuongTuyen,
        soLuongDaTuyen: tin.soLuongDaTuyen,
        conLai: tin.soLuongTuyen - tin.soLuongDaTuyen,
        luotXem: tin.luotXem
      },
      ungVien: {
        tongSo: tongUngVien,
        moiNop,
        datSangLoc,
        khongDatSangLoc,
        dangPhongVan,
        daTuyen,
        khongTuyen,
        tyLeChuyenDoi: tongUngVien > 0 
          ? ((daTuyen / tongUngVien) * 100).toFixed(2) + '%'
          : '0%'
      }
    }
  });
});

module.exports = {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  xoa,
  doiTrangThai,
  layThongKe
};
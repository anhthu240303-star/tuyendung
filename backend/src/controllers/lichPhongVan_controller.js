const LichPhongVan = require('../models/LichPhongVan');
const UngVien = require('../models/UngVien');
const HoiDongPhongVan = require('../models/HoiDongPhongVan');
const NguoiDung = require('../models/NguoiDung');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams, generateCode } = require('../utils/helpers');
const emailService = require('../services/email_service');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG, TRANG_THAI_LICH_PV, TRANG_THAI_UNG_VIEN } = require('../utils/constants');

// @desc    Tạo lịch phỏng vấn
// @route   POST /api/lich-phong-van
// @access  Private (Admin, HR)
const taoLich = asyncHandler(async (req, res) => {
  const {
    ungVienId,
    jobId,
    hoiDongId,
    thoiGianBatDau,
    thoiGianKetThuc,
    diaDiem,
    linkOnline,
    hinhThuc,
    noiDung,
    ghiChu
  } = req.body;

  // Validate ứng viên
  const ungVien = await UngVien.findById(ungVienId);
  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  // Validate hội đồng
  const hoiDong = await HoiDongPhongVan.findById(hoiDongId).populate('thanhVien.nguoiDungId');
  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng phỏng vấn'
    });
  }

  // Kiểm tra trùng lịch của ứng viên
  const lichTrung = await LichPhongVan.findOne({
    ungVienId,
    trangThai: { $nin: [TRANG_THAI_LICH_PV.HUY, TRANG_THAI_LICH_PV.TU_CHOI] },
    $or: [
      {
        thoiGianBatDau: { $lte: new Date(thoiGianKetThuc) },
        thoiGianKetThuc: { $gte: new Date(thoiGianBatDau) }
      }
    ]
  });

  if (lichTrung) {
    return res.status(400).json({
      success: false,
      message: 'Ứng viên đã có lịch phỏng vấn trong khoảng thời gian này'
    });
  }

  // Tạo token xác nhận
  const tokenXacNhan = generateCode('CONFIRM', 32);

  const lichPhongVan = await LichPhongVan.create({
    ungVienId,
    jobId,
    hoiDongId,
    thoiGianBatDau,
    thoiGianKetThuc,
    diaDiem,
    linkOnline,
    hinhThuc,
    noiDung,
    ghiChu,
    taoBoi: req.user._id,
    tokenXacNhan
  });

  // Cập nhật trạng thái ứng viên
  ungVien.capNhatTrangThai(
    TRANG_THAI_UNG_VIEN.CHO_PHONG_VAN,
    req.user._id,
    'Đã được lên lịch phỏng vấn'
  );
  await ungVien.save();

  // Populate để gửi email
  await lichPhongVan.populate([
    { path: 'ungVienId' },
    { path: 'jobId' },
    { path: 'hoiDongId' }
  ]);

  // Gửi email mời phỏng vấn cho ứng viên
  await emailService.guiEmailMoiPhongVan(
    lichPhongVan.ungVienId,
    lichPhongVan,
    lichPhongVan.jobId,
    lichPhongVan.hoiDongId
  );

  // Gửi email thông báo cho các thành viên hội đồng
  for (const tv of hoiDong.thanhVien) {
    await emailService.guiEmailChoHoiDong(
      tv.nguoiDungId,
      lichPhongVan,
      lichPhongVan.ungVienId,
      lichPhongVan.jobId
    );
  }

  lichPhongVan.emailDaGui = true;
  await lichPhongVan.save();

  // Log
  await nhatKyService.logTaoLichPhongVan(
    lichPhongVan._id,
    ungVienId,
    req.user._id,
    { thoiGianBatDau, hinhThuc },
    req
  );

  res.status(201).json({
    success: true,
    message: 'Tạo lịch phỏng vấn thành công',
    data: lichPhongVan
  });
});

// @desc    Lấy danh sách lịch phỏng vấn
// @route   GET /api/lich-phong-van
// @access  Private
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { ungVienId, hoiDongId, trangThai, tuNgay, denNgay } = req.query;

  const query = {};
  
  if (ungVienId) query.ungVienId = ungVienId;
  if (hoiDongId) query.hoiDongId = hoiDongId;
  if (trangThai) query.trangThai = trangThai;

  if (tuNgay || denNgay) {
    query.thoiGianBatDau = {};
    if (tuNgay) query.thoiGianBatDau.$gte = new Date(tuNgay);
    if (denNgay) query.thoiGianBatDau.$lte = new Date(denNgay);
  }

  // Nếu là Interviewer, chỉ xem lịch của mình
  if (req.user.vaiTro === 'Interviewer') {
    const hoiDongs = await HoiDongPhongVan.find({
      'thanhVien.nguoiDungId': req.user._id
    }).select('_id');
    
    query.hoiDongId = { $in: hoiDongs.map(hd => hd._id) };
  }

  const [lichPhongVan, total] = await Promise.all([
    LichPhongVan.find(query)
      .populate('ungVienId', 'hoTen email soDienThoai')
      .populate('jobId', 'tieuDe')
      .populate('hoiDongId', 'ten')
      .populate('taoBoi', 'hoTen email')
      .sort({ thoiGianBatDau: 1 })
      .skip(skip)
      .limit(limit),
    LichPhongVan.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: lichPhongVan,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết lịch phỏng vấn
// @route   GET /api/lich-phong-van/:id
// @access  Private
const layChiTiet = asyncHandler(async (req, res) => {
  const lich = await LichPhongVan.findById(req.params.id)
    .populate('ungVienId')
    .populate('jobId')
    .populate('hoiDongId')
    .populate('taoBoi', 'hoTen email');

  if (!lich) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch phỏng vấn'
    });
  }

  res.json({
    success: true,
    data: lich
  });
});

// @desc    Cập nhật lịch phỏng vấn
// @route   PUT /api/lich-phong-van/:id
// @access  Private (Admin, HR)
const capNhat = asyncHandler(async (req, res) => {
  const lich = await LichPhongVan.findById(req.params.id);

  if (!lich) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch phỏng vấn'
    });
  }

  const duLieuCu = { ...lich.toObject() };

  const fieldsToUpdate = [
    'thoiGianBatDau', 'thoiGianKetThuc', 'diaDiem',
    'linkOnline', 'hinhThuc', 'noiDung', 'ghiChu'
  ];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      lich[field] = req.body[field];
    }
  });

  await lich.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.LICH_PHONG_VAN,
    lich._id,
    req.user._id,
    duLieuCu,
    lich.toObject(),
    'Cập nhật lịch phỏng vấn',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật lịch phỏng vấn thành công',
    data: lich
  });
});

// @desc    Xác nhận/Từ chối lịch phỏng vấn (qua link email)
// @route   GET /api/lich-phong-van/xac-nhan/:token
// @access  Public
const xacNhanLich = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { action } = req.query; // accept hoặc reject

  const lich = await LichPhongVan.findOne({ tokenXacNhan: token })
    .populate('ungVienId')
    .populate('jobId');

  if (!lich) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch phỏng vấn hoặc link đã hết hạn'
    });
  }

  if (lich.trangThai !== TRANG_THAI_LICH_PV.CHO_XAC_NHAN) {
    return res.status(400).json({
      success: false,
      message: 'Lịch phỏng vấn này đã được xử lý'
    });
  }

  if (action === 'accept') {
    lich.xacNhan(lich.ungVienId._id);
    
    // Cập nhật trạng thái ứng viên
    const ungVien = await UngVien.findById(lich.ungVienId._id);
    ungVien.capNhatTrangThai(
      TRANG_THAI_UNG_VIEN.DANG_PHONG_VAN,
      null,
      'Đã xác nhận tham gia phỏng vấn'
    );
    await ungVien.save();

    await lich.save();

    res.json({
      success: true,
      message: 'Xác nhận tham gia phỏng vấn thành công! Chúng tôi sẽ gửi thông tin chi tiết qua email.'
    });
  } else if (action === 'reject') {
    lich.tuChoi(req.body.lyDo || 'Không thể sắp xếp thời gian');
    await lich.save();

    res.json({
      success: true,
      message: 'Đã ghi nhận từ chối phỏng vấn. Cảm ơn bạn đã thông báo!'
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Hành động không hợp lệ'
    });
  }
});

// @desc    Hủy lịch phỏng vấn
// @route   PUT /api/lich-phong-van/:id/huy
// @access  Private (Admin, HR)
const huyLich = asyncHandler(async (req, res) => {
  const { lyDo } = req.body;

  const lich = await LichPhongVan.findById(req.params.id);

  if (!lich) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch phỏng vấn'
    });
  }

  lich.huy(req.user._id, lyDo);
  await lich.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.LICH_PHONG_VAN,
    lich._id,
    req.user._id,
    null,
    { trangThai: TRANG_THAI_LICH_PV.HUY },
    'Hủy lịch phỏng vấn',
    req
  );

  res.json({
    success: true,
    message: 'Hủy lịch phỏng vấn thành công',
    data: lich
  });
});

// @desc    Đánh dấu hoàn thành phỏng vấn
// @route   PUT /api/lich-phong-van/:id/hoan-thanh
// @access  Private (Admin, HR)
const hoanThanh = asyncHandler(async (req, res) => {
  const lich = await LichPhongVan.findById(req.params.id);

  if (!lich) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch phỏng vấn'
    });
  }

  lich.trangThai = TRANG_THAI_LICH_PV.HOAN_THANH;
  await lich.save();

  // Cập nhật trạng thái ứng viên
  const ungVien = await UngVien.findById(lich.ungVienId);
  ungVien.capNhatTrangThai(
    TRANG_THAI_UNG_VIEN.HOAN_THANH_PHONG_VAN,
    req.user._id,
    'Đã hoàn thành phỏng vấn'
  );
  await ungVien.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.LICH_PHONG_VAN,
    lich._id,
    req.user._id,
    null,
    { trangThai: TRANG_THAI_LICH_PV.HOAN_THANH },
    'Đánh dấu hoàn thành phỏng vấn',
    req
  );

  res.json({
    success: true,
    message: 'Đánh dấu hoàn thành thành công',
    data: lich
  });
});

module.exports = {
  taoLich,
  layDanhSach,
  layChiTiet,
  capNhat,
  xacNhanLich,
  huyLich,
  hoanThanh
};
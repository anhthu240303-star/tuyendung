const QuyTrinhTuyenDung = require('../models/QuyTrinhTuyenDung');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams } = require('../utils/helpers');
const nhatKyService = require('../services/nhatKy_service');

// @desc    Lấy danh sách quy trình
// @route   GET /api/quy-trinh
// @access  Private
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { trangThai, timKiem } = req.query;

  const query = {};
  
  if (trangThai) query.trangThai = trangThai;
  if (timKiem) {
    query.ten = { $regex: timKiem, $options: 'i' };
  }

  const [quyTrinh, total] = await Promise.all([
    QuyTrinhTuyenDung.find(query)
      .populate('taoBoi', 'hoTen email')
      .sort({ macDinh: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    QuyTrinhTuyenDung.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: quyTrinh,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết quy trình
// @route   GET /api/quy-trinh/:id
// @access  Private
const layChiTiet = asyncHandler(async (req, res) => {
  const quyTrinh = await QuyTrinhTuyenDung.findById(req.params.id)
    .populate('taoBoi', 'hoTen email');

  if (!quyTrinh) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy quy trình'
    });
  }

  res.json({
    success: true,
    data: quyTrinh
  });
});

// @desc    Tạo quy trình mới
// @route   POST /api/quy-trinh
// @access  Private (Admin, HR)
const taoMoi = asyncHandler(async (req, res) => {
  const { ten, moTa, cacBuoc, macDinh } = req.body;

  // Validate cacBuoc
  if (!cacBuoc || cacBuoc.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Quy trình phải có ít nhất 1 bước'
    });
  }

  // Sắp xếp thứ tự các bước
  const cacBuocSorted = cacBuoc.map((buoc, index) => ({
    ...buoc,
    thuTu: buoc.thuTu || index + 1
  })).sort((a, b) => a.thuTu - b.thuTu);

  const quyTrinh = await QuyTrinhTuyenDung.create({
    ten,
    moTa,
    cacBuoc: cacBuocSorted,
    macDinh: macDinh || false,
    taoBoi: req.user._id
  });

  // Log
  await nhatKyService.logTaoMoi(
    'QuyTrinhTuyenDung',
    quyTrinh._id,
    req.user._id,
    `Tạo quy trình: ${ten}`,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Tạo quy trình thành công',
    data: quyTrinh
  });
});

// @desc    Cập nhật quy trình
// @route   PUT /api/quy-trinh/:id
// @access  Private (Admin, HR)
const capNhat = asyncHandler(async (req, res) => {
  const { ten, moTa, cacBuoc, macDinh, trangThai } = req.body;

  const quyTrinh = await QuyTrinhTuyenDung.findById(req.params.id);

  if (!quyTrinh) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy quy trình'
    });
  }

  const duLieuCu = { ...quyTrinh.toObject() };

  if (ten) quyTrinh.ten = ten;
  if (moTa !== undefined) quyTrinh.moTa = moTa;
  if (trangThai) quyTrinh.trangThai = trangThai;
  if (macDinh !== undefined) quyTrinh.macDinh = macDinh;
  
  if (cacBuoc && cacBuoc.length > 0) {
    const cacBuocSorted = cacBuoc.map((buoc, index) => ({
      ...buoc,
      thuTu: buoc.thuTu || index + 1
    })).sort((a, b) => a.thuTu - b.thuTu);
    
    quyTrinh.cacBuoc = cacBuocSorted;
  }

  await quyTrinh.save();

  // Log
  await nhatKyService.logCapNhat(
    'QuyTrinhTuyenDung',
    quyTrinh._id,
    req.user._id,
    duLieuCu,
    quyTrinh.toObject(),
    'Cập nhật quy trình',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật quy trình thành công',
    data: quyTrinh
  });
});

// @desc    Xóa quy trình
// @route   DELETE /api/quy-trinh/:id
// @access  Private (Admin, HR)
const xoa = asyncHandler(async (req, res) => {
  const quyTrinh = await QuyTrinhTuyenDung.findById(req.params.id);

  if (!quyTrinh) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy quy trình'
    });
  }

  // Không cho xóa quy trình mặc định
  if (quyTrinh.macDinh) {
    return res.status(400).json({
      success: false,
      message: 'Không thể xóa quy trình mặc định'
    });
  }

  // Kiểm tra xem có tin tuyển dụng nào đang dùng không
  const TinTuyenDung = require('../models/TinTuyenDung');
  const tinDangDung = await TinTuyenDung.countDocuments({ quyTrinhId: quyTrinh._id });

  if (tinDangDung > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa. Có ${tinDangDung} tin tuyển dụng đang sử dụng quy trình này`
    });
  }

  await quyTrinh.deleteOne();

  // Log
  await nhatKyService.logXoa(
    'QuyTrinhTuyenDung',
    quyTrinh._id,
    req.user._id,
    `Xóa quy trình: ${quyTrinh.ten}`,
    req
  );

  res.json({
    success: true,
    message: 'Xóa quy trình thành công'
  });
});

// @desc    Đặt làm quy trình mặc định
// @route   PUT /api/quy-trinh/:id/mac-dinh
// @access  Private (Admin, HR)
const datMacDinh = asyncHandler(async (req, res) => {
  const quyTrinh = await QuyTrinhTuyenDung.findById(req.params.id);

  if (!quyTrinh) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy quy trình'
    });
  }

  // Bỏ mặc định của các quy trình khác
  await QuyTrinhTuyenDung.updateMany(
    { _id: { $ne: quyTrinh._id } },
    { macDinh: false }
  );

  quyTrinh.macDinh = true;
  await quyTrinh.save();

  // Log
  await nhatKyService.logCapNhat(
    'QuyTrinhTuyenDung',
    quyTrinh._id,
    req.user._id,
    { macDinh: false },
    { macDinh: true },
    'Đặt làm quy trình mặc định',
    req
  );

  res.json({
    success: true,
    message: 'Đã đặt làm quy trình mặc định',
    data: quyTrinh
  });
});

// @desc    Sao chép quy trình
// @route   POST /api/quy-trinh/:id/sao-chep
// @access  Private (Admin, HR)
const saoChep = asyncHandler(async (req, res) => {
  const quyTrinhGoc = await QuyTrinhTuyenDung.findById(req.params.id);

  if (!quyTrinhGoc) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy quy trình'
    });
  }

  const quyTrinhMoi = await QuyTrinhTuyenDung.create({
    ten: `${quyTrinhGoc.ten} (Sao chép)`,
    moTa: quyTrinhGoc.moTa,
    cacBuoc: quyTrinhGoc.cacBuoc,
    macDinh: false,
    taoBoi: req.user._id
  });

  // Log
  await nhatKyService.logTaoMoi(
    'QuyTrinhTuyenDung',
    quyTrinhMoi._id,
    req.user._id,
    `Sao chép quy trình từ: ${quyTrinhGoc.ten}`,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Sao chép quy trình thành công',
    data: quyTrinhMoi
  });
});

module.exports = {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  xoa,
  datMacDinh,
  saoChep
};
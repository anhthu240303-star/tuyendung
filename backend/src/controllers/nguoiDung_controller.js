const NguoiDung = require('../models/NguoiDung');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams } = require('../utils/helpers');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG } = require('../utils/constants');

// @desc    Lấy danh sách người dùng
// @route   GET /api/nguoi-dung
// @access  Private (Admin)
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { vaiTro, trangThai, timKiem } = req.query;

  // Build query
  const query = {};
  
  if (vaiTro) query.vaiTro = vaiTro;
  if (trangThai) query.trangThai = trangThai;
  if (timKiem) {
    query.$or = [
      { hoTen: { $regex: timKiem, $options: 'i' } },
      { email: { $regex: timKiem, $options: 'i' } }
    ];
  }

  // Execute query
  const [nguoiDung, total] = await Promise.all([
    NguoiDung.find(query)
      .select('-matKhauHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    NguoiDung.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: nguoiDung,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết người dùng
// @route   GET /api/nguoi-dung/:id
// @access  Private (Admin)
const layChiTiet = asyncHandler(async (req, res) => {
  const nguoiDung = await NguoiDung.findById(req.params.id);

  if (!nguoiDung) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng'
    });
  }

  res.json({
    success: true,
    data: nguoiDung
  });
});

// @desc    Tạo người dùng mới
// @route   POST /api/nguoi-dung
// @access  Private (Admin)
const taoMoi = asyncHandler(async (req, res) => {
  const { hoTen, email, matKhau, vaiTro, soDienThoai } = req.body;

  // Kiểm tra email đã tồn tại
  const tonTai = await NguoiDung.findOne({ email });
  if (tonTai) {
    return res.status(400).json({
      success: false,
      message: 'Email này đã được đăng ký'
    });
  }

  const nguoiDung = await NguoiDung.create({
    hoTen,
    email,
    matKhauHash: matKhau,
    vaiTro,
    soDienThoai
  });

  // Log
  await nhatKyService.logTaoMoi(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    `Tạo người dùng mới: ${email}`,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Tạo người dùng thành công',
    data: nguoiDung
  });
});

// @desc    Cập nhật người dùng
// @route   PUT /api/nguoi-dung/:id
// @access  Private (Admin)
const capNhat = asyncHandler(async (req, res) => {
  const { hoTen, vaiTro, soDienThoai, trangThai } = req.body;

  const nguoiDung = await NguoiDung.findById(req.params.id);

  if (!nguoiDung) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng'
    });
  }

  const duLieuCu = {
    hoTen: nguoiDung.hoTen,
    vaiTro: nguoiDung.vaiTro,
    soDienThoai: nguoiDung.soDienThoai,
    trangThai: nguoiDung.trangThai
  };

  if (hoTen) nguoiDung.hoTen = hoTen;
  if (vaiTro) nguoiDung.vaiTro = vaiTro;
  if (soDienThoai) nguoiDung.soDienThoai = soDienThoai;
  if (trangThai) nguoiDung.trangThai = trangThai;

  await nguoiDung.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    duLieuCu,
    { hoTen, vaiTro, soDienThoai, trangThai },
    'Cập nhật thông tin người dùng',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật thành công',
    data: nguoiDung
  });
});

// @desc    Xóa người dùng
// @route   DELETE /api/nguoi-dung/:id
// @access  Private (Admin)
const xoa = asyncHandler(async (req, res) => {
  const nguoiDung = await NguoiDung.findById(req.params.id);

  if (!nguoiDung) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng'
    });
  }

  // Không cho phép xóa chính mình
  if (nguoiDung._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Không thể xóa chính bạn'
    });
  }

  await nguoiDung.deleteOne();

  // Log
  await nhatKyService.logXoa(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    `Xóa người dùng: ${nguoiDung.email}`,
    req
  );

  res.json({
    success: true,
    message: 'Xóa người dùng thành công'
  });
});

// @desc    Đổi trạng thái (Khóa/Mở khóa)
// @route   PUT /api/nguoi-dung/:id/trang-thai
// @access  Private (Admin)
const doiTrangThai = asyncHandler(async (req, res) => {
  const { trangThai } = req.body;

  if (!['Hoat_dong', 'Khoa'].includes(trangThai)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const nguoiDung = await NguoiDung.findById(req.params.id);

  if (!nguoiDung) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng'
    });
  }

  // Không cho phép khóa chính mình
  if (nguoiDung._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái của chính bạn'
    });
  }

  const trangThaiCu = nguoiDung.trangThai;
  nguoiDung.trangThai = trangThai;
  await nguoiDung.save();

  // Log
  await nhatKyService.logThayDoiTrangThai(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    trangThaiCu,
    trangThai,
    `Đổi trạng thái người dùng: ${nguoiDung.email}`,
    req
  );

  res.json({
    success: true,
    message: `${trangThai === 'Khoa' ? 'Khóa' : 'Mở khóa'} tài khoản thành công`,
    data: nguoiDung
  });
});

// @desc    Reset mật khẩu người dùng
// @route   PUT /api/nguoi-dung/:id/reset-password
// @access  Private (Admin)
const resetMatKhau = asyncHandler(async (req, res) => {
  const { matKhauMoi } = req.body;

  if (!matKhauMoi) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập mật khẩu mới'
    });
  }

  const nguoiDung = await NguoiDung.findById(req.params.id);

  if (!nguoiDung) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng'
    });
  }

  nguoiDung.matKhauHash = matKhauMoi;
  await nguoiDung.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    null,
    null,
    `Reset mật khẩu cho: ${nguoiDung.email}`,
    req
  );

  res.json({
    success: true,
    message: 'Reset mật khẩu thành công'
  });
});

module.exports = {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  xoa,
  doiTrangThai,
  resetMatKhau
};
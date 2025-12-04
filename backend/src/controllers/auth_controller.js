const NguoiDung = require('../models/NguoiDung');
const { generateToken } = require('../config/jwt');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG } = require('../utils/constants');

// @desc    Đăng ký tài khoản
// @route   POST /api/auth/register
// @access  Public (hoặc chỉ Admin)
const dangKy = asyncHandler(async (req, res) => {
  const { hoTen, email, matKhau, vaiTro, soDienThoai } = req.body;

  // Kiểm tra email đã tồn tại
  const tonTai = await NguoiDung.findOne({ email });
  if (tonTai) {
    return res.status(400).json({
      success: false,
      message: 'Email này đã được đăng ký'
    });
  }

  // Tạo user mới
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
    req.user ? req.user._id : nguoiDung._id,
    `Đăng ký tài khoản: ${email}`,
    req
  );

  // Generate token
  const token = generateToken({ id: nguoiDung._id });

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      user: nguoiDung,
      token
    }
  });
});

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const dangNhap = asyncHandler(async (req, res) => {
  const { email, matKhau } = req.body;

  // Validate
  if (!email || !matKhau) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập email và mật khẩu'
    });
  }

  // Tìm user và lấy cả password
  const nguoiDung = await NguoiDung.findOne({ email }).select('+matKhauHash');
  
  if (!nguoiDung) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  // Kiểm tra tài khoản bị khóa
  if (nguoiDung.trangThai === 'Khoa') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên'
    });
  }

  // Kiểm tra mật khẩu
  const isMatch = await nguoiDung.kiemTraMatKhau(matKhau);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  // Cập nhật lần đăng nhập cuối
  nguoiDung.lanDangNhapCuoi = new Date();
  await nguoiDung.save();

  // Generate token
  const token = generateToken({ id: nguoiDung._id });

  // Remove password from response
  nguoiDung.matKhauHash = undefined;

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user: nguoiDung,
      token
    }
  });
});

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
const layThongTinCaNhan = asyncHandler(async (req, res) => {
  const nguoiDung = await NguoiDung.findById(req.user._id);

  res.json({
    success: true,
    data: nguoiDung
  });
});

// @desc    Đổi mật khẩu
// @route   PUT /api/auth/change-password
// @access  Private
const doiMatKhau = asyncHandler(async (req, res) => {
  const { matKhauCu, matKhauMoi } = req.body;

  if (!matKhauCu || !matKhauMoi) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ thông tin'
    });
  }

  // Lấy user với password
  const nguoiDung = await NguoiDung.findById(req.user._id).select('+matKhauHash');

  // Kiểm tra mật khẩu cũ
  const isMatch = await nguoiDung.kiemTraMatKhau(matKhauCu);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Mật khẩu cũ không đúng'
    });
  }

  // Cập nhật mật khẩu mới
  nguoiDung.matKhauHash = matKhauMoi;
  await nguoiDung.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    null,
    null,
    'Đổi mật khẩu',
    req
  );

  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công'
  });
});

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/auth/update-profile
// @access  Private
const capNhatThongTin = asyncHandler(async (req, res) => {
  const { hoTen, soDienThoai } = req.body;

  const nguoiDung = await NguoiDung.findById(req.user._id);

  const duLieuCu = {
    hoTen: nguoiDung.hoTen,
    soDienThoai: nguoiDung.soDienThoai
  };

  if (hoTen) nguoiDung.hoTen = hoTen;
  if (soDienThoai) nguoiDung.soDienThoai = soDienThoai;

  await nguoiDung.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.NGUOI_DUNG,
    nguoiDung._id,
    req.user._id,
    duLieuCu,
    { hoTen, soDienThoai },
    'Cập nhật thông tin cá nhân',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: nguoiDung
  });
});

// @desc    Quên mật khẩu (gửi email reset - sẽ làm sau)
// @route   POST /api/auth/forgot-password
// @access  Public
const quenMatKhau = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const nguoiDung = await NguoiDung.findOne({ email });

  if (!nguoiDung) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng với email này'
    });
  }

  // TODO: Tạo reset token và gửi email
  // Hiện tại chỉ trả về thông báo

  res.json({
    success: true,
    message: 'Email khôi phục mật khẩu đã được gửi (chức năng đang phát triển)'
  });
});

module.exports = {
  dangKy,
  dangNhap,
  layThongTinCaNhan,
  doiMatKhau,
  capNhatThongTin,
  quenMatKhau
};
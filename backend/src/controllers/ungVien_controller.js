const UngVien = require('../models/UngVien');
const TinTuyenDung = require('../models/TinTuyenDung');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams } = require('../utils/helpers');
const emailService = require('../services/email_service');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG, TRANG_THAI_UNG_VIEN } = require('../utils/constants');
const path = require('path');

// @desc    Ứng tuyển (Form công khai)
// @route   POST /api/ung-vien/apply
// @access  Public
const ungTuyen = asyncHandler(async (req, res) => {
  const {
    hoTen,
    email,
    soDienThoai,
    ngaySinh,
    gioiTinh,
    diaChi,
    jobId,
    thuUngTuyen,
    kinhNghiem,
    kyNangNoiBat,
    hocVan,
    nguonUngTuyen
  } = req.body;

  // Kiểm tra job tồn tại và còn nhận hồ sơ
  const job = await TinTuyenDung.findById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tin tuyển dụng'
    });
  }

  if (job.trangThai !== 'Dang_tuyen') {
    return res.status(400).json({
      success: false,
      message: 'Tin tuyển dụng này không còn nhận hồ sơ'
    });
  }

  if (new Date() > new Date(job.hanNop)) {
    return res.status(400).json({
      success: false,
      message: 'Đã hết hạn nộp hồ sơ'
    });
  }

  // Kiểm tra đã ứng tuyển chưa
  const daNop = await UngVien.findOne({ email, jobId });
  if (daNop) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã nộp hồ sơ cho vị trí này rồi'
    });
  }

  // Kiểm tra file CV
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng upload CV'
    });
  }

  // Tạo ứng viên mới
  const ungVien = await UngVien.create({
    hoTen,
    email,
    soDienThoai,
    ngaySinh,
    gioiTinh,
    diaChi,
    jobId,
    cvUrl: `/uploads/cv/${req.file.filename}`,
    cvFileName: req.file.filename,
    thuUngTuyen,
    kinhNghiem,
    kyNangNoiBat,
    hocVan,
    nguonUngTuyen,
    trangThai: TRANG_THAI_UNG_VIEN.MOI_NOP
  });

  // Cập nhật số lượng ứng tuyển của job
  job.soLuongUngTuyen += 1;
  await job.save();

  // Gửi email xác nhận
  await emailService.guiEmailNhanHoSo(ungVien, job);

  // Log
  await nhatKyService.logTaoMoi(
    DOI_TUONG_LOG.UNG_VIEN,
    ungVien._id,
    null,
    `Ứng viên ${hoTen} nộp hồ sơ cho ${job.tieuDe}`,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm',
    data: ungVien
  });
});

// @desc    Lấy danh sách ứng viên
// @route   GET /api/ung-vien
// @access  Private (Admin, HR)
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { jobId, trangThai, timKiem, tuNgay, denNgay } = req.query;

  const query = {};
  
  if (jobId) query.jobId = jobId;
  if (trangThai) query.trangThai = trangThai;
  
  if (timKiem) {
    query.$or = [
      { hoTen: { $regex: timKiem, $options: 'i' } },
      { email: { $regex: timKiem, $options: 'i' } },
      { soDienThoai: { $regex: timKiem, $options: 'i' } }
    ];
  }

  if (tuNgay || denNgay) {
    query.ngayNop = {};
    if (tuNgay) query.ngayNop.$gte = new Date(tuNgay);
    if (denNgay) query.ngayNop.$lte = new Date(denNgay);
  }

  const [ungVien, total] = await Promise.all([
    UngVien.find(query)
      .populate('jobId', 'tieuDe')
      .populate('nguoiSangLoc', 'hoTen email')
      .sort({ ngayNop: -1 })
      .skip(skip)
      .limit(limit),
    UngVien.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: ungVien,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết ứng viên
// @route   GET /api/ung-vien/:id
// @access  Private (Admin, HR, Interviewer)
const layChiTiet = asyncHandler(async (req, res) => {
  const ungVien = await UngVien.findById(req.params.id)
    .populate('jobId')
    .populate('nguoiSangLoc', 'hoTen email')
    .populate('lichSu.nguoiThayDoi', 'hoTen email');

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  res.json({
    success: true,
    data: ungVien
  });
});

// @desc    Cập nhật thông tin ứng viên
// @route   PUT /api/ung-vien/:id
// @access  Private (Admin, HR)
const capNhat = asyncHandler(async (req, res) => {
  const ungVien = await UngVien.findById(req.params.id);

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  const duLieuCu = { ...ungVien.toObject() };

  // Cập nhật các field được phép
  const fieldsToUpdate = [
    'hoTen', 'soDienThoai', 'ngaySinh', 'gioiTinh',
    'diaChi', 'kinhNghiem', 'kyNangNoiBat', 'hocVan'
  ];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      ungVien[field] = req.body[field];
    }
  });

  await ungVien.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.UNG_VIEN,
    ungVien._id,
    req.user._id,
    duLieuCu,
    ungVien.toObject(),
    'Cập nhật thông tin ứng viên',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật thành công',
    data: ungVien
  });
});

// @desc    Xóa ứng viên
// @route   DELETE /api/ung-vien/:id
// @access  Private (Admin, HR)
const xoa = asyncHandler(async (req, res) => {
  const ungVien = await UngVien.findById(req.params.id);

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  // Xóa file CV
  const fs = require('fs').promises;
  const cvPath = path.join(__dirname, '../../uploads/cv', ungVien.cvFileName);
  try {
    await fs.unlink(cvPath);
  } catch (error) {
    console.error('Lỗi xóa file CV:', error);
  }

  await ungVien.deleteOne();

  // Log
  await nhatKyService.logXoa(
    DOI_TUONG_LOG.UNG_VIEN,
    ungVien._id,
    req.user._id,
    `Xóa ứng viên: ${ungVien.hoTen}`,
    req
  );

  res.json({
    success: true,
    message: 'Xóa ứng viên thành công'
  });
});

// @desc    Thay đổi trạng thái ứng viên
// @route   PUT /api/ung-vien/:id/trang-thai
// @access  Private (Admin, HR)
const doiTrangThai = asyncHandler(async (req, res) => {
  const { trangThai, ghiChu } = req.body;

  if (!Object.values(TRANG_THAI_UNG_VIEN).includes(trangThai)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const ungVien = await UngVien.findById(req.params.id).populate('jobId');

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  const trangThaiCu = ungVien.trangThai;
  
  // Sử dụng method để cập nhật trạng thái (có lưu lịch sử)
  ungVien.capNhatTrangThai(trangThai, req.user._id, ghiChu);
  await ungVien.save();

  // Gửi email theo trạng thái
  if (trangThai === TRANG_THAI_UNG_VIEN.DAT_SANG_LOC) {
    await emailService.guiEmailDatSangLoc(ungVien, ungVien.jobId);
  } else if (trangThai === TRANG_THAI_UNG_VIEN.KHONG_DAT_SANG_LOC) {
    await emailService.guiEmailKhongDatSangLoc(ungVien, ungVien.jobId, ghiChu);
  }

  // Log
  await nhatKyService.logThayDoiTrangThai(
    DOI_TUONG_LOG.UNG_VIEN,
    ungVien._id,
    req.user._id,
    trangThaiCu,
    trangThai,
    `Đổi trạng thái ứng viên: ${ungVien.hoTen}`,
    req
  );

  res.json({
    success: true,
    message: 'Đổi trạng thái thành công',
    data: ungVien
  });
});

// @desc    Download CV
// @route   GET /api/ung-vien/:id/download-cv
// @access  Private (Admin, HR, Interviewer)
const downloadCV = asyncHandler(async (req, res) => {
  const ungVien = await UngVien.findById(req.params.id);

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  const filePath = path.join(__dirname, '../../uploads/cv', ungVien.cvFileName);
  
  res.download(filePath, `CV-${ungVien.hoTen}.pdf`, (err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'Không thể tải file CV'
      });
    }
  });
});

module.exports = {
  ungTuyen,
  layDanhSach,
  layChiTiet,
  capNhat,
  xoa,
  doiTrangThai,
  downloadCV
};
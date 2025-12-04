const ThuMoiNhanViec = require('../models/ThuMoiNhanViec');
const UngVien = require('../models/UngVien');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams } = require('../utils/helpers');
const pdfService = require('../services/pdf_service');
const emailService = require('../services/email_service');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG, TRANG_THAI_UNG_VIEN } = require('../utils/constants');

// @desc    Tạo thư mời nhận việc
// @route   POST /api/offer
// @access  Private (Admin, HR)
const taoMoi = asyncHandler(async (req, res) => {
  const {
    ungVienId,
    jobId,
    viTri,
    phongBan,
    mucLuong,
    ngayBatDau,
    thoiGianThuViec,
    dieuKhoan,
    quyenLoi,
    diaDiemLamViec,
    nguoiLienHe,
    hanTraLoi,
    ghiChu
  } = req.body;

  // Validate ứng viên
  const ungVien = await UngVien.findById(ungVienId).populate('jobId');
  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  // Kiểm tra ứng viên đã được tuyển chưa
  if (ungVien.trangThai !== TRANG_THAI_UNG_VIEN.DA_TUYEN) {
    return res.status(400).json({
      success: false,
      message: 'Ứng viên chưa được xác nhận tuyển dụng'
    });
  }

  // Kiểm tra đã có offer chưa
  const offerDaCo = await ThuMoiNhanViec.findOne({
    ungVienId,
    trangThai: { $in: ['Cho_tra_loi', 'Da_chap_nhan'] }
  });

  if (offerDaCo) {
    return res.status(400).json({
      success: false,
      message: 'Ứng viên đã có thư mời nhận việc'
    });
  }

  // Tạo offer
  const offer = await ThuMoiNhanViec.create({
    ungVienId,
    jobId,
    viTri,
    phongBan,
    mucLuong,
    ngayBatDau,
    thoiGianThuViec: thoiGianThuViec || { soThang: 2, mucLuongThuViec: 85 },
    dieuKhoan: dieuKhoan || [],
    quyenLoi: quyenLoi || [],
    diaDiemLamViec,
    nguoiLienHe,
    hanTraLoi,
    ghiChu,
    taoBoi: req.user._id
  });

  // Tạo PDF
  const pdfResult = await pdfService.taoOfferLetter(
    offer,
    ungVien,
    ungVien.jobId
  );

  if (pdfResult.success) {
    offer.pdfUrl = pdfResult.url;
    offer.pdfFileName = pdfResult.fileName;
    await offer.save();
  }

  // Log
  await nhatKyService.logTaoOffer(
    offer._id,
    ungVienId,
    req.user._id,
    { viTri, mucLuong: mucLuong.coban },
    req
  );

  res.status(201).json({
    success: true,
    message: 'Tạo thư mời nhận việc thành công',
    data: offer
  });
});

// @desc    Gửi offer qua email
// @route   POST /api/offer/:id/gui
// @access  Private (Admin, HR)
const guiOffer = asyncHandler(async (req, res) => {
  const offer = await ThuMoiNhanViec.findById(req.params.id)
    .populate('ungVienId')
    .populate('jobId');

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thư mời nhận việc'
    });
  }

  if (offer.emailDaGui) {
    return res.status(400).json({
      success: false,
      message: 'Thư mời đã được gửi rồi'
    });
  }

  // Gửi email
  const path = require('path');
  const pdfPath = offer.pdfUrl 
    ? path.join(__dirname, '../../uploads/offer', offer.pdfFileName)
    : null;

  await emailService.guiEmailOffer(
    offer.ungVienId,
    offer,
    offer.jobId,
    pdfPath
  );

  offer.emailDaGui = true;
  offer.ngayGui = new Date();
  await offer.save();

  // Log
  await nhatKyService.logGuiEmail(
    DOI_TUONG_LOG.OFFER,
    offer._id,
    req.user._id,
    {
      to: offer.ungVienId.email,
      subject: 'Thư mời nhận việc'
    },
    req
  );

  res.json({
    success: true,
    message: 'Gửi thư mời thành công',
    data: offer
  });
});

// @desc    Lấy danh sách offer
// @route   GET /api/offer
// @access  Private (Admin, HR)
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { trangThai, ungVienId, timKiem } = req.query;

  const query = {};
  
  if (trangThai) query.trangThai = trangThai;
  if (ungVienId) query.ungVienId = ungVienId;
  
  if (timKiem) {
    query.$or = [
      { maOffer: { $regex: timKiem, $options: 'i' } },
      { viTri: { $regex: timKiem, $options: 'i' } }
    ];
  }

  const [offers, total] = await Promise.all([
    ThuMoiNhanViec.find(query)
      .populate('ungVienId', 'hoTen email soDienThoai')
      .populate('jobId', 'tieuDe')
      .populate('taoBoi', 'hoTen email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ThuMoiNhanViec.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: offers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết offer
// @route   GET /api/offer/:id
// @access  Private (Admin, HR)
const layChiTiet = asyncHandler(async (req, res) => {
  const offer = await ThuMoiNhanViec.findById(req.params.id)
    .populate('ungVienId')
    .populate('jobId')
    .populate('taoBoi', 'hoTen email');

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thư mời nhận việc'
    });
  }

  res.json({
    success: true,
    data: offer
  });
});

// @desc    Cập nhật offer
// @route   PUT /api/offer/:id
// @access  Private (Admin, HR)
const capNhat = asyncHandler(async (req, res) => {
  const offer = await ThuMoiNhanViec.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thư mời nhận việc'
    });
  }

  if (offer.emailDaGui) {
    return res.status(400).json({
      success: false,
      message: 'Không thể cập nhật offer đã gửi'
    });
  }

  const duLieuCu = { ...offer.toObject() };

  const fieldsToUpdate = [
    'viTri', 'phongBan', 'mucLuong', 'ngayBatDau',
    'thoiGianThuViec', 'dieuKhoan', 'quyenLoi',
    'diaDiemLamViec', 'nguoiLienHe', 'hanTraLoi', 'ghiChu'
  ];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      offer[field] = req.body[field];
    }
  });

  await offer.save();

  // Tạo lại PDF nếu cần
  if (req.body.taoLaiPDF) {
    const ungVien = await UngVien.findById(offer.ungVienId).populate('jobId');
    const pdfResult = await pdfService.taoOfferLetter(offer, ungVien, ungVien.jobId);
    
    if (pdfResult.success) {
      offer.pdfUrl = pdfResult.url;
      offer.pdfFileName = pdfResult.fileName;
      await offer.save();
    }
  }

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.OFFER,
    offer._id,
    req.user._id,
    duLieuCu,
    offer.toObject(),
    'Cập nhật offer',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật thành công',
    data: offer
  });
});

// @desc    Hủy offer
// @route   PUT /api/offer/:id/huy
// @access  Private (Admin, HR)
const huyOffer = asyncHandler(async (req, res) => {
  const offer = await ThuMoiNhanViec.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thư mời nhận việc'
    });
  }

  if (offer.trangThai === 'Da_chap_nhan') {
    return res.status(400).json({
      success: false,
      message: 'Không thể hủy offer đã được chấp nhận'
    });
  }

  offer.trangThai = 'Da_huy';
  await offer.save();

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.OFFER,
    offer._id,
    req.user._id,
    null,
    { trangThai: 'Da_huy' },
    'Hủy offer',
    req
  );

  res.json({
    success: true,
    message: 'Hủy offer thành công',
    data: offer
  });
});

// @desc    Ứng viên chấp nhận/từ chối offer (qua link)
// @route   POST /api/offer/:maOffer/tra-loi
// @access  Public
const traLoiOffer = asyncHandler(async (req, res) => {
  const { maOffer } = req.params;
  const { action, lyDo } = req.body; // accept hoặc reject

  const offer = await ThuMoiNhanViec.findOne({ maOffer })
    .populate('ungVienId');

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thư mời nhận việc'
    });
  }

  if (offer.trangThai !== 'Cho_tra_loi') {
    return res.status(400).json({
      success: false,
      message: 'Thư mời này đã được xử lý'
    });
  }

  if (new Date() > new Date(offer.hanTraLoi)) {
    offer.trangThai = 'Het_han';
    await offer.save();
    
    return res.status(400).json({
      success: false,
      message: 'Thư mời đã hết hạn trả lời'
    });
  }

  if (action === 'accept') {
    offer.chapNhan();
    
    // Cập nhật trạng thái ứng viên
    const ungVien = await UngVien.findById(offer.ungVienId._id);
    ungVien.capNhatTrangThai(
      TRANG_THAI_UNG_VIEN.DA_NHAN_VIEC,
      null,
      'Đã chấp nhận thư mời nhận việc'
    );
    await ungVien.save();

    res.json({
      success: true,
      message: 'Chúc mừng! Bạn đã chấp nhận thư mời nhận việc. Chúng tôi sẽ liên hệ với bạn sớm.'
    });
  } else if (action === 'reject') {
    offer.tuChoi(lyDo);
    
    res.json({
      success: true,
      message: 'Đã ghi nhận từ chối offer. Cảm ơn bạn đã thông báo!'
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Hành động không hợp lệ'
    });
  }

  await offer.save();
});

// @desc    Download PDF offer
// @route   GET /api/offer/:id/download
// @access  Private (Admin, HR)
const downloadPDF = asyncHandler(async (req, res) => {
  const offer = await ThuMoiNhanViec.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thư mời nhận việc'
    });
  }

  if (!offer.pdfUrl) {
    return res.status(404).json({
      success: false,
      message: 'Chưa có file PDF'
    });
  }

  const path = require('path');
  const filePath = path.join(__dirname, '../../uploads/offer', offer.pdfFileName);

  res.download(filePath, `Offer-${offer.maOffer}.pdf`);
});

module.exports = {
  taoMoi,
  guiOffer,
  layDanhSach,
  layChiTiet,
  capNhat,
  huyOffer,
  traLoiOffer,
  downloadPDF
};
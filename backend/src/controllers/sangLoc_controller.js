const UngVien = require('../models/UngVien');
const TinTuyenDung = require('../models/TinTuyenDung');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const emailService = require('../services/email_service');
const nhatKyService = require('../services/nhatKy_service');
const { DOI_TUONG_LOG, TRANG_THAI_UNG_VIEN } = require('../utils/constants');
const { highlightKeywords } = require('../utils/helpers');

// @desc    Sàng lọc thủ công ứng viên
// @route   PUT /api/sang-loc/manual/:id
// @access  Private (Admin, HR)
const sangLocThuCong = asyncHandler(async (req, res) => {
  const { goiY, diemSangLoc, nhanXetSangLoc, trangThai } = req.body;

  const ungVien = await UngVien.findById(req.params.id).populate('jobId');

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  // Validate trạng thái
  if (trangThai && !['Dat_sang_loc', 'Khong_dat_sang_loc'].includes(trangThai)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const trangThaiCu = ungVien.trangThai;

  // Cập nhật thông tin sàng lọc
  if (goiY) ungVien.goiY = goiY;
  if (diemSangLoc !== undefined) ungVien.diemSangLoc = diemSangLoc;
  if (nhanXetSangLoc) ungVien.nhanXetSangLoc = nhanXetSangLoc;
  
  ungVien.nguoiSangLoc = req.user._id;
  ungVien.ngaySangLoc = new Date();

  // Nếu có trạng thái mới, cập nhật
  if (trangThai) {
    ungVien.capNhatTrangThai(trangThai, req.user._id, nhanXetSangLoc);
  }

  await ungVien.save();

  // Gửi email thông báo kết quả
  if (trangThai === TRANG_THAI_UNG_VIEN.DAT_SANG_LOC) {
    await emailService.guiEmailDatSangLoc(ungVien, ungVien.jobId);
  } else if (trangThai === TRANG_THAI_UNG_VIEN.KHONG_DAT_SANG_LOC) {
    await emailService.guiEmailKhongDatSangLoc(ungVien, ungVien.jobId, nhanXetSangLoc);
  }

  // Log
  await nhatKyService.logCapNhat(
    DOI_TUONG_LOG.UNG_VIEN,
    ungVien._id,
    req.user._id,
    { trangThai: trangThaiCu },
    { 
      trangThai, 
      diemSangLoc, 
      goiY: goiY ? goiY.length : 0 
    },
    'Sàng lọc hồ sơ ứng viên',
    req
  );

  res.json({
    success: true,
    message: 'Sàng lọc thành công',
    data: ungVien
  });
});

// @desc    Gợi ý sàng lọc tự động (highlight keywords)
// @route   GET /api/sang-loc/goi-y/:id
// @access  Private (Admin, HR)
const goiYSangLoc = asyncHandler(async (req, res) => {
  const ungVien = await UngVien.findById(req.params.id).populate('jobId');

  if (!ungVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy ứng viên'
    });
  }

  const job = ungVien.jobId;
  const goiY = [];

  // 1. Kiểm tra kinh nghiệm
  if (job.kinhNghiemToiThieu) {
    goiY.push({
      tieuChi: `Kinh nghiệm tối thiểu ${job.kinhNghiemToiThieu} năm`,
      ketQua: ungVien.kinhNghiem >= job.kinhNghiemToiThieu ? 'Dat' : 'Khong_dat',
      ghiChu: `Ứng viên có ${ungVien.kinhNghiem} năm kinh nghiệm`
    });
  }

  // 2. Kiểm tra kỹ năng bắt buộc
  if (job.kyNangBatBuoc && job.kyNangBatBuoc.length > 0) {
    const kyNangUV = ungVien.kyNangNoiBat || [];
    const kyNangMatch = job.kyNangBatBuoc.filter(kn => 
      kyNangUV.some(uvKn => 
        uvKn.toLowerCase().includes(kn.toLowerCase()) ||
        kn.toLowerCase().includes(uvKn.toLowerCase())
      )
    );

    goiY.push({
      tieuChi: `Kỹ năng bắt buộc (${job.kyNangBatBuoc.join(', ')})`,
      ketQua: kyNangMatch.length === job.kyNangBatBuoc.length ? 'Dat' : 
              kyNangMatch.length > 0 ? 'Chua_danh_gia' : 'Khong_dat',
      ghiChu: `Có ${kyNangMatch.length}/${job.kyNangBatBuoc.length} kỹ năng: ${kyNangMatch.join(', ')}`
    });
  }

  // 3. Kiểm tra học vấn
  if (ungVien.hocVan) {
    goiY.push({
      tieuChi: 'Học vấn',
      ketQua: 'Chua_danh_gia',
      ghiChu: ungVien.hocVan
    });
  }

  // 4. Kiểm tra thư ứng tuyển
  if (ungVien.thuUngTuyen) {
    const keywords = [
      ...job.kyNangBatBuoc || [],
      job.tieuDe,
      'kinh nghiệm',
      'dự án',
      'thành tựu'
    ];

    const matchCount = keywords.filter(kw => 
      ungVien.thuUngTuyen.toLowerCase().includes(kw.toLowerCase())
    ).length;

    goiY.push({
      tieuChi: 'Thư ứng tuyển',
      ketQua: matchCount >= keywords.length / 2 ? 'Dat' : 'Chua_danh_gia',
      ghiChu: `Có ${matchCount}/${keywords.length} từ khóa liên quan`
    });
  }

  res.json({
    success: true,
    data: {
      ungVien: {
        _id: ungVien._id,
        hoTen: ungVien.hoTen,
        kinhNghiem: ungVien.kinhNghiem,
        kyNangNoiBat: ungVien.kyNangNoiBat,
        hocVan: ungVien.hocVan
      },
      job: {
        tieuDe: job.tieuDe,
        kinhNghiemToiThieu: job.kinhNghiemToiThieu,
        kyNangBatBuoc: job.kyNangBatBuoc
      },
      goiY,
      diemGoiY: goiY.filter(g => g.ketQua === 'Dat').length / goiY.length * 100
    }
  });
});

// @desc    Sàng lọc hàng loạt
// @route   POST /api/sang-loc/hang-loat
// @access  Private (Admin, HR)
const sangLocHangLoat = asyncHandler(async (req, res) => {
  const { ungVienIds, trangThai, nhanXet } = req.body;

  if (!ungVienIds || ungVienIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn ứng viên'
    });
  }

  if (!['Dat_sang_loc', 'Khong_dat_sang_loc'].includes(trangThai)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ'
    });
  }

  const ungViens = await UngVien.find({ 
    _id: { $in: ungVienIds } 
  }).populate('jobId');

  const ketQua = {
    thanhCong: 0,
    thatBai: 0,
    chiTiet: []
  };

  for (const uv of ungViens) {
    try {
      uv.capNhatTrangThai(trangThai, req.user._id, nhanXet);
      uv.nguoiSangLoc = req.user._id;
      uv.ngaySangLoc = new Date();
      await uv.save();

      // Gửi email
      if (trangThai === TRANG_THAI_UNG_VIEN.DAT_SANG_LOC) {
        await emailService.guiEmailDatSangLoc(uv, uv.jobId);
      } else {
        await emailService.guiEmailKhongDatSangLoc(uv, uv.jobId, nhanXet);
      }

      // Log
      await nhatKyService.logCapNhat(
        DOI_TUONG_LOG.UNG_VIEN,
        uv._id,
        req.user._id,
        null,
        { trangThai },
        'Sàng lọc hàng loạt',
        req
      );

      ketQua.thanhCong++;
      ketQua.chiTiet.push({
        ungVienId: uv._id,
        hoTen: uv.hoTen,
        thanhCong: true
      });
    } catch (error) {
      ketQua.thatBai++;
      ketQua.chiTiet.push({
        ungVienId: uv._id,
        hoTen: uv.hoTen,
        thanhCong: false,
        loi: error.message
      });
    }
  }

  res.json({
    success: true,
    message: `Sàng lọc hoàn tất: ${ketQua.thanhCong} thành công, ${ketQua.thatBai} thất bại`,
    data: ketQua
  });
});

// @desc    Lấy danh sách ứng viên cần sàng lọc
// @route   GET /api/sang-loc/can-sang-loc
// @access  Private (Admin, HR)
const layDanhSachCanSangLoc = asyncHandler(async (req, res) => {
  const { jobId } = req.query;

  const query = { 
    trangThai: TRANG_THAI_UNG_VIEN.MOI_NOP 
  };

  if (jobId) query.jobId = jobId;

  const ungViens = await UngVien.find(query)
    .populate('jobId', 'tieuDe kyNangBatBuoc kinhNghiemToiThieu')
    .sort({ ngayNop: 1 })
    .limit(50);

  res.json({
    success: true,
    data: ungViens,
    total: ungViens.length
  });
});

// @desc    Thống kê kết quả sàng lọc
// @route   GET /api/sang-loc/thong-ke
// @access  Private (Admin, HR)
const thongKeSangLoc = asyncHandler(async (req, res) => {
  const { jobId, tuNgay, denNgay } = req.query;

  const matchCondition = {};
  if (jobId) matchCondition.jobId = require('mongoose').Types.ObjectId(jobId);
  if (tuNgay || denNgay) {
    matchCondition.ngaySangLoc = {};
    if (tuNgay) matchCondition.ngaySangLoc.$gte = new Date(tuNgay);
    if (denNgay) matchCondition.ngaySangLoc.$lte = new Date(denNgay);
  }

  const thongKe = await UngVien.aggregate([
    {
      $match: {
        nguoiSangLoc: { $exists: true },
        ...matchCondition
      }
    },
    {
      $group: {
        _id: '$trangThai',
        soLuong: { $sum: 1 },
        diemTrungBinh: { $avg: '$diemSangLoc' }
      }
    }
  ]);

  const tongSo = thongKe.reduce((sum, item) => sum + item.soLuong, 0);

  res.json({
    success: true,
    data: {
      thongKe: thongKe.map(item => ({
        trangThai: item._id,
        soLuong: item.soLuong,
        tyLe: ((item.soLuong / tongSo) * 100).toFixed(2) + '%',
        diemTrungBinh: item.diemTrungBinh ? item.diemTrungBinh.toFixed(2) : null
      })),
      tongSo
    }
  });
});

module.exports = {
  sangLocThuCong,
  goiYSangLoc,
  sangLocHangLoat,
  layDanhSachCanSangLoc,
  thongKeSangLoc
};
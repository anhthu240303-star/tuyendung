const HoiDongPhongVan = require('../models/HoiDongPhongVan');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const { getPaginationParams } = require('../utils/helpers');
const nhatKyService = require('../services/nhatKy_service');
const { VAI_TRO_HOI_DONG } = require('../utils/constants');

// @desc    Tạo hội đồng phỏng vấn
// @route   POST /api/hoi-dong
// @access  Private (Admin, HR)
const taoMoi = asyncHandler(async (req, res) => {
  const { ten, moTa, thanhVien } = req.body;

  // Validate thành viên
  if (!thanhVien || thanhVien.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Hội đồng phải có ít nhất 1 thành viên'
    });
  }

  // Kiểm tra số lượng chủ tịch
  const chuTichCount = thanhVien.filter(
    tv => tv.vaiTro === VAI_TRO_HOI_DONG.CHU_TICH
  ).length;

  if (chuTichCount > 1) {
    return res.status(400).json({
      success: false,
      message: 'Hội đồng chỉ có thể có 1 chủ tịch'
    });
  }

  // Kiểm tra trùng thành viên
  const nguoiDungIds = thanhVien.map(tv => tv.nguoiDungId.toString());
  const uniqueIds = new Set(nguoiDungIds);

  if (nguoiDungIds.length !== uniqueIds.size) {
    return res.status(400).json({
      success: false,
      message: 'Không thể thêm trùng thành viên trong hội đồng'
    });
  }

  const hoiDong = await HoiDongPhongVan.create({
    ten,
    moTa,
    thanhVien,
    taoBoi: req.user._id
  });

  // Log
  await nhatKyService.logTaoMoi(
    'HoiDongPhongVan',
    hoiDong._id,
    req.user._id,
    `Tạo hội đồng: ${ten}`,
    req
  );

  res.status(201).json({
    success: true,
    message: 'Tạo hội đồng phỏng vấn thành công',
    data: hoiDong
  });
});

// @desc    Lấy danh sách hội đồng
// @route   GET /api/hoi-dong
// @access  Private
const layDanhSach = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { trangThai, timKiem } = req.query;

  const query = {};
  
  if (trangThai) query.trangThai = trangThai;
  if (timKiem) {
    query.ten = { $regex: timKiem, $options: 'i' };
  }

  const [hoiDong, total] = await Promise.all([
    HoiDongPhongVan.find(query)
      .populate('thanhVien.nguoiDungId', 'hoTen email vaiTro')
      .populate('taoBoi', 'hoTen email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    HoiDongPhongVan.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: hoiDong,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Lấy chi tiết hội đồng
// @route   GET /api/hoi-dong/:id
// @access  Private
const layChiTiet = asyncHandler(async (req, res) => {
  const hoiDong = await HoiDongPhongVan.findById(req.params.id)
    .populate('thanhVien.nguoiDungId', 'hoTen email soDienThoai vaiTro')
    .populate('taoBoi', 'hoTen email');

  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng'
    });
  }

  // Lấy số lượng phỏng vấn đã thực hiện
  const LichPhongVan = require('../models/LichPhongVan');
  const soLuocPhongVan = await LichPhongVan.countDocuments({
    hoiDongId: hoiDong._id,
    trangThai: 'Hoan_thanh'
  });

  res.json({
    success: true,
    data: {
      ...hoiDong.toObject(),
      soLuocPhongVan
    }
  });
});

// @desc    Cập nhật hội đồng
// @route   PUT /api/hoi-dong/:id
// @access  Private (Admin, HR)
const capNhat = asyncHandler(async (req, res) => {
  const { ten, moTa, trangThai } = req.body;

  const hoiDong = await HoiDongPhongVan.findById(req.params.id);

  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng'
    });
  }

  const duLieuCu = { ...hoiDong.toObject() };

  if (ten) hoiDong.ten = ten;
  if (moTa !== undefined) hoiDong.moTa = moTa;
  if (trangThai) hoiDong.trangThai = trangThai;

  await hoiDong.save();

  // Log
  await nhatKyService.logCapNhat(
    'HoiDongPhongVan',
    hoiDong._id,
    req.user._id,
    duLieuCu,
    hoiDong.toObject(),
    'Cập nhật hội đồng',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật hội đồng thành công',
    data: hoiDong
  });
});

// @desc    Xóa hội đồng
// @route   DELETE /api/hoi-dong/:id
// @access  Private (Admin, HR)
const xoa = asyncHandler(async (req, res) => {
  const hoiDong = await HoiDongPhongVan.findById(req.params.id);

  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng'
    });
  }

  // Kiểm tra có lịch phỏng vấn nào đang dùng không
  const LichPhongVan = require('../models/LichPhongVan');
  const lichDangDung = await LichPhongVan.countDocuments({
    hoiDongId: hoiDong._id,
    trangThai: { $in: ['Cho_xac_nhan', 'Da_xac_nhan'] }
  });

  if (lichDangDung > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa. Có ${lichDangDung} lịch phỏng vấn đang sử dụng hội đồng này`
    });
  }

  await hoiDong.deleteOne();

  // Log
  await nhatKyService.logXoa(
    'HoiDongPhongVan',
    hoiDong._id,
    req.user._id,
    `Xóa hội đồng: ${hoiDong.ten}`,
    req
  );

  res.json({
    success: true,
    message: 'Xóa hội đồng thành công'
  });
});

// @desc    Thêm thành viên vào hội đồng
// @route   POST /api/hoi-dong/:id/thanh-vien
// @access  Private (Admin, HR)
const themThanhVien = asyncHandler(async (req, res) => {
  const { nguoiDungId, vaiTro } = req.body;

  if (!Object.values(VAI_TRO_HOI_DONG).includes(vaiTro)) {
    return res.status(400).json({
      success: false,
      message: 'Vai trò không hợp lệ'
    });
  }

  const hoiDong = await HoiDongPhongVan.findById(req.params.id);

  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng'
    });
  }

  // Kiểm tra thành viên đã tồn tại
  const daTonTai = hoiDong.thanhVien.some(
    tv => tv.nguoiDungId.toString() === nguoiDungId
  );

  if (daTonTai) {
    return res.status(400).json({
      success: false,
      message: 'Thành viên đã tồn tại trong hội đồng'
    });
  }

  // Nếu thêm chủ tịch, kiểm tra đã có chưa
  if (vaiTro === VAI_TRO_HOI_DONG.CHU_TICH) {
    const coChuTich = hoiDong.thanhVien.some(
      tv => tv.vaiTro === VAI_TRO_HOI_DONG.CHU_TICH
    );

    if (coChuTich) {
      return res.status(400).json({
        success: false,
        message: 'Hội đồng đã có chủ tịch'
      });
    }
  }

  hoiDong.themThanhVien(nguoiDungId, vaiTro);
  await hoiDong.save();

  // Log
  await nhatKyService.logCapNhat(
    'HoiDongPhongVan',
    hoiDong._id,
    req.user._id,
    null,
    { nguoiDungId, vaiTro },
    'Thêm thành viên vào hội đồng',
    req
  );

  res.json({
    success: true,
    message: 'Thêm thành viên thành công',
    data: hoiDong
  });
});

// @desc    Xóa thành viên khỏi hội đồng
// @route   DELETE /api/hoi-dong/:id/thanh-vien/:nguoiDungId
// @access  Private (Admin, HR)
const xoaThanhVien = asyncHandler(async (req, res) => {
  const { nguoiDungId } = req.params;

  const hoiDong = await HoiDongPhongVan.findById(req.params.id);

  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng'
    });
  }

  hoiDong.xoaThanhVien(nguoiDungId);
  await hoiDong.save();

  // Log
  await nhatKyService.logCapNhat(
    'HoiDongPhongVan',
    hoiDong._id,
    req.user._id,
    null,
    { nguoiDungId },
    'Xóa thành viên khỏi hội đồng',
    req
  );

  res.json({
    success: true,
    message: 'Xóa thành viên thành công',
    data: hoiDong
  });
});

// @desc    Cập nhật vai trò thành viên
// @route   PUT /api/hoi-dong/:id/thanh-vien/:nguoiDungId
// @access  Private (Admin, HR)
const capNhatVaiTro = asyncHandler(async (req, res) => {
  const { nguoiDungId } = req.params;
  const { vaiTro } = req.body;

  if (!Object.values(VAI_TRO_HOI_DONG).includes(vaiTro)) {
    return res.status(400).json({
      success: false,
      message: 'Vai trò không hợp lệ'
    });
  }

  const hoiDong = await HoiDongPhongVan.findById(req.params.id);

  if (!hoiDong) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy hội đồng'
    });
  }

  // Tìm thành viên
  const thanhVien = hoiDong.thanhVien.find(
    tv => tv.nguoiDungId.toString() === nguoiDungId
  );

  if (!thanhVien) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thành viên trong hội đồng'
    });
  }

  // Nếu đổi sang chủ tịch, kiểm tra đã có chưa
  if (vaiTro === VAI_TRO_HOI_DONG.CHU_TICH) {
    const coChuTich = hoiDong.thanhVien.some(
      tv => tv.vaiTro === VAI_TRO_HOI_DONG.CHU_TICH && 
            tv.nguoiDungId.toString() !== nguoiDungId
    );

    if (coChuTich) {
      return res.status(400).json({
        success: false,
        message: 'Hội đồng đã có chủ tịch. Vui lòng đổi vai trò của chủ tịch hiện tại trước'
      });
    }
  }

  thanhVien.vaiTro = vaiTro;
  await hoiDong.save();

  // Log
  await nhatKyService.logCapNhat(
    'HoiDongPhongVan',
    hoiDong._id,
    req.user._id,
    null,
    { nguoiDungId, vaiTro },
    'Cập nhật vai trò thành viên',
    req
  );

  res.json({
    success: true,
    message: 'Cập nhật vai trò thành công',
    data: hoiDong
  });
});

module.exports = {
  taoMoi,
  layDanhSach,
  layChiTiet,
  capNhat,
  xoa,
  themThanhVien,
  xoaThanhVien,
  capNhatVaiTro
};
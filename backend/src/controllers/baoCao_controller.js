const TinTuyenDung = require('../models/TinTuyenDung');
const UngVien = require('../models/UngVien');
const LichPhongVan = require('../models/LichPhongVan');
const ThuMoiNhanViec = require('../models/ThuMoiNhanViec');
const { asyncHandler } = require('../middlewares/errorHandler_middleware');
const excelService = require('../services/excel_service');
const { TRANG_THAI_UNG_VIEN } = require('../utils/constants');

// @desc    Dashboard - Thống kê tổng quan
// @route   GET /api/bao-cao/dashboard
// @access  Private (Admin, HR)
const dashboard = asyncHandler(async (req, res) => {
  const { tuNgay, denNgay } = req.query;

  // Build date filter
  const dateFilter = {};
  if (tuNgay || denNgay) {
    dateFilter.createdAt = {};
    if (tuNgay) dateFilter.createdAt.$gte = new Date(tuNgay);
    if (denNgay) dateFilter.createdAt.$lte = new Date(denNgay);
  }

  // Thống kê cơ bản
  const [
    tongTinTuyenDung,
    tinDangTuyen,
    tongUngVien,
    ungVienMoi,
    ungVienDatSangLoc,
    ungVienDangPhongVan,
    ungVienDaTuyen,
    tongLichPhongVan,
    lichSapToi,
    tongOffer,
    offerDaChapNhan
  ] = await Promise.all([
    TinTuyenDung.countDocuments(dateFilter),
    TinTuyenDung.countDocuments({ 
      ...dateFilter,
      trangThai: 'Dang_tuyen' 
    }),
    UngVien.countDocuments(dateFilter),
    UngVien.countDocuments({
      ...dateFilter,
      trangThai: TRANG_THAI_UNG_VIEN.MOI_NOP
    }),
    UngVien.countDocuments({
      ...dateFilter,
      trangThai: TRANG_THAI_UNG_VIEN.DAT_SANG_LOC
    }),
    UngVien.countDocuments({
      ...dateFilter,
      trangThai: {
        $in: [
          TRANG_THAI_UNG_VIEN.CHO_PHONG_VAN,
          TRANG_THAI_UNG_VIEN.DANG_PHONG_VAN,
          TRANG_THAI_UNG_VIEN.HOAN_THANH_PHONG_VAN
        ]
      }
    }),
    UngVien.countDocuments({
      ...dateFilter,
      trangThai: TRANG_THAI_UNG_VIEN.DA_TUYEN
    }),
    LichPhongVan.countDocuments(dateFilter),
    LichPhongVan.countDocuments({
      thoiGianBatDau: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày tới
      },
      trangThai: { $in: ['Cho_xac_nhan', 'Da_xac_nhan'] }
    }),
    ThuMoiNhanViec.countDocuments(dateFilter),
    ThuMoiNhanViec.countDocuments({
      ...dateFilter,
      trangThai: 'Da_chap_nhan'
    })
  ]);

  // Tỷ lệ chuyển đổi
  const tyLeChuyenDoi = tongUngVien > 0
    ? ((ungVienDaTuyen / tongUngVien) * 100).toFixed(2)
    : 0;

  const tyLeSangLoc = tongUngVien > 0
    ? ((ungVienDatSangLoc / tongUngVien) * 100).toFixed(2)
    : 0;

  // Thời gian tuyển dụng trung bình (ngày)
  const thoiGianTrungBinh = await UngVien.aggregate([
    {
      $match: {
        ...dateFilter,
        trangThai: TRANG_THAI_UNG_VIEN.DA_TUYEN
      }
    },
    {
      $project: {
        soNgay: {
          $divide: [
            { $subtract: ['$updatedAt', '$ngayNop'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        trungBinh: { $avg: '$soNgay' }
      }
    }
  ]);

  const thoiGianTB = thoiGianTrungBinh.length > 0
    ? Math.round(thoiGianTrungBinh[0].trungBinh)
    : 0;

  res.json({
    success: true,
    data: {
      tongQuan: {
        tongTinTuyenDung,
        tinDangTuyen,
        tongUngVien,
        ungVienDaTuyen,
        tongLichPhongVan,
        tongOffer
      },
      ungVien: {
        moiNop: ungVienMoi,
        datSangLoc: ungVienDatSangLoc,
        dangPhongVan: ungVienDangPhongVan,
        daTuyen: ungVienDaTuyen
      },
      chiSo: {
        tyLeChuyenDoi: tyLeChuyenDoi + '%',
        tyLeSangLoc: tyLeSangLoc + '%',
        thoiGianTrungBinh: thoiGianTB + ' ngày'
      },
      sapToi: {
        lichPhongVan: lichSapToi
      },
      offer: {
        tongSo: tongOffer,
        daChapNhan: offerDaChapNhan,
        choTraLoi: tongOffer - offerDaChapNhan
      }
    }
  });
});

// @desc    Báo cáo theo tin tuyển dụng
// @route   GET /api/bao-cao/theo-tin
// @access  Private (Admin, HR)
const baoCaoTheoTin = asyncHandler(async (req, res) => {
  const { tuNgay, denNgay } = req.query;

  const dateFilter = {};
  if (tuNgay || denNgay) {
    dateFilter.ngayDang = {};
    if (tuNgay) dateFilter.ngayDang.$gte = new Date(tuNgay);
    if (denNgay) dateFilter.ngayDang.$lte = new Date(denNgay);
  }

  const tinTuyenDung = await TinTuyenDung.find(dateFilter)
    .select('tieuDe soLuongTuyen soLuongDaTuyen soLuongUngTuyen trangThai ngayDang hanNop')
    .lean();

  // Lấy thống kê ứng viên cho mỗi tin
  const baoCao = await Promise.all(
    tinTuyenDung.map(async (tin) => {
      const [moiNop, datSangLoc, dangPV, daTuyen, khongTuyen] = await Promise.all([
        UngVien.countDocuments({ 
          jobId: tin._id, 
          trangThai: TRANG_THAI_UNG_VIEN.MOI_NOP 
        }),
        UngVien.countDocuments({ 
          jobId: tin._id, 
          trangThai: TRANG_THAI_UNG_VIEN.DAT_SANG_LOC 
        }),
        UngVien.countDocuments({
          jobId: tin._id,
          trangThai: {
            $in: [
              TRANG_THAI_UNG_VIEN.CHO_PHONG_VAN,
              TRANG_THAI_UNG_VIEN.DANG_PHONG_VAN,
              TRANG_THAI_UNG_VIEN.HOAN_THANH_PHONG_VAN
            ]
          }
        }),
        UngVien.countDocuments({ 
          jobId: tin._id, 
          trangThai: TRANG_THAI_UNG_VIEN.DA_TUYEN 
        }),
        UngVien.countDocuments({ 
          jobId: tin._id, 
          trangThai: TRANG_THAI_UNG_VIEN.KHONG_TUYEN 
        })
      ]);

      return {
        ...tin,
        ungVien: {
          moiNop,
          datSangLoc,
          dangPhongVan: dangPV,
          daTuyen,
          khongTuyen,
          tyLeChuyenDoi: tin.soLuongUngTuyen > 0
            ? ((daTuyen / tin.soLuongUngTuyen) * 100).toFixed(2) + '%'
            : '0%'
        }
      };
    })
  );

  res.json({
    success: true,
    data: baoCao
  });
});

// @desc    Báo cáo theo nguồn ứng tuyển
// @route   GET /api/bao-cao/theo-nguon
// @access  Private (Admin, HR)
const baoCaoTheoNguon = asyncHandler(async (req, res) => {
  const { tuNgay, denNgay } = req.query;

  const matchCondition = {};
  if (tuNgay || denNgay) {
    matchCondition.ngayNop = {};
    if (tuNgay) matchCondition.ngayNop.$gte = new Date(tuNgay);
    if (denNgay) matchCondition.ngayNop.$lte = new Date(denNgay);
  }

  const thongKe = await UngVien.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$nguonUngTuyen',
        soLuong: { $sum: 1 },
        daTuyen: {
          $sum: {
            $cond: [
              { $eq: ['$trangThai', TRANG_THAI_UNG_VIEN.DA_TUYEN] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { soLuong: -1 } }
  ]);

  const tongSo = thongKe.reduce((sum, item) => sum + item.soLuong, 0);

  const baoCao = thongKe.map(item => ({
    nguon: item._id || 'Không xác định',
    soLuong: item.soLuong,
    daTuyen: item.daTuyen,
    tyLe: ((item.soLuong / tongSo) * 100).toFixed(2) + '%',
    tyLeChuyenDoi: item.soLuong > 0
      ? ((item.daTuyen / item.soLuong) * 100).toFixed(2) + '%'
      : '0%'
  }));

  res.json({
    success: true,
    data: {
      thongKe: baoCao,
      tongSo
    }
  });
});

// @desc    Báo cáo theo thời gian
// @route   GET /api/bao-cao/theo-thoi-gian
// @access  Private (Admin, HR)
const baoCaoTheoThoiGian = asyncHandler(async (req, res) => {
  const { tuNgay, denNgay, groupBy = 'ngay' } = req.query;

  const matchCondition = {};
  if (tuNgay || denNgay) {
    matchCondition.ngayNop = {};
    if (tuNgay) matchCondition.ngayNop.$gte = new Date(tuNgay);
    if (denNgay) matchCondition.ngayNop.$lte = new Date(denNgay);
  }

  // Group format
  let dateFormat;
  switch (groupBy) {
    case 'tuan':
      dateFormat = { $isoWeek: '$ngayNop' };
      break;
    case 'thang':
      dateFormat = { $month: '$ngayNop' };
      break;
    case 'nam':
      dateFormat = { $year: '$ngayNop' };
      break;
    default: // ngay
      dateFormat = {
        $dateToString: { format: '%Y-%m-%d', date: '$ngayNop' }
      };
  }

  const thongKe = await UngVien.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: dateFormat,
        tongUngVien: { $sum: 1 },
        datSangLoc: {
          $sum: {
            $cond: [
              { $eq: ['$trangThai', TRANG_THAI_UNG_VIEN.DAT_SANG_LOC] },
              1,
              0
            ]
          }
        },
        daTuyen: {
          $sum: {
            $cond: [
              { $eq: ['$trangThai', TRANG_THAI_UNG_VIEN.DA_TUYEN] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: thongKe.map(item => ({
      thoiGian: item._id,
      tongUngVien: item.tongUngVien,
      datSangLoc: item.datSangLoc,
      daTuyen: item.daTuyen,
      tyLeChuyenDoi: item.tongUngVien > 0
        ? ((item.daTuyen / item.tongUngVien) * 100).toFixed(2) + '%'
        : '0%'
    }))
  });
});

// @desc    Export báo cáo Excel
// @route   GET /api/bao-cao/export
// @access  Private (Admin, HR)
const exportExcel = asyncHandler(async (req, res) => {
  const { loai = 'tong-hop', tuNgay, denNgay } = req.query;

  if (loai === 'ung-vien') {
    // Export danh sách ứng viên
    const { jobId } = req.query;
    const query = {};
    if (jobId) query.jobId = jobId;

    const ungViens = await UngVien.find(query)
      .populate('jobId', 'tieuDe')
      .lean();

    const tinTuyenDung = jobId 
      ? await TinTuyenDung.findById(jobId)
      : null;

    const result = await excelService.exportUngVien(ungViens, tinTuyenDung);
    
    res.download(result.filePath, result.fileName);
  } else {
    // Export báo cáo tổng hợp
    const dateFilter = {};
    if (tuNgay || denNgay) {
      dateFilter.createdAt = {};
      if (tuNgay) dateFilter.createdAt.$gte = new Date(tuNgay);
      if (denNgay) dateFilter.createdAt.$lte = new Date(denNgay);
    }

    // Lấy dữ liệu tổng hợp
    const [tongTinTuyenDung, tongUngVien, ungVienDatSangLoc, ungVienPhongVan, ungVienDuocTuyen] = await Promise.all([
      TinTuyenDung.countDocuments(dateFilter),
      UngVien.countDocuments(dateFilter),
      UngVien.countDocuments({ 
        ...dateFilter, 
        trangThai: TRANG_THAI_UNG_VIEN.DAT_SANG_LOC 
      }),
      UngVien.countDocuments({
        ...dateFilter,
        trangThai: {
          $in: [
            TRANG_THAI_UNG_VIEN.CHO_PHONG_VAN,
            TRANG_THAI_UNG_VIEN.DANG_PHONG_VAN,
            TRANG_THAI_UNG_VIEN.HOAN_THANH_PHONG_VAN
          ]
        }
      }),
      UngVien.countDocuments({ 
        ...dateFilter, 
        trangThai: TRANG_THAI_UNG_VIEN.DA_TUYEN 
      })
    ]);

    const tyLeChuyenDoi = tongUngVien > 0
      ? ((ungVienDuocTuyen / tongUngVien) * 100).toFixed(2)
      : 0;

    // Lấy thống kê theo vị trí
    const theoViTri = await TinTuyenDung.find(dateFilter)
      .select('tieuDe soLuongTuyen soLuongDaTuyen soLuongUngTuyen trangThai')
      .lean();

    // Lấy thống kê theo nguồn
    const theoNguon = await UngVien.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$nguonUngTuyen',
          soLuong: { $sum: 1 }
        }
      }
    ]);

    const tongUV = theoNguon.reduce((sum, item) => sum + item.soLuong, 0);
    const theoNguonFormatted = theoNguon.map(item => ({
      nguon: item._id || 'Không xác định',
      soLuong: item.soLuong,
      tyLe: ((item.soLuong / tongUV) * 100).toFixed(2)
    }));

    const data = {
      tongTinTuyenDung,
      tongUngVien,
      ungVienDatSangLoc,
      ungVienPhongVan,
      ungVienDuocTuyen,
      tyLeChuyenDoi,
      thoiGianTrungBinh: 0, // Tính riêng nếu cần
      theoViTri,
      theoNguon: theoNguonFormatted
    };

    const result = await excelService.exportBaoCaoTongHop(data);
    
    res.download(result.filePath, result.fileName);
  }
});

module.exports = {
  dashboard,
  baoCaoTheoTin,
  baoCaoTheoNguon,
  baoCaoTheoThoiGian,
  exportExcel
};
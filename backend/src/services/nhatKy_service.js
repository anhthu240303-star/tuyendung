const NhatKyHeThong = require('../models/NhatKyHeThong');
const { LOAI_HANH_DONG, DOI_TUONG_LOG } = require('../utils/constants');

class NhatKyService {
  // Tạo log chung
  async taoLog({
    doiTuong,
    doiTuongId,
    hanhDong,
    moTa,
    thucHienBoi,
    chiTiet = null,
    duLieuCu = null,
    duLieuMoi = null,
    req = null
  }) {
    try {
      return await NhatKyHeThong.taoLog({
        doiTuong,
        doiTuongId,
        hanhDong,
        moTa,
        thucHienBoi,
        chiTiet,
        duLieuCu,
        duLieuMoi,
        req
      });
    } catch (error) {
      console.error('Lỗi tạo log:', error);
      return null;
    }
  }

  // Log tạo mới
  async logTaoMoi(doiTuong, doiTuongId, thucHienBoi, moTa, req = null) {
    return this.taoLog({
      doiTuong,
      doiTuongId,
      hanhDong: LOAI_HANH_DONG.TAO_MOI,
      moTa: moTa || `Tạo mới ${doiTuong}`,
      thucHienBoi,
      req
    });
  }

  // Log cập nhật
  async logCapNhat(doiTuong, doiTuongId, thucHienBoi, duLieuCu, duLieuMoi, moTa, req = null) {
    return this.taoLog({
      doiTuong,
      doiTuongId,
      hanhDong: LOAI_HANH_DONG.CAP_NHAT,
      moTa: moTa || `Cập nhật ${doiTuong}`,
      thucHienBoi,
      duLieuCu,
      duLieuMoi,
      req
    });
  }

  // Log xóa
  async logXoa(doiTuong, doiTuongId, thucHienBoi, moTa, req = null) {
    return this.taoLog({
      doiTuong,
      doiTuongId,
      hanhDong: LOAI_HANH_DONG.XOA,
      moTa: moTa || `Xóa ${doiTuong}`,
      thucHienBoi,
      req
    });
  }

  // Log thay đổi trạng thái
  async logThayDoiTrangThai(doiTuong, doiTuongId, thucHienBoi, trangThaiCu, trangThaiMoi, moTa, req = null) {
    return this.taoLog({
      doiTuong,
      doiTuongId,
      hanhDong: LOAI_HANH_DONG.THAY_DOI_TRANG_THAI,
      moTa: moTa || `Thay đổi trạng thái ${doiTuong} từ ${trangThaiCu} sang ${trangThaiMoi}`,
      thucHienBoi,
      chiTiet: {
        trangThaiCu,
        trangThaiMoi
      },
      req
    });
  }

  // Log gửi email
  async logGuiEmail(doiTuong, doiTuongId, thucHienBoi, emailInfo, req = null) {
    return this.taoLog({
      doiTuong,
      doiTuongId,
      hanhDong: LOAI_HANH_DONG.GUI_EMAIL,
      moTa: `Gửi email ${emailInfo.subject || ''} đến ${emailInfo.to || ''}`,
      thucHienBoi,
      chiTiet: emailInfo,
      req
    });
  }

  // Log đánh giá phỏng vấn
  async logDanhGia(ungVienId, nguoiDanhGiaId, lichPhongVanId, diem, req = null) {
    return this.taoLog({
      doiTuong: DOI_TUONG_LOG.UNG_VIEN,
      doiTuongId: ungVienId,
      hanhDong: LOAI_HANH_DONG.DANH_GIA,
      moTa: `Đánh giá phỏng vấn - Điểm: ${diem}`,
      thucHienBoi: nguoiDanhGiaId,
      chiTiet: {
        lichPhongVanId,
        diem
      },
      req
    });
  }

  // Log tạo lịch phỏng vấn
  async logTaoLichPhongVan(lichPhongVanId, ungVienId, taoBoi, thongTin, req = null) {
    return this.taoLog({
      doiTuong: DOI_TUONG_LOG.LICH_PHONG_VAN,
      doiTuongId: lichPhongVanId,
      hanhDong: LOAI_HANH_DONG.PHONG_VAN,
      moTa: `Tạo lịch phỏng vấn cho ứng viên`,
      thucHienBoi: taoBoi,
      chiTiet: {
        ungVienId,
        ...thongTin
      },
      req
    });
  }

  // Log tạo offer
  async logTaoOffer(offerId, ungVienId, taoBoi, thongTin, req = null) {
    return this.taoLog({
      doiTuong: DOI_TUONG_LOG.OFFER,
      doiTuongId: offerId,
      hanhDong: LOAI_HANH_DONG.TAO_MOI,
      moTa: `Tạo thư mời nhận việc`,
      thucHienBoi: taoBoi,
      chiTiet: {
        ungVienId,
        ...thongTin
      },
      req
    });
  }

  // Lấy lịch sử của đối tượng
  async layLichSu(doiTuong, doiTuongId, options = {}) {
    try {
      return await NhatKyHeThong.layLichSu(doiTuong, doiTuongId, options);
    } catch (error) {
      console.error('Lỗi lấy lịch sử:', error);
      return {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
    }
  }

  // Lấy log theo người thực hiện
  async layLogTheoNguoiDung(nguoiDungId, options = {}) {
    try {
      const { page = 1, limit = 20, tuNgay, denNgay } = options;
      const skip = (page - 1) * limit;

      const query = { thucHienBoi: nguoiDungId };

      if (tuNgay || denNgay) {
        query.thoiGian = {};
        if (tuNgay) query.thoiGian.$gte = new Date(tuNgay);
        if (denNgay) query.thoiGian.$lte = new Date(denNgay);
      }

      const [logs, total] = await Promise.all([
        NhatKyHeThong.find(query)
          .sort({ thoiGian: -1 })
          .skip(skip)
          .limit(limit),
        NhatKyHeThong.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Lỗi lấy log theo người dùng:', error);
      return {
        logs: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      };
    }
  }

  // Lấy thống kê hoạt động
  async thongKeHoatDong(options = {}) {
    try {
      const { tuNgay, denNgay } = options;
      const matchCondition = {};

      if (tuNgay || denNgay) {
        matchCondition.thoiGian = {};
        if (tuNgay) matchCondition.thoiGian.$gte = new Date(tuNgay);
        if (denNgay) matchCondition.thoiGian.$lte = new Date(denNgay);
      }

      const [theoHanhDong, theoDoiTuong, theoNguoiDung] = await Promise.all([
        // Thống kê theo hành động
        NhatKyHeThong.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: '$hanhDong',
              soLuong: { $sum: 1 }
            }
          },
          { $sort: { soLuong: -1 } }
        ]),

        // Thống kê theo đối tượng
        NhatKyHeThong.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: '$doiTuong',
              soLuong: { $sum: 1 }
            }
          },
          { $sort: { soLuong: -1 } }
        ]),

        // Thống kê theo người dùng
        NhatKyHeThong.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: '$thucHienBoi',
              soLuong: { $sum: 1 }
            }
          },
          { $sort: { soLuong: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'nguoi_dung',
              localField: '_id',
              foreignField: '_id',
              as: 'nguoiDung'
            }
          },
          { $unwind: '$nguoiDung' }
        ])
      ]);

      return {
        theoHanhDong,
        theoDoiTuong,
        theoNguoiDung
      };
    } catch (error) {
      console.error('Lỗi thống kê hoạt động:', error);
      return {
        theoHanhDong: [],
        theoDoiTuong: [],
        theoNguoiDung: []
      };
    }
  }
}

module.exports = new NhatKyService();
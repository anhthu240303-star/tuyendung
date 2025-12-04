const ExcelJS = require('exceljs');
const path = require('path');
const { formatDate, formatDateTime } = require('../utils/helpers');

class ExcelService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../uploads/temp');
  }

  // Tạo workbook mới
  createWorkbook() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hệ thống tuyển dụng';
    workbook.created = new Date();
    return workbook;
  }

  // Style cho header
  getHeaderStyle() {
    return {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  }

  // Export danh sách ứng viên
  async exportUngVien(danhSachUngVien, tinTuyenDung) {
    const workbook = this.createWorkbook();
    const worksheet = workbook.addWorksheet('Danh sách ứng viên');

    // Thiết lập columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ tên', key: 'hoTen', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'soDienThoai', width: 15 },
      { header: 'Kinh nghiệm (năm)', key: 'kinhNghiem', width: 18 },
      { header: 'Trạng thái', key: 'trangThai', width: 20 },
      { header: 'Ngày nộp', key: 'ngayNop', width: 18 },
      { header: 'Điểm sàng lọc', key: 'diemSangLoc', width: 15 }
    ];

    // Style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.style = this.getHeaderStyle();
    });

    // Thêm dữ liệu
    danhSachUngVien.forEach((uv, index) => {
      worksheet.addRow({
        stt: index + 1,
        hoTen: uv.hoTen,
        email: uv.email,
        soDienThoai: uv.soDienThoai,
        kinhNghiem: uv.kinhNghiem || 0,
        trangThai: this.formatTrangThai(uv.trangThai),
        ngayNop: formatDate(uv.ngayNop),
        diemSangLoc: uv.diemSangLoc || 'Chưa đánh giá'
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle' };
    });

    // Thêm title
    worksheet.insertRow(1, [`Danh sách ứng viên - ${tinTuyenDung ? tinTuyenDung.tieuDe : 'Tất cả'}`]);
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').style = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    worksheet.getRow(1).height = 30;

    // Lưu file
    const fileName = `ung-vien-${Date.now()}.xlsx`;
    const filePath = path.join(this.outputDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return { fileName, filePath };
  }

  // Export báo cáo tuyển dụng tổng hợp
  async exportBaoCaoTongHop(data) {
    const workbook = this.createWorkbook();

    // Sheet 1: Tổng quan
    const overview = workbook.addWorksheet('Tổng quan');
    overview.columns = [
      { header: 'Chỉ số', key: 'chiSo', width: 30 },
      { header: 'Giá trị', key: 'giaTri', width: 20 }
    ];

    overview.getRow(1).eachCell((cell) => {
      cell.style = this.getHeaderStyle();
    });

    overview.addRows([
      { chiSo: 'Tổng số tin tuyển dụng', giaTri: data.tongTinTuyenDung },
      { chiSo: 'Tổng số ứng viên', giaTri: data.tongUngVien },
      { chiSo: 'Số ứng viên đạt sàng lọc', giaTri: data.ungVienDatSangLoc },
      { chiSo: 'Số ứng viên phỏng vấn', giaTri: data.ungVienPhongVan },
      { chiSo: 'Số ứng viên được tuyển', giaTri: data.ungVienDuocTuyen },
      { chiSo: 'Tỷ lệ chuyển đổi', giaTri: `${data.tyLeChuyenDoi}%` },
      { chiSo: 'Thời gian tuyển dụng TB', giaTri: `${data.thoiGianTrungBinh} ngày` }
    ]);

    // Sheet 2: Theo từng vị trí
    const byPosition = workbook.addWorksheet('Theo vị trí');
    byPosition.columns = [
      { header: 'Vị trí', key: 'viTri', width: 30 },
      { header: 'Số lượng tuyển', key: 'soLuongTuyen', width: 15 },
      { header: 'Đã tuyển', key: 'daTuyen', width: 15 },
      { header: 'Còn thiếu', key: 'conThieu', width: 15 },
      { header: 'Số ứng viên', key: 'soUngVien', width: 15 },
      { header: 'Trạng thái', key: 'trangThai', width: 15 }
    ];

    byPosition.getRow(1).eachCell((cell) => {
      cell.style = this.getHeaderStyle();
    });

    if (data.theoViTri) {
      data.theoViTri.forEach(item => {
        byPosition.addRow({
          viTri: item.tieuDe,
          soLuongTuyen: item.soLuongTuyen,
          daTuyen: item.soLuongDaTuyen,
          conThieu: item.soLuongTuyen - item.soLuongDaTuyen,
          soUngVien: item.soLuongUngTuyen,
          trangThai: this.formatTrangThai(item.trangThai)
        });
      });
    }

    // Sheet 3: Nguồn ứng tuyển
    const bySource = workbook.addWorksheet('Nguồn ứng tuyển');
    bySource.columns = [
      { header: 'Nguồn', key: 'nguon', width: 25 },
      { header: 'Số lượng', key: 'soLuong', width: 15 },
      { header: 'Tỷ lệ', key: 'tyLe', width: 15 }
    ];

    bySource.getRow(1).eachCell((cell) => {
      cell.style = this.getHeaderStyle();
    });

    if (data.theoNguon) {
      data.theoNguon.forEach(item => {
        bySource.addRow({
          nguon: item.nguon,
          soLuong: item.soLuong,
          tyLe: `${item.tyLe}%`
        });
      });
    }

    // Lưu file
    const fileName = `bao-cao-tuyen-dung-${Date.now()}.xlsx`;
    const filePath = path.join(this.outputDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return { fileName, filePath };
  }

  // Export kết quả phỏng vấn
  async exportKetQuaPhongVan(danhSachDanhGia, ungVien, tinTuyenDung) {
    const workbook = this.createWorkbook();
    const worksheet = workbook.addWorksheet('Kết quả phỏng vấn');

    // Info ứng viên
    worksheet.addRow(['THÔNG TIN ỨNG VIÊN']);
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').style = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'center' }
    };

    worksheet.addRow(['Họ tên:', ungVien.hoTen]);
    worksheet.addRow(['Email:', ungVien.email]);
    worksheet.addRow(['Vị trí ứng tuyển:', tinTuyenDung.tieuDe]);
    worksheet.addRow([]);

    // Kết quả đánh giá
    worksheet.addRow(['KẾT QUẢ ĐÁNH GIÁ']);
    worksheet.mergeCells(`A${worksheet.lastRow.number}:F${worksheet.lastRow.number}`);
    worksheet.getCell(`A${worksheet.lastRow.number}`).style = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'center' }
    };

    // Headers
    const headerRow = worksheet.addRow([
      'Người đánh giá',
      'Thời gian',
      'Tổng điểm',
      'Đề xuất',
      'Điểm mạnh',
      'Điểm yếu'
    ]);

    headerRow.eachCell((cell) => {
      cell.style = this.getHeaderStyle();
    });

    // Data
    danhSachDanhGia.forEach(dg => {
      worksheet.addRow([
        dg.nguoiDanhGiaId.hoTen,
        formatDateTime(dg.thoiGianDanhGia),
        dg.tongDiem,
        this.formatDeXuat(dg.deXuat),
        dg.diemManh || 'N/A',
        dg.diemYeu || 'N/A'
      ]);
    });

    // Tính điểm trung bình
    if (danhSachDanhGia.length > 0) {
      const diemTB = danhSachDanhGia.reduce((sum, dg) => sum + dg.tongDiem, 0) / danhSachDanhGia.length;
      worksheet.addRow([]);
      worksheet.addRow(['ĐIỂM TRUNG BÌNH:', diemTB.toFixed(2)]);
      worksheet.getCell(`A${worksheet.lastRow.number}`).style = {
        font: { bold: true }
      };
    }

    // Auto-fit
    worksheet.columns = [
      { width: 25 },
      { width: 20 },
      { width: 12 },
      { width: 20 },
      { width: 30 },
      { width: 30 }
    ];

    // Lưu file
    const fileName = `ket-qua-phong-van-${ungVien.hoTen.replace(/\s/g, '-')}-${Date.now()}.xlsx`;
    const filePath = path.join(this.outputDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return { fileName, filePath };
  }

  // Helper: Format trạng thái
  formatTrangThai(trangThai) {
    const map = {
      'Moi_nop': 'Mới nộp',
      'Dat_sang_loc': 'Đạt sàng lọc',
      'Khong_dat_sang_loc': 'Không đạt sàng lọc',
      'Cho_phong_van': 'Chờ phỏng vấn',
      'Dang_phong_van': 'Đang phỏng vấn',
      'Hoan_thanh_phong_van': 'Hoàn thành PV',
      'Da_tuyen': 'Đã tuyển',
      'Khong_tuyen': 'Không tuyển',
      'Nhap': 'Nháp',
      'Dang_tuyen': 'Đang tuyển',
      'Da_dong': 'Đã đóng'
    };
    return map[trangThai] || trangThai;
  }

  // Helper: Format đề xuất
  formatDeXuat(deXuat) {
    const map = {
      'Tuyen': 'Tuyển',
      'Khong_tuyen': 'Không tuyển',
      'Can_them_phong_van': 'Cần thêm phỏng vấn',
      'Chua_quyet_dinh': 'Chưa quyết định'
    };
    return map[deXuat] || deXuat;
  }
}

module.exports = new ExcelService();
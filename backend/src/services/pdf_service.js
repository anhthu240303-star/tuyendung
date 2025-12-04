const htmlPdf = require('html-pdf-node');
const fs = require('fs').promises;
const path = require('path');
const { formatDate } = require('../utils/helpers');

class PDFService {
  constructor() {
    this.templateDir = path.join(__dirname, '../../templates/pdf');
    this.outputDir = path.join(__dirname, '../../uploads/offer');
  }

  // Đọc template HTML
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(this.templateDir, `${templateName}.html`);
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Lỗi đọc template ${templateName}:`, error);
      return null;
    }
  }

  // Replace placeholders
  replacePlaceholders(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    return result;
  }

  // Tạo PDF từ HTML
  async generatePDF(html, outputPath) {
    try {
      const options = {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      };

      const file = { content: html };
      const pdfBuffer = await htmlPdf.generatePdf(file, options);

      // Lưu file
      await fs.writeFile(outputPath, pdfBuffer);
      
      console.log('✅ PDF đã tạo:', outputPath);
      return { success: true, path: outputPath };
    } catch (error) {
      console.error('❌ Lỗi tạo PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Tạo Offer Letter PDF
  async taoOfferLetter(offer, ungVien, tinTuyenDung) {
    let template = await this.loadTemplate('offer-letter');
    
    // Nếu không có template, tạo HTML mặc định
    if (!template) {
      template = this.createDefaultOfferTemplate();
    }

    // Chuẩn bị dữ liệu
    const data = {
      maOffer: offer.maOffer,
      ngayHienTai: formatDate(new Date()),
      hoTenUngVien: ungVien.hoTen,
      emailUngVien: ungVien.email,
      soDienThoaiUngVien: ungVien.soDienThoai,
      viTri: offer.viTri,
      phongBan: offer.phongBan || 'N/A',
      mucLuongCoBan: offer.mucLuong.coban.toLocaleString('vi-VN'),
      phuCap: offer.mucLuong.phucap ? offer.mucLuong.phucap.toLocaleString('vi-VN') : '0',
      thuong: offer.mucLuong.thuong || 'Theo chính sách công ty',
      donVi: offer.mucLuong.donVi,
      ngayBatDau: formatDate(offer.ngayBatDau),
      soThangThuViec: offer.thoiGianThuViec.soThang,
      mucLuongThuViec: offer.thoiGianThuViec.mucLuongThuViec,
      diaDiem: offer.diaDiemLamViec,
      hanTraLoi: formatDate(offer.hanTraLoi),
      nguoiLienHe: offer.nguoiLienHe.hoTen,
      chucVuNguoiLienHe: offer.nguoiLienHe.chucVu,
      emailNguoiLienHe: offer.nguoiLienHe.email,
      sdtNguoiLienHe: offer.nguoiLienHe.soDienThoai,
      companyName: 'CÔNG TY ABC',
      companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
      companyPhone: '0123456789',
      companyEmail: 'hr@abc.com',
      // Quyền lợi
      quyenLoi: offer.quyenLoi.map((item, index) => 
        `<li>${item}</li>`
      ).join(''),
      // Điều khoản
      dieuKhoan: offer.dieuKhoan.map((item, index) => 
        `<li>${item}</li>`
      ).join('')
    };

    const html = this.replacePlaceholders(template, data);

    // Tạo tên file unique
    const fileName = `offer-${offer.maOffer}-${Date.now()}.pdf`;
    const outputPath = path.join(this.outputDir, fileName);

    const result = await this.generatePDF(html, outputPath);

    if (result.success) {
      return {
        success: true,
        fileName,
        path: outputPath,
        url: `/uploads/offer/${fileName}`
      };
    }

    return result;
  }

  // Template mặc định cho Offer Letter
  createDefaultOfferTemplate() {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2c3e50;
      margin: 10px 0;
    }
    .company-info {
      text-align: center;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .offer-code {
      text-align: right;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .content {
      margin: 20px 0;
    }
    .greeting {
      margin: 20px 0;
    }
    .section {
      margin: 20px 0;
    }
    .section-title {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .info-table {
      width: 100%;
      margin: 10px 0;
    }
    .info-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    .info-table td:first-child {
      font-weight: bold;
      width: 200px;
    }
    ul {
      margin: 10px 0;
      padding-left: 30px;
    }
    ul li {
      margin: 5px 0;
    }
    .signature {
      margin-top: 50px;
    }
    .signature-box {
      display: inline-block;
      text-align: center;
      margin: 20px 50px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #2c3e50;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{companyName}}</h1>
    <div class="company-info">
      {{companyAddress}}<br>
      ☎ {{companyPhone}} | ✉ {{companyEmail}}
    </div>
  </div>

  <div class="offer-code">
    Số: {{maOffer}}<br>
    Ngày: {{ngayHienTai}}
  </div>

  <h2 style="text-align: center; color: #2c3e50;">THƯ MỜI NHẬN VIỆC</h2>

  <div class="greeting">
    Kính gửi: <strong>{{hoTenUngVien}}</strong><br>
    Email: {{emailUngVien}}<br>
    Số điện thoại: {{soDienThoaiUngVien}}
  </div>

  <div class="content">
    <p>Sau quá trình tuyển dụng và đánh giá, chúng tôi rất vui mừng được mời bạn gia nhập đội ngũ {{companyName}} với thông tin như sau:</p>

    <div class="section">
      <div class="section-title">1. THÔNG TIN VỊ TRÍ CÔNG VIỆC</div>
      <table class="info-table">
        <tr>
          <td>Vị trí:</td>
          <td>{{viTri}}</td>
        </tr>
        <tr>
          <td>Phòng ban:</td>
          <td>{{phongBan}}</td>
        </tr>
        <tr>
          <td>Địa điểm làm việc:</td>
          <td>{{diaDiem}}</td>
        </tr>
        <tr>
          <td>Ngày bắt đầu:</td>
          <td>{{ngayBatDau}}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">2. THÔNG TIN LƯƠNG THƯỞNG</div>
      <table class="info-table">
        <tr>
          <td>Lương cơ bản:</td>
          <td>{{mucLuongCoBan}} {{donVi}}/tháng</td>
        </tr>
        <tr>
          <td>Phụ cấp:</td>
          <td>{{phuCap}} {{donVi}}/tháng</td>
        </tr>
        <tr>
          <td>Thưởng:</td>
          <td>{{thuong}}</td>
        </tr>
        <tr>
          <td>Thời gian thử việc:</td>
          <td>{{soThangThuViec}} tháng ({{mucLuongThuViec}}% lương chính thức)</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">3. QUYỀN LỢI</div>
      <ul>
        {{quyenLoi}}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">4. ĐIỀU KHOẢN</div>
      <ul>
        {{dieuKhoan}}
      </ul>
    </div>

    <div class="section">
      <p><strong>Hạn trả lời:</strong> Vui lòng phản hồi cho chúng tôi trước ngày <strong>{{hanTraLoi}}</strong>.</p>
      <p><strong>Người liên hệ:</strong> {{nguoiLienHe}} ({{chucVuNguoiLienHe}})<br>
      Email: {{emailNguoiLienHe}} | SĐT: {{sdtNguoiLienHe}}</p>
    </div>

    <p>Chúng tôi rất mong nhận được phản hồi tích cực từ bạn và chào đón bạn gia nhập đội ngũ của {{companyName}}!</p>
  </div>

  <div class="signature">
    <div style="float: right;">
      <div class="signature-box">
        <strong>ĐẠI DIỆN CÔNG TY</strong><br>
        <em>(Ký và ghi rõ họ tên)</em>
        <div style="height: 80px;"></div>
        <div>___________________________</div>
      </div>
    </div>
    <div style="clear: both;"></div>
  </div>

  <div class="footer">
    <p>{{companyName}}<br>
    {{companyAddress}}<br>
    ☎ {{companyPhone}} | ✉ {{companyEmail}}</p>
  </div>
</body>
</html>
    `;
  }

  // Tạo báo cáo PDF (có thể mở rộng thêm)
  async taoBaoCaoPDF(htmlContent, fileName) {
    const outputPath = path.join(this.outputDir, fileName);
    return await this.generatePDF(htmlContent, outputPath);
  }
}

module.exports = new PDFService();
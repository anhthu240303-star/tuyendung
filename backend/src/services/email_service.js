const { createTransporter } = require('../config/email');
const fs = require('fs').promises;
const path = require('path');
const { formatDateTime } = require('../utils/helpers');

class EmailService {
  constructor() {
    this.transporter = createTransporter();
    this.templateDir = path.join(__dirname, '../../templates/email');
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

  // Replace placeholders trong template
  replacePlaceholders(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    return result;
  }

  // Gửi email chung
  async sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email đã gửi:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      return { success: false, error: error.message };
    }
  }

  // 1. Email xác nhận nhận hồ sơ
  async guiEmailNhanHoSo(ungVien, tinTuyenDung) {
    const template = await this.loadTemplate('nhan-ho-so');
    
    if (!template) {
      return this.sendEmail({
        to: ungVien.email,
        subject: 'Xác nhận nhận hồ sơ ứng tuyển',
        text: `Xin chào ${ungVien.hoTen},\n\nChúng tôi đã nhận được hồ sơ ứng tuyển của bạn cho vị trí ${tinTuyenDung.tieuDe}.\n\nCảm ơn bạn đã quan tâm!`
      });
    }

    const html = this.replacePlaceholders(template, {
      hoTen: ungVien.hoTen,
      viTri: tinTuyenDung.tieuDe,
      ngayNop: formatDateTime(ungVien.ngayNop),
      companyName: 'Công ty ABC'
    });

    return this.sendEmail({
      to: ungVien.email,
      subject: `Xác nhận nhận hồ sơ ứng tuyển - ${tinTuyenDung.tieuDe}`,
      html
    });
  }

  // 2. Email kết quả sàng lọc - Đạt
  async guiEmailDatSangLoc(ungVien, tinTuyenDung) {
    const template = await this.loadTemplate('ket-qua-sang-loc');
    
    if (!template) {
      return this.sendEmail({
        to: ungVien.email,
        subject: 'Kết quả sàng lọc hồ sơ',
        text: `Xin chào ${ungVien.hoTen},\n\nChúc mừng! Hồ sơ của bạn đã đạt vòng sàng lọc cho vị trí ${tinTuyenDung.tieuDe}.\n\nChúng tôi sẽ liên hệ với bạn sớm để sắp xếp lịch phỏng vấn.`
      });
    }

    const html = this.replacePlaceholders(template, {
      hoTen: ungVien.hoTen,
      viTri: tinTuyenDung.tieuDe,
      ketQua: 'ĐẠT',
      noiDung: 'Chúc mừng! Hồ sơ của bạn đã đạt vòng sàng lọc. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để sắp xếp lịch phỏng vấn.',
      companyName: 'Công ty ABC'
    });

    return this.sendEmail({
      to: ungVien.email,
      subject: `🎉 Chúc mừng - Hồ sơ đạt vòng sàng lọc - ${tinTuyenDung.tieuDe}`,
      html
    });
  }

  // 3. Email kết quả sàng lọc - Không đạt
  async guiEmailKhongDatSangLoc(ungVien, tinTuyenDung, lyDo = '') {
    const template = await this.loadTemplate('ket-qua-sang-loc');
    
    if (!template) {
      return this.sendEmail({
        to: ungVien.email,
        subject: 'Kết quả sàng lọc hồ sơ',
        text: `Xin chào ${ungVien.hoTen},\n\nCảm ơn bạn đã quan tâm đến vị trí ${tinTuyenDung.tieuDe}.\n\nRất tiếc, sau khi xem xét, chúng tôi nhận thấy hồ sơ của bạn chưa phù hợp với yêu cầu công việc.\n\nChúng tôi sẽ lưu giữ hồ sơ của bạn và liên hệ khi có cơ hội phù hợp hơn.`
      });
    }

    const html = this.replacePlaceholders(template, {
      hoTen: ungVien.hoTen,
      viTri: tinTuyenDung.tieuDe,
      ketQua: 'KHÔNG ĐẠT',
      noiDung: `Cảm ơn bạn đã quan tâm đến vị trí ${tinTuyenDung.tieuDe}. Rất tiếc, sau khi xem xét, chúng tôi nhận thấy hồ sơ của bạn chưa phù hợp với yêu cầu công việc hiện tại. ${lyDo ? 'Lý do: ' + lyDo : ''}<br><br>Chúng tôi sẽ lưu giữ hồ sơ của bạn và liên hệ khi có cơ hội phù hợp hơn trong tương lai.`,
      companyName: 'Công ty ABC'
    });

    return this.sendEmail({
      to: ungVien.email,
      subject: `Kết quả xét hồ sơ - ${tinTuyenDung.tieuDe}`,
      html
    });
  }

  // 4. Email mời phỏng vấn
  async guiEmailMoiPhongVan(ungVien, lichPhongVan, tinTuyenDung, hoiDong) {
    const template = await this.loadTemplate('lich-phong-van');
    
    const linkXacNhan = `${process.env.BASE_URL}/api/lich-phong-van/xac-nhan/${lichPhongVan.tokenXacNhan}?action=accept`;
    const linkTuChoi = `${process.env.BASE_URL}/api/lich-phong-van/xac-nhan/${lichPhongVan.tokenXacNhan}?action=reject`;

    if (!template) {
      return this.sendEmail({
        to: ungVien.email,
        subject: 'Lịch phỏng vấn',
        text: `Xin chào ${ungVien.hoTen},\n\nBạn được mời tham gia phỏng vấn cho vị trí ${tinTuyenDung.tieuDe}.\n\nThời gian: ${formatDateTime(lichPhongVan.thoiGianBatDau)}\nHình thức: ${lichPhongVan.hinhThuc}\n\nVui lòng xác nhận tham gia.`
      });
    }

    const html = this.replacePlaceholders(template, {
      hoTen: ungVien.hoTen,
      viTri: tinTuyenDung.tieuDe,
      thoiGian: formatDateTime(lichPhongVan.thoiGianBatDau),
      diaDiem: lichPhongVan.diaDiem || 'N/A',
      linkOnline: lichPhongVan.linkOnline || 'N/A',
      hinhThuc: lichPhongVan.hinhThuc,
      noiDung: lichPhongVan.noiDung || 'Phỏng vấn vòng 1',
      linkXacNhan,
      linkTuChoi,
      companyName: 'Công ty ABC'
    });

    return this.sendEmail({
      to: ungVien.email,
      subject: `📅 Lịch phỏng vấn - ${tinTuyenDung.tieuDe}`,
      html
    });
  }

  // 5. Email thông báo cho hội đồng phỏng vấn
  async guiEmailChoHoiDong(thanhVien, lichPhongVan, ungVien, tinTuyenDung) {
    return this.sendEmail({
      to: thanhVien.email,
      subject: `Thông báo lịch phỏng vấn - ${tinTuyenDung.tieuDe}`,
      html: `
        <h2>Thông báo lịch phỏng vấn</h2>
        <p>Xin chào ${thanhVien.hoTen},</p>
        <p>Bạn được phân công tham gia phỏng vấn ứng viên:</p>
        <ul>
          <li><strong>Ứng viên:</strong> ${ungVien.hoTen}</li>
          <li><strong>Vị trí:</strong> ${tinTuyenDung.tieuDe}</li>
          <li><strong>Thời gian:</strong> ${formatDateTime(lichPhongVan.thoiGianBatDau)}</li>
          <li><strong>Hình thức:</strong> ${lichPhongVan.hinhThuc}</li>
          ${lichPhongVan.diaDiem ? `<li><strong>Địa điểm:</strong> ${lichPhongVan.diaDiem}</li>` : ''}
          ${lichPhongVan.linkOnline ? `<li><strong>Link:</strong> ${lichPhongVan.linkOnline}</li>` : ''}
        </ul>
        <p>Vui lòng sắp xếp thời gian và chuẩn bị nội dung phỏng vấn.</p>
      `
    });
  }

  // 6. Email gửi thư mời nhận việc (Offer)
  async guiEmailOffer(ungVien, offer, tinTuyenDung, pdfPath) {
    const template = await this.loadTemplate('thu-moi-nhan-viec');
    
    const attachments = pdfPath ? [{
      filename: offer.pdfFileName,
      path: pdfPath
    }] : [];

    if (!template) {
      return this.sendEmail({
        to: ungVien.email,
        subject: 'Thư mời nhận việc',
        text: `Xin chào ${ungVien.hoTen},\n\nChúc mừng! Chúng tôi xin gửi đến bạn thư mời nhận việc cho vị trí ${offer.viTri}.\n\nVui lòng xem chi tiết trong file đính kèm.`,
        attachments
      });
    }

    const html = this.replacePlaceholders(template, {
      hoTen: ungVien.hoTen,
      viTri: offer.viTri,
      mucLuong: offer.mucLuong.coban.toLocaleString('vi-VN') + ' VND',
      ngayBatDau: formatDateTime(offer.ngayBatDau),
      hanTraLoi: formatDateTime(offer.hanTraLoi),
      companyName: 'Công ty ABC',
      maOffer: offer.maOffer
    });

    return this.sendEmail({
      to: ungVien.email,
      subject: `🎉 Thư mời nhận việc - ${offer.viTri}`,
      html,
      attachments
    });
  }

  // 7. Email nhắc nhở phỏng vấn (trước 1 ngày)
  async guiEmailNhacNhoPhongVan(ungVien, lichPhongVan, tinTuyenDung) {
    return this.sendEmail({
      to: ungVien.email,
      subject: `⏰ Nhắc nhở: Lịch phỏng vấn ngày mai`,
      html: `
        <h2>Nhắc nhở lịch phỏng vấn</h2>
        <p>Xin chào ${ungVien.hoTen},</p>
        <p>Đây là email nhắc nhở về buổi phỏng vấn của bạn:</p>
        <ul>
          <li><strong>Vị trí:</strong> ${tinTuyenDung.tieuDe}</li>
          <li><strong>Thời gian:</strong> ${formatDateTime(lichPhongVan.thoiGianBatDau)}</li>
          <li><strong>Hình thức:</strong> ${lichPhongVan.hinhThuc}</li>
          ${lichPhongVan.diaDiem ? `<li><strong>Địa điểm:</strong> ${lichPhongVan.diaDiem}</li>` : ''}
          ${lichPhongVan.linkOnline ? `<li><strong>Link:</strong> ${lichPhongVan.linkOnline}</li>` : ''}
        </ul>
        <p>Chúc bạn thành công!</p>
      `
    });
  }

  // 8. Email thông báo kết quả cuối cùng - Trúng tuyển
  async guiEmailTrungTuyen(ungVien, tinTuyenDung, ketQua) {
    return this.sendEmail({
      to: ungVien.email,
      subject: `🎊 Chúc mừng - Kết quả tuyển dụng`,
      html: `
        <h2>Chúc mừng bạn đã trúng tuyển!</h2>
        <p>Xin chào ${ungVien.hoTen},</p>
        <p>Chúng tôi rất vui thông báo rằng bạn đã <strong>TRÚNG TUYỂN</strong> vào vị trí <strong>${tinTuyenDung.tieuDe}</strong>.</p>
        ${ketQua.danhGiaChung ? `<p><strong>Đánh giá:</strong> ${ketQua.danhGiaChung}</p>` : ''}
        <p>Chúng tôi sẽ gửi thư mời nhận việc chi tiết trong thời gian sớm nhất.</p>
        <p>Chúc mừng và chào đón bạn gia nhập đội ngũ của chúng tôi!</p>
      `
    });
  }

  // 9. Email thông báo kết quả cuối cùng - Không trúng tuyển
  async guiEmailKhongTrungTuyen(ungVien, tinTuyenDung, ketQua) {
    return this.sendEmail({
      to: ungVien.email,
      subject: `Kết quả tuyển dụng - ${tinTuyenDung.tieuDe}`,
      html: `
        <h2>Kết quả tuyển dụng</h2>
        <p>Xin chào ${ungVien.hoTen},</p>
        <p>Cảm ơn bạn đã tham gia phỏng vấn cho vị trí <strong>${tinTuyenDung.tieuDe}</strong>.</p>
        <p>Sau khi cân nhắc kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng lần này chúng tôi đã lựa chọn ứng viên khác phù hợp hơn với yêu cầu công việc.</p>
        ${ketQua.lyDo ? `<p><strong>Lý do:</strong> ${ketQua.lyDo}</p>` : ''}
        <p>Chúng tôi đánh giá cao nỗ lực của bạn và hy vọng sẽ có cơ hội hợp tác trong tương lai.</p>
        <p>Chúc bạn thành công!</p>
      `
    });
  }
}

module.exports = new EmailService();
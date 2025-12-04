const express = require('express');
const router = express.Router();
const {
  taoMoi,
  layTheoUngVien,
  layTheoLich,
  layChiTiet,
  capNhat,
  xoa,
  tongHopDiem,
  exportExcel
} = require('../controllers/danhGia_controller');
const { xacThuc, adminVaHR, tatCaNhanVien } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Tất cả routes cần đăng nhập
router.use(xacThuc);

router.post('/', tatCaNhanVien, taoMoi);

router.get('/ung-vien/:ungVienId', kiemTraObjectId('ungVienId'), adminVaHR, layTheoUngVien);
router.get('/lich/:lichPhongVanId', kiemTraObjectId('lichPhongVanId'), tatCaNhanVien, layTheoLich);
router.get('/tong-hop/:ungVienId', kiemTraObjectId('ungVienId'), adminVaHR, tongHopDiem);
router.get('/export/:ungVienId', kiemTraObjectId('ungVienId'), adminVaHR, exportExcel);

router.route('/:id')
  .get(kiemTraObjectId('id'), tatCaNhanVien, layChiTiet)
  .put(kiemTraObjectId('id'), tatCaNhanVien, capNhat)
  .delete(kiemTraObjectId('id'), xoa);

module.exports = router;
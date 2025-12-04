const express = require('express');
const router = express.Router();
const {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  xoa,
  doiTrangThai,
  layThongKe
} = require('../controllers/tinTuyenDung_controller');
const { xacThuc, adminVaHR, xacThucTuyChon } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Public routes (có thể xem tin tuyển dụng mà không cần đăng nhập)
router.get('/', xacThucTuyChon, layDanhSach);
router.get('/:id', kiemTraObjectId('id'), xacThucTuyChon, layChiTiet);

// Protected routes - chỉ Admin & HR
router.post('/', xacThuc, adminVaHR, taoMoi);
router.put('/:id', kiemTraObjectId('id'), xacThuc, adminVaHR, capNhat);
router.delete('/:id', kiemTraObjectId('id'), xacThuc, adminVaHR, xoa);
router.put('/:id/trang-thai', kiemTraObjectId('id'), xacThuc, adminVaHR, doiTrangThai);
router.get('/:id/thong-ke', kiemTraObjectId('id'), xacThuc, adminVaHR, layThongKe);

module.exports = router;
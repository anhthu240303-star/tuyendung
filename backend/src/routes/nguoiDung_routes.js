const express = require('express');
const router = express.Router();
const {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  xoa,
  doiTrangThai,
  resetMatKhau
} = require('../controllers/nguoiDung_controller');
const { xacThuc, chiAdmin } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Tất cả routes cần đăng nhập và chỉ Admin
router.use(xacThuc, chiAdmin);

router.route('/')
  .get(layDanhSach)
  .post(taoMoi);

router.route('/:id')
  .get(kiemTraObjectId('id'), layChiTiet)
  .put(kiemTraObjectId('id'), capNhat)
  .delete(kiemTraObjectId('id'), xoa);

router.put('/:id/trang-thai', kiemTraObjectId('id'), doiTrangThai);
router.put('/:id/reset-password', kiemTraObjectId('id'), resetMatKhau);

module.exports = router;
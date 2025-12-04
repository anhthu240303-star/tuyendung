const express = require('express');
const router = express.Router();
const {
  taoMoi,
  layDanhSach,
  layChiTiet,
  capNhat,
  xoa,
  themThanhVien,
  xoaThanhVien,
  capNhatVaiTro
} = require('../controllers/hoiDong_controller');
const { xacThuc, adminVaHR } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Tất cả routes cần đăng nhập
router.use(xacThuc);

router.route('/')
  .get(layDanhSach)
  .post(adminVaHR, taoMoi);

router.route('/:id')
  .get(kiemTraObjectId('id'), layChiTiet)
  .put(kiemTraObjectId('id'), adminVaHR, capNhat)
  .delete(kiemTraObjectId('id'), adminVaHR, xoa);

// Quản lý thành viên
router.post('/:id/thanh-vien', kiemTraObjectId('id'), adminVaHR, themThanhVien);
router.delete('/:id/thanh-vien/:nguoiDungId', kiemTraObjectId('id'), adminVaHR, xoaThanhVien);
router.put('/:id/thanh-vien/:nguoiDungId', kiemTraObjectId('id'), adminVaHR, capNhatVaiTro);

module.exports = router;
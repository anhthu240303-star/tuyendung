const express = require('express');
const router = express.Router();
const {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  xoa,
  datMacDinh,
  saoChep
} = require('../controllers/quyTrinh_controller');
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

router.put('/:id/mac-dinh', kiemTraObjectId('id'), adminVaHR, datMacDinh);
router.post('/:id/sao-chep', kiemTraObjectId('id'), adminVaHR, saoChep);

module.exports = router;
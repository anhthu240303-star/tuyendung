const express = require('express');
const router = express.Router();
const {
  sangLocThuCong,
  goiYSangLoc,
  sangLocHangLoat,
  layDanhSachCanSangLoc,
  thongKeSangLoc
} = require('../controllers/sangLoc_controller');
const { xacThuc, adminVaHR } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Tất cả routes cần đăng nhập và chỉ Admin & HR
router.use(xacThuc, adminVaHR);

router.put('/manual/:id', kiemTraObjectId('id'), sangLocThuCong);
router.get('/goi-y/:id', kiemTraObjectId('id'), goiYSangLoc);
router.post('/hang-loat', sangLocHangLoat);
router.get('/can-sang-loc', layDanhSachCanSangLoc);
router.get('/thong-ke', thongKeSangLoc);

module.exports = router;
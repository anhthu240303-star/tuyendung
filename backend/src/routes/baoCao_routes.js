const express = require('express');
const router = express.Router();
const {
  dashboard,
  baoCaoTheoTin,
  baoCaoTheoNguon,
  baoCaoTheoThoiGian,
  exportExcel
} = require('../controllers/baoCao_controller');
const { xacThuc, adminVaHR } = require('../middlewares/auth_middleware');

// Tất cả routes cần đăng nhập và chỉ Admin & HR
router.use(xacThuc, adminVaHR);

router.get('/dashboard', dashboard);
router.get('/theo-tin', baoCaoTheoTin);
router.get('/theo-nguon', baoCaoTheoNguon);
router.get('/theo-thoi-gian', baoCaoTheoThoiGian);
router.get('/export', exportExcel);

module.exports = router;
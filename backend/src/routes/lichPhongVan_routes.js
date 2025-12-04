const express = require('express');
const router = express.Router();
const {
  taoLich,
  layDanhSach,
  layChiTiet,
  capNhat,
  xacNhanLich,
  huyLich,
  hoanThanh
} = require('../controllers/lichPhongVan_controller');
const { xacThuc, adminVaHR } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Public route - xác nhận lịch qua email
router.get('/xac-nhan/:token', xacNhanLich);

// Protected routes
router.use(xacThuc);

router.route('/')
  .get(layDanhSach)
  .post(adminVaHR, taoLich);

router.route('/:id')
  .get(kiemTraObjectId('id'), layChiTiet)
  .put(kiemTraObjectId('id'), adminVaHR, capNhat);

router.put('/:id/huy', kiemTraObjectId('id'), adminVaHR, huyLich);
router.put('/:id/hoan-thanh', kiemTraObjectId('id'), adminVaHR, hoanThanh);

module.exports = router;
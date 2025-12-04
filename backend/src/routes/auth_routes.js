const express = require('express');
const router = express.Router();
const {
  dangKy,
  dangNhap,
  layThongTinCaNhan,
  doiMatKhau,
  capNhatThongTin,
  quenMatKhau
} = require('../controllers/auth_controller');
const { xacThuc } = require('../middlewares/auth_middleware');

// Public routes
router.post('/register', dangKy);
router.post('/login', dangNhap);
router.post('/forgot-password', quenMatKhau);

// Protected routes
router.get('/me', xacThuc, layThongTinCaNhan);
router.put('/change-password', xacThuc, doiMatKhau);
router.put('/update-profile', xacThuc, capNhatThongTin);

module.exports = router;
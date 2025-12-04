const express = require('express');
const router = express.Router();
const {
  ungTuyen,
  layDanhSach,
  layChiTiet,
  capNhat,
  xoa,
  doiTrangThai,
  downloadCV
} = require('../controllers/ungVien_controller');
const { xacThuc, adminVaHR, tatCaNhanVien } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');
const { uploadCV, xuLyLoiUpload } = require('../middlewares/upload_middleware');

// Public route - ứng tuyển
router.post('/apply', uploadCV.single('cv'), xuLyLoiUpload, ungTuyen);

// Protected routes
router.use(xacThuc);

router.get('/', adminVaHR, layDanhSach);
router.get('/:id', kiemTraObjectId('id'), tatCaNhanVien, layChiTiet);
router.put('/:id', kiemTraObjectId('id'), adminVaHR, capNhat);
router.delete('/:id', kiemTraObjectId('id'), adminVaHR, xoa);
router.put('/:id/trang-thai', kiemTraObjectId('id'), adminVaHR, doiTrangThai);
router.get('/:id/download-cv', kiemTraObjectId('id'), tatCaNhanVien, downloadCV);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  taoMoi,
  guiOffer,
  layDanhSach,
  layChiTiet,
  capNhat,
  huyOffer,
  traLoiOffer,
  downloadPDF
} = require('../controllers/offer_controller');
const { xacThuc, adminVaHR } = require('../middlewares/auth_middleware');
const { kiemTraObjectId } = require('../middlewares/validation_middleware');

// Public route - ứng viên trả lời offer
router.post('/:maOffer/tra-loi', traLoiOffer);

// Protected routes
router.use(xacThuc, adminVaHR);

router.route('/')
  .get(layDanhSach)
  .post(taoMoi);

router.route('/:id')
  .get(kiemTraObjectId('id'), layChiTiet)
  .put(kiemTraObjectId('id'), capNhat);

router.post('/:id/gui', kiemTraObjectId('id'), guiOffer);
router.put('/:id/huy', kiemTraObjectId('id'), huyOffer);
router.get('/:id/download', kiemTraObjectId('id'), downloadPDF);

module.exports = router;
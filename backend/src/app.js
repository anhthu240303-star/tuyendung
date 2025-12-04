const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Import middlewares
const { errorHandler } = require('./middlewares/errorHandler_middleware');

// Import routes
const authRoutes = require('./routes/auth_routes');
const nguoiDungRoutes = require('./routes/nguoiDung_routes');
const quyTrinhRoutes = require('./routes/quyTrinh_routes');
const tinTuyenDungRoutes = require('./routes/tinTuyenDung_routes');
const ungVienRoutes = require('./routes/ungVien_routes');
const sangLocRoutes = require('./routes/sangLoc_routes');
const lichPhongVanRoutes = require('./routes/lichPhongVan_routes');
const hoiDongRoutes = require('./routes/hoiDong_routes');
const danhGiaRoutes = require('./routes/danhGia_routes');
const offerRoutes = require('./routes/offer_routes');
const baoCaoRoutes = require('./routes/baoCao_routes');

// Middlewares cơ bản
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server đang hoạt động bình thường',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nguoi-dung', nguoiDungRoutes);
app.use('/api/quy-trinh', quyTrinhRoutes);
app.use('/api/tin-tuyen-dung', tinTuyenDungRoutes);
app.use('/api/ung-vien', ungVienRoutes);
app.use('/api/sang-loc', sangLocRoutes);
app.use('/api/lich-phong-van', lichPhongVanRoutes);
app.use('/api/hoi-dong', hoiDongRoutes);
app.use('/api/danh-gia', danhGiaRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/bao-cao', baoCaoRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.originalUrl}`
  });
});

// Error Handler (phải đặt cuối cùng)
app.use(errorHandler);

module.exports = app;
class AppRoutes {
  // Auth Routes
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  
  // Main Routes
  static const String home = '/home';
  static const String dashboard = '/dashboard';
  
  // Tin tuyển dụng Routes
  static const String tinTuyenDung = '/tin-tuyen-dung';
  static const String tinTuyenDungDetail = '/tin-tuyen-dung/:id';
  static const String tinTuyenDungCreate = '/tin-tuyen-dung/create';
  static const String tinTuyenDungEdit = '/tin-tuyen-dung/:id/edit';
  
  // Ứng viên Routes
  static const String ungVien = '/ung-vien';
  static const String ungVienDetail = '/ung-vien/:id';
  static const String ungVienApply = '/ung-tuyen/:jobId';
  
  // Sàng lọc Routes
  static const String sangLoc = '/sang-loc';
  static const String sangLocDetail = '/sang-loc/:id';
  
  // Lịch phỏng vấn Routes
  static const String lichPhongVan = '/lich-phong-van';
  static const String lichPhongVanDetail = '/lich-phong-van/:id';
  static const String lichPhongVanCreate = '/lich-phong-van/create';
  
  // Hội đồng Routes
  static const String hoiDong = '/hoi-dong';
  static const String hoiDongDetail = '/hoi-dong/:id';
  static const String hoiDongCreate = '/hoi-dong/create';
  
  // Đánh giá Routes
  static const String danhGia = '/danh-gia';
  static const String danhGiaCreate = '/danh-gia/create';
  static const String danhGiaDetail = '/danh-gia/:id';
  
  // Offer Routes
  static const String offer = '/offer';
  static const String offerDetail = '/offer/:id';
  static const String offerCreate = '/offer/create';
  
  // Báo cáo Routes
  static const String baoCao = '/bao-cao';
  
  // Profile Routes
  static const String profile = '/profile';
  static const String changePassword = '/change-password';
  
  // Quy trình Routes
  static const String quyTrinh = '/quy-trinh';
  static const String quyTrinhDetail = '/quy-trinh/:id';
  static const String quyTrinhCreate = '/quy-trinh/create';
  
  // Người dùng Routes (Admin only)
  static const String nguoiDung = '/nguoi-dung';
  static const String nguoiDungDetail = '/nguoi-dung/:id';
  static const String nguoiDungCreate = '/nguoi-dung/create';
}
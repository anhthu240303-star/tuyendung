class ApiConstants {
  // Base URL - Thay đổi theo môi trường
  static const String baseUrl = 'http://localhost:5000/api';
  
  // Timeout
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/change-password';
  static const String updateProfile = '/auth/update-profile';
  
  // Người dùng Endpoints
  static const String nguoiDung = '/nguoi-dung';
  static String nguoiDungDetail(String id) => '/nguoi-dung/$id';
  static String nguoiDungTrangThai(String id) => '/nguoi-dung/$id/trang-thai';
  
  // Quy trình Endpoints
  static const String quyTrinh = '/quy-trinh';
  static String quyTrinhDetail(String id) => '/quy-trinh/$id';
  static String quyTrinhMacDinh(String id) => '/quy-trinh/$id/mac-dinh';
  static String quyTrinhSaoChep(String id) => '/quy-trinh/$id/sao-chep';
  
  // Tin tuyển dụng Endpoints
  static const String tinTuyenDung = '/tin-tuyen-dung';
  static String tinTuyenDungDetail(String id) => '/tin-tuyen-dung/$id';
  static String tinTuyenDungTrangThai(String id) => '/tin-tuyen-dung/$id/trang-thai';
  static String tinTuyenDungThongKe(String id) => '/tin-tuyen-dung/$id/thong-ke';
  
  // Ứng viên Endpoints
  static const String ungVien = '/ung-vien';
  static const String ungVienApply = '/ung-vien/apply';
  static String ungVienDetail(String id) => '/ung-vien/$id';
  static String ungVienTrangThai(String id) => '/ung-vien/$id/trang-thai';
  static String ungVienDownloadCV(String id) => '/ung-vien/$id/download-cv';
  
  // Sàng lọc Endpoints
  static String sangLocManual(String id) => '/sang-loc/manual/$id';
  static String sangLocGoiY(String id) => '/sang-loc/goi-y/$id';
  static const String sangLocHangLoat = '/sang-loc/hang-loat';
  static const String sangLocCanSangLoc = '/sang-loc/can-sang-loc';
  static const String sangLocThongKe = '/sang-loc/thong-ke';
  
  // Lịch phỏng vấn Endpoints
  static const String lichPhongVan = '/lich-phong-van';
  static String lichPhongVanDetail(String id) => '/lich-phong-van/$id';
  static String lichPhongVanXacNhan(String token) => '/lich-phong-van/xac-nhan/$token';
  static String lichPhongVanHuy(String id) => '/lich-phong-van/$id/huy';
  static String lichPhongVanHoanThanh(String id) => '/lich-phong-van/$id/hoan-thanh';
  
  // Hội đồng Endpoints
  static const String hoiDong = '/hoi-dong';
  static String hoiDongDetail(String id) => '/hoi-dong/$id';
  static String hoiDongThanhVien(String id) => '/hoi-dong/$id/thanh-vien';
  
  // Đánh giá Endpoints
  static const String danhGia = '/danh-gia';
  static String danhGiaDetail(String id) => '/danh-gia/$id';
  static String danhGiaUngVien(String id) => '/danh-gia/ung-vien/$id';
  static String danhGiaLich(String id) => '/danh-gia/lich/$id';
  static String danhGiaTongHop(String id) => '/danh-gia/tong-hop/$id';
  static String danhGiaExport(String id) => '/danh-gia/export/$id';
  
  // Offer Endpoints
  static const String offer = '/offer';
  static String offerDetail(String id) => '/offer/$id';
  static String offerGui(String id) => '/offer/$id/gui';
  static String offerHuy(String id) => '/offer/$id/huy';
  static String offerDownload(String id) => '/offer/$id/download';
  static String offerTraLoi(String maOffer) => '/offer/$maOffer/tra-loi';
  
  // Báo cáo Endpoints
  static const String baoCaoDashboard = '/bao-cao/dashboard';
  static const String baoCaoTheoTin = '/bao-cao/theo-tin';
  static const String baoCaoTheoNguon = '/bao-cao/theo-nguon';
  static const String baoCaoTheoThoiGian = '/bao-cao/theo-thoi-gian';
  static const String baoCaoExport = '/bao-cao/export';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  
  // Pagination
  static const int defaultPageSize = 20;
}
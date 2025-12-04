// lib/core/services/danh_gia_service.dart
import '../../config/constants/api_constants.dart';
import '../models/danh_gia_phong_van.dart';
import 'api_service.dart';

class DanhGiaService {
  final ApiService _api = ApiService();

  Future<DanhGiaPhongVan> taoMoi({
    required String lichPhongVanId,
    required String ungVienId,
    required List<Map<String, dynamic>> cacTieuChi,
    String? nhanXet,
    String? diemManh,
    String? diemYeu,
    required String deXuat,
  }) async {
    final response = await _api.post(ApiConstants.danhGia, data: {
      'lichPhongVanId': lichPhongVanId,
      'ungVienId': ungVienId,
      'cacTieuChi': cacTieuChi,
      'nhanXet': nhanXet,
      'diemManh': diemManh,
      'diemYeu': diemYeu,
      'deXuat': deXuat,
    });
    
    if (response.data['success'] == true) {
      return DanhGiaPhongVan.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<List<DanhGiaPhongVan>> layTheoUngVien(String ungVienId) async {
    final response = await _api.get(ApiConstants.danhGiaUngVien(ungVienId));
    if (response.data['success'] == true) {
      final data = response.data['data']['danhGia'] as List;
      return data.map((json) => DanhGiaPhongVan.fromJson(json)).toList();
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<Map<String, dynamic>> tongHopDiem(String ungVienId) async {
    final response = await _api.get(ApiConstants.danhGiaTongHop(ungVienId));
    if (response.data['success'] == true) {
      return response.data['data'];
    }
    throw response.data['message'] ?? 'Lỗi';
  }
}


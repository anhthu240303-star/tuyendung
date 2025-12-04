// lib/core/services/hoi_dong_service.dart
import '../../config/constants/api_constants.dart';
import '../models/hoi_dong_phong_van.dart';
import 'api_service.dart';

class HoiDongService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getDanhSach({int page = 1, int limit = 20}) async {
    final response = await _api.get(ApiConstants.hoiDong, 
      queryParameters: {'page': page.toString(), 'limit': limit.toString()});
    
    if (response.data['success'] == true) {
      final data = response.data['data'] as List;
      return {
        'data': data.map((json) => HoiDongPhongVan.fromJson(json)).toList(),
        'pagination': response.data['pagination'],
      };
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<HoiDongPhongVan> getChiTiet(String id) async {
    final response = await _api.get(ApiConstants.hoiDongDetail(id));
    if (response.data['success'] == true) {
      return HoiDongPhongVan.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<HoiDongPhongVan> taoMoi({
    required String ten,
    String? moTa,
    required List<Map<String, dynamic>> thanhVien,
  }) async {
    final response = await _api.post(ApiConstants.hoiDong, 
      data: {'ten': ten, 'moTa': moTa, 'thanhVien': thanhVien});
    
    if (response.data['success'] == true) {
      return HoiDongPhongVan.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }
}


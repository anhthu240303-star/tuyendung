// lib/core/services/bao_cao_service.dart
import '../../config/constants/api_constants.dart';
import '../models/dashboard.dart';
import 'api_service.dart';

class BaoCaoService {
  final ApiService _api = ApiService();

  Future<DashboardData> getDashboard({DateTime? tuNgay, DateTime? denNgay}) async {
    final queryParams = <String, String>{};
    if (tuNgay != null) queryParams['tuNgay'] = tuNgay.toIso8601String();
    if (denNgay != null) queryParams['denNgay'] = denNgay.toIso8601String();

    final response = await _api.get(ApiConstants.baoCaoDashboard, 
      queryParameters: queryParams);
    
    if (response.data['success'] == true) {
      return DashboardData.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<List<Map<String, dynamic>>> getBaoCaoTheoTin() async {
    final response = await _api.get(ApiConstants.baoCaoTheoTin);
    if (response.data['success'] == true) {
      return List<Map<String, dynamic>>.from(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<Map<String, dynamic>> getBaoCaoTheoNguon() async {
    final response = await _api.get(ApiConstants.baoCaoTheoNguon);
    if (response.data['success'] == true) {
      return response.data['data'];
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<String> exportExcel(String loai) async {
    // Implementation for downloading Excel file
    final savePath = '/path/to/save/excel';
    await _api.downloadFile(
      '${ApiConstants.baoCaoExport}?loai=$loai',
      savePath,
    );
    return savePath;
  }
}
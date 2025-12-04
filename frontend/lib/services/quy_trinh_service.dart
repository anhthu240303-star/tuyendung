import '../../config/constants/api_constants.dart';
import '../models/quy_trinh_tuyen_dung.dart';
import 'api_service.dart';

class QuyTrinhService {
  final ApiService _api = ApiService();

  // Get list
  Future<Map<String, dynamic>> getDanhSach({
    int page = 1,
    int limit = 20,
    String? trangThai,
    String? timKiem,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (trangThai != null) 'trangThai': trangThai,
        if (timKiem != null) 'timKiem': timKiem,
      };

      final response = await _api.get(
        ApiConstants.quyTrinh,
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final data = response.data['data'] as List;
        final list = data.map((json) => QuyTrinhTuyenDung.fromJson(json)).toList();
        
        return {
          'data': list,
          'pagination': response.data['pagination'],
        };
      } else {
        throw response.data['message'] ?? 'Không lấy được danh sách';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Get detail
  Future<QuyTrinhTuyenDung> getChiTiet(String id) async {
    try {
      final response = await _api.get(
        ApiConstants.quyTrinhDetail(id),
      );

      if (response.data['success'] == true) {
        return QuyTrinhTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Không lấy được chi tiết';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Create
  Future<QuyTrinhTuyenDung> taoMoi({
    required String ten,
    String? moTa,
    required List<Map<String, dynamic>> cacBuoc,
    bool macDinh = false,
  }) async {
    try {
      final response = await _api.post(
        ApiConstants.quyTrinh,
        data: {
          'ten': ten,
          'moTa': moTa,
          'cacBuoc': cacBuoc,
          'macDinh': macDinh,
        },
      );

      if (response.data['success'] == true) {
        return QuyTrinhTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Tạo quy trình thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Update
  Future<QuyTrinhTuyenDung> capNhat(String id, Map<String, dynamic> data) async {
    try {
      final response = await _api.put(
        ApiConstants.quyTrinhDetail(id),
        data: data,
      );

      if (response.data['success'] == true) {
        return QuyTrinhTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Cập nhật thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Delete
  Future<bool> xoa(String id) async {
    try {
      final response = await _api.delete(
        ApiConstants.quyTrinhDetail(id),
      );

      return response.data['success'] == true;
    } catch (e) {
      throw e.toString();
    }
  }

  // Set as default
  Future<QuyTrinhTuyenDung> datMacDinh(String id) async {
    try {
      final response = await _api.put(
        ApiConstants.quyTrinhMacDinh(id),
      );

      if (response.data['success'] == true) {
        return QuyTrinhTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Đặt mặc định thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Copy
  Future<QuyTrinhTuyenDung> saoChep(String id) async {
    try {
      final response = await _api.post(
        ApiConstants.quyTrinhSaoChep(id),
      );

      if (response.data['success'] == true) {
        return QuyTrinhTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Sao chép thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }
}
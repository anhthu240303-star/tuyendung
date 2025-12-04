import '../../config/constants/api_constants.dart';
import '../models/lich_phong_van.dart';
import 'api_service.dart';

class LichPhongVanService {
  final ApiService _api = ApiService();

  // Get list
  Future<Map<String, dynamic>> getDanhSach({
    int page = 1,
    int limit = 20,
    String? ungVienId,
    String? hoiDongId,
    String? trangThai,
    DateTime? tuNgay,
    DateTime? denNgay,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (ungVienId != null) 'ungVienId': ungVienId,
        if (hoiDongId != null) 'hoiDongId': hoiDongId,
        if (trangThai != null) 'trangThai': trangThai,
        if (tuNgay != null) 'tuNgay': tuNgay.toIso8601String(),
        if (denNgay != null) 'denNgay': denNgay.toIso8601String(),
      };

      final response = await _api.get(
        ApiConstants.lichPhongVan,
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final data = response.data['data'] as List;
        final list = data.map((json) => LichPhongVan.fromJson(json)).toList();
        
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
  Future<LichPhongVan> getChiTiet(String id) async {
    try {
      final response = await _api.get(
        ApiConstants.lichPhongVanDetail(id),
      );

      if (response.data['success'] == true) {
        return LichPhongVan.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Không lấy được chi tiết';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Create
  Future<LichPhongVan> taoLich({
    required String ungVienId,
    required String jobId,
    required String hoiDongId,
    required DateTime thoiGianBatDau,
    required DateTime thoiGianKetThuc,
    String? diaDiem,
    String? linkOnline,
    required String hinhThuc,
    String? noiDung,
    String? ghiChu,
  }) async {
    try {
      final response = await _api.post(
        ApiConstants.lichPhongVan,
        data: {
          'ungVienId': ungVienId,
          'jobId': jobId,
          'hoiDongId': hoiDongId,
          'thoiGianBatDau': thoiGianBatDau.toIso8601String(),
          'thoiGianKetThuc': thoiGianKetThuc.toIso8601String(),
          'diaDiem': diaDiem,
          'linkOnline': linkOnline,
          'hinhThuc': hinhThuc,
          'noiDung': noiDung,
          'ghiChu': ghiChu,
        },
      );

      if (response.data['success'] == true) {
        return LichPhongVan.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Tạo lịch thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Update
  Future<LichPhongVan> capNhat(String id, Map<String, dynamic> data) async {
    try {
      final response = await _api.put(
        ApiConstants.lichPhongVanDetail(id),
        data: data,
      );

      if (response.data['success'] == true) {
        return LichPhongVan.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Cập nhật thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Cancel
  Future<LichPhongVan> huyLich(String id, String lyDo) async {
    try {
      final response = await _api.put(
        ApiConstants.lichPhongVanHuy(id),
        data: {'lyDo': lyDo},
      );

      if (response.data['success'] == true) {
        return LichPhongVan.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Hủy lịch thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Mark as completed
  Future<LichPhongVan> hoanThanh(String id) async {
    try {
      final response = await _api.put(
        ApiConstants.lichPhongVanHoanThanh(id),
      );

      if (response.data['success'] == true) {
        return LichPhongVan.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Đánh dấu hoàn thành thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }
}
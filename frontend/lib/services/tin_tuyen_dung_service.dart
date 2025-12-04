import '../../config/constants/api_constants.dart';
import '../models/tin_tuyen_dung.dart';
import 'api_service.dart';

class TinTuyenDungService {
  final ApiService _api = ApiService();

  // Get list
  Future<Map<String, dynamic>> getDanhSach({
    int page = 1,
    int limit = 20,
    String? trangThai,
    String? timKiem,
    String? capBac,
    String? hinhThucLamViec,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (trangThai != null) 'trangThai': trangThai,
        if (timKiem != null) 'timKiem': timKiem,
        if (capBac != null) 'capBac': capBac,
        if (hinhThucLamViec != null) 'hinhThucLamViec': hinhThucLamViec,
      };

      final response = await _api.get(
        ApiConstants.tinTuyenDung,
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final data = response.data['data'] as List;
        final tinList = data.map((json) => TinTuyenDung.fromJson(json)).toList();
        
        return {
          'data': tinList,
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
  Future<TinTuyenDung> getChiTiet(String id) async {
    try {
      final response = await _api.get(
        ApiConstants.tinTuyenDungDetail(id),
      );

      if (response.data['success'] == true) {
        return TinTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Không lấy được chi tiết';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Create
  Future<TinTuyenDung> taoMoi({
    required String tieuDe,
    required String moTa,
    required String yeuCau,
    String? quyenLoi,
    required List<String> kyNangBatBuoc,
    List<String>? kyNangMongMuon,
    required int kinhNghiemToiThieu,
    required String capBac,
    required String hinhThucLamViec,
    required Map<String, dynamic> mucLuong,
    required String diaDiem,
    required int soLuongTuyen,
    required DateTime hanNop,
    required String quyTrinhId,
  }) async {
    try {
      final response = await _api.post(
        ApiConstants.tinTuyenDung,
        data: {
          'tieuDe': tieuDe,
          'moTa': moTa,
          'yeuCau': yeuCau,
          'quyenLoi': quyenLoi,
          'kyNangBatBuoc': kyNangBatBuoc,
          'kyNangMongMuon': kyNangMongMuon ?? [],
          'kinhNghiemToiThieu': kinhNghiemToiThieu,
          'capBac': capBac,
          'hinhThucLamViec': hinhThucLamViec,
          'mucLuong': mucLuong,
          'diaDiem': diaDiem,
          'soLuongTuyen': soLuongTuyen,
          'hanNop': hanNop.toIso8601String(),
          'quyTrinhId': quyTrinhId,
        },
      );

      if (response.data['success'] == true) {
        return TinTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Tạo tin thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Update
  Future<TinTuyenDung> capNhat(String id, Map<String, dynamic> data) async {
    try {
      final response = await _api.put(
        ApiConstants.tinTuyenDungDetail(id),
        data: data,
      );

      if (response.data['success'] == true) {
        return TinTuyenDung.fromJson(response.data['data']);
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
        ApiConstants.tinTuyenDungDetail(id),
      );

      return response.data['success'] == true;
    } catch (e) {
      throw e.toString();
    }
  }

  // Change status
  Future<TinTuyenDung> doiTrangThai(String id, String trangThai) async {
    try {
      final response = await _api.put(
        ApiConstants.tinTuyenDungTrangThai(id),
        data: {'trangThai': trangThai},
      );

      if (response.data['success'] == true) {
        return TinTuyenDung.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Đổi trạng thái thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Get statistics
  Future<Map<String, dynamic>> getThongKe(String id) async {
    try {
      final response = await _api.get(
        ApiConstants.tinTuyenDungThongKe(id),
      );

      if (response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw response.data['message'] ?? 'Không lấy được thống kê';
      }
    } catch (e) {
      throw e.toString();
    }
  }
}
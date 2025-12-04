import 'dart:io';
import '../../config/constants/api_constants.dart';
import '../models/ung_vien.dart';
import 'api_service.dart';

class UngVienService {
  final ApiService _api = ApiService();

  // Apply for job
  Future<UngVien> ungTuyen({
    required String hoTen,
    required String email,
    required String soDienThoai,
    DateTime? ngaySinh,
    String? gioiTinh,
    String? diaChi,
    required String jobId,
    required File cvFile,
    String? thuUngTuyen,
    int? kinhNghiem,
    List<String>? kyNangNoiBat,
    String? hocVan,
    String? nguonUngTuyen,
  }) async {
    try {
      final data = {
        'hoTen': hoTen,
        'email': email,
        'soDienThoai': soDienThoai,
        if (ngaySinh != null) 'ngaySinh': ngaySinh.toIso8601String(),
        if (gioiTinh != null) 'gioiTinh': gioiTinh,
        if (diaChi != null) 'diaChi': diaChi,
        'jobId': jobId,
        if (thuUngTuyen != null) 'thuUngTuyen': thuUngTuyen,
        'kinhNghiem': kinhNghiem ?? 0,
        'kyNangNoiBat': kyNangNoiBat ?? [],
        if (hocVan != null) 'hocVan': hocVan,
        'nguonUngTuyen': nguonUngTuyen ?? 'Website',
      };

      final response = await _api.uploadFile(
        ApiConstants.ungVienApply,
        cvFile,
        fieldName: 'cv',
        data: data,
      );

      if (response.data['success'] == true) {
        return UngVien.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Ứng tuyển thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Get list
  Future<Map<String, dynamic>> getDanhSach({
    int page = 1,
    int limit = 20,
    String? jobId,
    String? trangThai,
    String? timKiem,
    DateTime? tuNgay,
    DateTime? denNgay,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (jobId != null) 'jobId': jobId,
        if (trangThai != null) 'trangThai': trangThai,
        if (timKiem != null) 'timKiem': timKiem,
        if (tuNgay != null) 'tuNgay': tuNgay.toIso8601String(),
        if (denNgay != null) 'denNgay': denNgay.toIso8601String(),
      };

      final response = await _api.get(
        ApiConstants.ungVien,
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final data = response.data['data'] as List;
        final ungVienList = data.map((json) => UngVien.fromJson(json)).toList();
        
        return {
          'data': ungVienList,
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
  Future<UngVien> getChiTiet(String id) async {
    try {
      final response = await _api.get(
        ApiConstants.ungVienDetail(id),
      );

      if (response.data['success'] == true) {
        return UngVien.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Không lấy được chi tiết';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Update
  Future<UngVien> capNhat(String id, Map<String, dynamic> data) async {
    try {
      final response = await _api.put(
        ApiConstants.ungVienDetail(id),
        data: data,
      );

      if (response.data['success'] == true) {
        return UngVien.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Cập nhật thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Change status
  Future<UngVien> doiTrangThai(
    String id,
    String trangThai, {
    String? ghiChu,
  }) async {
    try {
      final response = await _api.put(
        ApiConstants.ungVienTrangThai(id),
        data: {
          'trangThai': trangThai,
          if (ghiChu != null) 'ghiChu': ghiChu,
        },
      );

      if (response.data['success'] == true) {
        return UngVien.fromJson(response.data['data']);
      } else {
        throw response.data['message'] ?? 'Đổi trạng thái thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Delete
  Future<bool> xoa(String id) async {
    try {
      final response = await _api.delete(
        ApiConstants.ungVienDetail(id),
      );

      return response.data['success'] == true;
    } catch (e) {
      throw e.toString();
    }
  }

  // Download CV
  Future<String> downloadCV(String id, String savePath) async {
    try {
      await _api.downloadFile(
        ApiConstants.ungVienDownloadCV(id),
        savePath,
      );
      return savePath;
    } catch (e) {
      throw e.toString();
    }
  }
}
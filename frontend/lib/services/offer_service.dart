// lib/core/services/offer_service.dart
import 'dart:io';
import '../../config/constants/api_constants.dart';
import '../models/thu_moi_nhan_viec.dart';
import 'api_service.dart';

class OfferService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getDanhSach({int page = 1, int limit = 20}) async {
    final response = await _api.get(ApiConstants.offer,
      queryParameters: {'page': page.toString(), 'limit': limit.toString()});
    
    if (response.data['success'] == true) {
      final data = response.data['data'] as List;
      return {
        'data': data.map((json) => ThuMoiNhanViec.fromJson(json)).toList(),
        'pagination': response.data['pagination'],
      };
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<ThuMoiNhanViec> taoMoi(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.offer, data: data);
    if (response.data['success'] == true) {
      return ThuMoiNhanViec.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<ThuMoiNhanViec> guiOffer(String id) async {
    final response = await _api.post(ApiConstants.offerGui(id));
    if (response.data['success'] == true) {
      return ThuMoiNhanViec.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Lỗi';
  }

  Future<String> downloadPDF(String id, String savePath) async {
    await _api.downloadFile(ApiConstants.offerDownload(id), savePath);
    return savePath;
  }

  Future<ThuMoiNhanViec> getChiTiet(String id) async {
    final response = await _api.get(ApiConstants.offerDetail(id));
    if (response.data['success'] == true) {
      return ThuMoiNhanViec.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Không lấy được chi tiết';
  }

  Future<ThuMoiNhanViec> capNhat(String id, Map<String, dynamic> data) async {
    final response = await _api.put(ApiConstants.offerDetail(id), data: data);
    if (response.data['success'] == true) {
      return ThuMoiNhanViec.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Cập nhật thất bại';
  }

  Future<bool> xoa(String id) async {
    final response = await _api.delete(ApiConstants.offerDetail(id));
    return response.data['success'] == true;
  }

  Future<ThuMoiNhanViec> huyOffer(String id, String lyDo) async {
    final response = await _api.put(
      ApiConstants.offerHuy(id),
      data: {'lyDo': lyDo},
    );
    if (response.data['success'] == true) {
      return ThuMoiNhanViec.fromJson(response.data['data']);
    }
    throw response.data['message'] ?? 'Hủy offer thất bại';
  }

  Future<bool> traLoiOffer(String maOffer, bool chap) async {
    final response = await _api.post(
      ApiConstants.offerTraLoi(maOffer),
      data: {'chap': chap},
    );
    return response.data['success'] == true;
  }
}


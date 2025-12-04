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
}


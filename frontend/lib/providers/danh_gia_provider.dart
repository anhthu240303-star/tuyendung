// frontend/lib/providers/danh_gia_provider.dart
import 'package:flutter/material.dart';
import '../models/danh_gia_phong_van.dart';
import '../services/danh_gia_service.dart';

class DanhGiaProvider extends ChangeNotifier {
  final DanhGiaService _service = DanhGiaService();

  List<DanhGiaPhongVan> _danhSach = [];
  DanhGiaPhongVan? _chiTiet;
  Map<String, dynamic>? _tongHop;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<DanhGiaPhongVan> get danhSach => _danhSach;
  DanhGiaPhongVan? get chiTiet => _chiTiet;
  Map<String, dynamic>? get tongHop => _tongHop;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Create evaluation
  Future<bool> taoMoi({
    required String lichPhongVanId,
    required String ungVienId,
    required List<Map<String, dynamic>> cacTieuChi,
    String? nhanXet,
    String? diemManh,
    String? diemYeu,
    required String deXuat,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final danhGia = await _service.taoMoi(
        lichPhongVanId: lichPhongVanId,
        ungVienId: ungVienId,
        cacTieuChi: cacTieuChi,
        nhanXet: nhanXet,
        diemManh: diemManh,
        diemYeu: diemYeu,
        deXuat: deXuat,
      );

      _danhSach.insert(0, danhGia);
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Get evaluations by candidate
  Future<void> layTheoUngVien(String ungVienId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _danhSach = await _service.layTheoUngVien(ungVienId);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get evaluations by interview schedule
  Future<void> layTheoLich(String lichPhongVanId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _danhSach = await _service.layTheoLich(lichPhongVanId);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get detail
  Future<void> getChiTiet(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _chiTiet = await _service.getChiTiet(id);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get summary
  Future<void> tongHopDiem(String ungVienId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _tongHop = await _service.tongHopDiem(ungVienId);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update
  Future<bool> capNhat(String id, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final danhGia = await _service.capNhat(id, data);
      
      final index = _danhSach.indexWhere((dg) => dg.id == id);
      if (index != -1) {
        _danhSach[index] = danhGia;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = danhGia;
      }
      
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Delete
  Future<bool> xoa(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final success = await _service.xoa(id);
      
      if (success) {
        _danhSach.removeWhere((dg) => dg.id == id);
        if (_chiTiet?.id == id) {
          _chiTiet = null;
        }
      }
      
      _error = null;
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Clear
  void clear() {
    _danhSach.clear();
    _chiTiet = null;
    _tongHop = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
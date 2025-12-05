// frontend/lib/providers/quy_trinh_provider.dart
import 'package:flutter/material.dart';
import '../models/quy_trinh_tuyen_dung.dart';
import '../services/quy_trinh_service.dart';

class QuyTrinhProvider extends ChangeNotifier {
  final QuyTrinhService _service = QuyTrinhService();

  List<QuyTrinhTuyenDung> _danhSach = [];
  QuyTrinhTuyenDung? _chiTiet;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<QuyTrinhTuyenDung> get danhSach => _danhSach;
  QuyTrinhTuyenDung? get chiTiet => _chiTiet;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  QuyTrinhTuyenDung? get quyTrinhMacDinh {
    try {
      return _danhSach.firstWhere((qt) => qt.macDinh);
    } catch (e) {
      return null;
    }
  }

  // Get list
  Future<void> getDanhSach({String? trangThai, String? timKiem}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _service.getDanhSach(
        trangThai: trangThai,
        timKiem: timKiem,
      );

      _danhSach = result['data'];
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

  // Create
  Future<bool> taoMoi({
    required String ten,
    String? moTa,
    required List<Map<String, dynamic>> cacBuoc,
    bool macDinh = false,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final quyTrinh = await _service.taoMoi(
        ten: ten,
        moTa: moTa,
        cacBuoc: cacBuoc,
        macDinh: macDinh,
      );

      _danhSach.insert(0, quyTrinh);
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

  // Update
  Future<bool> capNhat(String id, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final quyTrinh = await _service.capNhat(id, data);
      
      final index = _danhSach.indexWhere((qt) => qt.id == id);
      if (index != -1) {
        _danhSach[index] = quyTrinh;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = quyTrinh;
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
        _danhSach.removeWhere((qt) => qt.id == id);
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

  // Set as default
  Future<bool> datMacDinh(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final quyTrinh = await _service.datMacDinh(id);
      
      // Update all quy trinh
      for (var i = 0; i < _danhSach.length; i++) {
        if (_danhSach[i].id == id) {
          _danhSach[i] = quyTrinh;
        } else {
          // Set other to non-default (assuming API does this)
        }
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

  // Copy
  Future<bool> saoChep(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final quyTrinh = await _service.saoChep(id);
      _danhSach.insert(0, quyTrinh);
      
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

  // Clear detail
  void clearChiTiet() {
    _chiTiet = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
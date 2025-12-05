// frontend/lib/providers/hoi_dong_provider.dart
import 'package:flutter/material.dart';
import '../models/hoi_dong_phong_van.dart';
import '../services/hoi_dong_service.dart';

class HoiDongProvider extends ChangeNotifier {
  final HoiDongService _service = HoiDongService();

  List<HoiDongPhongVan> _danhSach = [];
  HoiDongPhongVan? _chiTiet;
  bool _isLoading = false;
  String? _error;
  
  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  int _total = 0;
  final int _limit = 20;

  // Getters
  List<HoiDongPhongVan> get danhSach => _danhSach;
  HoiDongPhongVan? get chiTiet => _chiTiet;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  int get total => _total;
  bool get hasMore => _currentPage < _totalPages;
  
  // Get active councils only
  List<HoiDongPhongVan> get danhSachHoatDong {
    return _danhSach.where((hd) => hd.isActive).toList();
  }

  // Get list
  Future<void> getDanhSach({
    int? page,
    String? trangThai,
    String? timKiem,
    bool refresh = false,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _danhSach.clear();
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _service.getDanhSach(
        page: page ?? _currentPage,
        limit: _limit,
      );

      if (refresh) {
        _danhSach = result['data'];
      } else {
        _danhSach.addAll(result['data']);
      }

      final pagination = result['pagination'];
      _currentPage = pagination['page'];
      _totalPages = pagination['pages'];
      _total = pagination['total'];
      
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
    required List<Map<String, dynamic>> thanhVien,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final hoiDong = await _service.taoMoi(
        ten: ten,
        moTa: moTa,
        thanhVien: thanhVien,
      );

      _danhSach.insert(0, hoiDong);
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
      final hoiDong = await _service.capNhat(id, data);
      
      final index = _danhSach.indexWhere((hd) => hd.id == id);
      if (index != -1) {
        _danhSach[index] = hoiDong;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = hoiDong;
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
        _danhSach.removeWhere((hd) => hd.id == id);
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

  // Add member
  Future<bool> themThanhVien(
    String id,
    String nguoiDungId,
    String vaiTro,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final hoiDong = await _service.themThanhVien(
        id,
        {
          'nguoiDungId': nguoiDungId,
          'vaiTro': vaiTro,
        },
      );
      
      final index = _danhSach.indexWhere((hd) => hd.id == id);
      if (index != -1) {
        _danhSach[index] = hoiDong;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = hoiDong;
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

  // Remove member
  Future<bool> xoaThanhVien(String id, String nguoiDungId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final hoiDong = await _service.xoaThanhVien(id, nguoiDungId);
      
      final index = _danhSach.indexWhere((hd) => hd.id == id);
      if (index != -1) {
        _danhSach[index] = hoiDong;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = hoiDong;
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
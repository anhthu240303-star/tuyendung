// frontend/lib/providers/offer_provider.dart
import 'package:flutter/material.dart';
import '../models/thu_moi_nhan_viec.dart';
import '../services/offer_service.dart';

class OfferProvider extends ChangeNotifier {
  final OfferService _service = OfferService();

  List<ThuMoiNhanViec> _danhSach = [];
  ThuMoiNhanViec? _chiTiet;
  bool _isLoading = false;
  String? _error;
  
  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  int _total = 0;
  final int _limit = 20;

  // Getters
  List<ThuMoiNhanViec> get danhSach => _danhSach;
  ThuMoiNhanViec? get chiTiet => _chiTiet;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  int get total => _total;
  bool get hasMore => _currentPage < _totalPages;

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
  Future<bool> taoMoi(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final offer = await _service.taoMoi(data);

      _danhSach.insert(0, offer);
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
      final offer = await _service.capNhat(id, data);
      
      final index = _danhSach.indexWhere((o) => o.id == id);
      if (index != -1) {
        _danhSach[index] = offer;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = offer;
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

  // Send offer
  Future<bool> guiOffer(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final offer = await _service.guiOffer(id);
      
      final index = _danhSach.indexWhere((o) => o.id == id);
      if (index != -1) {
        _danhSach[index] = offer;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = offer;
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

  // Cancel offer
  Future<bool> huyOffer(String id, String lyDo) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final offer = await _service.huyOffer(id, lyDo);
      
      final index = _danhSach.indexWhere((o) => o.id == id);
      if (index != -1) {
        _danhSach[index] = offer;
      }
      
      if (_chiTiet?.id == id) {
        _chiTiet = offer;
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

  // Download PDF
  Future<String?> downloadPDF(String id, String savePath) async {
    try {
      return await _service.downloadPDF(id, savePath);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
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
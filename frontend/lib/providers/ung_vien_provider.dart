import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/ung_vien.dart';
import '../services/ung_vien_service.dart';

class UngVienProvider with ChangeNotifier {
  final UngVienService _service = UngVienService();

  List<UngVien> _danhSach = [];
  UngVien? _chiTiet;
  
  bool _isLoading = false;
  String? _error;
  
  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  int _total = 0;
  final int _limit = 20;

  // Getters
  List<UngVien> get danhSach => _danhSach;
  UngVien? get chiTiet => _chiTiet;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  int get total => _total;
  bool get hasNextPage => _currentPage < _totalPages;
  bool get hasPreviousPage => _currentPage > 1;

  // Get list
  Future<void> getDanhSach({
    int? page,
    String? jobId,
    String? trangThai,
    String? timKiem,
    DateTime? tuNgay,
    DateTime? denNgay,
    bool loadMore = false,
  }) async {
    try {
      if (!loadMore) {
        _isLoading = true;
        _error = null;
        _currentPage = page ?? 1;
        notifyListeners();
      }

      final result = await _service.getDanhSach(
        page: page ?? _currentPage,
        limit: _limit,
        jobId: jobId,
        trangThai: trangThai,
        timKiem: timKiem,
        tuNgay: tuNgay,
        denNgay: denNgay,
      );

      final newList = result['data'] as List<UngVien>;
      final pagination = result['pagination'];

      if (loadMore) {
        _danhSach.addAll(newList);
      } else {
        _danhSach = newList;
      }

      _currentPage = pagination['page'];
      _totalPages = pagination['pages'];
      _total = pagination['total'];

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load more
  Future<void> loadMore({
    String? jobId,
    String? trangThai,
    String? timKiem,
    DateTime? tuNgay,
    DateTime? denNgay,
  }) async {
    if (hasNextPage && !_isLoading) {
      await getDanhSach(
        page: _currentPage + 1,
        jobId: jobId,
        trangThai: trangThai,
        timKiem: timKiem,
        tuNgay: tuNgay,
        denNgay: denNgay,
        loadMore: true,
      );
    }
  }

  // Get detail
  Future<void> getChiTiet(String id) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _chiTiet = await _service.getChiTiet(id);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Apply
  Future<bool> ungTuyen({
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
      _isLoading = true;
      _error = null;
      notifyListeners();

      final ungVien = await _service.ungTuyen(
        hoTen: hoTen,
        email: email,
        soDienThoai: soDienThoai,
        ngaySinh: ngaySinh,
        gioiTinh: gioiTinh,
        diaChi: diaChi,
        jobId: jobId,
        cvFile: cvFile,
        thuUngTuyen: thuUngTuyen,
        kinhNghiem: kinhNghiem,
        kyNangNoiBat: kyNangNoiBat,
        hocVan: hocVan,
        nguonUngTuyen: nguonUngTuyen,
      );

      _danhSach.insert(0, ungVien);
      _chiTiet = ungVien;

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
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final ungVien = await _service.capNhat(id, data);

      // Update in list
      final index = _danhSach.indexWhere((uv) => uv.id == id);
      if (index != -1) {
        _danhSach[index] = ungVien;
      }

      // Update detail
      if (_chiTiet?.id == id) {
        _chiTiet = ungVien;
      }

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

  // Change status
  Future<bool> doiTrangThai(
    String id,
    String trangThai, {
    String? ghiChu,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final ungVien = await _service.doiTrangThai(
        id,
        trangThai,
        ghiChu: ghiChu,
      );

      // Update in list
      final index = _danhSach.indexWhere((uv) => uv.id == id);
      if (index != -1) {
        _danhSach[index] = ungVien;
      }

      // Update detail
      if (_chiTiet?.id == id) {
        _chiTiet = ungVien;
      }

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
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final success = await _service.xoa(id);

      if (success) {
        _danhSach.removeWhere((uv) => uv.id == id);
        if (_chiTiet?.id == id) {
          _chiTiet = null;
        }
      }

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

  // Download CV
  Future<String?> downloadCV(String id, String savePath) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final path = await _service.downloadCV(id, savePath);

      _isLoading = false;
      notifyListeners();

      return path;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // Clear
  void clearChiTiet() {
    _chiTiet = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
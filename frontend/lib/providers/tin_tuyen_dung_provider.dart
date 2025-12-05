import 'package:flutter/foundation.dart';
import '../models/tin_tuyen_dung.dart';
import '../services/tin_tuyen_dung_service.dart';

class TinTuyenDungProvider with ChangeNotifier {
  final TinTuyenDungService _service = TinTuyenDungService();

  List<TinTuyenDung> _danhSach = [];
  TinTuyenDung? _chiTiet;
  Map<String, dynamic>? _thongKe;
  
  bool _isLoading = false;
  String? _error;
  
  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  int _total = 0;
  final int _limit = 20;

  // Getters
  List<TinTuyenDung> get danhSach => _danhSach;
  TinTuyenDung? get chiTiet => _chiTiet;
  Map<String, dynamic>? get thongKe => _thongKe;
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
    String? trangThai,
    String? timKiem,
    String? capBac,
    String? hinhThucLamViec,
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
        trangThai: trangThai,
        timKiem: timKiem,
        capBac: capBac,
        hinhThucLamViec: hinhThucLamViec,
      );

      final newList = result['data'] as List<TinTuyenDung>;
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
    String? trangThai,
    String? timKiem,
    String? capBac,
    String? hinhThucLamViec,
  }) async {
    if (hasNextPage && !_isLoading) {
      await getDanhSach(
        page: _currentPage + 1,
        trangThai: trangThai,
        timKiem: timKiem,
        capBac: capBac,
        hinhThucLamViec: hinhThucLamViec,
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

  // Create
  Future<bool> taoMoi({
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
      _isLoading = true;
      _error = null;
      notifyListeners();

      final tin = await _service.taoMoi(
        tieuDe: tieuDe,
        moTa: moTa,
        yeuCau: yeuCau,
        quyenLoi: quyenLoi,
        kyNangBatBuoc: kyNangBatBuoc,
        kyNangMongMuon: kyNangMongMuon,
        kinhNghiemToiThieu: kinhNghiemToiThieu,
        capBac: capBac,
        hinhThucLamViec: hinhThucLamViec,
        mucLuong: mucLuong,
        diaDiem: diaDiem,
        soLuongTuyen: soLuongTuyen,
        hanNop: hanNop,
        quyTrinhId: quyTrinhId,
      );

      _danhSach.insert(0, tin);
      _chiTiet = tin;

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

      final tin = await _service.capNhat(id, data);

      // Update in list
      final index = _danhSach.indexWhere((t) => t.id == id);
      if (index != -1) {
        _danhSach[index] = tin;
      }

      // Update detail
      if (_chiTiet?.id == id) {
        _chiTiet = tin;
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
        _danhSach.removeWhere((t) => t.id == id);
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

  // Change status
  Future<bool> doiTrangThai(String id, String trangThai) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final tin = await _service.doiTrangThai(id, trangThai);

      // Update in list
      final index = _danhSach.indexWhere((t) => t.id == id);
      if (index != -1) {
        _danhSach[index] = tin;
      }

      // Update detail
      if (_chiTiet?.id == id) {
        _chiTiet = tin;
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

  // Get statistics
  Future<void> getThongKe(String id) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _thongKe = await _service.getThongKe(id);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear
  void clearChiTiet() {
    _chiTiet = null;
    notifyListeners();
  }

  void clearThongKe() {
    _thongKe = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
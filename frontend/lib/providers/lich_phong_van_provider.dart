// frontend/lib/providers/lich_phong_van_provider.dart
import 'package:flutter/material.dart';
import '../models/lich_phong_van.dart';
import '../services/lich_phong_van_service.dart';
class LichPhongVanProvider extends ChangeNotifier {
final LichPhongVanService _service = LichPhongVanService();
List<LichPhongVan> _danhSach = [];
LichPhongVan? _chiTiet;
bool _isLoading = false;
String? _error;
// Pagination
int _currentPage = 1;
int _totalPages = 1;
int _total = 0;
final int _limit = 20;
// Getters
List<LichPhongVan> get danhSach => _danhSach;
LichPhongVan? get chiTiet => _chiTiet;
bool get isLoading => _isLoading;
String? get error => _error;
int get currentPage => _currentPage;
int get totalPages => _totalPages;
int get total => _total;
bool get hasMore => _currentPage < _totalPages;
// Get list
Future<void> getDanhSach({
int? page,
String? ungVienId,
String? hoiDongId,
String? trangThai,
DateTime? tuNgay,
DateTime? denNgay,
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
    ungVienId: ungVienId,
    hoiDongId: hoiDongId,
    trangThai: trangThai,
    tuNgay: tuNgay,
    denNgay: denNgay,
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
Future<bool> taoLich({
required String ungVienId,
required String jobId,
required String hoiDongId,
required DateTime thoiGianBatDau,
required DateTime thoiGianKetThuc,
String? diaDiem,
String? linkOnline,
required String hinhThuc,
String? noiDung,
String? ghiChu,
}) async {
_isLoading = true;
_error = null;
notifyListeners();
try {
  final lich = await _service.taoLich(
    ungVienId: ungVienId,
    jobId: jobId,
    hoiDongId: hoiDongId,
    thoiGianBatDau: thoiGianBatDau,
    thoiGianKetThuc: thoiGianKetThuc,
    diaDiem: diaDiem,
    linkOnline: linkOnline,
    hinhThuc: hinhThuc,
    noiDung: noiDung,
    ghiChu: ghiChu,
  );

  _danhSach.insert(0, lich);
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
  final lich = await _service.capNhat(id, data);
  
  final index = _danhSach.indexWhere((l) => l.id == id);
  if (index != -1) {
    _danhSach[index] = lich;
  }
  
  if (_chiTiet?.id == id) {
    _chiTiet = lich;
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
// Cancel
Future<bool> huyLich(String id, String lyDo) async {
_isLoading = true;
_error = null;
notifyListeners();
try {
  final lich = await _service.huyLich(id, lyDo);
  
  final index = _danhSach.indexWhere((l) => l.id == id);
  if (index != -1) {
    _danhSach[index] = lich;
  }
  
  if (_chiTiet?.id == id) {
    _chiTiet = lich;
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
// Mark as completed
Future<bool> hoanThanh(String id) async {
_isLoading = true;
_error = null;
notifyListeners();
try {
  final lich = await _service.hoanThanh(id);
  
  final index = _danhSach.indexWhere((l) => l.id == id);
  if (index != -1) {
    _danhSach[index] = lich;
  }
  
  if (_chiTiet?.id == id) {
    _chiTiet = lich;
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
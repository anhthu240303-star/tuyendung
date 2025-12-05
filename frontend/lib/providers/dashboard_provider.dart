import 'package:flutter/foundation.dart';
import '../models/dashboard.dart';
import '../services/bao_cao_service.dart';

class DashboardProvider with ChangeNotifier {
  final BaoCaoService _service = BaoCaoService();

  DashboardData? _data;
  List<Map<String, dynamic>> _baoCaoTheoTin = [];
  Map<String, dynamic>? _baoCaoTheoNguon;
  
  bool _isLoading = false;
  String? _error;

  // Getters
  DashboardData? get data => _data;
  DashboardData? get dashboardData => _data;
  List<Map<String, dynamic>> get baoCaoTheoTin => _baoCaoTheoTin;
  Map<String, dynamic>? get baoCaoTheoNguon => _baoCaoTheoNguon;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get dashboard
  Future<void> getDashboard({DateTime? tuNgay, DateTime? denNgay}) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _data = await _service.getDashboard(tuNgay: tuNgay, denNgay: denNgay);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get report by job
  Future<void> getBaoCaoTheoTin() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _baoCaoTheoTin = await _service.getBaoCaoTheoTin();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get report by source
  Future<void> getBaoCaoTheoNguon() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _baoCaoTheoNguon = await _service.getBaoCaoTheoNguon();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Export Excel
  Future<String?> exportExcel(String loai) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final path = await _service.exportExcel(loai);

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
  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> refresh() async {
    await getDashboard();
  }
}
// frontend/lib/providers/bao_cao_provider.dart
import 'package:flutter/material.dart';
import '../services/bao_cao_service.dart';

class BaoCaoProvider extends ChangeNotifier {
  final BaoCaoService _service = BaoCaoService();

  List<Map<String, dynamic>> _baoCaoTheoTin = [];
  Map<String, dynamic>? _baoCaoTheoNguon;
  List<Map<String, dynamic>> _baoCaoTheoThoiGian = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Map<String, dynamic>> get baoCaoTheoTin => _baoCaoTheoTin;
  Map<String, dynamic>? get baoCaoTheoNguon => _baoCaoTheoNguon;
  List<Map<String, dynamic>> get baoCaoTheoThoiGian => _baoCaoTheoThoiGian;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get report by job
  Future<void> getBaoCaoTheoTin({DateTime? tuNgay, DateTime? denNgay}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _baoCaoTheoTin = await _service.getBaoCaoTheoTin(
        tuNgay: tuNgay,
        denNgay: denNgay,
      );
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get report by source
  Future<void> getBaoCaoTheoNguon({DateTime? tuNgay, DateTime? denNgay}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _baoCaoTheoNguon = await _service.getBaoCaoTheoNguon(
        tuNgay: tuNgay,
        denNgay: denNgay,
      );
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get report by time
  Future<void> getBaoCaoTheoThoiGian({
    DateTime? tuNgay,
    DateTime? denNgay,
    String groupBy = 'ngay',
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _baoCaoTheoThoiGian = await _service.getBaoCaoTheoThoiGian(
        tuNgay: tuNgay,
        denNgay: denNgay,
        groupBy: groupBy,
      );
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Export Excel
  Future<String?> exportExcel(String loai) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final path = await _service.exportExcel(loai);
      _error = null;
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

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
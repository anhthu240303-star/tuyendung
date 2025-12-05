import 'package:flutter/foundation.dart';
import '../models/nguoi_dung.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final StorageService _storage = StorageService();

  NguoiDung? _currentUser;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  // Getters
  NguoiDung? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;
  
  bool get isAdmin => _currentUser?.isAdmin ?? false;
  bool get isHR => _currentUser?.isHR ?? false;
  bool get isInterviewer => _currentUser?.isInterviewer ?? false;

  // Initialize - check if user is logged in
  Future<void> initialize() async {
    try {
      _isLoading = true;
      notifyListeners();

      final isLoggedIn = await _authService.isLoggedIn();
      
      if (isLoggedIn) {
        _currentUser = _authService.getSavedUser();
        if (_currentUser != null) {
          _isAuthenticated = true;
          // Refresh user data from server
          try {
            _currentUser = await _authService.getCurrentUser();
          } catch (e) {
            // If refresh fails, use cached user
            debugPrint('Failed to refresh user: $e');
          }
        }
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Initialize error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final result = await _authService.login(email, password);
      
      _currentUser = result['user'];
      _isAuthenticated = true;
      
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

  // Register
  Future<bool> register({
    required String hoTen,
    required String email,
    required String password,
    required String vaiTro,
    String? soDienThoai,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final result = await _authService.register(
        hoTen: hoTen,
        email: email,
        password: password,
        vaiTro: vaiTro,
        soDienThoai: soDienThoai,
      );
      
      _currentUser = result['user'];
      _isAuthenticated = true;
      
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

  // Logout
  Future<void> logout() async {
    try {
      await _authService.logout();
      _currentUser = null;
      _isAuthenticated = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Refresh current user
  Future<void> refreshUser() async {
    try {
      _isLoading = true;
      notifyListeners();

      _currentUser = await _authService.getCurrentUser();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update profile
  Future<bool> updateProfile({
    String? hoTen,
    String? soDienThoai,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _currentUser = await _authService.updateProfile(
        hoTen: hoTen,
        soDienThoai: soDienThoai,
      );
      
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

  // Change password
  Future<bool> changePassword({
    required String matKhauCu,
    required String matKhauMoi,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final success = await _authService.changePassword(
        matKhauCu: matKhauCu,
        matKhauMoi: matKhauMoi,
      );
      
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

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
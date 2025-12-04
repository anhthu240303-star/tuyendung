import '../../config/constants/api_constants.dart';
import '../models/nguoi_dung.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _api.post(
        ApiConstants.login,
        data: {
          'email': email,
          'matKhau': password,
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final token = data['token'];
        final userJson = data['user'];

        // Save token and user
        await _storage.saveToken(token);
        final user = NguoiDung.fromJson(userJson);
        await _storage.saveUser(user);

        return {
          'success': true,
          'user': user,
          'token': token,
        };
      } else {
        throw response.data['message'] ?? 'Đăng nhập thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Register
  Future<Map<String, dynamic>> register({
    required String hoTen,
    required String email,
    required String password,
    required String vaiTro,
    String? soDienThoai,
  }) async {
    try {
      final response = await _api.post(
        ApiConstants.register,
        data: {
          'hoTen': hoTen,
          'email': email,
          'matKhau': password,
          'vaiTro': vaiTro,
          'soDienThoai': soDienThoai,
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final token = data['token'];
        final userJson = data['user'];

        // Save token and user
        await _storage.saveToken(token);
        final user = NguoiDung.fromJson(userJson);
        await _storage.saveUser(user);

        return {
          'success': true,
          'user': user,
          'token': token,
        };
      } else {
        throw response.data['message'] ?? 'Đăng ký thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Get current user
  Future<NguoiDung> getCurrentUser() async {
    try {
      final response = await _api.get(ApiConstants.me);

      if (response.data['success'] == true) {
        final user = NguoiDung.fromJson(response.data['data']);
        await _storage.saveUser(user);
        return user;
      } else {
        throw response.data['message'] ?? 'Không lấy được thông tin người dùng';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Change password
  Future<bool> changePassword({
    required String matKhauCu,
    required String matKhauMoi,
  }) async {
    try {
      final response = await _api.put(
        ApiConstants.changePassword,
        data: {
          'matKhauCu': matKhauCu,
          'matKhauMoi': matKhauMoi,
        },
      );

      return response.data['success'] == true;
    } catch (e) {
      throw e.toString();
    }
  }

  // Update profile
  Future<NguoiDung> updateProfile({
    String? hoTen,
    String? soDienThoai,
  }) async {
    try {
      final response = await _api.put(
        ApiConstants.updateProfile,
        data: {
          if (hoTen != null) 'hoTen': hoTen,
          if (soDienThoai != null) 'soDienThoai': soDienThoai,
        },
      );

      if (response.data['success'] == true) {
        final user = NguoiDung.fromJson(response.data['data']);
        await _storage.saveUser(user);
        return user;
      } else {
        throw response.data['message'] ?? 'Cập nhật thất bại';
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Logout
  Future<void> logout() async {
    await _storage.logout();
  }

  // Check if logged in
  Future<bool> isLoggedIn() async {
    return await _storage.isLoggedIn();
  }

  // Get saved user
  NguoiDung? getSavedUser() {
    return _storage.getUser();
  }
}
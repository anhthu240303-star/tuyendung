import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../config/constants/api_constants.dart';
import '../models/nguoi_dung.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  late SharedPreferences _prefs;
  final _secureStorage = const FlutterSecureStorage();

  // Initialize
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token methods
  Future<void> saveToken(String token) async {
    await _secureStorage.write(
      key: ApiConstants.tokenKey,
      value: token,
    );
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: ApiConstants.tokenKey);
  }

  Future<void> clearToken() async {
    await _secureStorage.delete(key: ApiConstants.tokenKey);
  }

  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // User methods
  Future<void> saveUser(NguoiDung user) async {
    final userJson = jsonEncode(user.toJson());
    await _prefs.setString(ApiConstants.userKey, userJson);
  }

  NguoiDung? getUser() {
    final userJson = _prefs.getString(ApiConstants.userKey);
    if (userJson == null) return null;
    
    try {
      final userMap = jsonDecode(userJson) as Map<String, dynamic>;
      return NguoiDung.fromJson(userMap);
    } catch (e) {
      debugPrint('Error parsing user: $e');
      return null;
    }
  }

  Future<void> clearUser() async {
    await _prefs.remove(ApiConstants.userKey);
  }

  // Generic methods
  Future<void> setString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  String? getString(String key) {
    return _prefs.getString(key);
  }

  Future<void> setInt(String key, int value) async {
    await _prefs.setInt(key, value);
  }

  int? getInt(String key) {
    return _prefs.getInt(key);
  }

  Future<void> setBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  Future<void> setDouble(String key, double value) async {
    await _prefs.setDouble(key, value);
  }

  double? getDouble(String key) {
    return _prefs.getDouble(key);
  }

  Future<void> setStringList(String key, List<String> value) async {
    await _prefs.setStringList(key, value);
  }

  List<String>? getStringList(String key) {
    return _prefs.getStringList(key);
  }

  Future<void> remove(String key) async {
    await _prefs.remove(key);
  }

  Future<void> clear() async {
    await _prefs.clear();
    await _secureStorage.deleteAll();
  }

  // Auth helpers
  Future<bool> isLoggedIn() async {
    return await hasToken();
  }

  Future<void> logout() async {
    await clearToken();
    await clearUser();
  }
}
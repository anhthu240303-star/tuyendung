import 'dart:io';
import 'package:dio/dio.dart';
import '../../config/constants/api_constants.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  final StorageService _storage = StorageService();

  // Initialize Dio
  Future<void> init() async {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectionTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add token to headers
        final token = await _storage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        print('📤 REQUEST[${options.method}] => ${options.path}');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('📥 RESPONSE[${response.statusCode}] => ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (error, handler) async {
        print('❌ ERROR[${error.response?.statusCode}] => ${error.requestOptions.path}');
        
        // Handle 401 - Unauthorized
        if (error.response?.statusCode == 401) {
          await _storage.clearToken();
          // TODO: Navigate to login screen
        }
        
        return handler.next(error);
      },
    ));
  }

  // GET Request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST Request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // PUT Request
  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE Request
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Upload File
  Future<Response> uploadFile(
    String path,
    File file, {
    String fieldName = 'file',
    Map<String, dynamic>? data,
    void Function(int, int)? onProgress,
  }) async {
    try {
      String fileName = file.path.split('/').last;
      FormData formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        if (data != null) ...data,
      });

      final response = await _dio.post(
        path,
        data: formData,
        onSendProgress: onProgress,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Download File
  Future<Response> downloadFile(
    String path,
    String savePath, {
    void Function(int, int)? onProgress,
  }) async {
    try {
      final response = await _dio.download(
        path,
        savePath,
        onReceiveProgress: onProgress,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Error Handler
  String _handleError(DioException error) {
    String errorMessage = '';

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        errorMessage = 'Kết nối timeout. Vui lòng thử lại';
        break;
      case DioExceptionType.sendTimeout:
        errorMessage = 'Gửi dữ liệu timeout. Vui lòng thử lại';
        break;
      case DioExceptionType.receiveTimeout:
        errorMessage = 'Nhận dữ liệu timeout. Vui lòng thử lại';
        break;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        
        if (data != null && data is Map<String, dynamic>) {
          errorMessage = data['message'] ?? 'Có lỗi xảy ra';
        } else {
          switch (statusCode) {
            case 400:
              errorMessage = 'Yêu cầu không hợp lệ';
              break;
            case 401:
              errorMessage = 'Phiên đăng nhập đã hết hạn';
              break;
            case 403:
              errorMessage = 'Bạn không có quyền truy cập';
              break;
            case 404:
              errorMessage = 'Không tìm thấy dữ liệu';
              break;
            case 500:
              errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
              break;
            default:
              errorMessage = 'Có lỗi xảy ra';
          }
        }
        break;
      case DioExceptionType.cancel:
        errorMessage = 'Yêu cầu đã bị hủy';
        break;
      case DioExceptionType.connectionError:
        errorMessage = 'Không có kết nối mạng';
        break;
      default:
        errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại';
    }

    return errorMessage;
  }
}
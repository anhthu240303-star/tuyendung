import 'nguoi_dung.dart';

class ThanhVien {
  final String nguoiDungId;
  final NguoiDung? nguoiDung;
  final String vaiTro;
  final DateTime ngayThamGia;

  ThanhVien({
    required this.nguoiDungId,
    this.nguoiDung,
    required this.vaiTro,
    required this.ngayThamGia,
  });

  factory ThanhVien.fromJson(Map<String, dynamic> json) {
    return ThanhVien(
      nguoiDungId: json['nguoiDungId'] is String
          ? json['nguoiDungId']
          : json['nguoiDungId']?['_id'] ?? '',
      nguoiDung: json['nguoiDungId'] is Map
          ? NguoiDung.fromJson(json['nguoiDungId'])
          : null,
      vaiTro: json['vaiTro'] ?? 'Thanh_vien',
      ngayThamGia: DateTime.parse(
        json['ngayThamGia'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nguoiDungId': nguoiDungId,
      'vaiTro': vaiTro,
      'ngayThamGia': ngayThamGia.toIso8601String(),
    };
  }

  String get vaiTroText {
    const map = {
      'Chu_tich': 'Chủ tịch',
      'Thu_ky': 'Thư ký',
      'Thanh_vien': 'Thành viên',
    };
    return map[vaiTro] ?? vaiTro;
  }
}

class HoiDongPhongVan {
  final String id;
  final String ten;
  final String? moTa;
  final List<ThanhVien> thanhVien;
  final String trangThai;
  final String taoBoi;
  final int soLuocPhongVan;
  final DateTime createdAt;
  final DateTime updatedAt;

  HoiDongPhongVan({
    required this.id,
    required this.ten,
    this.moTa,
    required this.thanhVien,
    required this.trangThai,
    required this.taoBoi,
    this.soLuocPhongVan = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HoiDongPhongVan.fromJson(Map<String, dynamic> json) {
    return HoiDongPhongVan(
      id: json['_id'] ?? '',
      ten: json['ten'] ?? '',
      moTa: json['moTa'],
      thanhVien: (json['thanhVien'] as List? ?? [])
          .map((e) => ThanhVien.fromJson(e))
          .toList(),
      trangThai: json['trangThai'] ?? 'Hoat_dong',
      taoBoi: json['taoBoi'] ?? '',
      soLuocPhongVan: json['soLuocPhongVan'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'ten': ten,
      'moTa': moTa,
      'thanhVien': thanhVien.map((e) => e.toJson()).toList(),
      'trangThai': trangThai,
      'taoBoi': taoBoi,
      'soLuocPhongVan': soLuocPhongVan,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  int get soThanhVien => thanhVien.length;
  bool get isActive => trangThai == 'Hoat_dong';
}
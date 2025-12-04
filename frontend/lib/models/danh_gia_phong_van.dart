class TieuChiDanhGia {
  final String tenTieuChi;
  final double diem;
  final double trongSo;
  final String? ghiChu;

  TieuChiDanhGia({
    required this.tenTieuChi,
    required this.diem,
    this.trongSo = 1.0,
    this.ghiChu,
  });

  factory TieuChiDanhGia.fromJson(Map<String, dynamic> json) {
    return TieuChiDanhGia(
      tenTieuChi: json['tenTieuChi'] ?? '',
      diem: (json['diem'] ?? 0).toDouble(),
      trongSo: (json['trongSo'] ?? 1).toDouble(),
      ghiChu: json['ghiChu'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tenTieuChi': tenTieuChi,
      'diem': diem,
      'trongSo': trongSo,
      'ghiChu': ghiChu,
    };
  }
}

class DanhGiaPhongVan {
  final String id;
  final String lichPhongVanId;
  final String ungVienId;
  final String nguoiDanhGiaId;
  final List<TieuChiDanhGia> cacTieuChi;
  final double tongDiem;
  final String? nhanXet;
  final String? diemManh;
  final String? diemYeu;
  final String deXuat;
  final DateTime thoiGianDanhGia;
  final DateTime createdAt;
  final DateTime updatedAt;

  DanhGiaPhongVan({
    required this.id,
    required this.lichPhongVanId,
    required this.ungVienId,
    required this.nguoiDanhGiaId,
    required this.cacTieuChi,
    required this.tongDiem,
    this.nhanXet,
    this.diemManh,
    this.diemYeu,
    required this.deXuat,
    required this.thoiGianDanhGia,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DanhGiaPhongVan.fromJson(Map<String, dynamic> json) {
    return DanhGiaPhongVan(
      id: json['_id'] ?? '',
      lichPhongVanId: json['lichPhongVanId'] is String
          ? json['lichPhongVanId']
          : json['lichPhongVanId']?['_id'] ?? '',
      ungVienId: json['ungVienId'] is String
          ? json['ungVienId']
          : json['ungVienId']?['_id'] ?? '',
      nguoiDanhGiaId: json['nguoiDanhGiaId'] is String
          ? json['nguoiDanhGiaId']
          : json['nguoiDanhGiaId']?['_id'] ?? '',
      cacTieuChi: (json['cacTieuChi'] as List? ?? [])
          .map((e) => TieuChiDanhGia.fromJson(e))
          .toList(),
      tongDiem: (json['tongDiem'] ?? 0).toDouble(),
      nhanXet: json['nhanXet'],
      diemManh: json['diemManh'],
      diemYeu: json['diemYeu'],
      deXuat: json['deXuat'] ?? 'Chua_quyet_dinh',
      thoiGianDanhGia: DateTime.parse(
        json['thoiGianDanhGia'] ?? DateTime.now().toIso8601String(),
      ),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'lichPhongVanId': lichPhongVanId,
      'ungVienId': ungVienId,
      'nguoiDanhGiaId': nguoiDanhGiaId,
      'cacTieuChi': cacTieuChi.map((e) => e.toJson()).toList(),
      'tongDiem': tongDiem,
      'nhanXet': nhanXet,
      'diemManh': diemManh,
      'diemYeu': diemYeu,
      'deXuat': deXuat,
      'thoiGianDanhGia': thoiGianDanhGia.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get deXuatText {
    const map = {
      'Tuyen': 'Tuyển',
      'Khong_tuyen': 'Không tuyển',
      'Can_them_phong_van': 'Cần thêm phỏng vấn',
      'Chua_quyet_dinh': 'Chưa quyết định',
    };
    return map[deXuat] ?? deXuat;
  }

  String get diemText => '${tongDiem.toStringAsFixed(1)}/100';
}
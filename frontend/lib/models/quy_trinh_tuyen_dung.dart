class BuocQuyTrinh {
  final int thuTu;
  final String tenBuoc;
  final String? moTa;
  final bool batBuoc;

  BuocQuyTrinh({
    required this.thuTu,
    required this.tenBuoc,
    this.moTa,
    this.batBuoc = true,
  });

  factory BuocQuyTrinh.fromJson(Map<String, dynamic> json) {
    return BuocQuyTrinh(
      thuTu: json['thuTu'] ?? 0,
      tenBuoc: json['tenBuoc'] ?? '',
      moTa: json['moTa'],
      batBuoc: json['batBuoc'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'thuTu': thuTu,
      'tenBuoc': tenBuoc,
      'moTa': moTa,
      'batBuoc': batBuoc,
    };
  }
}

class QuyTrinhTuyenDung {
  final String id;
  final String ten;
  final String? moTa;
  final List<BuocQuyTrinh> cacBuoc;
  final bool macDinh;
  final String trangThai;
  final String taoBoi;
  final DateTime createdAt;
  final DateTime updatedAt;

  QuyTrinhTuyenDung({
    required this.id,
    required this.ten,
    this.moTa,
    required this.cacBuoc,
    this.macDinh = false,
    required this.trangThai,
    required this.taoBoi,
    required this.createdAt,
    required this.updatedAt,
  });

  factory QuyTrinhTuyenDung.fromJson(Map<String, dynamic> json) {
    return QuyTrinhTuyenDung(
      id: json['_id'] ?? '',
      ten: json['ten'] ?? '',
      moTa: json['moTa'],
      cacBuoc: (json['cacBuoc'] as List? ?? [])
          .map((e) => BuocQuyTrinh.fromJson(e))
          .toList(),
      macDinh: json['macDinh'] ?? false,
      trangThai: json['trangThai'] ?? 'Hoat_dong',
      taoBoi: json['taoBoi'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'ten': ten,
      'moTa': moTa,
      'cacBuoc': cacBuoc.map((e) => e.toJson()).toList(),
      'macDinh': macDinh,
      'trangThai': trangThai,
      'taoBoi': taoBoi,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  int get soBuoc => cacBuoc.length;
  bool get isActive => trangThai == 'Hoat_dong';
}
class MucLuong {
  final int min;
  final int max;
  final String donVi;
  final bool hienThi;

  MucLuong({
    required this.min,
    required this.max,
    this.donVi = 'VND',
    this.hienThi = true,
  });

  factory MucLuong.fromJson(Map<String, dynamic> json) {
    return MucLuong(
      min: json['min'] ?? 0,
      max: json['max'] ?? 0,
      donVi: json['donVi'] ?? 'VND',
      hienThi: json['hienThi'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'min': min,
      'max': max,
      'donVi': donVi,
      'hienThi': hienThi,
    };
  }
}

class TinTuyenDung {
  final String id;
  final String tieuDe;
  final String slug;
  final String moTa;
  final String yeuCau;
  final String? quyenLoi;
  final List<String> kyNangBatBuoc;
  final List<String> kyNangMongMuon;
  final int kinhNghiemToiThieu;
  final String capBac;
  final String hinhThucLamViec;
  final MucLuong mucLuong;
  final String diaDiem;
  final int soLuongTuyen;
  final int soLuongDaTuyen;
  final DateTime hanNop;
  final String quyTrinhId;
  final String trangThai;
  final String taoBoi;
  final DateTime? ngayDang;
  final int luotXem;
  final int soLuongUngTuyen;
  final DateTime createdAt;
  final DateTime updatedAt;

  TinTuyenDung({
    required this.id,
    required this.tieuDe,
    required this.slug,
    required this.moTa,
    required this.yeuCau,
    this.quyenLoi,
    required this.kyNangBatBuoc,
    required this.kyNangMongMuon,
    required this.kinhNghiemToiThieu,
    required this.capBac,
    required this.hinhThucLamViec,
    required this.mucLuong,
    required this.diaDiem,
    required this.soLuongTuyen,
    required this.soLuongDaTuyen,
    required this.hanNop,
    required this.quyTrinhId,
    required this.trangThai,
    required this.taoBoi,
    this.ngayDang,
    required this.luotXem,
    required this.soLuongUngTuyen,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TinTuyenDung.fromJson(Map<String, dynamic> json) {
    return TinTuyenDung(
      id: json['_id'] ?? '',
      tieuDe: json['tieuDe'] ?? '',
      slug: json['slug'] ?? '',
      moTa: json['moTa'] ?? '',
      yeuCau: json['yeuCau'] ?? '',
      quyenLoi: json['quyenLoi'],
      kyNangBatBuoc: List<String>.from(json['kyNangBatBuoc'] ?? []),
      kyNangMongMuon: List<String>.from(json['kyNangMongMuon'] ?? []),
      kinhNghiemToiThieu: json['kinhNghiemToiThieu'] ?? 0,
      capBac: json['capBac'] ?? 'Nhan_vien',
      hinhThucLamViec: json['hinhThucLamViec'] ?? 'Toan_thoi_gian',
      mucLuong: MucLuong.fromJson(json['mucLuong'] ?? {}),
      diaDiem: json['diaDiem'] ?? '',
      soLuongTuyen: json['soLuongTuyen'] ?? 1,
      soLuongDaTuyen: json['soLuongDaTuyen'] ?? 0,
      hanNop: DateTime.parse(json['hanNop']),
      quyTrinhId: json['quyTrinhId'] ?? '',
      trangThai: json['trangThai'] ?? 'Nhap',
      taoBoi: json['taoBoi'] ?? '',
      ngayDang: json['ngayDang'] != null ? DateTime.parse(json['ngayDang']) : null,
      luotXem: json['luotXem'] ?? 0,
      soLuongUngTuyen: json['soLuongUngTuyen'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'tieuDe': tieuDe,
      'slug': slug,
      'moTa': moTa,
      'yeuCau': yeuCau,
      'quyenLoi': quyenLoi,
      'kyNangBatBuoc': kyNangBatBuoc,
      'kyNangMongMuon': kyNangMongMuon,
      'kinhNghiemToiThieu': kinhNghiemToiThieu,
      'capBac': capBac,
      'hinhThucLamViec': hinhThucLamViec,
      'mucLuong': mucLuong.toJson(),
      'diaDiem': diaDiem,
      'soLuongTuyen': soLuongTuyen,
      'soLuongDaTuyen': soLuongDaTuyen,
      'hanNop': hanNop.toIso8601String(),
      'quyTrinhId': quyTrinhId,
      'trangThai': trangThai,
      'taoBoi': taoBoi,
      'ngayDang': ngayDang?.toIso8601String(),
      'luotXem': luotXem,
      'soLuongUngTuyen': soLuongUngTuyen,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Helper methods
  bool get conHan => DateTime.now().isBefore(hanNop);
  bool get daTuyenDu => soLuongDaTuyen >= soLuongTuyen;
  bool get dangTuyen => trangThai == 'Dang_tuyen';
  
  String get mucLuongText {
    if (!mucLuong.hienThi) return 'Thỏa thuận';
    if (mucLuong.min == 0 && mucLuong.max == 0) return 'Thỏa thuận';
    
    String formatMoney(int amount) {
      if (amount >= 1000000) {
        return '${(amount / 1000000).toStringAsFixed(0)} triệu';
      }
      return '${amount ~/ 1000}K';
    }
    
    if (mucLuong.min == mucLuong.max) {
      return formatMoney(mucLuong.min);
    }
    return '${formatMoney(mucLuong.min)} - ${formatMoney(mucLuong.max)}';
  }
}
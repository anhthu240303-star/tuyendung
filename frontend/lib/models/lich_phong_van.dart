class LichPhongVan {
  final String id;
  final String ungVienId;
  final String jobId;
  final String hoiDongId;
  final DateTime thoiGianBatDau;
  final DateTime thoiGianKetThuc;
  final String? diaDiem;
  final String? linkOnline;
  final String hinhThuc;
  final String trangThai;
  final String? noiDung;
  final String? ghiChu;
  final String taoBoi;
  final DateTime? ngayXacNhan;
  final String? nguoiXacNhan;
  final String? lyDoTuChoi;
  final String? lyDoHuy;
  final String? nguoiHuy;
  final DateTime? ngayHuy;
  final bool emailDaGui;
  final String? tokenXacNhan;
  final DateTime createdAt;
  final DateTime updatedAt;

  LichPhongVan({
    required this.id,
    required this.ungVienId,
    required this.jobId,
    required this.hoiDongId,
    required this.thoiGianBatDau,
    required this.thoiGianKetThuc,
    this.diaDiem,
    this.linkOnline,
    required this.hinhThuc,
    required this.trangThai,
    this.noiDung,
    this.ghiChu,
    required this.taoBoi,
    this.ngayXacNhan,
    this.nguoiXacNhan,
    this.lyDoTuChoi,
    this.lyDoHuy,
    this.nguoiHuy,
    this.ngayHuy,
    required this.emailDaGui,
    this.tokenXacNhan,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LichPhongVan.fromJson(Map<String, dynamic> json) {
    return LichPhongVan(
      id: json['_id'] ?? '',
      ungVienId: json['ungVienId'] is String 
          ? json['ungVienId'] 
          : json['ungVienId']?['_id'] ?? '',
      jobId: json['jobId'] is String 
          ? json['jobId'] 
          : json['jobId']?['_id'] ?? '',
      hoiDongId: json['hoiDongId'] is String 
          ? json['hoiDongId'] 
          : json['hoiDongId']?['_id'] ?? '',
      thoiGianBatDau: DateTime.parse(json['thoiGianBatDau']),
      thoiGianKetThuc: DateTime.parse(json['thoiGianKetThuc']),
      diaDiem: json['diaDiem'],
      linkOnline: json['linkOnline'],
      hinhThuc: json['hinhThuc'] ?? 'Truc_tiep',
      trangThai: json['trangThai'] ?? 'Cho_xac_nhan',
      noiDung: json['noiDung'],
      ghiChu: json['ghiChu'],
      taoBoi: json['taoBoi'] ?? '',
      ngayXacNhan: json['ngayXacNhan'] != null 
          ? DateTime.parse(json['ngayXacNhan']) 
          : null,
      nguoiXacNhan: json['nguoiXacNhan'],
      lyDoTuChoi: json['lyDoTuChoi'],
      lyDoHuy: json['lyDoHuy'],
      nguoiHuy: json['nguoiHuy'],
      ngayHuy: json['ngayHuy'] != null 
          ? DateTime.parse(json['ngayHuy']) 
          : null,
      emailDaGui: json['emailDaGui'] ?? false,
      tokenXacNhan: json['tokenXacNhan'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'ungVienId': ungVienId,
      'jobId': jobId,
      'hoiDongId': hoiDongId,
      'thoiGianBatDau': thoiGianBatDau.toIso8601String(),
      'thoiGianKetThuc': thoiGianKetThuc.toIso8601String(),
      'diaDiem': diaDiem,
      'linkOnline': linkOnline,
      'hinhThuc': hinhThuc,
      'trangThai': trangThai,
      'noiDung': noiDung,
      'ghiChu': ghiChu,
      'taoBoi': taoBoi,
      'ngayXacNhan': ngayXacNhan?.toIso8601String(),
      'nguoiXacNhan': nguoiXacNhan,
      'lyDoTuChoi': lyDoTuChoi,
      'lyDoHuy': lyDoHuy,
      'nguoiHuy': nguoiHuy,
      'ngayHuy': ngayHuy?.toIso8601String(),
      'emailDaGui': emailDaGui,
      'tokenXacNhan': tokenXacNhan,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Helper methods
  bool get daQua => DateTime.now().isAfter(thoiGianKetThuc);
  bool get sapDienRa => DateTime.now().isBefore(thoiGianBatDau) && 
                        thoiGianBatDau.difference(DateTime.now()).inHours <= 24;
  
  int get thoiLuongPhut => thoiGianKetThuc.difference(thoiGianBatDau).inMinutes;
  
  String get hinhThucText {
    const map = {
      'Truc_tiep': 'Trực tiếp',
      'Online': 'Online',
      'Dien_thoai': 'Điện thoại',
    };
    return map[hinhThuc] ?? hinhThuc;
  }
  
  String get trangThaiText {
    const map = {
      'Cho_xac_nhan': 'Chờ xác nhận',
      'Da_xac_nhan': 'Đã xác nhận',
      'Tu_choi': 'Từ chối',
      'Hoan_thanh': 'Hoàn thành',
      'Huy': 'Hủy',
    };
    return map[trangThai] ?? trangThai;
  }
}
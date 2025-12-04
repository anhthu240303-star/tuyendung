class GoiY {
  final String tieuChi;
  final String ketQua;
  final String? ghiChu;

  GoiY({
    required this.tieuChi,
    required this.ketQua,
    this.ghiChu,
  });

  factory GoiY.fromJson(Map<String, dynamic> json) {
    return GoiY(
      tieuChi: json['tieuChi'] ?? '',
      ketQua: json['ketQua'] ?? 'Chua_danh_gia',
      ghiChu: json['ghiChu'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tieuChi': tieuChi,
      'ketQua': ketQua,
      'ghiChu': ghiChu,
    };
  }
}

class LichSu {
  final String? trangThaiCu;
  final String trangThaiMoi;
  final String? nguoiThayDoi;
  final String? ghiChu;
  final DateTime thoiGian;

  LichSu({
    this.trangThaiCu,
    required this.trangThaiMoi,
    this.nguoiThayDoi,
    this.ghiChu,
    required this.thoiGian,
  });

  factory LichSu.fromJson(Map<String, dynamic> json) {
    return LichSu(
      trangThaiCu: json['trangThaiCu'],
      trangThaiMoi: json['trangThaiMoi'] ?? '',
      nguoiThayDoi: json['nguoiThayDoi'],
      ghiChu: json['ghiChu'],
      thoiGian: DateTime.parse(json['thoiGian']),
    );
  }
}

class UngVien {
  final String id;
  final String hoTen;
  final String email;
  final String soDienThoai;
  final DateTime? ngaySinh;
  final String? gioiTinh;
  final String? diaChi;
  final String jobId;
  final String cvUrl;
  final String cvFileName;
  final String? thuUngTuyen;
  final int kinhNghiem;
  final List<String> kyNangNoiBat;
  final String? hocVan;
  final String trangThai;
  final List<GoiY> goiY;
  final double? diemSangLoc;
  final String? nhanXetSangLoc;
  final String? nguoiSangLoc;
  final DateTime? ngaySangLoc;
  final List<LichSu> lichSu;
  final DateTime ngayNop;
  final String nguonUngTuyen;
  final DateTime createdAt;
  final DateTime updatedAt;

  UngVien({
    required this.id,
    required this.hoTen,
    required this.email,
    required this.soDienThoai,
    this.ngaySinh,
    this.gioiTinh,
    this.diaChi,
    required this.jobId,
    required this.cvUrl,
    required this.cvFileName,
    this.thuUngTuyen,
    required this.kinhNghiem,
    required this.kyNangNoiBat,
    this.hocVan,
    required this.trangThai,
    required this.goiY,
    this.diemSangLoc,
    this.nhanXetSangLoc,
    this.nguoiSangLoc,
    this.ngaySangLoc,
    required this.lichSu,
    required this.ngayNop,
    required this.nguonUngTuyen,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UngVien.fromJson(Map<String, dynamic> json) {
    return UngVien(
      id: json['_id'] ?? '',
      hoTen: json['hoTen'] ?? '',
      email: json['email'] ?? '',
      soDienThoai: json['soDienThoai'] ?? '',
      ngaySinh: json['ngaySinh'] != null ? DateTime.parse(json['ngaySinh']) : null,
      gioiTinh: json['gioiTinh'],
      diaChi: json['diaChi'],
      jobId: json['jobId'] is String ? json['jobId'] : json['jobId']?['_id'] ?? '',
      cvUrl: json['cvUrl'] ?? '',
      cvFileName: json['cvFileName'] ?? '',
      thuUngTuyen: json['thuUngTuyen'],
      kinhNghiem: json['kinhNghiem'] ?? 0,
      kyNangNoiBat: List<String>.from(json['kyNangNoiBat'] ?? []),
      hocVan: json['hocVan'],
      trangThai: json['trangThai'] ?? 'Moi_nop',
      goiY: (json['goiY'] as List? ?? []).map((e) => GoiY.fromJson(e)).toList(),
      diemSangLoc: json['diemSangLoc']?.toDouble(),
      nhanXetSangLoc: json['nhanXetSangLoc'],
      nguoiSangLoc: json['nguoiSangLoc'],
      ngaySangLoc: json['ngaySangLoc'] != null ? DateTime.parse(json['ngaySangLoc']) : null,
      lichSu: (json['lichSu'] as List? ?? []).map((e) => LichSu.fromJson(e)).toList(),
      ngayNop: DateTime.parse(json['ngayNop'] ?? DateTime.now().toIso8601String()),
      nguonUngTuyen: json['nguonUngTuyen'] ?? 'Website',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'hoTen': hoTen,
      'email': email,
      'soDienThoai': soDienThoai,
      'ngaySinh': ngaySinh?.toIso8601String(),
      'gioiTinh': gioiTinh,
      'diaChi': diaChi,
      'jobId': jobId,
      'cvUrl': cvUrl,
      'cvFileName': cvFileName,
      'thuUngTuyen': thuUngTuyen,
      'kinhNghiem': kinhNghiem,
      'kyNangNoiBat': kyNangNoiBat,
      'hocVan': hocVan,
      'trangThai': trangThai,
      'goiY': goiY.map((e) => e.toJson()).toList(),
      'diemSangLoc': diemSangLoc,
      'nhanXetSangLoc': nhanXetSangLoc,
      'nguoiSangLoc': nguoiSangLoc,
      'ngaySangLoc': ngaySangLoc?.toIso8601String(),
      'lichSu': lichSu,
      'ngayNop': ngayNop.toIso8601String(),
      'nguonUngTuyen': nguonUngTuyen,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Helper methods
  String get trangThaiText {
    const map = {
      'Moi_nop': 'Mới nộp',
      'Dat_sang_loc': 'Đạt sàng lọc',
      'Khong_dat_sang_loc': 'Không đạt',
      'Cho_phong_van': 'Chờ phỏng vấn',
      'Dang_phong_van': 'Đang phỏng vấn',
      'Hoan_thanh_phong_van': 'Hoàn thành PV',
      'Da_tuyen': 'Đã tuyển',
      'Khong_tuyen': 'Không tuyển',
      'Da_nhan_viec': 'Đã nhận việc',
      'Tu_choi': 'Từ chối',
    };
    return map[trangThai] ?? trangThai;
  }
}
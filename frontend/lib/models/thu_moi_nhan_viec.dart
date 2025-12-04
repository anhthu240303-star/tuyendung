class MucLuongOffer {
  final int coban;
  final int phucap;
  final String? thuong;
  final String donVi;

  MucLuongOffer({
    required this.coban,
    this.phucap = 0,
    this.thuong,
    this.donVi = 'VND',
  });

  factory MucLuongOffer.fromJson(Map<String, dynamic> json) {
    return MucLuongOffer(
      coban: json['coban'] ?? 0,
      phucap: json['phucap'] ?? 0,
      thuong: json['thuong'],
      donVi: json['donVi'] ?? 'VND',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'coban': coban,
      'phucap': phucap,
      'thuong': thuong,
      'donVi': donVi,
    };
  }

  int get tongLuong => coban + phucap;
}

class ThoiGianThuViec {
  final int soThang;
  final int mucLuongThuViec;

  ThoiGianThuViec({
    required this.soThang,
    required this.mucLuongThuViec,
  });

  factory ThoiGianThuViec.fromJson(Map<String, dynamic> json) {
    return ThoiGianThuViec(
      soThang: json['soThang'] ?? 2,
      mucLuongThuViec: json['mucLuongThuViec'] ?? 85,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'soThang': soThang,
      'mucLuongThuViec': mucLuongThuViec,
    };
  }
}

class NguoiLienHe {
  final String? hoTen;
  final String? chucVu;
  final String? email;
  final String? soDienThoai;

  NguoiLienHe({
    this.hoTen,
    this.chucVu,
    this.email,
    this.soDienThoai,
  });

  factory NguoiLienHe.fromJson(Map<String, dynamic> json) {
    return NguoiLienHe(
      hoTen: json['hoTen'],
      chucVu: json['chucVu'],
      email: json['email'],
      soDienThoai: json['soDienThoai'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'hoTen': hoTen,
      'chucVu': chucVu,
      'email': email,
      'soDienThoai': soDienThoai,
    };
  }
}

class ThuMoiNhanViec {
  final String id;
  final String ungVienId;
  final String jobId;
  final String maOffer;
  final String viTri;
  final String? phongBan;
  final MucLuongOffer mucLuong;
  final DateTime ngayBatDau;
  final ThoiGianThuViec thoiGianThuViec;
  final List<String> dieuKhoan;
  final List<String> quyenLoi;
  final String diaDiemLamViec;
  final NguoiLienHe nguoiLienHe;
  final DateTime hanTraLoi;
  final String trangThai;
  final String? pdfUrl;
  final String? pdfFileName;
  final String taoBoi;
  final DateTime? ngayGui;
  final bool emailDaGui;
  final DateTime? ngayTraLoi;
  final String? lyDoTuChoi;
  final String? ghiChu;
  final DateTime createdAt;
  final DateTime updatedAt;

  ThuMoiNhanViec({
    required this.id,
    required this.ungVienId,
    required this.jobId,
    required this.maOffer,
    required this.viTri,
    this.phongBan,
    required this.mucLuong,
    required this.ngayBatDau,
    required this.thoiGianThuViec,
    required this.dieuKhoan,
    required this.quyenLoi,
    required this.diaDiemLamViec,
    required this.nguoiLienHe,
    required this.hanTraLoi,
    required this.trangThai,
    this.pdfUrl,
    this.pdfFileName,
    required this.taoBoi,
    this.ngayGui,
    this.emailDaGui = false,
    this.ngayTraLoi,
    this.lyDoTuChoi,
    this.ghiChu,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ThuMoiNhanViec.fromJson(Map<String, dynamic> json) {
    return ThuMoiNhanViec(
      id: json['_id'] ?? '',
      ungVienId: json['ungVienId'] is String
          ? json['ungVienId']
          : json['ungVienId']?['_id'] ?? '',
      jobId: json['jobId'] is String
          ? json['jobId']
          : json['jobId']?['_id'] ?? '',
      maOffer: json['maOffer'] ?? '',
      viTri: json['viTri'] ?? '',
      phongBan: json['phongBan'],
      mucLuong: MucLuongOffer.fromJson(json['mucLuong'] ?? {}),
      ngayBatDau: DateTime.parse(json['ngayBatDau']),
      thoiGianThuViec: ThoiGianThuViec.fromJson(json['thoiGianThuViec'] ?? {}),
      dieuKhoan: List<String>.from(json['dieuKhoan'] ?? []),
      quyenLoi: List<String>.from(json['quyenLoi'] ?? []),
      diaDiemLamViec: json['diaDiemLamViec'] ?? '',
      nguoiLienHe: NguoiLienHe.fromJson(json['nguoiLienHe'] ?? {}),
      hanTraLoi: DateTime.parse(json['hanTraLoi']),
      trangThai: json['trangThai'] ?? 'Cho_tra_loi',
      pdfUrl: json['pdfUrl'],
      pdfFileName: json['pdfFileName'],
      taoBoi: json['taoBoi'] ?? '',
      ngayGui: json['ngayGui'] != null ? DateTime.parse(json['ngayGui']) : null,
      emailDaGui: json['emailDaGui'] ?? false,
      ngayTraLoi: json['ngayTraLoi'] != null ? DateTime.parse(json['ngayTraLoi']) : null,
      lyDoTuChoi: json['lyDoTuChoi'],
      ghiChu: json['ghiChu'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'ungVienId': ungVienId,
      'jobId': jobId,
      'maOffer': maOffer,
      'viTri': viTri,
      'phongBan': phongBan,
      'mucLuong': mucLuong.toJson(),
      'ngayBatDau': ngayBatDau.toIso8601String(),
      'thoiGianThuViec': thoiGianThuViec.toJson(),
      'dieuKhoan': dieuKhoan,
      'quyenLoi': quyenLoi,
      'diaDiemLamViec': diaDiemLamViec,
      'nguoiLienHe': nguoiLienHe.toJson(),
      'hanTraLoi': hanTraLoi.toIso8601String(),
      'trangThai': trangThai,
      'pdfUrl': pdfUrl,
      'pdfFileName': pdfFileName,
      'taoBoi': taoBoi,
      'ngayGui': ngayGui?.toIso8601String(),
      'emailDaGui': emailDaGui,
      'ngayTraLoi': ngayTraLoi?.toIso8601String(),
      'lyDoTuChoi': lyDoTuChoi,
      'ghiChu': ghiChu,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get hetHan => DateTime.now().isAfter(hanTraLoi);
  bool get choTraLoi => trangThai == 'Cho_tra_loi';
  bool get daChapNhan => trangThai == 'Da_chap_nhan';

  String get trangThaiText {
    const map = {
      'Cho_tra_loi': 'Chờ trả lời',
      'Da_chap_nhan': 'Đã chấp nhận',
      'Da_tu_choi': 'Đã từ chối',
      'Het_han': 'Hết hạn',
      'Da_huy': 'Đã hủy',
    };
    return map[trangThai] ?? trangThai;
  }
}
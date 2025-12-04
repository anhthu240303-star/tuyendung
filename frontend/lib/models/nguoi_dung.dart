class NguoiDung {
  final String id;
  final String hoTen;
  final String email;
  final String vaiTro;
  final String? soDienThoai;
  final String? avatar;
  final String trangThai;
  final DateTime? lanDangNhapCuoi;
  final DateTime createdAt;
  final DateTime updatedAt;

  NguoiDung({
    required this.id,
    required this.hoTen,
    required this.email,
    required this.vaiTro,
    this.soDienThoai,
    this.avatar,
    required this.trangThai,
    this.lanDangNhapCuoi,
    required this.createdAt,
    required this.updatedAt,
  });

  factory NguoiDung.fromJson(Map<String, dynamic> json) {
    return NguoiDung(
      id: json['_id'] ?? '',
      hoTen: json['hoTen'] ?? '',
      email: json['email'] ?? '',
      vaiTro: json['vaiTro'] ?? 'HR',
      soDienThoai: json['soDienThoai'],
      avatar: json['avatar'],
      trangThai: json['trangThai'] ?? 'Hoat_dong',
      lanDangNhapCuoi: json['lanDangNhapCuoi'] != null
          ? DateTime.parse(json['lanDangNhapCuoi'])
          : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'hoTen': hoTen,
      'email': email,
      'vaiTro': vaiTro,
      'soDienThoai': soDienThoai,
      'avatar': avatar,
      'trangThai': trangThai,
      'lanDangNhapCuoi': lanDangNhapCuoi?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  NguoiDung copyWith({
    String? id,
    String? hoTen,
    String? email,
    String? vaiTro,
    String? soDienThoai,
    String? avatar,
    String? trangThai,
    DateTime? lanDangNhapCuoi,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return NguoiDung(
      id: id ?? this.id,
      hoTen: hoTen ?? this.hoTen,
      email: email ?? this.email,
      vaiTro: vaiTro ?? this.vaiTro,
      soDienThoai: soDienThoai ?? this.soDienThoai,
      avatar: avatar ?? this.avatar,
      trangThai: trangThai ?? this.trangThai,
      lanDangNhapCuoi: lanDangNhapCuoi ?? this.lanDangNhapCuoi,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Helper methods
  bool get isAdmin => vaiTro == 'Admin';
  bool get isHR => vaiTro == 'HR';
  bool get isInterviewer => vaiTro == 'Interviewer';
  bool get isActive => trangThai == 'Hoat_dong';
}
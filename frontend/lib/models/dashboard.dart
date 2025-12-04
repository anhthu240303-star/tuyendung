class TongQuan {
  final int tongTinTuyenDung;
  final int tinDangTuyen;
  final int tongUngVien;
  final int ungVienDaTuyen;
  final int tongLichPhongVan;
  final int tongOffer;

  TongQuan({
    required this.tongTinTuyenDung,
    required this.tinDangTuyen,
    required this.tongUngVien,
    required this.ungVienDaTuyen,
    required this.tongLichPhongVan,
    required this.tongOffer,
  });

  factory TongQuan.fromJson(Map<String, dynamic> json) {
    return TongQuan(
      tongTinTuyenDung: json['tongTinTuyenDung'] ?? 0,
      tinDangTuyen: json['tinDangTuyen'] ?? 0,
      tongUngVien: json['tongUngVien'] ?? 0,
      ungVienDaTuyen: json['ungVienDaTuyen'] ?? 0,
      tongLichPhongVan: json['tongLichPhongVan'] ?? 0,
      tongOffer: json['tongOffer'] ?? 0,
    );
  }
}

class UngVienStats {
  final int moiNop;
  final int datSangLoc;
  final int dangPhongVan;
  final int daTuyen;

  UngVienStats({
    required this.moiNop,
    required this.datSangLoc,
    required this.dangPhongVan,
    required this.daTuyen,
  });

  factory UngVienStats.fromJson(Map<String, dynamic> json) {
    return UngVienStats(
      moiNop: json['moiNop'] ?? 0,
      datSangLoc: json['datSangLoc'] ?? 0,
      dangPhongVan: json['dangPhongVan'] ?? 0,
      daTuyen: json['daTuyen'] ?? 0,
    );
  }
}

class ChiSo {
  final String tyLeChuyenDoi;
  final String tyLeSangLoc;
  final String thoiGianTrungBinh;

  ChiSo({
    required this.tyLeChuyenDoi,
    required this.tyLeSangLoc,
    required this.thoiGianTrungBinh,
  });

  factory ChiSo.fromJson(Map<String, dynamic> json) {
    return ChiSo(
      tyLeChuyenDoi: json['tyLeChuyenDoi'] ?? '0%',
      tyLeSangLoc: json['tyLeSangLoc'] ?? '0%',
      thoiGianTrungBinh: json['thoiGianTrungBinh'] ?? '0 ngày',
    );
  }
}

class SapToi {
  final int lichPhongVan;

  SapToi({
    required this.lichPhongVan,
  });

  factory SapToi.fromJson(Map<String, dynamic> json) {
    return SapToi(
      lichPhongVan: json['lichPhongVan'] ?? 0,
    );
  }
}

class OfferStats {
  final int tongSo;
  final int daChapNhan;
  final int choTraLoi;

  OfferStats({
    required this.tongSo,
    required this.daChapNhan,
    required this.choTraLoi,
  });

  factory OfferStats.fromJson(Map<String, dynamic> json) {
    return OfferStats(
      tongSo: json['tongSo'] ?? 0,
      daChapNhan: json['daChapNhan'] ?? 0,
      choTraLoi: json['choTraLoi'] ?? 0,
    );
  }
}

class DashboardData {
  final TongQuan tongQuan;
  final UngVienStats ungVien;
  final ChiSo chiSo;
  final SapToi sapToi;
  final OfferStats offer;

  DashboardData({
    required this.tongQuan,
    required this.ungVien,
    required this.chiSo,
    required this.sapToi,
    required this.offer,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      tongQuan: TongQuan.fromJson(json['tongQuan'] ?? {}),
      ungVien: UngVienStats.fromJson(json['ungVien'] ?? {}),
      chiSo: ChiSo.fromJson(json['chiSo'] ?? {}),
      sapToi: SapToi.fromJson(json['sapToi'] ?? {}),
      offer: OfferStats.fromJson(json['offer'] ?? {}),
    );
  }
}
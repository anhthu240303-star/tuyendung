// Vai trò người dùng
const VAI_TRO = {
  ADMIN: 'Admin',
  HR: 'HR',
  INTERVIEWER: 'Interviewer',
  CANDIDATE: 'Candidate'
};

// Trạng thái ứng viên
const TRANG_THAI_UNG_VIEN = {
  MOI_NOP: 'Moi_nop',
  DAT_SANG_LOC: 'Dat_sang_loc',
  KHONG_DAT_SANG_LOC: 'Khong_dat_sang_loc',
  CHO_PHONG_VAN: 'Cho_phong_van',
  DANG_PHONG_VAN: 'Dang_phong_van',
  HOAN_THANH_PHONG_VAN: 'Hoan_thanh_phong_van',
  DA_TUYEN: 'Da_tuyen',
  KHONG_TUYEN: 'Khong_tuyen',
  DA_NHAN_VIEC: 'Da_nhan_viec',
  TU_CHOI: 'Tu_choi'
};

// Trạng thái tin tuyển dụng
const TRANG_THAI_TIN = {
  NHAP: 'Nhap',
  DANG_TUYEN: 'Dang_tuyen',
  TAM_DUNG: 'Tam_dung',
  DA_DONG: 'Da_dong'
};

// Trạng thái lịch phỏng vấn
const TRANG_THAI_LICH_PV = {
  CHO_XAC_NHAN: 'Cho_xac_nhan',
  DA_XAC_NHAN: 'Da_xac_nhan',
  TU_CHOI: 'Tu_choi',
  HOAN_THANH: 'Hoan_thanh',
  HUY: 'Huy'
};

// Hình thức phỏng vấn
const HINH_THUC_PHONG_VAN = {
  TRUC_TIEP: 'Truc_tiep',
  ONLINE: 'Online',
  DIEN_THOAI: 'Dien_thoai'
};

// Vai trò trong hội đồng
const VAI_TRO_HOI_DONG = {
  CHU_TICH: 'Chu_tich',
  THU_KY: 'Thu_ky',
  THANH_VIEN: 'Thanh_vien'
};

// Kết quả tuyển dụng
const KET_QUA_TUYEN_DUNG = {
  PASS: 'Pass',
  FAIL: 'Fail',
  PENDING: 'Pending'
};

// Loại hành động log
const LOAI_HANH_DONG = {
  TAO_MOI: 'Tao_moi',
  CAP_NHAT: 'Cap_nhat',
  XOA: 'Xoa',
  THAY_DOI_TRANG_THAI: 'Thay_doi_trang_thai',
  GUI_EMAIL: 'Gui_email',
  DANH_GIA: 'Danh_gia',
  PHONG_VAN: 'Phong_van'
};

// Loại đối tượng log
const DOI_TUONG_LOG = {
  NGUOI_DUNG: 'NguoiDung',
  TIN_TUYEN_DUNG: 'TinTuyenDung',
  UNG_VIEN: 'UngVien',
  LICH_PHONG_VAN: 'LichPhongVan',
  DANH_GIA: 'DanhGia',
  OFFER: 'Offer'
};

module.exports = {
  VAI_TRO,
  TRANG_THAI_UNG_VIEN,
  TRANG_THAI_TIN,
  TRANG_THAI_LICH_PV,
  HINH_THUC_PHONG_VAN,
  VAI_TRO_HOI_DONG,
  KET_QUA_TUYEN_DUNG,
  LOAI_HANH_DONG,
  DOI_TUONG_LOG
};
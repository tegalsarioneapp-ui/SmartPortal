// storage-keys.ts — Auto-generated SmartPortal RT
// Semua localStorage keys terdaftar di sini

export const STORAGE_KEYS = {
  ADMIN_RIGHT_PANEL_STATE: "admin_right_panel_state",
  BEN_IURAN: "ben_iuran",
  BEN_KOMPONEN: "ben_komponen",
  BEN_SALDO_AWAL: "ben_saldo_awal",
  DATA_WARGA_MANDIRI: "data_warga_mandiri",
  DB_ADUAN: "db_aduan",
  DB_ARISAN: "db_arisan",
  DB_BANTUAN: "db_bantuan",
  DB_BERITA: "db_berita",
  DB_DARURAT: "db_darurat",
  DB_INFO_ARISAN: "db_info_arisan",
  DB_IURAN: "db_iuran",
  DB_JENIS_IURAN: "db_jenis_iuran",
  DB_KAS: "db_kas",
  DB_KOMENTAR_BERITA: "db_komentar_berita",
  DB_KOP_PINJAM: "db_kop_pinjam",
  DB_KOP_SIMPAN: "db_kop_simpan",
  DB_KOPERASI: "db_koperasi",
  DB_NOTULEN: "db_notulen",
  DB_PASSWORDS: "db_passwords",
  DB_PENGUMUMAN: "db_pengumuman",
  DB_PENGURUS: "db_pengurus",
  DB_PENGURUS_DESC: "db_pengurus_desc",
  DB_PENGURUS_PDF: "db_pengurus_pdf",
  DB_REQ_SURAT: "db_req_surat",
  DB_REQ_SURAT_V2: "db_req_surat_v2",
  DB_RIWAYAT_EKSPOR: "db_riwayat_ekspor",
  DB_SALDO_AWAL: "db_saldo_awal",
  DB_SETTINGS: "db_settings",
  DB_SURAT: "db_surat",
  DB_WARGA: "db_warga",
  DB_WARGA_BIOMETRIC: "db_warga_biometric",
  FT_INSTALL_DISMISSED_TS: "ft-install-dismissed-ts",
  GT_LOCAL_BERITA_READ: "gt_local_berita_read",
  GT_LOCAL_LASTVIEW: "gt_local_lastView",
  GT_LOCAL_SESSION: "gt_local_session",
  GT_NEWS_BOOKMARKS: "gt_news_bookmarks",
  GT_NOTIF_READ: "gt_notif_read",
  GT_THEME: "gt_theme",
  ISLOGGEDIN: "isLoggedIn",
  KEGIATAN: "kegiatan",
  LOGGEDINAS: "loggedInAs",
  MUTASI: "mutasi",
  RIGHT_PANEL_STATE: "right_panel_state",
  SIDEBAR_STATE: "sidebar_state",
  SURAT_COUNTER: "surat_counter",
  TS_KAS: "ts_kas",
  TS_LAST_SYNC: "ts_last_sync",
  TS_PENGURUS_PDF: "ts_pengurus_pdf",
  TS_RIWAYAT_EKSPOR: "ts_riwayat_ekspor",
  TS_WARGA: "ts_warga",
  TS_WARGA_BIOMETRIC: "ts_warga_biometric",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn("[Storage] Parse error:", key);
    return fallback;
  }
}

export function storageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("[Storage] Write error:", key, e);
    return false;
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("[Storage] Remove error:", key, e);
  }
}

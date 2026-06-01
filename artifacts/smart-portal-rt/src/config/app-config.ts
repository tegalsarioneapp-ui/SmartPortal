// app-config.ts — SmartPortal RT
export const APP_CONFIG = {
  RT_NAME    : (import.meta.env.VITE_RT_NAME      as string) ?? "RT 005",
  RW_NAME    : (import.meta.env.VITE_RW_NAME      as string) ?? "RW 001",
  KELURAHAN  : (import.meta.env.VITE_KELURAHAN    as string) ?? "Tegalsari",
  KECAMATAN  : "Candisari",
  KOTA       : "Semarang",
  API_URL    : (import.meta.env.VITE_API_URL      as string) ?? "",
  VERSION    : "2.0.0",
  IURAN_BULANAN : 30_000,
  LOCALE     : "id-ID",
  SESSION_KEY: "gt_local_session",
  SESSION_HOURS: 8,
} as const;

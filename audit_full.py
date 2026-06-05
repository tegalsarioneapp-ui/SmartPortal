import os, re, json

ROOT  = "artifacts/smart-portal-rt"
IDX   = os.path.join(ROOT, "index.html")
PUB   = os.path.join(ROOT, "public")

with open(IDX, "r", encoding="utf-8") as f:
    html = f.read()

print("=" * 60)
print("AUDIT FULL — SmartPortal RT 005")
print("=" * 60)

# ══════════════════════════════════════════
# 1. FITUR UTAMA — semua ada?
# ══════════════════════════════════════════
print("\n[1] CEK FITUR UTAMA")
features = {
    "Login Universal"        : "prosesLoginUniversal",
    "Portal Warga"           : 'id="view-warga"',
    "Portal Admin"           : 'id="view-admin"',
    "Portal Bendahara"       : 'id="view-bendahara"',
    "Data KK/Warga"          : 'id="admin-datakk"',
    "Iuran/Dues"             : "iuran",
    "Kas Ledger"             : "kas",
    "Surat/Dokumen"          : "surat",
    "Koperasi"               : "koperasi",
    "Kontak Darurat"         : "darurat",
    "Laporan Bulanan"        : "cetakLaporanBulanan",
    "Cetak Kuitansi"         : "downloadKuitansiIuran",
    "printViaIframe"         : "printViaIframe",
    "SSE/Realtime"           : "EventSource",
    "Service Worker"         : "serviceWorker",
    "PWA Manifest"           : "manifest.json",
    "Export XLSX"            : "XLSX",
    "Export PDF"             : "jsPDF",
    "SweetAlert2"            : "Swal",
    "Select2"                : "Select2",
}
missing = []
for name, pattern in features.items():
    found = pattern in html
    status = "OK" if found else "MISSING"
    if not found: missing.append(name)
    print(f"  [{status:7}] {name}")

# ══════════════════════════════════════════
# 2. FUNGSI KRITIS — syntax check
# ══════════════════════════════════════════
print("\n[2] CEK FUNGSI KRITIS")
funcs = [
    "prosesLoginUniversal",
    "printViaIframe",
    "downloadKuitansiIuran",
    "cetakLaporanBulanan",
    "openAdminTab",
    "loadAdminDashboard",
    "simpanDataKK",
    "hapusDataKK",
    "prosesIuran",
    "simpanKas",
    "generateSurat",
    "showPortal",
    "logoutUniversal",
]
for fn in funcs:
    count = html.count(fn)
    defined = bool(re.search(rf'function\s+{fn}|{fn}\s*=\s*function|window\.{fn}\s*=', html))
    status = "OK" if defined else ("CALLED" if count > 0 else "MISSING")
    print(f"  [{status:7}] {fn} ({count}x total)")

# ══════════════════════════════════════════
# 3. CEK KONSISTENSI DATA
# ══════════════════════════════════════════
print("\n[3] CEK KONSISTENSI localStorage KEYS")
ls_keys = re.findall(r'localStorage\.(?:get|set|remove)Item\(["\']([^"\']+)["\']', html)
unique_keys = sorted(set(ls_keys))
print(f"  Total unique keys: {len(unique_keys)}")
# Cek duplikat typo
for k in unique_keys:
    similar = [x for x in unique_keys if x != k and (k in x or x in k)]
    if similar:
        print(f"  [WARN] Possible duplicate: '{k}' ~ {similar}")

# ══════════════════════════════════════════
# 4. CEK PUBLIC FILES
# ══════════════════════════════════════════
print("\n[4] CEK PUBLIC FILES")
pub_files = os.listdir(PUB)
# File yang tidak perlu di public
dev_files = [f for f in pub_files if f.endswith((".py", ".sh", ".bat", ".ps1", ".mjs", ".bak"))]
if dev_files:
    for f in dev_files:
        print(f"  [WARN] Dev file di public: {f}")
else:
    print("  [OK] Tidak ada dev file di public")

# ══════════════════════════════════════════
# 5. CEK BROKEN LINKS/REFERENCES
# ══════════════════════════════════════════
print("\n[5] CEK REFERENSI FILE")
refs = re.findall(r'(?:src|href)=["\'](?!http|//|data:|#|mailto)([^"\']+)["\']', html)
missing_refs = []
for ref in set(refs):
    ref_clean = ref.split("?")[0].split("#")[0]
    if not ref_clean or ref_clean.startswith("{"): continue
    full = os.path.join(ROOT, ref_clean.lstrip("/"))
    pub_path = os.path.join(PUB, os.path.basename(ref_clean))
    if not os.path.exists(full) and not os.path.exists(pub_path):
        missing_refs.append(ref_clean)

if missing_refs:
    for r in sorted(set(missing_refs))[:20]:
        print(f"  [WARN] Referensi tidak ditemukan: {r}")
else:
    print("  [OK] Semua referensi file ditemukan")

# ══════════════════════════════════════════
# 6. CEK UKURAN index.html
# ══════════════════════════════════════════
print("\n[6] CEK UKURAN")
sz = os.path.getsize(IDX)
lines = html.count("\n")
print(f"  index.html: {sz/1024:.0f} KB / {lines:,} baris")
if sz > 900 * 1024:
    print("  [WARN] File sangat besar (>900KB) — pertimbangkan split")
elif sz > 500 * 1024:
    print("  [NOTE] File besar (>500KB)")
else:
    print("  [OK] Ukuran wajar")

# ══════════════════════════════════════════
# 7. SUMMARY
# ══════════════════════════════════════════
print("\n[7] SUMMARY")
print(f"  Fitur missing  : {len(missing)}")
if missing:
    for m in missing:
        print(f"    - {m}")
print(f"  Dev file public: {len(dev_files)}")
print(f"  Ref broken     : {len(set(missing_refs)) if missing_refs else 0}")
print("=" * 60)

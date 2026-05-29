import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=" * 60)

# ══ CEK 1: wfb-keluar-btn posisi dalam aside ══
idx_aside      = html.find('<aside class="warga-fb-left no-print">')
idx_aside_end  = html.find('</aside>', idx_aside)
idx_wfb_btn    = html.find('<button class="wfb-keluar-btn"')

print(f"[1] warga-fb-left aside mulai : {idx_aside}")
print(f"[1] wfb-keluar-btn pos        : {idx_wfb_btn}")
print(f"[1] warga-fb-left aside akhir : {idx_aside_end}")
if idx_aside != -1 and idx_aside < idx_wfb_btn < idx_aside_end:
    print("[1] OK: Tombol ADA di dalam aside sidebar!")
else:
    print("[1] !! MASALAH: Tombol TIDAK di dalam aside!")

# Tampilkan area sekitar tombol
print(f"\n[1] Konteks tombol wfb-keluar-btn:")
print(html[idx_wfb_btn-150:idx_wfb_btn+200])

# ══ CEK 2: sp-keluar-btn posisi dalam drawer ══
idx_drawer     = html.find('<div id="gt-sp-drawer">')
idx_drawer_end = 799907  # sudah diketahui dari audit sebelumnya
idx_sp_btn     = html.find('<button class="sp-keluar-btn"')

print(f"\n[2] gt-sp-drawer mulai : {idx_drawer}")
print(f"[2] sp-keluar-btn pos  : {idx_sp_btn}")
print(f"[2] gt-sp-drawer akhir : {idx_drawer_end}")
if idx_drawer != -1 and idx_drawer < idx_sp_btn < idx_drawer_end:
    print("[2] OK: Tombol ADA di dalam drawer!")
else:
    print("[2] !! MASALAH: Tombol TIDAK di dalam drawer!")

# ══ CEK 3: gtKeluar fungsi lengkap ══
print(f"\n[3] window.gtKeluar fungsi:")
fn = re.search(r'window\.gtKeluar\s*=\s*function\s*\(\)\s*\{.*?\};', html, re.DOTALL)
if fn:
    clean = re.sub(r'\s+', ' ', fn.group(0)).strip()
    print(f"OK: {clean[:400]}")
else:
    print("!! gtKeluar NOT FOUND")

# ══ CEK 4: alias window.logout = window.gtKeluar ══
print(f"\n[4] alias window.logout:")
alias = re.search(r'window\.logout\s*=\s*window\.gtKeluar', html)
if alias:
    print(f"OK: pos {alias.start()}")
else:
    print("!! alias tidak ditemukan")

# ══ CEK 5: tidak ada lagi btn-logout di HTML element ══
print(f"\n[5] Sisa class btn-logout di HTML:")
btns = re.findall(r'class="[^"]*btn-logout[^"]*"', html)
if btns:
    print(f"!! Masih ada {len(btns)}x: {btns}")
else:
    print("OK: Tidak ada btn-logout HTML")

# ══ CEK 6: onclick gtKeluar terpanggil ══
print(f"\n[6] onclick gtKeluar:")
calls = re.findall(r'onclick="[^"]*gtKeluar[^"]*"', html)
for c in calls:
    print(f"  {c}")
print(f"Total: {len(calls)}x")

# ══ CEK 7: semua elemen kritis ══
print(f"\n[7] Elemen kritis:")
checks = {
    "login-screen"    : 'id="login-screen"',
    "login-form-view" : 'id="login-form-view"',
    "main-app"        : 'id="main-app"',
    "view-warga"      : 'id="view-warga"',
    "view-admin"      : 'id="view-admin"',
    "view-bendahara"  : 'id="view-bendahara"',
    "view-koperasi"   : 'id="view-koperasi"',
    "BukaPortal"      : 'BukaPortal',
    "prosesLoginUniv" : 'prosesLoginUniversal',
    "openWargaTab"    : 'openWargaTab',
    "openAdminTab"    : 'openAdminTab',
    "openBenTab"      : 'openBenTab',
    "openKopTab"      : 'openKopTab',
    "gtKeluar"        : 'window.gtKeluar',
    "GT_FLUSH_NOW"    : 'GT_FLUSH_NOW',
    "gtRestoreSession": 'gtRestoreSession',
}
all_ok = True
for label, needle in checks.items():
    found = needle in html
    if not found:
        all_ok = False
    print(f"  {'OK' if found else '!!'} {label:20s}: {'ADA' if found else 'HILANG'}")

# ══ CEK 8: JS syntax ══
print(f"\n[8] JS Syntax check:")
import subprocess, re as re2
scripts = re2.findall(r'<script[^>]*>(.*?)</script>', html, re2.DOTALL)
all_js = "\n".join(scripts)
with open("_temp_verify.js", "w", encoding="utf-8") as f:
    f.write(all_js)
result = subprocess.run(["node","--check","_temp_verify.js"], capture_output=True, text=True)
if result.stderr:
    print(f"!! ERROR: {result.stderr[:300]}")
else:
    print("OK: JS syntax valid!")

print("=" * 60)
print(f"\n{'✅ SEMUA OK - SIAP PUSH!' if all_ok else '❌ ADA MASALAH - JANGAN PUSH DULU!'}")
print("\nDone.")

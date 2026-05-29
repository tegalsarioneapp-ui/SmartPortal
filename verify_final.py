import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

all_ok = True

# CEK 1: Tombol wfb-keluar-btn dalam aside
idx_aside     = html.find('<aside class="warga-fb-left no-print">')
idx_aside_end = html.find('</aside>', idx_aside)
idx_wfb_btn   = html.find('<button class="wfb-keluar-btn"')
ok1 = idx_aside < idx_wfb_btn < idx_aside_end
if not ok1: all_ok = False
print(f"[1] wfb-keluar-btn dalam aside  : {'OK' if ok1 else '!!'}")

# CEK 2: Tombol sp-keluar-btn dalam drawer
idx_drawer    = html.find('<div id="gt-sp-drawer">')
idx_sp_btn    = html.find('<button class="sp-keluar-btn"')
idx_sp_footer = html.find('<div class="sp-footer">')
# Hitung drawer end
depth = 0
i = idx_drawer
idx_drawer_end = -1
tag_open = re.search(r'<div[^>]*id="gt-sp-drawer"[^>]*>', html)
if tag_open:
    i = tag_open.start()
    while i < tag_open.start() + 50000:
        if html[i:i+4] == '<div': depth += 1
        elif html[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                idx_drawer_end = i + 6
                break
        i += 1
ok2 = idx_drawer < idx_sp_btn < idx_sp_footer < idx_drawer_end
if not ok2: all_ok = False
print(f"[2] sp-keluar-btn dalam drawer  : {'OK' if ok2 else '!!'}")
print(f"    drawer: {idx_drawer} < btn: {idx_sp_btn} < footer: {idx_sp_footer} < end: {idx_drawer_end}")

# CEK 3: gtKeluar fungsi ada
ok3 = 'window.gtKeluar = function()' in html
if not ok3: all_ok = False
print(f"[3] window.gtKeluar fungsi      : {'OK' if ok3 else '!!'}")

# CEK 4: alias window.logout
ok4 = 'window.logout = window.gtKeluar' in html
if not ok4: all_ok = False
print(f"[4] alias window.logout         : {'OK' if ok4 else '!!'}")

# CEK 5: tidak ada btn-logout HTML
btns = re.findall(r'class="[^"]*btn-logout[^"]*"', html)
ok5 = len(btns) == 0
if not ok5: all_ok = False
print(f"[5] btn-logout HTML bersih      : {'OK' if ok5 else f'!! masih ada {len(btns)}x'}")

# CEK 6: onclick calls
calls = re.findall(r'onclick="[^"]*gtKeluar[^"]*"', html)
ok6 = len(calls) == 2
if not ok6: all_ok = False
print(f"[6] onclick gtKeluar = 2x       : {'OK' if ok6 else f'!! {len(calls)}x'} ({calls})")

# CEK 7: Tidak ada orphan logout body
orphan = re.search(r';\s*if\s*\(typeof\s+window\.GT_FLUSH_NOW.*?doReload.*?\};', html, re.DOTALL)
ok7 = orphan is None
if not ok7: all_ok = False
print(f"[7] Tidak ada orphan logout     : {'OK' if ok7 else '!! masih ada orphan!'}")

# CEK 8: Elemen kritis
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
    "lupaPassword"    : 'window.lupaPassword',
    "loginSebagaiTamu": 'window.loginSebagaiTamu',
}
print(f"\n[8] Elemen kritis:")
for label, needle in checks.items():
    found = needle in html
    if not found: all_ok = False
    print(f"    {'OK' if found else '!!'} {label:20s}: {'ADA' if found else 'HILANG'}")

# CEK 9: JS Syntax
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js  = "\n".join(scripts)
with open("_verify_final.js", "w", encoding="utf-8") as f:
    f.write(all_js)
result = subprocess.run(["node","--check","_verify_final.js"], capture_output=True, text=True)
ok9 = not bool(result.stderr)
if not ok9: all_ok = False
print(f"\n[9] JS Syntax                   : {'OK' if ok9 else '!! ' + result.stderr[:200]}")

print("=" * 55)
print(f"HASIL: {'✅ 100% OK - SIAP PUSH!' if all_ok else '❌ ADA MASALAH - JANGAN PUSH!'}")
print("=" * 55)

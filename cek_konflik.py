import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# CEK: Isi window.bukaFormLogin (yang override)
print("=== window.bukaFormLogin ===")
fn = re.search(
    r'window\.bukaFormLogin\s*=\s*function\s*\(\s*\).*?(?=\n\s*window\.|\n\s*function |\}\s*\n\s*\n)',
    html, re.DOTALL
)
if fn:
    clean = re.sub(r'\s+', ' ', fn.group(0)).strip()
    print(clean[:800])
else:
    print("!! tidak ditemukan")

# CEK: t1-splash HTML
print("\n=== t1-splash HTML ===")
idx = html.find('id="t1-splash"')
if idx > -1:
    print(html[idx:idx+300])

# CEK: Apakah splash-view muncul setelah t1-splash dismiss
print("\n=== URUTAN SPLASH ===")
idx_t1     = html.find('id="t1-splash"')
idx_splash = html.find('id="splash-view"')
idx_login  = html.find('id="login-screen"')
idx_main   = html.find('id="main-app"')
print(f"t1-splash   : {idx_t1}")
print(f"splash-view : {idx_splash}")
print(f"login-screen: {idx_login}")
print(f"main-app    : {idx_main}")

# CEK: Apakah t1-splash menutupi splash-view
print("\n=== t1-splash STYLE ===")
m = re.search(r'id="t1-splash"[^>]*>', html)
if m:
    print(m.group(0)[:400])

# CEK: gtRestoreSession — apakah langsung hide splash-view
print("\n=== gtRestoreSession FULL ===")
fn2 = re.search(
    r'window\.gtRestoreSession\s*=\s*function.*?(?=\nwindow\.|\Z)',
    html, re.DOTALL
)
if fn2:
    clean = re.sub(r'\s+', ' ', fn2.group(0)).strip()
    print(clean[:1000])

print("\nDone.")

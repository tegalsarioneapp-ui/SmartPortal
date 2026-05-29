import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# CEK 1: Fungsi yang show login-form-view
print("=== CEK 1: YANG MENAMPILKAN login-form-view ===")
hits = re.findall(r'.{0,80}login-form-view.{0,80}', html)
for h in hits:
    clean = re.sub(r'\s+', ' ', h).strip()
    print(f"  {clean}")

# CEK 2: Fungsi showLoginForm / tampilLogin / dll
print("\n=== CEK 2: FUNGSI SHOW LOGIN ===")
fns = re.findall(
    r'(function\s+\w*[Ll]ogin\w*|window\.\w*[Ll]ogin\w*\s*=\s*function)[^{]*\{[^}]{0,300}',
    html
)
for f in fns[:10]:
    clean = re.sub(r'\s+', ' ', f).strip()
    print(f"  {clean[:200]}")

# CEK 3: splash screen / tombol masuk
print("\n=== CEK 3: SPLASH / TOMBOL MASUK ===")
splash = re.findall(r'.{0,60}(splash|btnMasuk|showLogin|login-form-view).{0,60}', html)
for s in splash[:15]:
    clean = re.sub(r'\s+', ' ', s).strip()
    print(f"  {clean}")

# CEK 4: DOMContentLoaded — apa yang dijalankan saat load
print("\n=== CEK 4: DOMContentLoaded ===")
dom = re.search(r'DOMContentLoaded.*?\{(.{0,1000})', html, re.DOTALL)
if dom:
    clean = re.sub(r'\s+', ' ', dom.group(1)).strip()
    print(clean[:600])

# CEK 5: gtRestoreSession
print("\n=== CEK 5: gtRestoreSession ===")
fn = re.search(r'(function gtRestoreSession|window\.gtRestoreSession\s*=\s*function).*?\n\};', html, re.DOTALL)
if fn:
    clean = re.sub(r'\s+', ' ', fn.group(0)).strip()
    print(clean[:500])
else:
    print("!! gtRestoreSession tidak ditemukan")

print("\nDone.")

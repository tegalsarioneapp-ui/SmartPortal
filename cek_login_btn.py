import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# CEK 1: Semua tombol di area login
print("=== CEK 1: TOMBOL DI AREA LOGIN ===")
idx_login = html.find('id="login-screen"')
idx_login_end = html.find('id="main-app"', idx_login)
login_area = html[idx_login:idx_login_end]

buttons = re.findall(r'<button[^>]*>.*?</button>', login_area, re.DOTALL)
for i, b in enumerate(buttons):
    clean = re.sub(r'\s+', ' ', b).strip()
    print(f"\n[{i+1}] {clean[:200]}")

# CEK 2: Form login universal
print("\n=== CEK 2: FORM LOGIN ===")
form = re.search(r'<form[^>]*id="login-form"[^>]*>.*?</form>', html, re.DOTALL)
if form:
    clean = re.sub(r'\s+', ' ', form.group(0)).strip()
    print(clean[:500])
else:
    print("!! form#login-form tidak ditemukan")
    # Cari form apapun di login area
    forms = re.findall(r'<form[^>]*>.*?</form>', login_area, re.DOTALL)
    print(f"Form lain di login area: {len(forms)}x")
    for f in forms:
        print(re.sub(r'\s+', ' ', f).strip()[:200])

# CEK 3: prosesLoginUniversal onclick
print("\n=== CEK 3: ONCLICK LOGIN ===")
calls = re.findall(r'onclick="[^"]*prosesLogin[^"]*"', html)
for c in calls:
    print(f"  {c}")
submits = re.findall(r'onsubmit="[^"]*"', login_area)
for s in submits:
    print(f"  {s}")

# CEK 4: login-form-view
print("\n=== CEK 4: LOGIN-FORM-VIEW ===")
idx_lfv = html.find('id="login-form-view"')
print(f"pos: {idx_lfv}")
print(html[idx_lfv:idx_lfv+800])

# CEK 5: display/visibility CSS
print("\n=== CEK 5: CSS LOGIN SCREEN ===")
css_hits = re.findall(r'#login-screen[^{]*\{[^}]*\}', html)
for c in css_hits[:5]:
    print(re.sub(r'\s+', ' ', c).strip()[:200])

print("\nDone.")

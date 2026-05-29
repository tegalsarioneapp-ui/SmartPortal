import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=== 1. TOMBOL LOGIN ===")
logins = re.findall(r'<button[^>]*(?:login|buka|submit)[^>]*>.*?</button>', html, re.DOTALL)
for b in logins[:5]:
    clean = re.sub(r'\s+', ' ', b).strip()
    print(clean[:200])

print("\n=== 2. SEMUA fa-bars TERSISA ===")
bars = re.findall(r'.{0,300}fa-bars.{0,300}', html)
for i, b in enumerate(bars):
    clean = re.sub(r'\s+', ' ', b).strip()
    print(f"\n[{i}] {clean}")

print("\n=== 3. HEADER / NAVBAR AREA ===")
headers = re.findall(r'<(?:header|nav)[^>]*>.*?</(?:header|nav)>', html, re.DOTALL)
for i, h in enumerate(headers[:5]):
    clean = re.sub(r'\s+', ' ', h).strip()
    print(f"\n[{i}] {clean[:400]}")

print("\n=== 4. AREA SEKITAR gt-sidebar-toggle-btn ===")
idx = html.find('gt-sidebar-toggle-btn')
if idx > -1:
    print("MASIH ADA gt-sidebar-toggle-btn!")
    print(html[idx-200:idx+200])
else:
    print("gt-sidebar-toggle-btn sudah tidak ada")

print("\n=== 5. TOMBOL DENGAN fa-bars CONTEXT ===")
# Cari 500 karakter sebelum dan sesudah fa-bars
for m in re.finditer(r'fa-bars', html):
    start = max(0, m.start()-300)
    end = min(len(html), m.end()+300)
    snippet = html[start:end]
    clean = re.sub(r'\s+', ' ', snippet).strip()
    print(f"\n--- fa-bars di posisi {m.start()} ---")
    print(clean[:500])

print("\n=== 6. LOGIN FORM VIEW ===")
idx2 = html.find('login-form-view')
if idx2 > -1:
    snippet = html[idx2:idx2+800]
    clean = re.sub(r'\s+', ' ', snippet).strip()
    print(clean[:600])

print("\nDone.")

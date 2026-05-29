import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=== SEMUA HAMBURGER / TOGGLE BUTTON ===")
# Cari semua button dengan fa-bars atau toggle
buttons = re.findall(r'<button[^>]*>(?:[^<]*<[^>]*>)*[^<]*fa-bars[^<]*(?:<[^>]*>[^<]*)*</button>', html, re.DOTALL)
for i, b in enumerate(buttons):
    clean = re.sub(r'\s+', ' ', b).strip()
    print(f"\n[{i}] {clean[:300]}")

print("\n=== SEMUA ELEMEN DENGAN fa-bars ===")
bars = re.findall(r'.{0,200}fa-bars.{0,200}', html)
for i, b in enumerate(bars):
    clean = re.sub(r'\s+', ' ', b).strip()
    print(f"\n[{i}] {clean}")

print("\n=== FUNGSI toggleSidebar LENGKAP ===")
match = re.search(r'(window\.toggleSidebar\s*=\s*function|function toggleSidebar)[^}]*\}', html, re.DOTALL)
if match:
    print(match.group(0)[:800])
else:
    print("TIDAK DITEMUKAN")

print("\n=== SEMUA ONCLICK YANG ADA toggleSidebar ===")
toggles = re.findall(r'.{0,150}toggleSidebar.{0,150}', html)
for t in toggles:
    clean = re.sub(r'\s+', ' ', t).strip()
    print(clean)

print("\nDone.")

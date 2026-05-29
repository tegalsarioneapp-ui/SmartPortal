import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cari SEMUA posisi btn-logout CSS
print("=== CSS .btn-logout (posisi semua rule) ===")
rules = list(re.finditer(r'\.btn-logout[^{]*\{[^}]*\}', html, re.DOTALL))
for i, r in enumerate(rules):
    clean = re.sub(r'\s+', ' ', r.group(0)).strip()
    print(f"[{i+1}] pos {r.start()}: {clean[:150]}")

# 2. Cari tombol HTML btn-logout
print("\n=== TOMBOL HTML btn-logout ===")
btns = list(re.finditer(r'<button[^>]*btn-logout[^>]*>.*?</button>', html, re.DOTALL))
for i, b in enumerate(btns):
    clean = re.sub(r'\s+', ' ', b.group(0)).strip()
    print(f"[{i+1}] pos {b.start()}: {clean[:200]}")

# 3. Cari fungsi logout
print("\n=== FUNGSI logout ===")
fns = list(re.finditer(r'(?:window\.)?logout\s*=\s*function[^{]*\{.*?\};', html, re.DOTALL))
for i, f in enumerate(fns):
    clean = re.sub(r'\s+', ' ', f.group(0)).strip()
    print(f"[{i+1}] pos {f.start()}: {clean[:300]}")

# 4. Cari sidebar warga-fb-left - tampilkan area bawah (user card + nav items)
print("\n=== WARGA-FB-LEFT STRUKTUR ===")
idx = html.find('class="warga-fb-left no-print"')
if idx > -1:
    chunk = html[idx:idx+6000]
    print(chunk[:4000])

# 5. Cari sidebar admin - nav items
print("\n=== ADMIN SIDEBAR STRUKTUR ===")
idx2 = html.find('id="view-admin"')
if idx2 > -1:
    chunk2 = html[idx2:idx2+3000]
    print(chunk2[:2000])

# 6. Cari mobile bottom nav
print("\n=== MOBILE BOTTOM NAV ===")
mob = re.search(r'wfb-mobile-nav.*?</nav>', html, re.DOTALL)
if mob:
    clean = re.sub(r'\s+', ' ', mob.group(0)).strip()
    print(clean[:500])

print("\nDone.")

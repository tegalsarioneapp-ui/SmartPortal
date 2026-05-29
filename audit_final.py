import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cari tombol HTML wfb-keluar-btn di DOM
print("=== TOMBOL HTML wfb-keluar-btn ===")
hits = list(re.finditer(r'wfb-keluar-btn', html))
print(f"Total: {len(hits)}x")
for h in hits:
    pos = h.start()
    ctx = html[pos-100:pos+300]
    clean = re.sub(r'\s+', ' ', ctx).strip()
    print(f"\npos {pos}:")
    print(clean[:400])

# 2. Cari tombol HTML sp-keluar-btn di DOM
print("\n=== TOMBOL HTML sp-keluar-btn ===")
hits2 = list(re.finditer(r'sp-keluar-btn', html))
print(f"Total: {len(hits2)}x")
for h in hits2:
    pos = h.start()
    ctx = html[pos-100:pos+300]
    clean = re.sub(r'\s+', ' ', ctx).strip()
    print(f"\npos {pos}:")
    print(clean[:400])

# 3. Cek posisi tombol relative terhadap warga-fb-left
print("\n=== POSISI RELATIF SIDEBAR ===")
idx_sidebar = html.find('class="warga-fb-left no-print"')
idx_btn = html.find('<button class="wfb-keluar-btn"')
idx_sidebar_end = html.find('</aside>', idx_sidebar)
print(f"warga-fb-left mulai : {idx_sidebar}")
print(f"wfb-keluar-btn      : {idx_btn}")
print(f"warga-fb-left akhir : {idx_sidebar_end}")
if idx_sidebar < idx_btn < idx_sidebar_end:
    print("OK: Tombol ADA di dalam sidebar!")
else:
    print("!! MASALAH: Tombol TIDAK di dalam sidebar!")

# 4. Cek posisi tombol relative terhadap gt-sp-drawer
print("\n=== POSISI RELATIF MOBILE DRAWER ===")
idx_drawer = html.find('id="gt-sp-drawer"')
idx_drawer_end = html.find('</div>', idx_drawer + 50)
# Cari penutup drawer yang benar (cari beberapa level)
depth = 0
i = idx_drawer
while i < idx_drawer + 30000:
    if html[i:i+4] == '<div': depth += 1
    elif html[i:i+6] == '</div>':
        depth -= 1
        if depth == 0:
            idx_drawer_end = i + 6
            break
    i += 1

idx_sp_btn = html.find('<button class="sp-keluar-btn"')
print(f"gt-sp-drawer mulai  : {idx_drawer}")
print(f"sp-keluar-btn       : {idx_sp_btn}")
print(f"gt-sp-drawer akhir  : {idx_drawer_end}")
if idx_sp_btn == -1:
    print("!! sp-keluar-btn tidak ditemukan sebagai HTML button!")
    # Cek apakah ada di JS string
    js_hit = html.find('sp-keluar-btn')
    print(f"   sp-keluar-btn di JS/CSS: pos {js_hit}")
elif idx_drawer < idx_sp_btn < idx_drawer_end:
    print("OK: Tombol ADA di dalam drawer!")
else:
    print("!! MASALAH: Tombol TIDAK di dalam drawer!")

# 5. Tampilkan area akhir warga-fb-left (50 char sebelum </aside>)
print("\n=== AKHIR warga-fb-left (sebelum </aside>) ===")
if idx_sidebar_end > 0:
    print(html[idx_sidebar_end-600:idx_sidebar_end+20])

print("\nDone.")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

original_len = len(html)

# STEP 1: Hapus button toggle lama
old_btn = re.findall(r'<button[^>]*btn-toggle-sidebar[^>]*>.*?</button>', html, re.DOTALL)
print("=== BUTTON LAMA DITEMUKAN ===")
for b in old_btn:
    print(re.sub(r'\s+', ' ', b).strip()[:200])

html, count1 = re.subn(r'<button[^>]*btn-toggle-sidebar[^>]*>.*?</button>', '', html, flags=re.DOTALL)
print(f"Button lama dihapus: {count1}x")

# STEP 2: Hapus semua duplikat fungsi toggleSidebar (sisakan 0, sudah tidak perlu)
# Hapus window.toggleSidebar = function() { ... };
html, count2 = re.subn(
    r'window\.toggleSidebar\s*=\s*function\s*\(\s*\)\s*\{[^}]*\}\s*;?',
    '',
    html,
    flags=re.DOTALL
)
print(f"Fungsi toggleSidebar dihapus: {count2}x")

# STEP 3: Hapus CSS yang terkait btn-toggle-sidebar jika ada
html, count3 = re.subn(
    r'\.btn-toggle-sidebar\s*\{[^}]*\}',
    '',
    html,
    flags=re.DOTALL
)
print(f"CSS btn-toggle-sidebar dihapus: {count3}x")

# STEP 4: Hapus CSS sidebar-collapsed jika ada dan tidak dipakai lagi
# (hati-hati, cek dulu apakah dipakai di tempat lain)
collapsed_usage = len(re.findall(r'sidebar-collapsed', html))
print(f"\nSisa pemakaian 'sidebar-collapsed': {collapsed_usage}x")
if collapsed_usage <= 2:
    html, count4 = re.subn(
        r'\.sidebar-collapsed[^{]*\{[^}]*\}',
        '',
        html,
        flags=re.DOTALL
    )
    print(f"CSS sidebar-collapsed dihapus: {count4}x")

print(f"\nUkuran file: {original_len} -> {len(html)} bytes")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("Done. File tersimpan.")

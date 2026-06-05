import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

lines = content.split('\n')

# Cek gtSpOpen function lengkap
print("=== gtSpOpen FUNCTION ===")
for i, line in enumerate(lines):
    if 'function gtSpOpen' in line:
        for j in range(i, min(i+60, len(lines))):
            print(f"  L{j+1}: {lines[j].rstrip()[:120]}")
            if j > i and lines[j].strip() == '})();':
                break

# Cek WARGA_MENUS dan ADMIN_MENUS
print("\n=== MENU DEFINITIONS ===")
for i, line in enumerate(lines):
    if 'WARGA_MENUS' in line or 'ADMIN_MENUS' in line or 'BEN_MENUS' in line or 'KOP_MENUS' in line:
        print(f"  L{i+1}: {lines[i].rstrip()[:120]}")

# Cek hamburger button
print("\n=== HAMBURGER BUTTON HTML ===")
for i, line in enumerate(lines):
    if 'gt-sp-hamburger' in line and ('<button' in line or 'onclick' in line.lower()):
        print(f"  L{i+1}: {lines[i].rstrip()[:120]}")

# Cek apakah ada duplikat gtSpOpen
print("\n=== SEMUA gtSpOpen / gtSpClose ===")
for i, line in enumerate(lines):
    if 'gtSpOpen' in line or 'gtSpClose' in line:
        print(f"  L{i+1}: {lines[i].rstrip()[:100]}")

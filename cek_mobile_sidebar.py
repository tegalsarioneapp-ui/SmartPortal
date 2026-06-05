import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

lines = content.split('\n')

# Cari section sidebar mobile
print("=== SIDEBAR MOBILE SECTION ===")
for i, line in enumerate(lines):
    if any(k in line.lower() for k in ['mobile-sidebar', 'mob-sidebar', 'sidebar-mobile', 
                                        'sidebar-overlay', 'mob-nav', 'drawer',
                                        'tegalsari', 'hamburger', 'mob-menu']):
        print(f"  L{i+1}: {line.strip()[:120]}")

print("\n=== CSS MOBILE SIDEBAR ===")
for i, line in enumerate(lines):
    if '@media' in line and i > 100:
        # Print media query block
        print(f"\n  L{i+1}: {line.strip()[:120]}")
        for j in range(i+1, min(i+20, len(lines))):
            print(f"  L{j+1}: {lines[j].strip()[:120]}")
            if '}' in lines[j] and '@media' not in lines[j]:
                break

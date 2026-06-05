import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Cari CSS admin-mobile-menu-open
print("=== CSS admin-mobile-menu-open ===")
for m in re.finditer(r'admin-mobile-menu-open[^{]*\{[^}]*\}', content, re.DOTALL):
    ln = content[:m.start()].count('\n') + 1
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

# Cari CSS mobile-left-open
print("\n=== CSS mobile-left-open ===")
for m in re.finditer(r'mobile-left-open[^{]*\{[^}]*\}', content, re.DOTALL):
    ln = content[:m.start()].count('\n') + 1
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

# Cari CSS #gt-sp-drawer.open
print("\n=== CSS gt-sp-drawer.open ===")
for m in re.finditer(r'#gt-sp-drawer[^{]*\{[^}]*\}', content, re.DOTALL):
    ln = content[:m.start()].count('\n') + 1
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

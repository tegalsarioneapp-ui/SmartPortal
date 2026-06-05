import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

lines = content.split('\n')

# Cari semua transition CSS untuk panel kiri dan kanan
print("=== CSS TRANSITION PANEL KIRI ===")
for m in re.finditer(r'[^{]*(?:admin-nav-tabs|warga-fb-left|gt-admin-side)[^{]*\{[^}]*\}', content, re.DOTALL):
    ln = content[:m.start()].count('\n') + 1
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    if 'transition' in clean or 'transform' in clean:
        print(f"  L{ln}: {clean[:200]}")

print("\n=== CSS TRANSITION PANEL KANAN ===")
for m in re.finditer(r'[^{]*(?:gt-admin-global-side|warga-fb-right|right-panel)[^{]*\{[^}]*\}', content, re.DOTALL):
    ln = content[:m.start()].count('\n') + 1
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    if 'transition' in clean or 'transform' in clean:
        print(f"  L{ln}: {clean[:200]}")

print("\n=== CSS TRANSITION gt-sp-drawer ===")
for m in re.finditer(r'#gt-sp-drawer[^{]*\{[^}]*transition[^}]*\}', content, re.DOTALL):
    ln = content[:m.start()].count('\n') + 1
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

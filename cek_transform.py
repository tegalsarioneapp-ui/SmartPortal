FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cari SEMUA CSS yang ada transform/scale pada btn-submit
print('=== SEMUA transform/scale pada btn-submit ===')
hits = re.findall(r'[^{}]*btn-submit[^{}]*\{[^}]*(?:transform|scale)[^}]*\}', html, re.DOTALL)
for h in hits:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])
    print()

print()
# Cari CSS yang ada transition pada btn-submit
print('=== SEMUA transition pada btn-submit ===')
hits2 = re.findall(r'\.btn-submit[^{]*\{[^}]*transition[^}]*\}', html, re.DOTALL)
for h in hits2:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])
    print()

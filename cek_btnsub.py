FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek semua CSS yang affect btn-submit
print('=== CSS btn-submit ===')
hits = re.findall(r'[^{}]*btn-submit[^{}]*\{[^}]*\}', html, re.DOTALL)
for h in hits:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])

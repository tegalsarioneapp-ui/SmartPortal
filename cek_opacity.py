FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek CSS yang set opacity:0 pada btn-submit
print('=== CSS opacity:0 pada btn-submit ===')
hits = re.findall(r'[^{}]*btn-submit[^{}]*\{[^}]*opacity\s*:\s*0[^}]*\}', html, re.DOTALL)
for h in hits:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])

print()
# Cek CSS pointer-events:none pada btn-submit
print('=== CSS pointer-events:none pada btn-submit ===')
hits2 = re.findall(r'[^{}]*btn-submit[^{}]*\{[^}]*pointer-events\s*:\s*none[^}]*\}', html, re.DOTALL)
for h in hits2:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])

print()
# Cek semua opacity rules untuk btn
print('=== SEMUA opacity rules btn-submit ===')
hits3 = re.findall(r'\.btn-submit[^{]*\{[^}]*\}', html, re.DOTALL)
for h in hits3:
    if 'opacity' in h or 'pointer' in h:
        print(' ', re.sub(r'\s+',' ',h).strip()[:300])

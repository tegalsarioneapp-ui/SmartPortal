FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek tracking-surat-section display default
print('=== tracking-surat-section ===')
idx = html.find('id="tracking-surat-section"')
if idx != -1:
    print(re.sub(r'\s+',' ', html[idx:idx+300]).strip())
else:
    print('MISSING')

# Cek form-pengajuan-surat display default
print()
print('=== form-pengajuan-surat display default ===')
idx2 = html.find('id="form-pengajuan-surat"')
if idx2 != -1:
    print(re.sub(r'\s+',' ', html[idx2:idx2+300]).strip())
else:
    print('MISSING')

# Cek CSS tracking-surat-section
print()
print('=== CSS tracking-surat-section ===')
hits = re.findall(r'[^{}]*tracking-surat-section[^{}]*\{[^}]*\}', html, re.DOTALL)
for h in hits:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])

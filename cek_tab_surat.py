FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek CSS btn-submit bg-blue
print('=== CSS .btn-submit ===')
hits = re.findall(r'\.btn-submit[^{]*\{[^}]*\}', html, re.DOTALL)
for h in hits:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])

print()
# Cek CSS bg-blue
print('=== CSS .bg-blue ===')
hits2 = re.findall(r'\.bg-blue[^{]*\{[^}]*\}', html, re.DOTALL)
for h in hits2:
    print(' ', re.sub(r'\s+',' ',h).strip()[:200])

print()
# Cek tab warga-surat → loadSuratWarga dipanggil
print('=== openWargaTab warga-surat ===')
idx = html.find("'warga-surat'")
while idx != -1:
    ctx = re.sub(r'\s+',' ', html[idx-100:idx+200]).strip()
    print(f'  pos {idx}:', ctx[:300])
    idx = html.find("'warga-surat'", idx+1)

print()
# Cek loadSuratWarga isi fungsi
print('=== loadSuratWarga isi ===')
idx = html.find('window.loadSuratWarga = function')
if idx != -1:
    print(re.sub(r'\s+',' ', html[idx:idx+1500]).strip()[:1500])

FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cari anchor yang tersedia dekat area surat
print('=== CARI ANCHOR INJECT ===')
anchors = [
    'window.cetakPDFSurat',
    'window.verifikasiTokenSurat',
    'window.loadSuratWarga',
    'window.submitSuratWarga',
]
for a in anchors:
    idx = html.find(a)
    print(f'  {a}: pos {idx}')

print()
print('=== loadSuratAdmin versi pertama ===')
hits = list(re.finditer(r'loadSuratAdmin', html))
print(f'Total: {len(hits)}x')
for h in hits[:5]:
    ctx = re.sub(r'\s+',' ', html[h.start()-50:h.start()+100]).strip()
    print(f'  pos {h.start()}: {ctx[:200]}')

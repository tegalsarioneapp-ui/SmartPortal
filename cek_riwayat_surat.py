FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

print('=== loadSuratWarga FULL ===')
idx = html.find('window.loadSuratWarga')
end = html.find('\nwindow.', idx+10)
fn = html[idx:end]
print(re.sub(r'\s+',' ', fn).strip()[:3000])

print()
print('=== tbody-riwayat-warga-baru HTML ===')
idx2 = html.find('tbody-riwayat-warga-baru')
if idx2 != -1:
    print(re.sub(r'\s+',' ', html[idx2-300:idx2+200]).strip()[:500])
else:
    print('  TIDAK ADA!')

print()
print('=== buildSuratStatus FULL ===')
idx3 = html.find('function buildSuratStatus')
if idx3 == -1: idx3 = html.find('window.buildSuratStatus')
if idx3 != -1:
    end3 = html.find('\nwindow.', idx3+10)
    print(re.sub(r'\s+',' ', html[idx3:end3]).strip()[:1000])
else:
    print('  TIDAK ADA!')

print()
print('=== tracking-surat-section HTML ===')
idx4 = html.find('id="tracking-surat-section"')
if idx4 != -1:
    print(re.sub(r'\s+',' ', html[idx4:idx4+800]).strip()[:800])
else:
    print('  TIDAK ADA!')

print()
print('=== form-pengajuan-surat HTML ===')
idx5 = html.find('id="form-pengajuan-surat"')
if idx5 != -1:
    print(re.sub(r'\s+',' ', html[idx5:idx5+300]).strip()[:300])
else:
    print('  TIDAK ADA!')

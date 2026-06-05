FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

print('=== submitSuratWarga FULL ===')
idx = html.find('window.submitSuratWarga')
if idx != -1:
    end = html.find('\nwindow.', idx+10)
    print(re.sub(r'\s+',' ', html[idx:end]).strip()[:2000])

print()
print('=== verifikasiTokenSurat FULL ===')
idx2 = html.find('window.verifikasiTokenSurat')
if idx2 != -1:
    end2 = html.find('\nwindow.', idx2+10)
    print(re.sub(r'\s+',' ', html[idx2:end2]).strip()[:2000])

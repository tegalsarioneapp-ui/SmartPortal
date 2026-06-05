FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek div tab warga-surat
print('=== DIV TAB warga-surat ===')
idx = html.find('id="warga-surat"')
if idx != -1:
    print(re.sub(r'\s+',' ', html[idx:idx+500]).strip())
else:
    print('MISSING id="warga-surat"')

print()
# Cek apakah form-pengajuan-surat BERADA DI DALAM tab warga-surat
print('=== POSISI RELATIF ===')
idx_tab  = html.find('id="warga-surat"')
idx_form = html.find('id="form-pengajuan-surat"')
print(f'Tab warga-surat  : pos {idx_tab}')
print(f'Form pengajuan   : pos {idx_form}')
if idx_tab != -1 and idx_form != -1:
    if idx_form > idx_tab:
        print('Form ADA di dalam tab? Cek jarak:', idx_form - idx_tab)
    else:
        print('!!! Form DILUAR tab (form lebih dulu dari tab)')

print()
# Cek 2000 char setelah id="warga-surat"
print('=== KONTEN TAB warga-surat (2000 char) ===')
if idx_tab != -1:
    print(re.sub(r'\s+',' ', html[idx_tab:idx_tab+2000]).strip())

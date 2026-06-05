FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

print('=== 1. FORM PENGAJUAN SURAT ===')
idx = html.find('id="form-pengajuan-surat"')
print('Ada:', idx != -1, '| pos:', idx)

print()
print('=== 2. FUNGSI submitSuratWarga ===')
idx2 = html.find('window.submitSuratWarga')
if idx2 == -1: idx2 = html.find('function submitSuratWarga')
print('Ada:', idx2 != -1, '| pos:', idx2)
if idx2 != -1:
    print(re.sub(r'\s+',' ', html[idx2:idx2+1000]).strip()[:1000])

print()
print('=== 3. FUNGSI loadSuratWarga ===')
idx3 = html.find('window.loadSuratWarga')
print('Ada:', idx3 != -1)
if idx3 != -1:
    print(re.sub(r'\s+',' ', html[idx3:idx3+500]).strip()[:500])

print()
print('=== 4. FUNGSI verifikasiTokenSurat ===')
idx4 = html.find('window.verifikasiTokenSurat')
print('Ada:', idx4 != -1)

print()
print('=== 5. FUNGSI cetakPDFSurat ===')
idx5 = html.find('window.cetakPDFSurat')
if idx5 == -1: idx5 = html.find('function cetakPDFSurat')
print('Ada:', idx5 != -1, '| pos:', idx5)
if idx5 != -1:
    print(re.sub(r'\s+',' ', html[idx5:idx5+500]).strip()[:500])

print()
print('=== 6. TRACKING SECTION ===')
idx6 = html.find('id="tracking-surat-section"')
print('Ada:', idx6 != -1)
if idx6 != -1:
    print(re.sub(r'\s+',' ', html[idx6:idx6+300]).strip()[:300])

print()
print('=== 7. TABEL RIWAYAT SURAT ===')
idx7 = html.find('tbody-riwayat-warga-baru')
print('Ada:', idx7 != -1)
if idx7 != -1:
    print(re.sub(r'\s+',' ', html[idx7:idx7+300]).strip()[:300])

print()
print('=== 8. AUTOFILL DARI loggedInWarga ===')
hits = re.findall(r'req_nama|req_nik|req_alamat|autofill|loggedInWarga.*req_', html)
print('Fields autofill:', hits[:10])

print()
print('=== 9. loadSuratWarga DIPANGGIL SAAT TAB DIBUKA ===')
idx8 = html.find("'warga-surat': function")
if idx8 == -1: idx8 = html.find('"warga-surat": function')
print('Ada callback:', idx8 != -1)
if idx8 != -1:
    print(re.sub(r'\s+',' ', html[idx8:idx8+200]).strip()[:200])

print()
print('=== 10. DUPLIKAT FUNGSI ===')
for fn in ['submitSuratWarga','loadSuratWarga','verifikasiTokenSurat','cetakPDFSurat']:
    c = html.count(fn)
    print(f'  {fn}: {c}x')

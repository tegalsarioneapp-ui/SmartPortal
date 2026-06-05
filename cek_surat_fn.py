import re

f = open('artifacts/smart-portal-rt/index.html','r',encoding='utf-8')
html = f.read()
f.close()

# 1. Cek semua fungsi terkait surat
fns = [
    'approveSurat', 'rejectSurat', 'generateTokenSurat',
    'verifikasiTokenSurat', 'cetakPDFSurat', 'kirimTokenSurat',
    'bagikanToken', 'resendToken', 'downloadSuratWarga',
    'window.downloadPdfFromHtml'
]
print('=== FUNGSI TERSEDIA ===')
for fn in fns:
    ada = fn in html
    idx = html.find(fn)
    ln = html[:idx].count('\n') + 1 if ada else 0
    print(f'  {"OK" if ada else "MISSING"}: {fn}' + (f' (L{ln})' if ada else ''))

# 2. Cek isi approveSurat
print()
print('=== approveSurat FULL ===')
idx = html.find('window.approveSurat')
if idx == -1: idx = html.find('function approveSurat')
if idx != -1:
    end = html.find('\nwindow.', idx+10)
    chunk = html[idx:end]
    print(re.sub(r'\s+',' ', chunk).strip()[:2000])
else:
    print('TIDAK ADA')

# 3. Cek row builder di loadSuratAdmin
print()
print('=== ROW BUILDER loadSuratAdmin (tombol) ===')
idx2 = html.find('window.loadSuratAdmin')
end2 = html.find('\nwindow.', idx2+10)
chunk2 = html[idx2:end2]
btns = re.findall(r'<button[^>]*onclick=["\'][^"\']*["\'][^>]*>.*?</button>', chunk2, re.DOTALL)
for b in btns:
    print(' ', re.sub(r'\s+',' ', b).strip()[:200])

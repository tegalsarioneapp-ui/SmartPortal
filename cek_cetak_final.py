FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

print('=== cetakPDFSurat — 500 CHAR TERAKHIR ===')
idx = html.find('window.cetakPDFSurat')
end = html.find('\nwindow.', idx+10)
fn = html[idx:end]
print(f'Panjang fungsi: {len(fn)} chars')
print()
print('=== 200 CHAR TERAKHIR ===')
print(repr(fn[-200:]))
print()
print('=== downloadPdfFromHtml di fungsi ===')
dpos = fn.find('downloadPdfFromHtml')
if dpos != -1:
    print('  pos dalam fungsi:', dpos)
    print('  context:', re.sub(r'\s+',' ', fn[dpos-100:dpos+200]).strip())
else:
    print('  TIDAK ADA dalam fungsi!')

print()
print('=== window.downloadPdfFromHtml DEFINISI ===')
defpos = html.find('window.downloadPdfFromHtml = function')
print('  Ada:', defpos != -1, '| pos:', defpos)
if defpos != -1:
    defchunk = html[defpos:defpos+300]
    print(re.sub(r'\s+',' ', defchunk).strip()[:300])

print()
print('=== approveSurat FULL ===')
idx2 = html.find('window.approveSurat')
end2 = html.find('\nwindow.', idx2+10)
print(re.sub(r'\s+',' ', html[idx2:end2]).strip()[:2000])

print()
print('=== rejectSurat FULL ===')
idx3 = html.find('window.rejectSurat')
end3 = html.find('\nwindow.', idx3+10)
print(re.sub(r'\s+',' ', html[idx3:end3]).strip()[:1000])

print()
print('=== DUPLIKAT FUNGSI CEK ===')
for fn2 in ['approveSurat','rejectSurat','loadSuratAdmin','cetakPDFSurat','submitSuratWarga']:
    c = html.count(f'window.{fn2}')
    print(f'  {"OK" if c==1 else "!!"} {fn2}: {c}x')

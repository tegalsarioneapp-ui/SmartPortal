import re

f = open('artifacts/smart-portal-rt/index.html','r',encoding='utf-8')
html = f.read()
f.close()

# Cari cetakPDFSurat dengan batas yang benar
idx = html.find('window.cetakPDFSurat')
# Cari penutup fungsi - cari }; setelah downloadPdfFromHtml
chunk = html[idx:idx+8000]

print('=== cetakPDFSurat 3000 chars terakhir ===')
print(re.sub(r'\s+',' ', chunk[-3000:]).strip())

print()
print('=== CEK downloadPdfFromHtml dipanggil ===')
pos = chunk.find('downloadPdfFromHtml')
if pos != -1:
    print('Ada di pos:', pos)
    print(re.sub(r'\s+',' ', chunk[pos-100:pos+300]).strip())
else:
    print('TIDAK ADA dalam 8000 chars pertama!')
    # Cari lebih jauh
    chunk2 = html[idx:idx+15000]
    pos2 = chunk2.find('downloadPdfFromHtml')
    if pos2 != -1:
        print('Ada di pos:', pos2)
        print(re.sub(r'\s+',' ', chunk2[pos2-100:pos2+300]).strip())
    else:
        print('BENAR-BENAR TIDAK ADA dalam 15000 chars!')

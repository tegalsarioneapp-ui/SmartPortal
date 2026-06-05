FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split('\n')

# Cari loadSuratWarga
import re
for m in re.finditer(r'window\.loadSuratWarga', html):
    line = html.count('\n', 0, m.start()) + 1
    print("loadSuratWarga L" + str(line))

print()

# Tampilkan isi loadSuratWarga
m = re.search(r'window\.loadSuratWarga\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    content = m.group(0)
    print("Panjang: " + str(len(content)))
    # Cari bagian tombol download
    idx = content.find('Download')
    if idx != -1:
        print("=== SEKITAR TOMBOL DOWNLOAD ===")
        print(content[max(0,idx-100):idx+300])
    else:
        print("TIDAK ADA kata Download!")
        # Tampilkan 500 char terakhir
        print("=== 500 CHAR TERAKHIR ===")
        print(content[-500:])
else:
    print("loadSuratWarga TIDAK DITEMUKAN!")

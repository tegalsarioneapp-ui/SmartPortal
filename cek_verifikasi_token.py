import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

m = re.search(r'window\.verifikasiTokenSurat\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    print("Panjang: " + str(len(m.group(0))))
    print(m.group(0)[:2000])
else:
    print("TIDAK DITEMUKAN!")
    # Cari alternatif
    idx = html.find('verifikasiTokenSurat')
    while idx != -1:
        line = html.count('\n', 0, idx) + 1
        print("L" + str(line) + ": " + re.sub(r'\s+', ' ', html[idx:idx+100]).strip())
        idx = html.find('verifikasiTokenSurat', idx+1)

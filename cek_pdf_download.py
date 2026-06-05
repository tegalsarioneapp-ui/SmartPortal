import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek downloadPdfFromHtml
m = re.search(r'window\.downloadPdfFromHtml\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    print("=== downloadPdfFromHtml ===")
    print("Panjang: " + str(len(m.group(0))))
    print(m.group(0)[:2000])
else:
    print("downloadPdfFromHtml TIDAK DITEMUKAN!")

print()

# Cek cetakPDFSurat bagian akhir (cara download)
m2 = re.search(r'window\.cetakPDFSurat\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m2:
    content = m2.group(0)
    print("=== cetakPDFSurat BAGIAN AKHIR ===")
    print(re.sub(r'\s+', ' ', content[-800:]).strip())

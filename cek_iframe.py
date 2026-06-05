import re
FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek cetakPDFSurat memanggil downloadPdfFromHtml
idx = html.find("window.cetakPDFSurat = function")
chunk = html[idx:idx+8000]
pos = chunk.find("downloadPdfFromHtml")
print("cetakPDFSurat memanggil downloadPdfFromHtml: " + str(pos != -1))
if pos != -1:
    print(re.sub(r'\s+', ' ', chunk[pos-30:pos+100]).strip())

# Cek htmlCetak variable ada di cetakPDFSurat
print("htmlCetak ada: " + str("htmlCetak" in chunk))
print("htmlCetak panjang (ada template): " + str(chunk.count("htmlCetak")))

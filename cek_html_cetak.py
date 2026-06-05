import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Ambil FULL cetakPDFSurat
idx = html.find("window.cetakPDFSurat = function")
chunk = html[idx:idx+8000]

# Cari htmlCetak assignment
pos1 = chunk.find("let htmlCetak")
pos2 = chunk.find("var htmlCetak")
pos = pos1 if pos1 != -1 else pos2

print("=== htmlCetak assignment ===")
if pos != -1:
    print(re.sub(r'\s+', ' ', chunk[pos:pos+300]).strip())
else:
    print("TIDAK ADA let/var htmlCetak!")

# Cari apakah htmlCetak diisi template literal
print()
print("=== Template literal htmlCetak ===")
backtick_pos = chunk.find("htmlCetak = `")
if backtick_pos != -1:
    # Cari penutup backtick
    end_bt = chunk.find("`", backtick_pos + 13)
    print("htmlCetak template length: " + str(end_bt - backtick_pos))
    print("Preview 200 chars: " + re.sub(r'\s+', ' ', chunk[backtick_pos:backtick_pos+200]).strip())
else:
    print("TIDAK ADA template literal!")
    # Cek apakah pakai string concat
    plus_pos = chunk.find("htmlCetak +")
    print("htmlCetak concat: " + str(plus_pos != -1))

# Cek watermark dan div utama
print()
print("=== Struktur HTML di cetakPDFSurat ===")
print("watermarkHTML ada: " + str("watermarkHTML" in chunk))
print("210mm ada: " + str("210mm" in chunk))
print("Times New Roman ada: " + str("Times New Roman" in chunk))
print("namaRT ada: " + str("namaRT" in chunk))
print("dt.nama ada: " + str("dt.nama" in chunk))

# Tampilkan 300 chars sebelum return downloadPdfFromHtml
print()
print("=== 300 chars sebelum return downloadPdfFromHtml ===")
ret_pos = chunk.find("return window.downloadPdfFromHtml")
if ret_pos != -1:
    print(re.sub(r'\s+', ' ', chunk[ret_pos-300:ret_pos+80]).strip())

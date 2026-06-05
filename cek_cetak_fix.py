import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cari SEMUA posisi cetakPDFSurat
print("=== [1] SEMUA POSISI cetakPDFSurat ===")
for m in re.finditer(r'cetakPDFSurat', html):
    line = html.count('\n', 0, m.start()) + 1
    ctx = re.sub(r'\s+', ' ', html[m.start()-30:m.start()+80]).strip()
    print("  L" + str(line) + ": " + ctx)

# 2. Cek apakah window.cetakPDFSurat = function ADA
print()
print("=== [2] DEFINISI window.cetakPDFSurat ===")
idx = html.find("window.cetakPDFSurat = function")
if idx != -1:
    line = html.count('\n', 0, idx) + 1
    chunk = html[idx:idx+200]
    print("  Ada di L" + str(line))
    print("  Preview: " + re.sub(r'\s+', ' ', chunk[:200]))
else:
    print("  TIDAK ADA! Cek alternatif...")
    idx2 = html.find("cetakPDFSurat = function")
    if idx2 != -1:
        line2 = html.count('\n', 0, idx2) + 1
        print("  Ada (tanpa window.) di L" + str(line2))
    else:
        print("  BENAR-BENAR TIDAK ADA DEFINISI FUNGSI!")

# 3. Cek apakah cetakPDFSurat memanggil downloadPdfFromHtml
print()
print("=== [3] CEK PEMANGGILAN downloadPdfFromHtml ===")
idx3 = html.find("window.cetakPDFSurat")
if idx3 != -1:
    chunk3 = html[idx3:idx3+12000]
    pos_dl = chunk3.find("downloadPdfFromHtml")
    # Cari penutup fungsi
    depth = 0
    close_pos = -1
    for i, ch in enumerate(chunk3):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                close_pos = i
                break
    print("  downloadPdfFromHtml di pos: " + str(pos_dl))
    print("  Penutup fungsi di pos: " + str(close_pos))
    if pos_dl == -1:
        print("  MASALAH: downloadPdfFromHtml TIDAK dipanggil dalam fungsi!")
        print("  300 chars sebelum penutup:")
        print(re.sub(r'\s+', ' ', chunk3[max(0,close_pos-300):close_pos+5]))
    elif close_pos != -1 and pos_dl > close_pos:
        print("  MASALAH: downloadPdfFromHtml dipanggil SETELAH fungsi tutup!")
    else:
        print("  OK: downloadPdfFromHtml dipanggil dalam fungsi")
        print(re.sub(r'\s+', ' ', chunk3[pos_dl-50:pos_dl+200]).strip())
else:
    print("  window.cetakPDFSurat tidak ditemukan!")

# 4. Cek window._fallbackPrint
print()
print("=== [4] _fallbackPrint ===")
idx4 = html.find("window._fallbackPrint")
if idx4 != -1:
    end4 = html.find("\nwindow.", idx4+10)
    chunk4 = html[idx4:min(end4, idx4+600)]
    print(re.sub(r'\s+', ' ', chunk4).strip())
else:
    print("  MISSING! Error silent saat fallback dipanggil")

# 5. Cek console error hints
print()
print("=== [5] CEK STRUKTUR FUNGSI (bracket balance) ===")
idx5 = html.find("window.cetakPDFSurat")
if idx5 != -1:
    chunk5 = html[idx5:idx5+35000]
    opens = chunk5.count('{')
    closes = chunk5.count('}')
    print("  { count dalam 35000 chars: " + str(opens))
    print("  } count dalam 35000 chars: " + str(closes))
    print("  Delta: " + str(opens - closes))

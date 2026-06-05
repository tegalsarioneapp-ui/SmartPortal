import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari fungsi yang generate HTML untuk PDF
# Biasanya ada downloadPdfFromHtml atau cetakPDFSurat
hits = list(re.finditer(r'kop-surat-resmi', html))
print(f"Total kop-surat-resmi: {len(hits)}")
for h in hits:
    pos = h.start()
    snippet = html[pos-200:pos+500]
    snippet = re.sub(r'base64,[A-Za-z0-9+/=]{30,}', 'base64,...', snippet)
    # Hanya tampilkan yang ada di dalam JS/template string
    if 'function' in snippet or 'let ' in snippet or 'var ' in snippet or 'const ' in snippet or '`' in snippet or "innerHTML" in snippet:
        print(f"\n=== JS/TEMPLATE pos {pos} ===")
        print(snippet)
        print("---")

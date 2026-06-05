import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=== ISI KODE KOP SURAT ANDA SEBENARNYA ===")

# Cari semua template PDF yang ada img logo
hits = list(re.finditer(r'(?:width|height)\s*:\s*\d+px[^"]*object-fit\s*:\s*contain', html))
for h in hits:
    pos = h.start()
    snippet = html[pos-300:pos+300]
    snippet = re.sub(r'base64,[A-Za-z0-9+/=]{30,}', 'base64,...', snippet)
    print(f"\n--- pos {pos} ---")
    print(snippet)

print("=== SELESAI ===")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua let html = atau var html = yang mengandung kop
hits = list(re.finditer(r'(let|var)\s+html\s*=\s*[\'"`]', html))
print(f"Total html template: {len(hits)}")
for h in hits:
    pos = h.start()
    snippet = html[pos:pos+2000]
    snippet = re.sub(r'base64,[A-Za-z0-9+/=]{30,}', 'base64,...', snippet)
    if 'kop-surat-resmi' in snippet or 'kop' in snippet:
        print(f"\n=== pos {pos} ===")
        print(snippet[:2000])
        print("---END---")

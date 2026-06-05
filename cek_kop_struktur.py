import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

hits = list(re.finditer(r'kop-surat-resmi', html))
print(f"Total kop-surat-resmi: {len(hits)}")
for h in hits:
    snippet = html[h.start()-5:h.start()+800]
    snippet = re.sub(r'base64,[A-Za-z0-9+/=]{50,}', 'base64,...TRUNCATED...', snippet)
    print(f"\n=== pos {h.start()} ===")
    print(snippet[:600])
    print("---")

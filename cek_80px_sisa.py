import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

hits = list(re.finditer(r'width:80px', html))
print(f"Total width:80px: {len(hits)}")
for h in hits:
    pos = h.start()
    snippet = html[pos-150:pos+200]
    snippet = re.sub(r'base64,[A-Za-z0-9+/=]{30,}', 'base64,...', snippet)
    print(f"\n=== pos {pos} ===")
    print(snippet)
    print("---")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua kop-surat HTML block
print("=== KOP SURAT HTML BLOCKS ===")
hits = list(re.finditer(r'<(?:div|table)[^>]*kop[^>]*>.*?</(?:div|table)>', html, re.DOTALL))
for h in hits:
    line = html.count("\n", 0, h.start()) + 1
    print("L" + str(line) + ":")
    print(h.group(0)[:500])
    print("---")

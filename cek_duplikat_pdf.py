import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari SEMUA definisi downloadPdfFromHtml
print("=== SEMUA DEFINISI downloadPdfFromHtml ===")
for m in re.finditer(r'downloadPdfFromHtml\s*=\s*(async\s*)?function', html):
    line = html.count('\n', 0, m.start()) + 1
    ctx = re.sub(r'\s+', ' ', html[m.start():m.start()+150]).strip()
    print("  L" + str(line) + " pos=" + str(m.start()) + ": " + ctx)

print()
print("Total definisi: " + str(len(re.findall(r'downloadPdfFromHtml\s*=\s*(async\s*)?function', html))))

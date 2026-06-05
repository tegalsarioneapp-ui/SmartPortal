import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=== SEMUA iframe.contentWindow.print ===")
for m in re.finditer(r'iframe\.contentWindow\.print', html):
    line = html.count('\n', 0, m.start()) + 1
    ctx = re.sub(r'\s+', ' ', html[m.start()-100:m.start()+150]).strip()
    print("L" + str(line) + ": " + ctx)
    print()

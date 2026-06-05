import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=== SEMUA PLACEHOLDER ===")
hits = list(re.finditer(r'__LOGO_B64_\d+__', html))
print("Total: " + str(len(hits)))
for h in hits:
    line = html.count("\n", 0, h.start()) + 1
    ctx = re.sub(r'\s+', ' ', html[h.start()-40:h.start()+60]).strip()
    print("  L" + str(line) + ": " + ctx)

print()
print("=== CEK logoUrl masih pakai placeholder? ===")
for m in re.finditer(r'var logoUrl[^\n;]+', html):
    print("  " + re.sub(r'\s+', ' ', m.group(0)).strip())

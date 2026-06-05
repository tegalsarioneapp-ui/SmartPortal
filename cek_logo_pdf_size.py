import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua img base64 beserta style/width/height
print("=== SEMUA IMG LOGO + UKURAN ===")
hits = list(re.finditer(r'<img src="data:image/png;base64,[^"]{10,}"([^>]*)>', html))
for h in hits:
    line = html.count("\n", 0, h.start()) + 1
    attrs = h.group(1)
    # Ambil style dan width/height
    style = re.search(r'style="([^"]*)"', attrs)
    width = re.search(r'width=["\']([^"\']*)["\']', attrs)
    height = re.search(r'height=["\']([^"\']*)["\']', attrs)
    cls = re.search(r'class="([^"]*)"', attrs)
    print("L" + str(line) + ":")
    print("  class : " + (cls.group(1) if cls else "-"))
    print("  width : " + (width.group(1) if width else "-"))
    print("  height: " + (height.group(1) if height else "-"))
    print("  style : " + (style.group(1) if style else "-"))
    print()

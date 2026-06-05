FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua tag head/html
import re
for tag in ["<head>", "</head>", "<html>", "</html>", "<body>", "</body>"]:
    idx = html.find(tag)
    if idx != -1:
        line = html.count("\n", 0, idx) + 1
        print(tag + " -> L" + str(line) + " pos " + str(idx))
    else:
        print(tag + " -> TIDAK ADA")

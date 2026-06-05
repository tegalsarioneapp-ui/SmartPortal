import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Ambil JS template di pos 612706
pos = 612706
snippet = html[pos-500:pos+1500]
snippet = re.sub(r'base64,[A-Za-z0-9+/=]{30,}', 'base64,...TRUNCATED...', snippet)
print(snippet)

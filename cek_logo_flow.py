import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek: dimana __LOGO_B64_0__ didefinisikan
print("=== DEFINISI __LOGO_B64_0__ ===")
hits = list(re.finditer(r'var __LOGO_B64_0__\s*=', html))
for h in hits:
    line = html.count("\n", 0, h.start()) + 1
    print("L" + str(line) + ": " + re.sub(r"\s+", " ", html[h.start():h.start()+80]))

print()

# Cek: dimana __b64Logo dipakai
print("=== PEMAKAIAN __b64Logo ===")
hits2 = list(re.finditer(r'__b64Logo', html))
for h in hits2:
    line = html.count("\n", 0, h.start()) + 1
    print("L" + str(line) + ": " + re.sub(r"\s+", " ", html[h.start()-40:h.start()+80]))

print()

# Cek: apakah base64 vars script ada di <head> sebelum semua script lain
print("=== POSISI gt-logo-b64-vars ===")
idx_vars = html.find('id="gt-logo-b64-vars"')
idx_patch = html.find('id="gt-logo-b64-patch"')
idx_main = html.find('<script>')
print("gt-logo-b64-vars pos: " + str(idx_vars))
print("gt-logo-b64-patch pos: " + str(idx_patch))
print("script pertama pos: " + str(idx_main))

# Cek: nilai base64 di vars
print()
print("=== ISI gt-logo-b64-vars (50 char pertama base64) ===")
m = re.search(r'<script id="gt-logo-b64-vars">(.*?)</script>', html, re.DOTALL)
if m:
    content = re.sub(r"\s+", " ", m.group(1)).strip()
    print(content[:150])
else:
    print("TIDAK DITEMUKAN")

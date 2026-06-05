import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek 1: script vars posisi
idx = html.find('id="gt-logo-b64-vars"')
line = html.count("\n", 0, idx) + 1
print("=== gt-logo-b64-vars di L" + str(line) + " ===")

# Cek 2: semua img yang pakai __LOGO_B64_0__
print("\n=== IMG pakai __LOGO_B64_0__ ===")
for m in re.finditer(r'<img[^>]*__LOGO_B64_0__[^>]*>', html):
    line = html.count("\n", 0, m.start()) + 1
    print("L" + str(line) + ": " + m.group(0)[:150])

# Cek 3: semua img pakai __b64Logo
print("\n=== IMG pakai __b64Logo ===")
for m in re.finditer(r'src=["\'].*?__b64Logo.*?["\']', html):
    line = html.count("\n", 0, m.start()) + 1
    print("L" + str(line) + ": " + html[m.start()-10:m.start()+100])

# Cek 4: img dsh-logo di HTML (bukan JS string)
print("\n=== IMG class dsh-logo ===")
for m in re.finditer(r'<img[^>]*dsh-logo[^>]*>', html):
    line = html.count("\n", 0, m.start()) + 1
    ln_start = html.rfind("\n", 0, m.start())
    ln_content = html[ln_start:m.start()]
    in_js = "'" in ln_content or '"' in ln_content
    print("L" + str(line) + " in_js=" + str(in_js) + ": " + m.group(0)[:150])

# Cek 5: patch script - apakah ada yang set src dari __LOGO_B64_0__
print("\n=== PATCH script ===")
patch = re.search(r'<script id="gt-logo-b64-patch">(.*?)</script>', html, re.DOTALL)
if patch:
    print(patch.group(1)[:300])
else:
    print("TIDAK ADA patch script")

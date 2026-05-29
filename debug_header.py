import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Lihat HTML header persis
idx = html.find('<div class="main-header no-print">')
if idx == -1:
    idx = html.find('main-header no-print') - 5
print(f"=== HTML HEADER (pos {idx}) ===")
print(html[idx:idx+1200])

# 2. Cari semua CSS yang hide/show btn-logout
print("\n=== CSS YANG AFFECT btn-logout VISIBILITY ===")
rules = re.findall(r'[^{}]*btn-logout[^{}]*\{[^}]*display[^}]*\}', html, re.DOTALL)
for r in rules:
    clean = re.sub(r'\s+', ' ', r).strip()
    print(f"  {clean[:200]}")

# 3. Cari semua CSS yang affect #gt-sp-hamburger
print("\n=== CSS YANG AFFECT #gt-sp-hamburger ===")
rules2 = re.findall(r'[^{}]*gt-sp-hamburger[^{}]*\{[^}]*\}', html, re.DOTALL)
for r in rules2:
    clean = re.sub(r'\s+', ' ', r).strip()
    print(f"  {clean[:200]}")

# 4. Cari padding/margin besar di bawah header
print("\n=== CSS MAIN-CONTENT / WRAPPER PADDING ===")
rules3 = re.findall(r'\.main-content[^{}]*\{[^}]*\}|\.content-wrapper[^{}]*\{[^}]*\}|\.app-wrapper[^{}]*\{[^}]*\}', html, re.DOTALL)
for r in rules3[:10]:
    clean = re.sub(r'\s+', ' ', r).strip()
    print(f"  {clean[:200]}")

print("\nDone.")

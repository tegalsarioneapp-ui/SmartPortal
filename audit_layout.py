import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cari semua margin-top / padding-top besar
print("=== MARGIN-TOP / PADDING-TOP MENCURIGAKAN ===")
hits = re.findall(r'[^;{}\n]{0,60}(?:margin-top|padding-top)\s*:\s*[^;}{]{1,80}', html)
seen = set()
for h in hits:
    clean = re.sub(r'\s+', ' ', h).strip()
    if clean not in seen and any(x in clean for x in ['px','vh','%','rem','em','calc']):
        seen.add(clean)
        print(f"  {clean[:120]}")

# 2. Cari semua height/min-height 100vh
print("\n=== HEIGHT 100VH / MIN-HEIGHT ===")
hits2 = re.findall(r'[^;{}\n]{0,60}(?:height|min-height)\s*:\s*(?:100vh|calc\(100vh[^)]*\))[^;]{0,40}', html)
seen2 = set()
for h in hits2:
    clean = re.sub(r'\s+', ' ', h).strip()
    if clean not in seen2:
        seen2.add(clean)
        print(f"  {clean[:120]}")

# 3. Cari translateY / top positioning
print("\n=== TRANSLATE-Y / TOP POSITIONING ===")
hits3 = re.findall(r'[^;{}\n]{0,60}(?:translateY|top\s*:)\s*[^;}{]{1,60}', html)
seen3 = set()
for h in hits3:
    clean = re.sub(r'\s+', ' ', h).strip()
    if clean not in seen3 and any(x in clean for x in ['px','vh','%','rem']):
        seen3.add(clean)
        print(f"  {clean[:120]}")

# 4. Cari struktur layout utama (wrapper, content, main)
print("\n=== STRUKTUR LAYOUT HTML ===")
# Cari div setelah main-header
idx = html.find('<div class="main-header no-print">')
# Cari penutupnya
depth = 0
i = idx
while i < idx + 3000:
    if html[i:i+4] == '<div': depth += 1
    elif html[i:i+6] == '</div>':
        depth -= 1
        if depth == 0:
            end_header = i + 6
            break
    i += 1

# Tampilkan 2000 char setelah header
print(html[end_header:end_header+2000])

# 5. Cari CSS untuk .app-container, .main-wrapper, .content-area dll
print("\n=== CSS CONTAINER UTAMA ===")
containers = re.findall(
    r'(?:\.app-container|\.main-wrapper|\.content-area|\.page-content|\.main-content|\.dashboard-container|#main-content|\.portal-wrapper)[^{]*\{[^}]+\}',
    html, re.DOTALL
)
for c in containers[:15]:
    clean = re.sub(r'\s+', ' ', c).strip()
    print(f"  {clean[:200]}")

# 6. Cari CSS yang pakai position:fixed/absolute pada container besar
print("\n=== POSITION FIXED/ABSOLUTE CONTAINERS ===")
fixed = re.findall(r'[^{}]{0,80}\{[^}]*position\s*:\s*(?:fixed|absolute)[^}]*\}', html, re.DOTALL)
seen4 = set()
for f in fixed[:20]:
    clean = re.sub(r'\s+', ' ', f).strip()
    if clean not in seen4 and len(clean) < 300:
        seen4.add(clean)
        print(f"  {clean[:200]}")

print("\nDone.")

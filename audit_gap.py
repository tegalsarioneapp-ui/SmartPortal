import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cari semua elemen dengan min-height:100vh atau height:100vh
print("=== MIN-HEIGHT / HEIGHT 100VH (dengan konteks HTML) ===")
hits = list(re.finditer(
    r'<[^>]*style="[^"]*(?:min-height|height)\s*:\s*(?:100vh|calc\(100vh)[^"]*"[^>]*>',
    html, re.DOTALL
))
for h in hits[:20]:
    print(f"  pos {h.start()}: {re.sub(chr(10),' ',h.group(0)[:200])}")

# 2. Cari div kosong / spacer besar setelah header
print("\n=== STRUKTUR SETELAH </div> HEADER ===")
idx_header = html.find('<div class="main-header no-print">')
# cari penutup header
depth = 0
i = idx_header
while i < idx_header + 5000:
    if html[i:i+4] == '<div': depth += 1
    elif html[i:i+6] == '</div>':
        depth -= 1
        if depth == 0:
            end_header = i + 6
            break
    i += 1
print(f"Header berakhir di pos: {end_header}")
# Tampilkan 3000 char setelah header
after = html[end_header:end_header+3000]
print(after)

# 3. Cari PWA install banner
print("\n=== PWA / INSTALL BANNER ===")
pwa = re.findall(r'<[^>]*(?:pwa|install|banner|splash|hero|spacer)[^>]*>.*?(?:</div>|</section>)', html, re.DOTALL|re.IGNORECASE)
for p in pwa[:5]:
    clean = re.sub(r'\s+', ' ', p).strip()
    print(f"  {clean[:300]}")

# 4. Cari justify-content:space-between pada wrapper utama
print("\n=== JUSTIFY-CONTENT SPACE-BETWEEN PADA WRAPPER ===")
jc = list(re.finditer(
    r'<div[^>]*style="[^"]*justify-content\s*:\s*space-between[^"]*"[^>]*>',
    html
))
for j in jc[:10]:
    print(f"  pos {j.start()}: {j.group(0)[:200]}")

# 5. Cari wrapper dengan padding-top besar (> 50px)
print("\n=== PADDING-TOP BESAR (>50px) ===")
big_pt = re.findall(
    r'<[^>]*style="[^"]*padding-top\s*:\s*(?:[5-9]\d|[1-9]\d{2,})px[^"]*"[^>]*>',
    html
)
for b in big_pt[:10]:
    clean = re.sub(r'\s+', ' ', b).strip()
    print(f"  {clean[:200]}")

# 6. Cari semua div yang LANGSUNG sesudah header (5 div pertama)
print("\n=== 5 DIV PERTAMA SETELAH HEADER ===")
div_pattern = re.compile(r'<div[^>]*>', re.DOTALL)
divs = list(div_pattern.finditer(html[end_header:end_header+5000]))
for d in divs[:5]:
    pos = end_header + d.start()
    print(f"  pos {pos}: {re.sub(chr(10),' ',d.group(0)[:300])}")

# 7. Cari CSS class spacer/hero
print("\n=== CSS .spacer / .hero / .splash ===")
sp = re.findall(r'\.(?:spacer|hero|splash|empty-top|top-gap|header-gap)[^{]*\{[^}]+\}', html, re.DOTALL|re.IGNORECASE)
for s in sp[:10]:
    clean = re.sub(r'\s+', ' ', s).strip()
    print(f"  {clean[:200]}")

# 8. Cari inline style dengan height/min-height besar pada div setelah header
print("\n=== DIV DENGAN HEIGHT/MIN-HEIGHT BESAR SETELAH HEADER ===")
area = html[end_header:end_header+20000]
big_h = list(re.finditer(
    r'<div[^>]*style="[^"]*(?:min-height|height)\s*:\s*(?:[2-9]\d{2,}px|[1-9]\d*vh|calc\(100vh)[^"]*"[^>]*>',
    area
))
for b in big_h[:10]:
    pos = end_header + b.start()
    print(f"  pos {pos}: {re.sub(chr(10),' ',b.group(0)[:250])}")

print("\nDone.")

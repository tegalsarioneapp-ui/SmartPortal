import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

def get_line(h, pos):
    return h[:pos].count('\n') + 1

# ══════════════════════════════════════════════
# 1. Lihat seluruh isi login-form-view
# ══════════════════════════════════════════════
print("=== 1. ISI login-form-view ===")
m = re.search(r'id="login-form-view".*?(?=<div id="[^"]*-view"|<div id="main-app")', html, re.DOTALL)
if m:
    ln = get_line(html, m.start())
    print(f"L{ln}:")
    print(html[m.start():m.start()+3000])
else:
    print("!! login-form-view tidak ditemukan")

# ══════════════════════════════════════════════
# 2. Semua tombol/button di area login
# ══════════════════════════════════════════════
print("\n=== 2. SEMUA BUTTON DI AREA LOGIN ===")
idx = html.find('id="login-form-view"')
if idx > -1:
    area = html[idx:idx+4000]
    buttons = re.finditer(r'<button[^>]*>.*?</button>', area, re.DOTALL)
    for b in buttons:
        ln = get_line(html, idx + b.start())
        clean = re.sub(r'\s+', ' ', b.group(0)).strip()
        print(f"  L{ln}: {clean[:200]}")

# ══════════════════════════════════════════════
# 3. Apakah ada form submit / input password / input ID
# ══════════════════════════════════════════════
print("\n=== 3. INPUT FIELDS LOGIN ===")
inputs = re.finditer(r'<input[^>]*(?:univ-id|univ-pass|password|username)[^>]*>', html)
for m in inputs:
    ln = get_line(html, m.start())
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

# ══════════════════════════════════════════════
# 4. Display awal login-form-view
# ══════════════════════════════════════════════
print("\n=== 4. DISPLAY AWAL login-form-view ===")
m2 = re.search(r'id="login-form-view"[^>]*style="([^"]*)"', html)
if m2:
    print(f"  style: {m2.group(1)}")
else:
    m3 = re.search(r'id="login-form-view"[^>]*>', html)
    if m3:
        ln = get_line(html, m3.start())
        print(f"  L{ln}: {m3.group(0)[:200]}")

# ══════════════════════════════════════════════
# 5. Display awal splash-view
# ══════════════════════════════════════════════
print("\n=== 5. DISPLAY AWAL splash-view ===")
m4 = re.search(r'id="splash-view"[^>]*style="([^"]*)"', html)
if m4:
    print(f"  style: {m4.group(1)[:200]}")

print("\nDone.")

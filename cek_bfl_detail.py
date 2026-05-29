import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

def get_line(h, pos):
    return h[:pos].count('\n') + 1

# 1. Lihat isi bukaFormLogin saat ini
print("=== 1. window.bukaFormLogin saat ini ===")
idx = html.find("window.bukaFormLogin")
if idx > -1:
    ln = get_line(html, idx)
    print(f"L{ln}:")
    print(html[idx:idx+700])

# 2. Lihat onclick splash-view
print("\n=== 2. splash-view onclick ===")
m = re.search(r'id="splash-view"[^>]*>', html)
if m:
    ln = get_line(html, m.start())
    print(f"L{ln}: {m.group(0)[:300]}")

# 3. Apakah login-screen punya display block/none
print("\n=== 3. login-screen div ===")
m2 = re.search(r'id="login-screen"[^>]*>', html)
if m2:
    ln = get_line(html, m2.start())
    print(f"L{ln}: {m2.group(0)[:200]}")

# 4. Semua pemanggil bukaFormLogin
print("\n=== 4. SEMUA PEMANGGIL bukaFormLogin ===")
for m in re.finditer(r'.{0,80}bukaFormLogin\s*\(\s*\).{0,80}', html):
    ln = get_line(html, m.start())
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

# 5. Lihat script paling awal yang handle splash dismiss
print("\n=== 5. SCRIPT SPLASH DISMISS (sebelum L4617) ===")
lines = html.split('\n')
for i in range(4560, min(4620, len(lines))):
    print(f"{i+1:6d}: {lines[i][:160]}")

print("\nDone.")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

def get_line(h, pos):
    return h[:pos].count('\n') + 1

# Cari login-form-view
idx = html.find('login-form-view')
print(f"=== login-form-view pertama di L{get_line(html, idx)} ===")
print(html[idx-200:idx+200])

# Cari splash-view
idx2 = html.find('splash-view')
print(f"\n=== splash-view pertama di L{get_line(html, idx2)} ===")
print(html[idx2-50:idx2+300])

# Cari onclick splash → bukaFormLogin
print("\n=== onclick splash ===")
for m in re.finditer(r'onclick=["\']bukaFormLogin[^"\']*["\']', html):
    ln = get_line(html, m.start())
    print(f"  L{ln}: {html[m.start()-100:m.start()+100]}")

# Lihat form login full L4655-4700
print("\n=== HTML L4655-4705 ===")
lines = html.split('\n')
for i in range(4654, min(4706, len(lines))):
    print(f"{i+1:6d}: {lines[i][:150]}")

# Cari fungsi bukaFormLogin di HTML — apa yang dilakukan
print("\n=== window.bukaFormLogin body ===")
m = re.search(r'window\.bukaFormLogin\s*=\s*function.*?\n\s*\};', html, re.DOTALL)
if m:
    ln = get_line(html, m.start())
    print(f"L{ln}:")
    print(m.group(0))

# Cari apakah ada timer auto-dismiss splash
print("\n=== AUTO DISMISS SPLASH ===")
for m in re.finditer(r'.{0,50}(setTimeout|setInterval).{0,100}(bukaFormLogin|splash|login-form).{0,80}', html):
    ln = get_line(html, m.start())
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln}: {clean[:200]}")

print("\nDone.")

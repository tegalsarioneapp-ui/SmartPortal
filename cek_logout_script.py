import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua posisi gt-logout-btn
print("=== SEMUA POSISI gt-logout-btn ===")
hits = list(re.finditer(r'gt-logout-btn', html))
for h in hits:
    pos = h.start()
    ln = html[:pos].count("\n") + 1
    # Cek apakah dalam script atau HTML
    # Cari <script> terdekat sebelum posisi ini
    last_script_open  = html.rfind('<script', 0, pos)
    last_script_close = html.rfind('</script>', 0, pos)
    in_script = last_script_open > last_script_close
    ctx = html[max(0,pos-80):pos+120].replace("\n"," ").strip()
    print(f"\n  L{ln} pos={pos} {'[IN SCRIPT]' if in_script else '[IN HTML]'}")
    print(f"  {ctx[:200]}")

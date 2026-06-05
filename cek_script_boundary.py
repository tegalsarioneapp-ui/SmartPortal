import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek script tag yang tidak tertutup sebelum L12701
print("=== CEK SCRIPT TAG SEBELUM pos=800056 ===")
pos_target = 800056
opens  = [(m.start(), m.group()) for m in re.finditer(r'<script[^>]*>', html[:pos_target])]
closes = [(m.start(),) for m in re.finditer(r'</script>', html[:pos_target])]
print(f"  <script> opens : {len(opens)}x")
print(f"  </script> closes: {len(closes)}x")
print(f"  Selisih: {len(opens)-len(closes)}x (harus 0)")

# Tampilkan 3 script open terakhir
print("\n  3 <script> TERAKHIR sebelum pos 800056:")
for pos, tag in opens[-3:]:
    ln = html[:pos].count("\n") + 1
    print(f"    L{ln} pos={pos}: {tag[:100]}")

# Tampilkan 3 script close terakhir
print("\n  3 </script> TERAKHIR sebelum pos 800056:")
for (pos,) in closes[-3:]:
    ln = html[:pos].count("\n") + 1
    ctx = html[pos-50:pos+20].replace("\n"," ").strip()
    print(f"    L{ln} pos={pos}: {ctx[:100]}")

# Cek area L18599 — buildDashboard string
print("\n=== CEK AREA L18593-L18600 ===")
lines = html.split("\n")
for i in range(18588, min(18605, len(lines))):
    print(f"  L{i+1}: {lines[i][:200]}")

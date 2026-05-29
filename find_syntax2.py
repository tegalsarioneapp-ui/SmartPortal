import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Cek line 11907 dan sekitarnya
print("\n=== LINE 11900-11915 ===")
for i in range(11897, 11915):
    if i < len(lines):
        print(f"{i+1}: {lines[i].rstrip()}")

# Cek line 12296 dan sekitarnya
print("\n=== LINE 12290-12305 ===")
for i in range(12287, 12305):
    if i < len(lines):
        print(f"{i+1}: {lines[i].rstrip()}")

# Cari semua catch(_ ) dan catch() kosong
print("\n=== SEMUA catch(_ ) ===")
html = "".join(lines)
matches = list(re.finditer(r'catch\s*\(\s*_\s*\)', html))
print(f"Jumlah catch(_): {len(matches)}")
for m in matches:
    start = html.rfind('\n', 0, m.start()) + 1
    print(f"  pos {m.start()}: {html[start:m.end()+20].strip()}")

# Cari catch() tanpa parameter
matches2 = list(re.finditer(r'catch\s*\(\s*\)', html))
print(f"\nJumlah catch(): {len(matches2)}")
for m in matches2:
    start = html.rfind('\n', 0, m.start()) + 1
    print(f"  pos {m.start()}: {html[start:m.end()+20].strip()}")

print("\nDone.")

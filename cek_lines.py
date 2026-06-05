import re

FILE = "artifacts/smart-portal-rt/public/_sync.js"
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Tampilkan baris 5-15 untuk lihat konteks
lines = content.split('\n')
print("=== BARIS 4-15 SEKARANG ===")
for i in range(3, min(15, len(lines))):
    print(f"  L{i+1}: {lines[i]}")

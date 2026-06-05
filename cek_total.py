FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

total = len(lines)
print(f"Total baris: {total}")

# Tampilkan 20 baris terakhir
print("\n=== 20 BARIS TERAKHIR ===")
for i, line in enumerate(lines[-20:], start=total-19):
    print(f"  L{i}: {line.rstrip()[:200]}")

# Cek apakah vercel deploy dari file yang berbeda
import os
print(f"\nFile size: {os.path.getsize(FILE):,} bytes")

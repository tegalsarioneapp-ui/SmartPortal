FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# PATCH 1: Hapus section Belum Bayar (line 7621-7644, index 7620-7643)
# Cek dulu
print("Cek line 7621:", lines[7620].strip()[:60])
print("Cek line 7644:", lines[7643].strip()[:60])

new_lines = []
for i, line in enumerate(lines):
    ln = i + 1  # 1-based
    if 7621 <= ln <= 7644:
        continue  # hapus
    new_lines.append(line)

print(f"Lines sebelum: {len(lines)}, sesudah: {len(new_lines)}, hapus: {len(lines)-len(new_lines)}")

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("OK: Hapus section Belum Bayar")
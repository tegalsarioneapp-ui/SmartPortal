FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

total = len(lines)

# Rentang baris yang akan dihapus (0-based index = lineNumber - 1)
# Hapus semua sisa fungsi bendahara yang belum terhapus:
# simpanIuranKolektif (6408) sampai sebelum window.getNominalByBulan (8508)
# KECUALI: simpanKas (6406) dan simpanSaldoAwal (6405) → tetap ada

ranges_to_delete = [
    (6407, 8507),   # simpanIuranKolektif s/d sebelum getNominalByBulan
]

# Tandai baris yang dihapus
delete_set = set()
for start, end in ranges_to_delete:
    for i in range(start - 1, end - 1):  # convert ke 0-based
        delete_set.add(i)

new_lines = []
deleted = 0
for i, line in enumerate(lines):
    if i in delete_set:
        deleted += 1
    else:
        new_lines.append(line)

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"✅ Hapus {deleted} baris (line 6408-8507)")
print(f"   Dari {total} → {len(new_lines)} baris")
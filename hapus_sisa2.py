FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Hapus line 6422 s/d 6813 (sisa fungsi iuran yang mengambang)
# line 6814+ (renderRiwayatIuranHariIni) juga hapus karena tab ben-iuran sudah dihapus
# Stop sebelum lihatKartuWarga (line 6856)

delete_start = 6422 - 1  # 0-based
delete_end   = 6854 - 1  # 0-based, sampai baris kosong sebelum lihatKartuWarga

delete_set = set(range(delete_start, delete_end))

new_lines = []
deleted = 0
for i, line in enumerate(lines):
    if i in delete_set:
        deleted += 1
    else:
        new_lines.append(line)

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"✅ Hapus {deleted} baris (line 6422-6853)")
print(f"   Dari {len(lines)} → {len(new_lines)} baris")
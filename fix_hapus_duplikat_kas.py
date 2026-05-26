FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Cari semua kemunculan filterLaporanKas function definition
MARKER_FILTER = "    window.filterLaporanKas = function() {"
MARKER_RESET  = "    window.resetFilterKas = function() {"
MARKER_HAPUS  = "    window.hapusKas = function(id) {"

# Hitung kemunculan
print("filterLaporanKas count:", content.count(MARKER_FILTER))
print("resetFilterKas count  :", content.count(MARKER_RESET))
print("hapusKas count        :", content.count(MARKER_HAPUS))

# Strategi: hapus blok KEDUA dari filterLaporanKas s/d resetFilterKas (blok duplikat)
# Blok duplikat dimulai dari kemunculan ke-2 filterLaporanKas
# sampai sebelum window.hapusKas

def remove_second_occurrence(text, start_marker, end_marker):
    first = text.find(start_marker)
    if first == -1:
        print(f"GAGAL: {start_marker} tidak ditemukan")
        return text
    second = text.find(start_marker, first + len(start_marker))
    if second == -1:
        print(f"OK: tidak ada duplikat untuk {start_marker}")
        return text
    # Cari end_marker setelah second
    end = text.find(end_marker, second)
    if end == -1:
        print(f"GAGAL: end marker tidak ditemukan setelah duplikat")
        return text
    # Hapus dari second sampai end_marker (tidak termasuk end_marker)
    removed = text[second:end]
    print(f"HAPUS duplikat ({len(removed)} chars): {start_marker[:60]}...")
    return text[:second] + text[end:]

# Hapus duplikat filterLaporanKas + resetFilterKas (blok ke-2)
# Blok ke-2 dimulai dari filterLaporanKas ke-2 sampai hapusKas
content = remove_second_occurrence(
    content,
    "    window.filterLaporanKas = function() {",
    "    window.hapusKas = function(id) {"
)

print("\nHasil setelah cleanup:")
print("filterLaporanKas count:", content.count("    window.filterLaporanKas = function() {"))
print("resetFilterKas count  :", content.count("    window.resetFilterKas = function() {"))

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)
print("\nSELESAI - duplikat dihapus")
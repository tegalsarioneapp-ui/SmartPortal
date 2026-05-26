FILE_HTML = "artifacts/smart-portal-rt/index.html"
FILE_JS   = "step2_engine.txt"

with open(FILE_HTML, "r", encoding="utf-8") as f:
    html = f.read()

with open(FILE_JS, "r", encoding="utf-8") as f:
    new_engine = f.read()

OLD_START = "    // === MESIN ANALISA & PENAGIHAN REAL-TIME (DIBEDAH 3 POS) ==="
OLD_END   = "    window.togglePenagihanList = function() {"

idx_s = html.find(OLD_START)
idx_e = html.find(OLD_END)

if idx_s == -1: print("GAGAL: OLD_START tidak ditemukan!"); exit(1)
if idx_e == -1: print("GAGAL: OLD_END tidak ditemukan!");   exit(1)

print(f"OK: Blok lama ditemukan (char {idx_s} → {idx_e})")
print(f"OK: Panjang kode baru = {len(new_engine)} karakter")

html = html[:idx_s] + new_engine + "\n\n    " + html[idx_e:]

with open(FILE_HTML, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: Inject selesai!")
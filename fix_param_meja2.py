FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK: {label}")

# PATCH 1: Load iuranMeja di loadPengaturan
patch('Load iuranMeja di loadPengaturan',
"        if (_elMeja) _elMeja.value = _param.targetUangMeja || 250000;",
"""        if (_elMeja) _elMeja.value = _param.targetUangMeja || 250000;
        let _elIuranMeja = document.getElementById('set_iuran_meja');
        if (_elIuranMeja) _elIuranMeja.value = _param.iuranMeja || 5000;""")

# PATCH 2: loadAnalisaUangMeja pakai iuranMeja dinamis
# Cek dulu apakah patch 4 sebelumnya sudah masuk atau belum
patch('loadAnalisaUangMeja iuranMeja dinamis',
"        var ji = JSON.parse(localStorage.getItem('db_jenis_iuran')||'null');",
"""        var param   = JSON.parse(localStorage.getItem('db_param_pertemuan')||'{}');
        var iuranMejaPerWarga = param.iuranMeja || 5000;
        var ji = JSON.parse(localStorage.getItem('db_jenis_iuran')||'null');""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
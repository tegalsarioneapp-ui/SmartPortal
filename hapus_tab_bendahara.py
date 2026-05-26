FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

import re

# ─── HAPUS TAB BUTTON (kecuali ben-input) ───
buttons_to_remove = [
    r'<button class="admin-tab-btn"[^>]*openBenTab\(\'ben-iuran\'\)[^>]*>.*?</button>',
    r'<button class="admin-tab-btn"[^>]*openBenTab\(\'ben-laporan\'\)[^>]*>.*?</button>',
    r'<button class="admin-tab-btn"[^>]*openBenTab\(\'ben-matriks\'\)[^>]*>.*?</button>',
    r'<button class="admin-tab-btn"[^>]*openBenTab\(\'ben-penagihan\'\)[^>]*>.*?</button>',
    r'<button class="admin-tab-btn"[^>]*openBenTab\(\'ben-arsip\'\)[^>]*>.*?</button>',
]
for pat in buttons_to_remove:
    html, n = re.subn(pat, '', html, flags=re.DOTALL)
    print(f"Hapus button: {n} ditemukan")

# ─── HAPUS TAB CONTENT (kecuali ben-input) ───
tabs_to_remove = ['ben-iuran', 'ben-laporan', 'ben-matriks', 'ben-penagihan', 'ben-arsip']
for tab in tabs_to_remove:
    pat = r'<div id="' + tab + r'"[^>]*>.*?(?=<div id="ben-|<div id="view-|</div>\s*</div>\s*</div>\s*<div id="view-)'
    html, n = re.subn(pat, '', html, flags=re.DOTALL)
    print(f"Hapus tab {tab}: {n} ditemukan")

# ─── HAPUS FUNGSI JS ───
funcs_to_remove = [
    # loadKasBendahara
    r'window\.loadKasBendahara\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # loadAnalisaUangMeja
    r'window\.loadAnalisaUangMeja\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # eksekusiDanaTalangan
    r'window\.eksekusiDanaTalangan\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # catatPengembalianTalangan
    r'window\.catatPengembalianTalangan\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # setorPembangunanKeKas
    r'window\.setorPembangunanKeKas\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # catatSosialBA
    r'window\.catatSosialBA\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # loadMatriksIuran
    r'window\.loadMatriksIuran\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # setorUangMeja
    r'window\.setorUangMeja\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # loadArsipBA
    r'window\.loadArsipBA\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # cetakBA
    r'window\.cetakBA\s*=\s*function\s*\(.*?\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # hitungOtomatisIuran
    r'window\.hitungOtomatisIuran\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # simpanIuranKolektifBaru
    r'window\.simpanIuranKolektifBaru\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # inputIuranCepat
    r'window\.inputIuranCepat\s*=\s*function\s*\(.*?\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # hitungKurangBayar
    r'window\.hitungKurangBayar\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # renderKurangBayar
    r'window\.renderKurangBayar\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # lunasiSatuKurangBayar
    r'window\.lunasiSatuKurangBayar\s*=\s*function\s*\(.*?\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # lunasKurangBayarWarga
    r'window\.lunasKurangBayarWarga\s*=\s*function\s*\(.*?\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
    # loadTabIuranKolektif
    r'window\.loadTabIuranKolektif\s*=\s*function\s*\(\s*\)\s*\{.*?(?=\n\s*window\.|\n\s*function )',
]

for pat in funcs_to_remove:
    html, n = re.subn(pat, '', html, flags=re.DOTALL)
    print(f"Hapus fungsi: {n} ditemukan")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\n✅ Selesai! Semua tab dan fungsi bendahara dihapus kecuali ben-input")
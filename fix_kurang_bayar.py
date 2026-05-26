FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL — tidak ditemukan: {label}")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK: {label}")

# ═══ PATCH 1: hitungKurangBayar — skip sudahLunasKurang ═══
patch("hitungKurangBayar skip sudahLunasKurang",
"""        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var nominalDibayar = Number(x.nominal) || 0;""",
"""        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            if (x.sudahLunasKurang) return;  // sudah dilunasi — skip
            var nominalDibayar = Number(x.nominal) || 0;""")

# ═══ PATCH 2: loadMatriksIuran — lunasIni hitung sudahLunasKurang juga ═══
patch("loadMatriksIuran lunasIni cek sudahLunasKurang",
"""                    if(bayar.posted){if(nominal<nominalStd){status='kurang';kurangRow++;}else{status='lunas';lunasCount++;}}""",
"""                    if(bayar.posted){if(bayar.sudahLunasKurang||nominal>=nominalStd){status='lunas';lunasCount++;}else{status='kurang';kurangRow++;}}""")

# ═══ PATCH 3: loadMatriksIuran stat — lunasIni cek sudahLunasKurang ═══
patch("loadMatriksIuran stat lunasIni cek sudahLunasKurang",
"""            if(b){ if(b.posted){ if(Number(b.nominal)<nominalStd)kurangCount++; else lunasIni++; } else pendingCount++; }""",
"""            if(b){ if(b.posted){ if(b.sudahLunasKurang||Number(b.nominal)>=nominalStd){lunasIni++;}else{kurangCount++;} } else pendingCount++; }""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ {count}/3 patch berhasil!")
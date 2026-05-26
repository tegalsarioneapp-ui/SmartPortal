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

patch("loadAnalisaUangMeja — baca terkumpul dari db_kas bukan jmlBayar×nominal",
"""        var mejaTerkumpul   = jmlBayar*nomMeja;
        var mejaKurang      = Math.max(0,targetMeja-mejaTerkumpul);
        var bangunTerkumpul = jmlBayar*nomBangun;
        var sosialTerkumpul = jmlBayar*nomSosial;
        var agusTerkumpul   = jmlBayar*nomAgustus;
        var agusKumulatif   = dbPertemuan.reduce(function(s,p){return s+(p.agustusTerkumpul||0);},0)+agusTerkumpul;""",
"""        // Baca terkumpul dari db_kas — sumber kebenaran setelah simpanBulan catat per komponen
        var dbKasBaca = JSON.parse(localStorage.getItem('db_kas')||'[]');

        // Meja: semua entri masuk dengan uraian mengandung 'Uang Meja' dan sumber iuran
        var mejaTerkumpul = dbKasBaca
            .filter(function(k){
                return k.tipe==='masuk' && k.sumber==='iuran'
                    && (k.uraian||'').toLowerCase().indexOf('uang meja') !== -1;
            })
            .reduce(function(s,k){ return s+(Number(k.nominal)||0); }, 0);

        // Pembangunan: semua entri masuk dengan uraian mengandung 'Pembangunan' dan sumber iuran
        var bangunTerkumpul = dbKasBaca
            .filter(function(k){
                return k.tipe==='masuk' && k.sumber==='iuran'
                    && (k.uraian||'').toLowerCase().indexOf('pembangunan') !== -1;
            })
            .reduce(function(s,k){ return s+(Number(k.nominal)||0); }, 0);

        // Sosial: hitung dari db_iuran bulan ini (tidak masuk kas utama)
        var sosialTerkumpul = jmlBayar*nomSosial;

        // 17 Agustus: hitung dari db_iuran bulan ini (tidak masuk kas utama)
        var agusTerkumpul   = jmlBayar*nomAgustus;
        var agusKumulatif   = dbPertemuan.reduce(function(s,p){return s+(p.agustusTerkumpul||0);},0)+agusTerkumpul;

        // Meja: kekurangan vs target tuan rumah bulan ini saja
        var mejaBulanIni = jmlBayar*nomMeja;
        var mejaKurang   = Math.max(0,targetMeja-mejaBulanIni);

        // Expose terkumpul meja bulan ini untuk setorUangMeja
        window.currentTerkumpulMeja = mejaBulanIni;""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✅ {count}/1 patch berhasil!" if count else "GAGAL!")
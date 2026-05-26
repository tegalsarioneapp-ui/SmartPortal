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

# ─── HELPER: getKomponenByBulan — satu fungsi tunggal untuk semua ───
# Sisipkan setelah getJenisIuranMap (line 7494)
patch("Tambah helper getKomponenByBulan",
"""    function getSaldoKas() {""",
"""    // Helper tunggal — kembalikan breakdown komponen per bulan
    // Return: { total, pembangunan, meja, agustus, sosial, masukKas }
    // masukKas = nominal yang masuk db_kas (Pembangunan + Meja saja)
    function getKomponenByBulan(bulan) {
        var periodeLama = [
            'September 2025','Oktober 2025','November 2025','Desember 2025',
            'Januari 2026','Februari 2026','Maret 2026','April 2026','Mei 2026'
        ];
        var ji = getJenisIuranMap();
        var nomBangun=0, nomMeja=0, nomAgustus=0, nomSosial=0;
        ji.forEach(function(j){
            var n=(j.nama||'').toLowerCase();
            if(n.indexOf('bangun')  !==-1) nomBangun  = Number(j.nominal)||0;
            if(n.indexOf('meja')    !==-1) nomMeja    = Number(j.nominal)||0;
            if(n.indexOf('agustus') !==-1) nomAgustus = Number(j.nominal)||0;
            if(n.indexOf('sosial')  !==-1) nomSosial  = Number(j.nominal)||0;
        });
        var isLama = periodeLama.indexOf(bulan) !== -1;
        // Periode lama tidak ada komponen sosial
        var sosial = isLama ? 0 : nomSosial;
        var total  = nomBangun + nomMeja + nomAgustus + sosial;
        return {
            total      : total,
            pembangunan: nomBangun,
            meja       : nomMeja,
            agustus    : nomAgustus,
            sosial     : sosial,
            masukKas   : nomBangun + nomMeja  // hanya ini yang masuk db_kas
        };
    }

    function getSaldoKas() {""")

# ─── PATCH 1: inputIuranCepat — pisah komponen ───
patch("inputIuranCepat pisah komponen per rule",
"""            dbIuran2.push({
                id: idBase,
                idWarga: w.id,
                namaWarga: w.nama,
                bulan: bulan,
                nominal: nominalIuran,
                tanggal: tgl,
                posted: true
            });
            dbKas.push({
                id: idBase+1,
                tgl: tgl,
                uraian: 'Iuran '+bulan+' - '+w.nama,
                tipe: 'masuk',
                nominal: nominalIuran,
                sumber: 'iuran'
            });
            localStorage.setItem('db_iuran', JSON.stringify(dbIuran2));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if(typeof _sync !== 'undefined'){
                _sync.setItem('db_iuran', JSON.stringify(dbIuran2));
                _sync.setItem('db_kas', JSON.stringify(dbKas));
            }
            Swal.fire('Berhasil!', 'Iuran '+bulan+' untuk '+w.nama+' berhasil dicatat!', 'success');""",
"""            var komp = getKomponenByBulan(bulan);
            dbIuran2.push({
                id            : idBase,
                idWarga       : w.id,
                namaWarga     : w.nama,
                bulan         : bulan,
                nominal       : komp.total,
                komponenAgustus: komp.agustus,
                komponenSosial : komp.sosial,
                tanggal       : tgl,
                posted        : true
            });
            // Pembangunan masuk kas
            if(komp.pembangunan > 0) dbKas.push({
                id: idBase+1, tgl: tgl,
                uraian: 'Pembangunan '+bulan+' - '+w.nama,
                tipe: 'masuk', nominal: komp.pembangunan, sumber: 'iuran'
            });
            // Uang Meja masuk kas
            if(komp.meja > 0) dbKas.push({
                id: idBase+2, tgl: tgl,
                uraian: 'Uang Meja '+bulan+' - '+w.nama,
                tipe: 'masuk', nominal: komp.meja, sumber: 'iuran'
            });
            localStorage.setItem('db_iuran', JSON.stringify(dbIuran2));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if(typeof _sync !== 'undefined'){
                _sync.setItem('db_iuran', JSON.stringify(dbIuran2));
                _sync.setItem('db_kas', JSON.stringify(dbKas));
            }
            Swal.fire('Berhasil!', 'Iuran '+bulan+' untuk '+w.nama+' berhasil dicatat!', 'success');""")

# ─── PATCH 2: loadAnalisaUangMeja — baca agustus & sosial dari db_iuran ───
patch("loadAnalisaUangMeja baca agustus sosial dari db_iuran",
"""        // Sosial: hitung dari db_iuran bulan ini (tidak masuk kas utama)
        var sosialTerkumpul = jmlBayar*nomSosial;

        // 17 Agustus: hitung dari db_iuran bulan ini (tidak masuk kas utama)
        var agusTerkumpul   = jmlBayar*nomAgustus;
        var agusKumulatif   = dbPertemuan.reduce(function(s,p){return s+(p.agustusTerkumpul||0);},0)+agusTerkumpul;

        // Meja: kekurangan vs target tuan rumah bulan ini saja
        var mejaBulanIni = jmlBayar*nomMeja;
        var mejaKurang   = Math.max(0,targetMeja-mejaBulanIni);

        // Expose terkumpul meja bulan ini untuk setorUangMeja
        window.currentTerkumpulMeja = mejaBulanIni;""",
"""        // 17 Agustus — baca dari field komponenAgustus di db_iuran bulan ini
        var agusTerkumpul = iuranBln.reduce(function(s,x){
            return s + (Number(x.komponenAgustus)||0);
        }, 0);
        // Fallback: kalau field belum ada (data lama), hitung dari jmlBayar
        if(agusTerkumpul === 0 && jmlBayar > 0) agusTerkumpul = jmlBayar * nomAgustus;

        // Sosial — baca dari field komponenSosial di db_iuran bulan ini
        var sosialTerkumpul = iuranBln.reduce(function(s,x){
            return s + (Number(x.komponenSosial)||0);
        }, 0);
        // Fallback: kalau field belum ada (data lama), hitung dari jmlBayar
        if(sosialTerkumpul === 0 && jmlBayar > 0) sosialTerkumpul = jmlBayar * nomSosial;

        var agusKumulatif = dbPertemuan.reduce(function(s,p){
            return s+(p.agustusTerkumpul||0);
        },0) + agusTerkumpul;

        // Meja bulan ini dari db_iuran (bukan db_kas karena sudah masuk saat input)
        var mejaBulanIni = iuranBln.reduce(function(s,x){
            return s + (Number(x.komponenMeja)||nomMeja);
        }, 0);
        var mejaKurang   = Math.max(0, targetMeja - mejaBulanIni);
        window.currentTerkumpulMeja = mejaBulanIni;""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ {count}/3 patch berhasil!" if count==3 else f"⚠️ Hanya {count}/3 patch berhasil!")
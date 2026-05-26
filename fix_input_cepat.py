FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Sisipkan sebelum simpanIuranKolektifBaru
OLD = "    window.simpanIuranKolektifBaru = function() {"

NEW = """    window.inputIuranCepat = function(idWarga, bulan) {
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var w = dbWarga.find(function(x){ return String(x.id)===String(idWarga); });
        if(!w) return Swal.fire('Gagal','Data warga tidak ditemukan!','error');
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var sudahAda = dbIuran.some(function(x){
            return String(x.idWarga)===String(idWarga) && x.bulan===bulan && x.posted;
        });
        if(sudahAda) return Swal.fire('Info','Iuran '+bulan+' untuk '+w.nama+' sudah tercatat!','info');
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var dbJenis = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        var breakdown = dbJenis.length > 0
            ? dbJenis.map(function(j){ return j.nama+': '+fmt(j.nominal); }).join(', ')
            : 'Total: '+fmt(nominalIuran);
        Swal.fire({
            title: 'Catat Iuran Cepat',
            html:
                '<div style="text-align:left;font-size:0.9rem;">' +
                '<b>Warga:</b> '+w.nama+'<br>' +
                '<b>Bulan:</b> '+bulan+'<br>' +
                '<b>Nominal:</b> '+fmt(nominalIuran)+'<br>' +
                '<small style="color:#64748b;">'+breakdown+'</small>' +
                '</div>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check"></i> Catat Sekarang',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#10b981'
        }).then(function(res){
            if(!res.isConfirmed) return;
            var dbIuran2 = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            var tgl = new Date().toISOString().split('T')[0];
            var idBase = Date.now();
            dbIuran2.push({
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
            Swal.fire('Berhasil!', 'Iuran '+bulan+' untuk '+w.nama+' berhasil dicatat!', 'success');
            if(typeof window.loadMatriksIuran === 'function') window.loadMatriksIuran();
            if(typeof window.loadKasBendahara === 'function') window.loadKasBendahara();
            if(typeof window.loadAnalisaUangMeja === 'function') window.loadAnalisaUangMeja();
        });
    };

    window.simpanIuranKolektifBaru = function() {"""

if OLD not in html:
    print("GAGAL: anchor tidak ditemukan")
else:
    html = html.replace(OLD, NEW, 1)
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(html)
    print("OK: Tambah fungsi inputIuranCepat")
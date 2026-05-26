FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """        function simpanBulan(nominalFinal) {
            var totalNominal = 0;
            bulanDipilih.forEach(function(bulan, idx) {
                var nominalIuran = nominalFinal !== null ? nominalFinal : window.getNominalByBulan(bulan);
                totalNominal += nominalIuran;
                dbIuran.push({
                    id: idBase+idx,
                    idWarga: _iuranWargaTerpilih.id,
                    namaWarga: _iuranWargaTerpilih.nama,
                    bulan: bulan,
                    nominal: nominalIuran,
                    tanggal: tgl,
                    posted: true
                });
            });
            // Kas diringkas jadi 1 entri saja
            var bulanLabel = bulanDipilih.length === 1
                ? bulanDipilih[0]
                : bulanDipilih[0].split(' ')[0] + '-' + bulanDipilih[bulanDipilih.length-1].split(' ')[0]
                  + ' ' + (bulanDipilih[0].split(' ')[1] || '');
            dbKas.push({
                id: idBase+1000,
                tgl: tgl,
                uraian: 'Iuran ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                tipe: 'masuk',
                nominal: totalNominal,
                sumber: 'iuran'
            });
            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            window._iuranDbIuran = dbIuran;
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Swal.fire('Berhasil!', _iuranWargaTerpilih.nama+' - '+bulanDipilih.length+' bulan tercatat! Total: '+fmt(totalNominal), 'success');
            window.loadTabIuranKolektif();
            var chk = document.getElementById('iuran-override-check');
            var wrap = document.getElementById('iuran-override-wrap');
            if (chk) chk.checked = false;
            if (wrap) wrap.style.display = 'none';
        }"""

NEW = """        function simpanBulan(nominalFinal) {
            var totalNominal = 0;

            // Ambil komponen dari db_jenis_iuran — nominal TETAP per item per bulan
            var jiKomp = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
            if (!jiKomp.length) jiKomp = [
                {nama:'Pembangunan', nominal:10000},
                {nama:'Uang Meja',   nominal:5000},
                {nama:'17 Agustus',  nominal:5000},
                {nama:'Sosial',      nominal:5000}
            ];

            // Cari nominal Pembangunan & Uang Meja langsung dari admin setting
            var nomBangunPerBulan = 0;
            var nomMejaPerBulan   = 0;
            jiKomp.forEach(function(j) {
                var nm = (j.nama || '').toLowerCase();
                if (nm.indexOf('bangun') !== -1) nomBangunPerBulan = Number(j.nominal) || 0;
                if (nm.indexOf('meja')   !== -1) nomMejaPerBulan   = Number(j.nominal) || 0;
            });

            // Simpan db_iuran per bulan
            bulanDipilih.forEach(function(bulan, idx) {
                var nominalIuran = nominalFinal !== null ? nominalFinal : window.getNominalByBulan(bulan);
                totalNominal += nominalIuran;
                dbIuran.push({
                    id: idBase+idx,
                    idWarga: _iuranWargaTerpilih.id,
                    namaWarga: _iuranWargaTerpilih.nama,
                    bulan: bulan,
                    nominal: nominalIuran,
                    tanggal: tgl,
                    posted: true
                });
            });

            // Label range bulan
            var bulanLabel = bulanDipilih.length === 1
                ? bulanDipilih[0]
                : bulanDipilih[0].split(' ')[0] + '-' + bulanDipilih[bulanDipilih.length-1].split(' ')[0]
                  + ' ' + (bulanDipilih[0].split(' ')[1] || '');

            // Total akumulatif = nominal per bulan × jumlah bulan dipilih
            var totalBangun = nomBangunPerBulan * bulanDipilih.length;
            var totalMeja   = nomMejaPerBulan   * bulanDipilih.length;

            // Catat 2 baris kas terpisah
            if (totalBangun > 0) {
                dbKas.push({
                    id: idBase + 1001,
                    tgl: tgl,
                    uraian: 'Pembangunan ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                    tipe: 'masuk',
                    nominal: totalBangun,
                    sumber: 'iuran'
                });
            }
            if (totalMeja > 0) {
                dbKas.push({
                    id: idBase + 1002,
                    tgl: tgl,
                    uraian: 'Uang Meja ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                    tipe: 'masuk',
                    nominal: totalMeja,
                    sumber: 'iuran'
                });
            }

            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            window._iuranDbIuran = dbIuran;
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Swal.fire('Berhasil!', _iuranWargaTerpilih.nama+' - '+bulanDipilih.length+' bulan tercatat! Total: '+fmt(totalNominal), 'success');
            window.loadTabIuranKolektif();
            var chk = document.getElementById('iuran-override-check');
            var wrap = document.getElementById('iuran-override-wrap');
            if (chk) chk.checked = false;
            if (wrap) wrap.style.display = 'none';
        }"""

if OLD not in html:
    print("GAGAL — string tidak ditemukan!")
    exit(1)

html = html.replace(OLD, NEW, 1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("✅ 1/1 patch berhasil!")
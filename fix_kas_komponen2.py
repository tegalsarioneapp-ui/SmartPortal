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

patch("simpanBulan — kas per komponen langsung dari db_jenis_iuran",
"""        function simpanBulan(nominalFinal) {
            var totalNominal = 0;

            // Ambil komponen dari db_jenis_iuran
            var jiKomp = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
            if (!jiKomp.length) jiKomp = [
                {nama:'Pembangunan', nominal:10000},
                {nama:'Uang Meja',   nominal:5000},
                {nama:'17 Agustus',  nominal:5000},
                {nama:'Sosial',      nominal:5000}
            ];
            var totalPerBulan = jiKomp.reduce(function(s,x){return s+(x.nominal||0);},0) || 25000;

            // Cari nominal Pembangunan & Uang Meja
            var nomBangunPerBulan = 0;
            var nomMejaPerBulan   = 0;
            jiKomp.forEach(function(j){
                var nm = (j.nama||'').toLowerCase();
                if (nm.indexOf('bangun') !== -1) nomBangunPerBulan = j.nominal || 0;
                if (nm.indexOf('meja')   !== -1) nomMejaPerBulan   = j.nominal || 0;
            });

            // Akumulator
            var akumBangun = 0;
            var akumMeja   = 0;

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
                // Akumulasi proporsional per bulan
                if (totalPerBulan > 0) {
                    akumBangun += Math.round((nomBangunPerBulan / totalPerBulan) * nominalIuran);
                    akumMeja   += Math.round((nomMejaPerBulan   / totalPerBulan) * nominalIuran);
                }
            });

            // Label range bulan
            var bulanLabel;
            if (bulanDipilih.length === 1) {
                bulanLabel = bulanDipilih[0];
            } else {
                var thn          = bulanDipilih[0].split(' ')[1] || '';
                var bAwal        = bulanDipilih[0].split(' ')[0];
                var bAkhir       = bulanDipilih[bulanDipilih.length-1].split(' ')[0];
                bulanLabel       = bAwal + '-' + bAkhir + (thn ? ' ' + thn : '');
            }

            // Catat 2 baris kas: Pembangunan + Uang Meja (akumulatif)
            if (akumBangun > 0) {
                dbKas.push({
                    id: idBase + 1001,
                    tgl: tgl,
                    uraian: 'Pembangunan ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                    tipe: 'masuk',
                    nominal: akumBangun,
                    sumber: 'iuran'
                });
            }
            if (akumMeja > 0) {
                dbKas.push({
                    id: idBase + 1002,
                    tgl: tgl,
                    uraian: 'Uang Meja ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                    tipe: 'masuk',
                    nominal: akumMeja,
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
        }""",
"""        function simpanBulan(nominalFinal) {
            var totalNominal = 0;

            // Ambil komponen langsung dari db_jenis_iuran — pakai nominal per item
            var jiKomp = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
            if (!jiKomp.length) jiKomp = [
                {nama:'Pembangunan', nominal:10000},
                {nama:'Uang Meja',   nominal:5000},
                {nama:'17 Agustus',  nominal:5000},
                {nama:'Sosial',      nominal:5000}
            ];

            // Cari nominal Pembangunan & Uang Meja langsung — bukan proporsional
            var nomBangunPerBulan = 0;
            var nomMejaPerBulan   = 0;
            jiKomp.forEach(function(j) {
                var nm = (j.nama || '').toLowerCase();
                if (nm.indexOf('bangun') !== -1) nomBangunPerBulan = Number(j.nominal) || 0;
                if (nm.indexOf('meja')   !== -1) nomMejaPerBulan   = Number(j.nominal) || 0;
            });

            // Akumulator: nominal tetap per bulan × jumlah bulan
            var akumBangun = 0;
            var akumMeja   = 0;

            bulanDipilih.forEach(function(bulan, idx) {
                var nominalIuran = nominalFinal !== null ? nominalFinal : window.getNominalByBulan(bulan);
                totalNominal += nominalIuran;
                dbIuran.push({
                    id: idBase + idx,
                    idWarga: _iuranWargaTerpilih.id,
                    namaWarga: _iuranWargaTerpilih.nama,
                    bulan: bulan,
                    nominal: nominalIuran,
                    tanggal: tgl,
                    posted: true
                });
                // Langsung pakai nominal per komponen — bukan proporsional
                akumBangun += nomBangunPerBulan;
                akumMeja   += nomMejaPerBulan;
            });

            // Label range bulan
            var bulanLabel;
            if (bulanDipilih.length === 1) {
                bulanLabel = bulanDipilih[0];
            } else {
                var thn    = bulanDipilih[0].split(' ')[1] || '';
                var bAwal  = bulanDipilih[0].split(' ')[0];
                var bAkhir = bulanDipilih[bulanDipilih.length - 1].split(' ')[0];
                bulanLabel = bAwal + '-' + bAkhir + (thn ? ' ' + thn : '');
            }

            // 2 baris kas akumulatif: Pembangunan + Uang Meja
            if (akumBangun > 0) {
                dbKas.push({
                    id: idBase + 1001,
                    tgl: tgl,
                    uraian: 'Pembangunan ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                    tipe: 'masuk',
                    nominal: akumBangun,
                    sumber: 'iuran'
                });
            }
            if (akumMeja > 0) {
                dbKas.push({
                    id: idBase + 1002,
                    tgl: tgl,
                    uraian: 'Uang Meja ' + bulanLabel + ' - ' + _iuranWargaTerpilih.nama,
                    tipe: 'masuk',
                    nominal: akumMeja,
                    sumber: 'iuran'
                });
            }

            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            window._iuranDbIuran = dbIuran;
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Swal.fire('Berhasil!', _iuranWargaTerpilih.nama + ' - ' + bulanDipilih.length + ' bulan tercatat! Total: ' + fmt(totalNominal), 'success');
            window.loadTabIuranKolektif();
            var chk = document.getElementById('iuran-override-check');
            var wrap = document.getElementById('iuran-override-wrap');
            if (chk) chk.checked = false;
            if (wrap) wrap.style.display = 'none';
        }""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ {count}/1 patch berhasil!")

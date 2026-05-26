FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

old = "    window.renderRiwayatIuranHariIni = function() {"

new = """    // ═══ SISTEM KURANG BAYAR ═══
    // Nominal seharusnya per periode:
    // Jan-Mei 2026 = 20000 (3 komponen)
    // Jun 2026+    = 25000 (4 komponen, tambah Uang Sosial)
    var BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'];

    function getNominalSeharusnya(bulan, tahun) {
        tahun = tahun || 2026;
        var idx = BULAN_LIST.indexOf(bulan);
        if (tahun < 2026) return 20000;
        if (tahun === 2026 && idx <= 4) return 20000; // Jan=0 s/d Mei=4
        return 25000;
    }

    window.hitungKurangBayar = function() {
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var hasil = [];

        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var nominalDibayar = Number(x.nominal) || 0;
            var tahun = 2026;
            // Coba baca tahun dari field tanggal jika ada
            if (x.tanggal) {
                var t = new Date(x.tanggal);
                if (!isNaN(t)) tahun = t.getFullYear();
            }
            var seharusnya = getNominalSeharusnya(x.bulan, tahun);
            var kurang = seharusnya - nominalDibayar;
            if (kurang > 0) {
                var warga = dbWarga.find(function(w) {
                    return String(w.id) === String(x.idWarga);
                });
                hasil.push({
                    idIuran: x.id,
                    idWarga: x.idWarga,
                    namaWarga: x.namaWarga || (warga ? warga.nama : 'Unknown'),
                    bulan: x.bulan,
                    tanggal: x.tanggal || '',
                    nominalDibayar: nominalDibayar,
                    seharusnya: seharusnya,
                    kurang: kurang
                });
            }
        });

        // Urutkan: nama warga → bulan
        hasil.sort(function(a, b) {
            if (a.namaWarga < b.namaWarga) return -1;
            if (a.namaWarga > b.namaWarga) return 1;
            return BULAN_LIST.indexOf(a.bulan) - BULAN_LIST.indexOf(b.bulan);
        });

        return hasil;
    };

    window.renderKurangBayar = function() {
        var tbody = document.getElementById('tbody-kurang-bayar');
        var elTotal = document.getElementById('kurang-bayar-total');
        var elStat = document.getElementById('iuran-stat-kurang');
        if (!tbody) return;

        var data = window.hitungKurangBayar();

        if (elStat) elStat.innerText = data.length;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#16a34a;padding:20px;font-weight:700;">' +
                '<i class="fa-solid fa-circle-check"></i> Tidak ada kurang bayar!</td></tr>';
            if (elTotal) elTotal.innerText = '';
            return;
        }

        var totalKurang = data.reduce(function(s, x) { return s + x.kurang; }, 0);
        if (elTotal) elTotal.innerText = 'Total kekurangan: Rp ' + totalKurang.toLocaleString('id-ID');

        var rows = '';
        data.forEach(function(x) {
            rows += '<tr>' +
                '<td style="font-weight:600;">' + x.namaWarga + '</td>' +
                '<td>' + x.bulan + '</td>' +
                '<td style="color:var(--text-muted);">Rp ' + x.nominalDibayar.toLocaleString('id-ID') + '</td>' +
                '<td>Rp ' + x.seharusnya.toLocaleString('id-ID') + '</td>' +
                '<td style="color:#d97706; font-weight:800;">Rp ' + x.kurang.toLocaleString('id-ID') + '</td>' +
                '<td><button class="btn-table" style="background:#fef9c3;color:#92400e;border:1px solid #fde047;" ' +
                'onclick="lunasiSatuKurangBayar(' + JSON.stringify(x.idWarga) + ',\'' + x.bulan + '\',' + x.kurang + ',\'' + x.namaWarga + '\')">' +
                '<i class="fa-solid fa-coins"></i> Lunasi</button></td>' +
                '</tr>';
        });
        tbody.innerHTML = rows;
    };

    window.lunasiSatuKurangBayar = function(idWarga, bulan, kurang, namaWarga) {
        Swal.fire({
            title: 'Lunasi Kekurangan?',
            html: '<b>' + namaWarga + '</b> bulan <b>' + bulan + '</b><br>' +
                  'Kekurangan: <b style="color:#d97706;">Rp ' + kurang.toLocaleString('id-ID') + '</b>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lunasi!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#f59e0b'
        }).then(function(result) {
            if (!result.isConfirmed) return;

            var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            var tgl = new Date().toISOString().split('T')[0];

            // Update nominal di db_iuran
            dbIuran.forEach(function(x) {
                if (String(x.idWarga) === String(idWarga) && x.bulan === bulan && x.posted) {
                    x.nominal = (Number(x.nominal) || 0) + kurang;
                    x.sudahLunasKurang = true;
                }
            });

            // Catat ke kas
            dbKas.push({
                id: Date.now(),
                tgl: tgl,
                uraian: 'Pelunasan kurang bayar ' + bulan + ' - ' + namaWarga + ' (Uang Sosial)',
                tipe: 'masuk',
                nominal: kurang,
                sumber: 'iuran'
            });

            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);

            Swal.fire('Berhasil!', 'Kekurangan ' + namaWarga + ' bulan ' + bulan + ' sudah dilunasi!', 'success');
            window.renderKurangBayar();
            if (typeof window.loadTabIuranKolektif === 'function') window.loadTabIuranKolektif();
        });
    };

    window.lunasiSemuaKurangBayar = function() {
        var data = window.hitungKurangBayar();
        if (data.length === 0) return Swal.fire('Info', 'Tidak ada kurang bayar!', 'info');

        var totalKurang = data.reduce(function(s, x) { return s + x.kurang; }, 0);

        Swal.fire({
            title: 'Lunasi Semua Kekurangan?',
            html: '<b>' + data.length + ' item</b> dari <b>' + 
                  [...new Set(data.map(function(x){return x.namaWarga;}))].length + ' warga</b><br>' +
                  'Total: <b style="color:#d97706;">Rp ' + totalKurang.toLocaleString('id-ID') + '</b>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lunasi Semua!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#f59e0b'
        }).then(function(result) {
            if (!result.isConfirmed) return;

            var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            var tgl = new Date().toISOString().split('T')[0];

            data.forEach(function(x) {
                dbIuran.forEach(function(rec) {
                    if (String(rec.idWarga) === String(x.idWarga) && rec.bulan === x.bulan && rec.posted) {
                        rec.nominal = (Number(rec.nominal) || 0) + x.kurang;
                        rec.sudahLunasKurang = true;
                    }
                });
                dbKas.push({
                    id: Date.now() + Math.random(),
                    tgl: tgl,
                    uraian: 'Pelunasan kurang bayar ' + x.bulan + ' - ' + x.namaWarga + ' (Uang Sosial)',
                    tipe: 'masuk',
                    nominal: x.kurang,
                    sumber: 'iuran'
                });
            });

            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);

            Swal.fire('Berhasil!', 'Semua kekurangan (' + data.length + ' item) sudah dilunasi!', 'success');
            window.renderKurangBayar();
            if (typeof window.loadTabIuranKolektif === 'function') window.loadTabIuranKolektif();
        });
    };

    window.renderRiwayatIuranHariIni = function() {"""

if old in html:
    html = html.replace(old, new, 1)
    print("OK: PATCH 3 - fungsi kurang bayar")
else:
    print("GAGAL: PATCH 3")

# ─────────────────────────────────────────────
# PATCH 4: Panggil renderKurangBayar di loadTabIuranKolektif
# ─────────────────────────────────────────────
old4 = """        window._iuranDbWarga = dbWarga;
        window._iuranDbIuran = dbIuran;
        window.renderListWargaIuran(dbWarga);
        window.renderRiwayatIuranHariIni();
    };"""

new4 = """        window._iuranDbWarga = dbWarga;
        window._iuranDbIuran = dbIuran;
        window.renderListWargaIuran(dbWarga);
        window.renderRiwayatIuranHariIni();
        window.renderKurangBayar();
    };"""

if old4 in html:
    html = html.replace(old4, new4, 1)
    print("OK: PATCH 4 - panggil renderKurangBayar")
else:
    print("GAGAL: PATCH 4")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("PART 2 SELESAI")
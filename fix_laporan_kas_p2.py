FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

old2 = """    window.loadKasBendahara = function() {
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var sAwal = parseInt(localStorage.getItem('db_saldo_awal') || '0') || 0;
        var sAkhir = sAwal;
        var totalMasuk = 0;
        var totalKeluar = 0;

        // Isi saldo awal di kedua tab
        if(document.getElementById('ben-display-saldo-awal'))
            document.getElementById('ben-display-saldo-awal').innerText = fmt(sAwal);
        if(document.getElementById('ben-lap-saldo-awal'))
            document.getElementById('ben-lap-saldo-awal').innerText = fmt(sAwal);

        var tb = document.getElementById('tbody-laporan-kas');
        if(tb) {
            tb.innerHTML = '';
            dbKas.sort(function(a,b){ return new Date(a.tgl) - new Date(b.tgl); }).forEach(function(k) {
                var nominal = Number(k.nominal) || 0;
                if(k.tipe === 'masuk') { sAkhir += nominal; totalMasuk += nominal; }
                else { sAkhir -= nominal; totalKeluar += nominal; }
                var warnaTipe = k.tipe === 'masuk'
                    ? 'style="color:#166534;font-weight:700;"'
                    : 'style="color:#991b1b;font-weight:700;"';
                var ikonTipe = k.tipe === 'masuk'
                    ? '<i class="fa-solid fa-circle-arrow-up" style="color:#16a34a;"></i>'
                    : '<i class="fa-solid fa-circle-arrow-down" style="color:#dc2626;"></i>';
                tb.innerHTML += '<tr>' +
                    '<td>' + (k.tgl || '-') + '</td>' +
                    '<td><b>' + (k.uraian || k.keterangan || '-') + '</b></td>' +
                    '<td>' + ikonTipe + ' <span ' + warnaTipe + '>' + (k.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</span></td>' +
                    '<td>' + fmt(nominal) + ' <small style="color:var(--text-muted);">(Saldo: ' + fmt(sAkhir) + ')</small></td>' +
                    '<td><button class="btn-table btn-tbl-del" onclick="hapusKas(' + k.id + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                    '</tr>';
            });
            if(dbKas.length === 0) {
                tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Belum ada transaksi kas.</td></tr>';
            }
        }

        // Update semua stat box
        if(document.getElementById('ben-total-masuk'))
            document.getElementById('ben-total-masuk').innerText = fmt(totalMasuk);
        if(document.getElementById('ben-total-keluar'))
            document.getElementById('ben-total-keluar').innerText = fmt(totalKeluar);
        if(document.getElementById('ben-lap-saldo-akhir'))
            document.getElementById('ben-lap-saldo-akhir').innerText = fmt(sAkhir);
        if(document.getElementById('ben-saldo-kas-input'))
            document.getElementById('ben-saldo-kas-input').innerText = fmt(sAkhir);
        if(document.getElementById('warga-saldo-kas'))
            document.getElementById('warga-saldo-kas').innerText = fmt(sAkhir);
    };"""

new2 = """    window.loadKasBendahara = function() {
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var sAwal = parseInt(localStorage.getItem('db_saldo_awal') || '0') || 0;

        // Simpan ke global untuk filter
        window._kasAllData = dbKas.slice().sort(function(a,b){ return new Date(a.tgl) - new Date(b.tgl); });
        window._kasSaldoAwal = sAwal;

        // Isi saldo awal
        if(document.getElementById('ben-display-saldo-awal'))
            document.getElementById('ben-display-saldo-awal').innerText = fmt(sAwal);
        if(document.getElementById('ben-lap-saldo-awal'))
            document.getElementById('ben-lap-saldo-awal').innerText = fmt(sAwal);

        // Hitung total keseluruhan untuk stat box
        var sAkhir = sAwal;
        var totalMasuk = 0;
        var totalKeluar = 0;
        window._kasAllData.forEach(function(k) {
            var nominal = Number(k.nominal) || 0;
            if(k.tipe === 'masuk') { sAkhir += nominal; totalMasuk += nominal; }
            else { sAkhir -= nominal; totalKeluar += nominal; }
        });

        if(document.getElementById('ben-total-masuk'))
            document.getElementById('ben-total-masuk').innerText = fmt(totalMasuk);
        if(document.getElementById('ben-total-keluar'))
            document.getElementById('ben-total-keluar').innerText = fmt(totalKeluar);
        if(document.getElementById('ben-lap-saldo-akhir'))
            document.getElementById('ben-lap-saldo-akhir').innerText = fmt(sAkhir);
        if(document.getElementById('ben-saldo-kas-input'))
            document.getElementById('ben-saldo-kas-input').innerText = fmt(sAkhir);
        if(document.getElementById('warga-saldo-kas'))
            document.getElementById('warga-saldo-kas').innerText = fmt(sAkhir);

        // Render tabel dengan filter aktif
        window.filterLaporanKas();
    };

    window.filterLaporanKas = function() {
        var tb = document.getElementById('tbody-laporan-kas');
        if (!tb) return;

        var allData = window._kasAllData || [];
        var sAwal   = window._kasSaldoAwal || 0;

        // Ambil nilai filter
        var dari   = (document.getElementById('kas-filter-dari')   || {}).value || '';
        var sampai = (document.getElementById('kas-filter-sampai') || {}).value || '';
        var tipe   = (document.getElementById('kas-filter-tipe')   || {}).value || '';
        var cari   = ((document.getElementById('kas-filter-cari')  || {}).value || '').toLowerCase().trim();

        // Hitung saldo berjalan sampai sebelum filter (agar saldo akurat)
        // saldo berjalan dihitung dari awal berdasarkan urutan tanggal
        var saldoMap = [];
        var sRun = sAwal;
        allData.forEach(function(k) {
            var n = Number(k.nominal) || 0;
            if (k.tipe === 'masuk') sRun += n; else sRun -= n;
            saldoMap.push({ id: k.id, saldo: sRun });
        });

        // Filter data
        var filtered = allData.filter(function(k) {
            if (dari   && k.tgl < dari)   return false;
            if (sampai && k.tgl > sampai) return false;
            if (tipe   && k.tipe !== tipe) return false;
            if (cari) {
                var uraian = (k.uraian || k.keterangan || '').toLowerCase();
                if (uraian.indexOf(cari) === -1) return false;
            }
            return true;
        });

        // Hitung stat filter
        var fMasuk = 0, fKeluar = 0;
        filtered.forEach(function(k) {
            var n = Number(k.nominal) || 0;
            if (k.tipe === 'masuk') fMasuk += n; else fKeluar += n;
        });

        // Update info filter
        var elStat = document.getElementById('kas-filter-stat');
        var elInfo = document.getElementById('kas-filter-info');
        var adaFilter = dari || sampai || tipe || cari;

        if (elInfo) elInfo.innerText = filtered.length + ' transaksi';

        if (elStat) {
            if (adaFilter) {
                elStat.style.display = 'block';
                elStat.innerHTML =
                    '<i class="fa-solid fa-filter"></i> Hasil filter: ' +
                    '<span style="color:#16a34a;margin-left:8px;"><i class="fa-solid fa-circle-arrow-up"></i> Masuk: ' + fmt(fMasuk) + '</span>' +
                    '<span style="color:#dc2626;margin-left:12px;"><i class="fa-solid fa-circle-arrow-down"></i> Keluar: ' + fmt(fKeluar) + '</span>' +
                    '<span style="color:#1e40af;margin-left:12px;"><i class="fa-solid fa-scale-balanced"></i> Selisih: ' + fmt(fMasuk - fKeluar) + '</span>';
            } else {
                elStat.style.display = 'none';
            }
        }

        // Render tabel
        if (filtered.length === 0) {
            tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">' +
                (adaFilter ? '<i class="fa-solid fa-magnifying-glass"></i> Tidak ada transaksi sesuai filter.' : 'Belum ada transaksi kas.') +
                '</td></tr>';
            return;
        }

        var rows = '';
        filtered.forEach(function(k) {
            var nominal = Number(k.nominal) || 0;
            var saldoEntry = saldoMap.find(function(s){ return s.id === k.id; });
            var saldoRun = saldoEntry ? saldoEntry.saldo : 0;
            var warnaTipe = k.tipe === 'masuk'
                ? 'style="color:#166534;font-weight:700;"'
                : 'style="color:#991b1b;font-weight:700;"';
            var ikonTipe = k.tipe === 'masuk'
                ? '<i class="fa-solid fa-circle-arrow-up" style="color:#16a34a;"></i>'
                : '<i class="fa-solid fa-circle-arrow-down" style="color:#dc2626;"></i>';
            rows += '<tr>' +
                '<td>' + (k.tgl || '-') + '</td>' +
                '<td><b>' + (k.uraian || k.keterangan || '-') + '</b></td>' +
                '<td>' + ikonTipe + ' <span ' + warnaTipe + '>' + (k.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</span></td>' +
                '<td>' + fmt(nominal) + ' <small style="color:var(--text-muted);">(Saldo: ' + fmt(saldoRun) + ')</small></td>' +
                '<td><button class="btn-table btn-tbl-del" onclick="hapusKas(' + k.id + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        });
        tb.innerHTML = rows;
    };

    window.resetFilterKas = function() {
        var ids = ['kas-filter-dari','kas-filter-sampai','kas-filter-cari'];
        ids.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });
        var tipe = document.getElementById('kas-filter-tipe');
        if (tipe) tipe.value = '';
        window.filterLaporanKas();
    };"""

if old2 in html:
    html = html.replace(old2, new2, 1)
    print("OK: PATCH 2 - fungsi filter JS")
else:
    print("GAGAL: PATCH 2")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("P2 SELESAI")
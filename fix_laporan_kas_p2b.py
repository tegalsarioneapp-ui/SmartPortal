FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

old = "    window.hapusKas = function(id) { let db = JSON.parse(localStorage.getItem('db_kas')) || []; localStorage.setItem('db_kas', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); };"

new = """    window.filterLaporanKas = function() {
        var tb = document.getElementById('tbody-laporan-kas');
        if (!tb) return;

        var allData = window._kasAllData || [];
        var sAwal   = window._kasSaldoAwal || 0;

        // Ambil nilai filter
        var dari   = (document.getElementById('kas-filter-dari')   || {}).value || '';
        var sampai = (document.getElementById('kas-filter-sampai') || {}).value || '';
        var tipe   = (document.getElementById('kas-filter-tipe')   || {}).value || '';
        var cari   = ((document.getElementById('kas-filter-cari')  || {}).value || '').toLowerCase().trim();

        // Hitung saldo berjalan untuk setiap transaksi (berdasarkan urutan penuh)
        var sRun = sAwal;
        var saldoPerTrx = allData.map(function(k) {
            var nominal = Number(k.nominal) || 0;
            if (k.tipe === 'masuk') sRun += nominal;
            else sRun -= nominal;
            return { id: k.id, saldo: sRun };
        });

        // Filter data
        var filtered = allData.filter(function(k) {
            if (dari   && k.tgl && k.tgl < dari)   return false;
            if (sampai && k.tgl && k.tgl > sampai) return false;
            if (tipe   && k.tipe !== tipe)          return false;
            if (cari) {
                var uraian = (k.uraian || k.keterangan || '').toLowerCase();
                if (uraian.indexOf(cari) === -1)    return false;
            }
            return true;
        });

        // Hitung stat filter
        var fMasuk = 0; var fKeluar = 0;
        filtered.forEach(function(k) {
            var n = Number(k.nominal) || 0;
            if (k.tipe === 'masuk') fMasuk += n;
            else fKeluar += n;
        });

        // Update info filter
        var elStat = document.getElementById('kas-filter-stat');
        var elInfo = document.getElementById('kas-filter-info');
        var adaFilter = dari || sampai || tipe || cari;

        if (adaFilter && elStat) {
            elStat.style.display = 'block';
            elStat.innerHTML =
                '<i class="fa-solid fa-filter"></i> Hasil filter: <b>' + filtered.length + '</b> transaksi &nbsp;|&nbsp; ' +
                'Pemasukan: <b style="color:#16a34a;">+' + fmt(fMasuk) + '</b> &nbsp;|&nbsp; ' +
                'Pengeluaran: <b style="color:#dc2626;">-' + fmt(fKeluar) + '</b> &nbsp;|&nbsp; ' +
                'Selisih: <b style="color:#1e40af;">' + fmt(fMasuk - fKeluar) + '</b>';
        } else if (elStat) {
            elStat.style.display = 'none';
        }

        if (elInfo) {
            elInfo.innerText = adaFilter ? '(' + filtered.length + ' dari ' + allData.length + ' transaksi)' : '';
        }

        // Render tabel
        if (filtered.length === 0) {
            tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">' +
                '<i class="fa-solid fa-magnifying-glass"></i> Tidak ada transaksi yang cocok dengan filter.</td></tr>';
            return;
        }

        var rows = '';
        filtered.forEach(function(k) {
            var nominal = Number(k.nominal) || 0;
            var saldoItem = saldoPerTrx.find(function(s){ return s.id === k.id; });
            var saldoAkhir = saldoItem ? saldoItem.saldo : 0;
            var warnaTipe = k.tipe === 'masuk'
                ? 'color:#166534;font-weight:700;'
                : 'color:#991b1b;font-weight:700;';
            var ikonTipe = k.tipe === 'masuk'
                ? '<i class="fa-solid fa-circle-arrow-up" style="color:#16a34a;"></i>'
                : '<i class="fa-solid fa-circle-arrow-down" style="color:#dc2626;"></i>';
            var bgRow = k.tipe === 'masuk' ? '' : 'background:#fff5f5;';
            rows += '<tr style="' + bgRow + '">' +
                '<td style="white-space:nowrap;">' + (k.tgl || '-') + '</td>' +
                '<td><b>' + (k.uraian || k.keterangan || '-') + '</b></td>' +
                '<td style="white-space:nowrap;">' + ikonTipe + ' <span style="' + warnaTipe + '">' +
                (k.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</span></td>' +
                '<td style="white-space:nowrap;">' + fmt(nominal) +
                ' <small style="color:var(--text-muted);">(Saldo: ' + fmt(saldoAkhir) + ')</small></td>' +
                '<td><button class="btn-table btn-tbl-del" onclick="hapusKas(' + k.id + ')">' +
                '<i class="fa-solid fa-trash"></i></button></td>' +
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
        var elTipe = document.getElementById('kas-filter-tipe');
        if (elTipe) elTipe.value = '';
        window.filterLaporanKas();
    };

    window.hapusKas = function(id) { let db = JSON.parse(localStorage.getItem('db_kas')) || []; localStorage.setItem('db_kas', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); };"""

if old in html:
    html = html.replace(old, new, 1)
    print("OK: PATCH 2 - fungsi filterLaporanKas + resetFilterKas")
else:
    print("GAGAL: PATCH 2")

# ── PATCH 3: upgrade loadKasBendahara ──────────────────────────────────────
old3 = """    window.loadKasBendahara = function() {
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

new3 = """    window.loadKasBendahara = function() {
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
    };"""

if old3 in html:
    html = html.replace(old3, new3, 1)
    print("OK: PATCH 3 - upgrade loadKasBendahara")
else:
    print("GAGAL: PATCH 3")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("P2 SELESAI")
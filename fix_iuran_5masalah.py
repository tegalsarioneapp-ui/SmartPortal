FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK [{count}]: {label}")
    # ═══ PATCH 1: loadTabIuranKolektif fix format bulan ═══
patch("loadTabIuranKolektif fix format bulan",
"""    window.loadTabIuranKolektif = function() {
        _iuranWargaTerpilih = null;
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var bulanIni = new Date().toLocaleString('id-ID',{month:'long'});
        var lunas = dbWarga.filter(function(w){
            return dbIuran.some(function(x){ return String(x.idWarga)===String(w.id) && x.bulan===bulanIni && x.posted; });
        }).length;
        if(document.getElementById('iuran-stat-total-warga')) document.getElementById('iuran-stat-total-warga').innerText = dbWarga.length;
        if(document.getElementById('iuran-stat-lunas')) document.getElementById('iuran-stat-lunas').innerText = lunas;
        if(document.getElementById('iuran-stat-belum')) document.getElementById('iuran-stat-belum').innerText = dbWarga.length - lunas;
        window._iuranDbWarga = dbWarga;
        window._iuranDbIuran = dbIuran;
        window.renderListWargaIuran(dbWarga);
        window.renderRiwayatIuranHariIni();
        window.renderKurangBayar();
    };""",
"""    window.loadTabIuranKolektif = function() {
        _iuranWargaTerpilih = null;
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var BULAN_ARR = ['Januari','Februari','Maret','April','Mei','Juni',
                         'Juli','Agustus','September','Oktober','November','Desember'];
        var now = new Date();
        var bulanIni = BULAN_ARR[now.getMonth()] + ' ' + now.getFullYear();
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalStd = Number(dbSettings.nominalIuran) || 25000;
        var lunasCount = 0, belumCount = 0;
        dbWarga.forEach(function(w) {
            var rec = dbIuran.find(function(x) {
                return String(x.idWarga) === String(w.id) && x.posted &&
                    (x.bulan === bulanIni || x.bulan === BULAN_ARR[now.getMonth()]);
            });
            if (rec && Number(rec.nominal) >= nominalStd) lunasCount++;
            else belumCount++;
        });
        var kurangPerWarga = {};
        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var bulanKey = x.bulan || '';
            var parts = bulanKey.trim().split(' ');
            var tahun = 2026;
            if (parts.length >= 2) tahun = parseInt(parts[1]) || 2026;
            else if (x.tanggal) { var t = new Date(x.tanggal); if (!isNaN(t)) tahun = t.getFullYear(); }
            var bIdx = BULAN_ARR.indexOf(parts[0]);
            var seharusnya = (tahun < 2026 || (tahun === 2026 && bIdx <= 4)) ? 20000 : nominalStd;
            var kurang = seharusnya - (Number(x.nominal) || 0);
            if (kurang > 0) {
                var key = String(x.idWarga);
                if (!kurangPerWarga[key]) kurangPerWarga[key] = 0;
                kurangPerWarga[key] += kurang;
            }
        });
        var totalWargaKurang = Object.keys(kurangPerWarga).length;
        if(document.getElementById('iuran-stat-total-warga')) document.getElementById('iuran-stat-total-warga').innerText = dbWarga.length;
        if(document.getElementById('iuran-stat-lunas')) document.getElementById('iuran-stat-lunas').innerText = lunasCount;
        if(document.getElementById('iuran-stat-belum')) document.getElementById('iuran-stat-belum').innerText = belumCount;
        if(document.getElementById('iuran-stat-kurang')) document.getElementById('iuran-stat-kurang').innerText = totalWargaKurang;
        window._iuranDbWarga = dbWarga;
        window._iuranDbIuran = dbIuran;
        window.renderListWargaIuran(dbWarga);
        window.renderRiwayatIuranHariIni();
        window.renderKurangBayarPerWarga();
    };""")
# ═══ PATCH 2: simpanBulan ringkas kas & riwayat jadi 1 entri ═══
patch("simpanBulan ringkas kas 1 entri",
"""        function simpanBulan(nominalFinal) {
            bulanDipilih.forEach(function(bulan, idx) {
                // Nominal: override manual atau otomatis per periode
                var nominalIuran = nominalFinal !== null ? nominalFinal : window.getNominalByBulan(bulan);
                dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
                dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
            });
            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            window._iuranDbIuran = dbIuran;
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Swal.fire('Berhasil!', _iuranWargaTerpilih.nama+' - '+bulanDipilih.length+' bulan tercatat!', 'success');
            window.loadTabIuranKolektif();
            // Reset override checkbox
            var chk = document.getElementById('iuran-override-check');
            var wrap = document.getElementById('iuran-override-wrap');
            if (chk) chk.checked = false;
            if (wrap) wrap.style.display = 'none';
        }""",
"""        function simpanBulan(nominalFinal) {
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
        }""")
# ═══ PATCH 3: renderRiwayatIuranHariIni ringkas per warga ═══
patch("renderRiwayatIuranHariIni ringkas per warga",
"""    window.renderRiwayatIuranHariIni = function() {
        var dbIuran = window._iuranDbIuran || [];
        var tgl = new Date().toISOString().split('T')[0];
        var hariIni = dbIuran.filter(function(x){ return x.tanggal === tgl; });
        var tb = document.getElementById('tbody-iuran-hari-ini');
        if(!tb) return;
        if(hariIni.length === 0) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;">Belum ada transaksi iuran hari ini</td></tr>';
            return;
        }
        tb.innerHTML = hariIni.sort(function(a,b){ return b.id - a.id; }).map(function(x){
            return '<tr>'
                + '<td><b>'+x.namaWarga+'</b></td>'
                + '<td>'+x.bulan+'</td>'
                + '<td>'+x.nominal+'</td>'
                + '<td><span style="background:#dcfce7;color:#166534;border-radius:999px;padding:2px 8px;font-size:0.75rem;font-weight:700;">Tercatat</span></td>'
                + '</tr>';
        }).join('');
    };""",
"""    window.renderRiwayatIuranHariIni = function() {
        var dbIuran = window._iuranDbIuran || JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var tgl = new Date().toISOString().split('T')[0];
        var hariIni = dbIuran.filter(function(x){ return x.tanggal === tgl; });
        var tb = document.getElementById('tbody-iuran-hari-ini');
        if(!tb) return;
        if(hariIni.length === 0) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">Belum ada transaksi iuran hari ini</td></tr>';
            return;
        }
        // Ringkas per warga
        var perWarga = {};
        hariIni.forEach(function(x) {
            var key = String(x.idWarga);
            if (!perWarga[key]) {
                perWarga[key] = {
                    nama: x.namaWarga,
                    bulanList: [],
                    total: 0
                };
            }
            perWarga[key].bulanList.push(x.bulan);
            perWarga[key].total += Number(x.nominal) || 0;
        });
        var rows = '';
        Object.values(perWarga).forEach(function(w) {
            var jmlBulan = w.bulanList.length;
            var bulanRingkas = jmlBulan === 1
                ? w.bulanList[0]
                : jmlBulan + ' bulan (' + w.bulanList[0].split(' ')[0] + '-' + w.bulanList[jmlBulan-1].split(' ')[0] + ')';
            rows += '<tr>'
                + '<td><b>' + w.nama + '</b></td>'
                + '<td style="font-size:0.82rem;">' + bulanRingkas + '</td>'
                + '<td style="font-weight:700;color:var(--success);">Rp ' + w.total.toLocaleString('id-ID') + '</td>'
                + '<td><span style="background:#dcfce7;color:#166534;border-radius:999px;padding:2px 8px;font-size:0.75rem;font-weight:700;">Tercatat</span></td>'
                + '</tr>';
        });
        tb.innerHTML = rows;
    };""")
# ═══ PATCH 4: renderKurangBayarPerWarga ringkas per warga ═══
patch("renderKurangBayar ganti ke renderKurangBayarPerWarga",
"""    window.renderKurangBayar = function() {""",
"""    window.renderKurangBayarPerWarga = function() {
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var BULAN_ARR = ['Januari','Februari','Maret','April','Mei','Juni',
                         'Juli','Agustus','September','Oktober','November','Desember'];
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalStd = Number(dbSettings.nominalIuran) || 25000;
        // Hitung kurang per warga
        var kurangMap = {};
        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var parts = (x.bulan || '').trim().split(' ');
            var tahun = parts.length >= 2 ? (parseInt(parts[1]) || 2026) : 2026;
            var bIdx = BULAN_ARR.indexOf(parts[0]);
            var seharusnya = (tahun < 2026 || (tahun === 2026 && bIdx <= 4)) ? 20000 : nominalStd;
            var kurang = seharusnya - (Number(x.nominal) || 0);
            if (kurang > 0) {
                var key = String(x.idWarga);
                if (!kurangMap[key]) kurangMap[key] = { nama: x.namaWarga, totalKurang: 0, bulanList: [] };
                kurangMap[key].totalKurang += kurang;
                kurangMap[key].bulanList.push(x.bulan);
            }
        });
        var tb = document.getElementById('tbody-kurang-bayar');
        if (!tb) return;
        var keys = Object.keys(kurangMap);
        if (keys.length === 0) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">Tidak ada kurang bayar</td></tr>';
            return;
        }
        tb.innerHTML = keys.map(function(key) {
            var w = kurangMap[key];
            var jml = w.bulanList.length;
            var bulanRingkas = jml === 1
                ? w.bulanList[0]
                : jml + ' bulan (' + w.bulanList[0].split(' ')[0] + '-' + w.bulanList[jml-1].split(' ')[0] + ')';
            return '<tr>'
                + '<td><b>' + w.nama + '</b></td>'
                + '<td style="font-size:0.82rem;">' + bulanRingkas + '</td>'
                + '<td style="font-weight:700;color:#f59e0b;">Rp ' + w.totalKurang.toLocaleString('id-ID') + '</td>'
                + '<td>'
                + '<button onclick="lunasKurangBayarWarga(\'' + key + '\',' + w.totalKurang + ',\'' + w.nama + '\')"'
                + ' style="background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:4px 12px;font-size:0.8rem;font-weight:700;cursor:pointer;">'
                + '<i class="fa-solid fa-money-bill-wave"></i> Lunasi</button>'
                + '</td>'
                + '</tr>';
        }).join('');
    };

    window.lunasKurangBayarWarga = function(idWarga, totalKurang, namaWarga) {
        Swal.fire({
            title: 'Lunasi Kurang Bayar',
            html: '<div style="text-align:left;font-size:0.9rem;">'
                + '<b>' + namaWarga + '</b><br>'
                + 'Total kurang: <b style="color:#f59e0b;">Rp ' + totalKurang.toLocaleString('id-ID') + '</b><br><br>'
                + '<label style="font-size:0.85rem;font-weight:700;">Nominal Dibayar:</label><br>'
                + '<input type="number" id="swal-input-lunas" value="' + totalKurang + '" min="0" step="1000"'
                + ' style="width:100%;padding:8px;border:2px solid #f59e0b;border-radius:8px;font-size:1rem;font-weight:700;margin-top:6px;">'
                + '</div>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check"></i> Lunasi Sekarang',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#f59e0b',
            preConfirm: function() {
                var val = parseInt(document.getElementById('swal-input-lunas').value);
                if (!val || val <= 0) { Swal.showValidationMessage('Nominal harus lebih dari 0'); return false; }
                return val;
            }
        }).then(function(result) {
            if (!result.isConfirmed) return;
            var nominal = result.value;
            var tgl = new Date().toISOString().split('T')[0];
            var idBase = Date.now();
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            dbKas.push({
                id: idBase,
                tgl: tgl,
                uraian: 'Pelunasan Kurang Bayar - ' + namaWarga,
                tipe: 'masuk',
                nominal: nominal,
                sumber: 'iuran'
            });
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Swal.fire('Berhasil!', 'Pelunasan Rp ' + nominal.toLocaleString('id-ID') + ' untuk ' + namaWarga + ' tercatat!', 'success');
            window.loadTabIuranKolektif();
            if (typeof window.loadKasBendahara === 'function') window.loadKasBendahara();
        });
    };

    window.renderKurangBayar = function() {""")
# ═══ PATCH 5: loadMatriksIuran fix format bulan "Januari 2026" ═══
patch("loadMatriksIuran fix format bulan tahun",
"""        validWarga.forEach(function(w){
            var b=dbIuran.find(function(i){return String(i.idWarga)===String(w.id)&&i.bulan===bulanIni;});
            if(b){ if(b.posted){ if(Number(b.nominal)<nominalStd)kurangCount++; else lunasIni++; } else pendingCount++; }
            else belumIni++;
        });""",
"""        var tahunMatriks = (function(){
            var sel = document.getElementById('mtrx-filter-tahun');
            return sel ? sel.value : String(new Date().getFullYear());
        })();
        validWarga.forEach(function(w){
            var bulanIniDgnTahun = bulanIni + ' ' + tahunMatriks;
            var b = dbIuran.find(function(i){
                return String(i.idWarga)===String(w.id) &&
                    (i.bulan===bulanIniDgnTahun || i.bulan===bulanIni);
            });
            if(b){ if(b.posted){ if(Number(b.nominal)<nominalStd)kurangCount++; else lunasIni++; } else pendingCount++; }
            else belumIni++;
        });""")

# ═══ PATCH 6: loadMatriksIuran fix cari bayar per baris ═══
patch("loadMatriksIuran fix cari bayar format bulan tahun",
"""                var bayar=dbIuran.find(function(i){return String(i.idWarga)===String(w.id)&&i.bulan===bln;});""",
"""                var blnDgnTahun = bln + ' ' + tahunMatriks;
                var bayar=dbIuran.find(function(i){
                    return String(i.idWarga)===String(w.id) &&
                        (i.bulan===blnDgnTahun || i.bulan===bln);
                });""")# ═══ SIMPAN FILE ═══
with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ SELESAI! {count} patch berhasil diterapkan.")
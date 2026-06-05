    var _iuranWargaTerpilih = null;

    window.loadTabIuranKolektif = function() {
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
    };

    window.simpanIuranKolektifBaru = function() {
        if(!_iuranWargaTerpilih) return Swal.fire('Gagal','Pilih warga terlebih dahulu!','error');
        var checked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        if(checked.length === 0) return Swal.fire('Gagal','Pilih minimal satu bulan!','error');
        var bulanDipilih = Array.from(checked).map(function(el){ return el.getAttribute('data-bulan'); });
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var tgl = new Date().toISOString().split('T')[0];
        var idBase = Date.now();
        bulanDipilih.forEach(function(bulan, idx) {
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tanggal: tgl, keterangan: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });
        localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
        localStorage.setItem('db_kas', JSON.stringify(dbKas));
        window._iuranDbIuran = dbIuran;
        Swal.fire('Berhasil!', _iuranWargaTerpilih.nama+' - '+bulanDipilih.length+' bulan tercatat!', 'success');
        window.loadTabIuranKolektif();
    };

    window.resetPilihWargaIuran = function() {
        _iuranWargaTerpilih = null;
        var elNama = document.getElementById('iuran-nama-terpilih');
        if(elNama) elNama.innerText = '- Pilih warga dulu';
        var grid = document.getElementById('iuran-bulan-grid');
        if(grid) grid.innerHTML = '<div style="text-align:center;color:var(--tm);padding:20px;grid-column:1/-1;">Pilih warga untuk melihat status bulan</div>';
        var elTotal = document.getElementById('iuran-total-display');
        if(elTotal) elTotal.innerText = 'Rp 0';
        var elBreak = document.getElementById('iuran-breakdown-display');
        if(elBreak) elBreak.innerText = '';
        window.renderListWargaIuran(window._iuranDbWarga || []);
    };

    window.renderRiwayatIuranHariIni = function() {
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
    };


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

    window.renderListWargaIuran = function(list) {
        var dbIuran = window._iuranDbIuran || [];
        var bulanIni = new Date().toLocaleString('id-ID',{month:'long'});
        var container = document.getElementById('iuran-list-warga');
        if(!container) return;
        if(!list || list.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Tidak ada data warga</div>';
            return;
        }
        container.innerHTML = list.map(function(w) {
            var sudahLunas = dbIuran.some(function(x){ return String(x.idWarga)===String(w.id) && x.bulan===bulanIni && x.posted; });
            var badge = sudahLunas
                ? '<span style="font-size:0.7rem;background:#dcfce7;color:#166534;border-radius:999px;padding:2px 8px;font-weight:700;">&#10003; Lunas</span>'
                : '<span style="font-size:0.7rem;background:#fee2e2;color:#991b1b;border-radius:999px;padding:2px 8px;font-weight:700;">&#10007; Belum</span>';
            var isActive = _iuranWargaTerpilih && String(_iuranWargaTerpilih.id)===String(w.id);
            return '<div onclick="pilihWargaIuran('+w.id+')" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:8px;cursor:pointer;border:2px solid '+(isActive?'var(--accent-gold)':'#e2e8f0')+';background:'+(isActive?'#fffbeb':'#fff')+';transition:all 0.2s;margin-bottom:4px;">'
                + '<span style="font-weight:600;font-size:0.9rem;">'+w.nama+'</span>'
                + badge
                + '</div>';
        }).join('');
    };

    window.filterWargaIuran = function() {
        var q = (document.getElementById('iuran-search-warga').value || '').toLowerCase();
        var list = (window._iuranDbWarga || []).filter(function(w){ return w.nama.toLowerCase().indexOf(q) > -1; });
        window.renderListWargaIuran(list);
    };

    window.pilihWargaIuran = function(idWarga) {
        var dbWarga = window._iuranDbWarga || [];
        var dbIuran = window._iuranDbIuran || [];
        _iuranWargaTerpilih = dbWarga.find(function(w){ return String(w.id)===String(idWarga); });
        if(!_iuranWargaTerpilih) return;
        var elNama = document.getElementById('iuran-nama-terpilih');
        if(elNama) elNama.innerText = _iuranWargaTerpilih.nama;
        var q = (document.getElementById('iuran-search-warga').value || '').toLowerCase();
        var list = dbWarga.filter(function(w){ return w.nama.toLowerCase().indexOf(q) > -1; });
        window.renderListWargaIuran(list);
        var bulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var grid = document.getElementById('iuran-bulan-grid');
        if(!grid) return;
        grid.innerHTML = bulanList.map(function(b) {
            var sudah = dbIuran.some(function(x){ return String(x.idWarga)===String(idWarga) && x.bulan===b && x.posted; });
            return '<div onclick="toggleBulanIuran(this,\''+b+'\')" data-bulan="'+b+'" data-checked="false" style="text-align:center;padding:10px 4px;border-radius:8px;border:2px solid '+(sudah?'#16a34a':'#e2e8f0')+';background:'+(sudah?'#dcfce7':'#fff')+';color:'+(sudah?'#166534':'#1e293b')+';font-size:0.8rem;font-weight:700;cursor:'+(sudah?'not-allowed':'pointer')+';position:relative;">'
                +(sudah?'<i class="fa-solid fa-lock" style="font-size:0.6rem;position:absolute;top:3px;right:4px;color:#16a34a;"></i>':'')
                +'<div>'+b.substring(0,3)+'</div>'
                +'<div style="font-size:0.65rem;margin-top:2px;">'+(sudah?'&#10003;':'')+'</div>'
                +'</div>';
        }).join('');
        window.hitungTotalIuranBaru();
    };

    window.toggleBulanIuran = function(el, bulan) {
        if(!_iuranWargaTerpilih) return;
        var dbIuran = window._iuranDbIuran || [];
        var sudah = dbIuran.some(function(x){ return String(x.idWarga)===String(_iuranWargaTerpilih.id) && x.bulan===bulan && x.posted; });
        if(sudah) return;
        var checked = el.getAttribute('data-checked') === 'true';
        el.setAttribute('data-checked', checked ? 'false' : 'true');
        el.style.background = checked ? '#fff' : '#fffbeb';
        el.style.borderColor = checked ? '#e2e8f0' : 'var(--accent-gold)';
        el.style.color = checked ? '#1e293b' : '#92400e';
        el.querySelector('div:last-child').innerText = checked ? '' : '&#10003;';
        window.hitungTotalIuranBaru();
    };

    window.hitungTotalIuranBaru = function() {
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var checked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        var total = checked.length * nominalIuran;
        var elTotal = document.getElementById('iuran-total-display');
        var elBreak = document.getElementById('iuran-breakdown-display');
        if(elTotal) elTotal.innerText = 'Rp ' + total.toLocaleString('id-ID');
        if(elBreak) elBreak.innerText = checked.length > 0 ? checked.length + ' bulan x Rp ' + nominalIuran.toLocaleString('id-ID') : '';
    };

    window.simpanIuranKolektifBaru = function() {
        if(!_iuranWargaTerpilih) return Swal.fire('Gagal','Pilih warga terlebih dahulu!','error');
        var checked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        if(checked.length === 0) return Swal.fire('Gagal','Pilih minimal 1 bulan!','error');
        var bulanDipilih = [];
        checked.forEach(function(el){ bulanDipilih.push(el.getAttribute('data-bulan')); });
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var now = new Date();
        var tgl = now.toISOString().split('T')[0];
        var lastId = dbIuran.length > 0 ? Math.max.apply(null, dbIuran.map(function(x){return x.id||0;})) : 0;
        bulanDipilih.forEach(function(b) {
            lastId++;
            dbIuran.push({ id: lastId, idWarga: _iuranWargaTerpilih.id, nama: _iuranWargaTerpilih.nama, bulan: b, nominal: nominalIuran, tgl: tgl, posted: false });
        });
        var totalNominal = bulanDipilih.length * nominalIuran;
        var lastKasId = dbKas.length > 0 ? Math.max.apply(null, dbKas.map(function(x){return x.id||0;})) : 0;
        lastKasId++;
        dbKas.push({ id: lastKasId, tgl: tgl, desc: 'Iuran ' + _iuranWargaTerpilih.nama + ' (' + bulanDipilih.join(', ') + ')', tipe: 'masuk', nominal: totalNominal, sumber: 'iuran' });
        localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
        localStorage.setItem('db_kas', JSON.stringify(dbKas));
        Swal.fire({icon:'success', title:'Berhasil!', text: _iuranWargaTerpilih.nama + ' - ' + bulanDipilih.length + ' bulan tercatat', timer:1800, showConfirmButton:false});
        window._iuranDbIuran = dbIuran;
        _iuranWargaTerpilih = null;
        window.loadTabIuranKolektif();
    };

    window.resetPilihWargaIuran = function() {
        _iuranWargaTerpilih = null;
        var elNama = document.getElementById('iuran-nama-terpilih');
        if(elNama) elNama.innerText = '— Pilih warga dulu';
        var grid = document.getElementById('iuran-bulan-grid');
        if(grid) grid.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;grid-column:1/-1;">Pilih warga untuk melihat status bulan</div>';
        var elTotal = document.getElementById('iuran-total-display');
        if(elTotal) elTotal.innerText = 'Rp 0';
        var elBreak = document.getElementById('iuran-breakdown-display');
        if(elBreak) elBreak.innerText = '';
        var elSearch = document.getElementById('iuran-search-warga');
        if(elSearch) elSearch.value = '';
        window.renderListWargaIuran(window._iuranDbWarga || []);
    };

    window.renderRiwayatIuranHariIni = function() {
        var dbIuran = window._iuranDbIuran || [];
        var today = new Date().toISOString().split('T')[0];
        var tb = document.getElementById('tbody-iuran-hari-ini');
        if(!tb) return;
        var data = dbIuran.filter(function(x){ return x.tgl === today; });
        if(data.length === 0) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:16px;">Belum ada transaksi iuran hari ini</td></tr>';
            return;
        }
        tb.innerHTML = data.map(function(x) {
            var badge = x.posted
                ? '<span style="background:#dcfce7;color:#166534;border-radius:999px;padding:2px 8px;font-size:0.75rem;font-weight:700;">Terposting</span>'
                : '<span style="background:#fef9c3;color:#854d0e;border-radius:999px;padding:2px 8px;font-size:0.75rem;font-weight:700;">Pending</span>';
            return '<tr><td>'+x.nama+'</td><td>'+x.bulan+'</td><td style="font-weight:700;color:var(--success);">Rp '+Number(x.nominal).toLocaleString('id-ID')+'</td><td>'+badge+'</td></tr>';
        }).join('');
    };

    window.filterMatriksIuran = function(q) {
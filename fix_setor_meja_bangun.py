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

# ═══ PATCH 1: setorPembangunanKeKas — hapus double entry kas, hanya set flag ═══
patch("setorPembangunanKeKas hapus double entry",
"""    window.setorPembangunanKeKas = function() {
        var periode = window.currentPeriodeKey||'';
        var sKey    = 'setor_bangun_'+periode.replace(/ /g,'_');
        if(localStorage.getItem(sKey)) return Swal.fire('Info','Sudah disetor bulan ini.','info');
        var settings    = JSON.parse(localStorage.getItem('db_settings')||'{}');
        var dbIuran     = JSON.parse(localStorage.getItem('db_iuran')||'[]');
        var dbWarga     = JSON.parse(localStorage.getItem('db_warga')||'[]');
        var ji          = getJenisIuranMap();
        var now         = new Date();
        var bulanNama   = new Intl.DateTimeFormat('id-ID',{month:'long'}).format(now);
        var tahunSkg    = now.getFullYear();
        var iuranBln    = dbIuran.filter(function(x){ return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()&&String(x.tahun||tahunSkg)===String(tahunSkg); });
        var sudahMap    = {}; iuranBln.forEach(function(x){ sudahMap[x.idWarga]=x; });
        var jmlBayar    = Object.keys(sudahMap).length;
        var nomBangun   = 0; ji.forEach(function(j){ if(j.nama.toLowerCase().includes('bangun')) nomBangun=j.nominal; });
        var total       = jmlBayar*nomBangun;
        if(!total) return Swal.fire('Info','Belum ada data iuran bulan ini.','info');
        Swal.fire({
            title:'Setor Pembangunan ke Kas?',
            html:'Total <b>'+fmt(total)+'</b> dari <b>'+jmlBayar+' warga</b> akan masuk Kas Utama.',
            icon:'question',showCancelButton:true,
            confirmButtonColor:'#3b82f6',confirmButtonText:'Ya, Setor!'
        }).then(function(r){
            if(!r.isConfirmed) return;
            var tgl = new Date().toISOString().split('T')[0];
            var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
            dbKas.push({id:Date.now(),tgl:tgl,uraian:'Setoran Iuran Pembangunan ('+periode+')',tipe:'masuk',nominal:total});
            localStorage.setItem('db_kas',JSON.stringify(dbKas));
            localStorage.setItem(sKey,JSON.stringify({tgl:tgl,nominal:total}));
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire('Berhasil','Setoran '+fmt(total)+' masuk Kas Utama.','success').then(function(){ loadAnalisaUangMeja(); });
        });
    };""",
"""    window.setorPembangunanKeKas = function() {
        var periode = window.currentPeriodeKey||'';
        var sKey    = 'setor_bangun_'+periode.replace(/ /g,'_');
        if(localStorage.getItem(sKey)) return Swal.fire('Info','Sudah ditandai bulan ini.','info');
        var dbIuran  = JSON.parse(localStorage.getItem('db_iuran')||'[]');
        var ji       = getJenisIuranMap();
        var now      = new Date();
        var bulanNama= new Intl.DateTimeFormat('id-ID',{month:'long'}).format(now);
        var tahunSkg = now.getFullYear();
        var iuranBln = dbIuran.filter(function(x){
            return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()
                && String(x.tahun||tahunSkg)===String(tahunSkg);
        });
        var sudahMap = {}; iuranBln.forEach(function(x){ sudahMap[x.idWarga]=x; });
        var jmlBayar = Object.keys(sudahMap).length;
        var nomBangun= 0; ji.forEach(function(j){ if((j.nama||'').toLowerCase().includes('bangun')) nomBangun=j.nominal; });
        var total    = jmlBayar * nomBangun;
        if(!total) return Swal.fire('Info','Belum ada data iuran bulan ini.','info');
        Swal.fire({
            title:'Konfirmasi Pembangunan Sudah Disetor?',
            html:'Uang Pembangunan <b>'+fmt(total)+'</b> dari <b>'+jmlBayar+' warga</b>'
                +'<br><span style="font-size:0.85rem;color:#64748b;">Sudah tercatat di kas saat iuran diinput. Tombol ini hanya menandai status setor.</span>',
            icon:'info',showCancelButton:true,
            confirmButtonColor:'#3b82f6',confirmButtonText:'Ya, Tandai Sudah Disetor!'
        }).then(function(r){
            if(!r.isConfirmed) return;
            var tgl = new Date().toISOString().split('T')[0];
            localStorage.setItem(sKey, JSON.stringify({tgl:tgl,nominal:total}));
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire('Berhasil','Pembangunan '+periode+' ditandai sudah disetor.','success')
                .then(function(){ loadAnalisaUangMeja(); });
        });
    };""")

# ═══ PATCH 2: setorUangMeja — catat KELUAR talangan + KELUAR bayar tuan rumah ═══
patch("setorUangMeja catat kas keluar",
"""    window.setorUangMeja = function() {
        let uang = window.currentTerkumpulMeja || 0;
        let bulanSkg = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        
        Swal.fire({
            title: 'Serahkan Uang Meja?',
            html: `Uang meja terkumpul bulan ini sebesar <b>${fmt(uang)}</b> akan ditandai telah diserahkan kepada Tuan Rumah / Bendahara.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: '<i class="fa-solid fa-check"></i> Ya, Serahkan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem('setor_meja_' + bulanSkg, 'true');
                if(typeof syncSemuaData==='function') syncSemuaData(true);
                loadAnalisaUangMeja(); 
                Swal.fire('Berhasil!', 'Status uang meja bulan ini telah diserahkan.', 'success');
            }
        });
    };""",
"""    window.setorUangMeja = function() {
        var periode  = window.currentPeriodeKey || '';
        var terkumpul= window.currentTerkumpulMeja || 0;
        var param2   = JSON.parse(localStorage.getItem('db_param_pertemuan')||'{}');
        var target   = param2.targetUangMeja || 250000;
        var kurang   = Math.max(0, target - terkumpul);
        var sKey     = 'setor_meja_'+periode.replace(/ /g,'_');
        if(localStorage.getItem(sKey)) return Swal.fire('Info','Uang meja bulan ini sudah diserahkan.','info');

        Swal.fire({
            title: 'Serahkan Uang Meja ke Tuan Rumah?',
            html: '<div style="text-align:left;font-size:0.9rem;line-height:2;">'
                + '<b>Terkumpul dari warga:</b> <span style="color:#10b981;font-weight:900;">'+fmt(terkumpul)+'</span><br>'
                + '<b>Target tuan rumah:</b> <span style="font-weight:900;">'+fmt(target)+'</span><br>'
                + (kurang > 0
                    ? '<b>Kekurangan (talangan kas):</b> <span style="color:#ef4444;font-weight:900;">'+fmt(kurang)+'</span><br>'
                    : '<span style="color:#10b981;">✅ Uang cukup, tidak perlu talangan</span><br>')
                + '<hr style="margin:8px 0;border-color:#e2e8f0;">'
                + '<b>Total dibayar ke tuan rumah:</b> <span style="font-weight:900;">'+fmt(target)+'</span>'
                + '</div>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: '<i class="fa-solid fa-check"></i> Ya, Serahkan!',
            cancelButtonText: 'Batal'
        }).then(function(result) {
            if (!result.isConfirmed) return;
            var tgl   = new Date().toISOString().split('T')[0];
            var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
            var idBase= Date.now();

            // KELUAR: talangan kekurangan (jika ada)
            if (kurang > 0) {
                dbKas.push({
                    id    : idBase + 1,
                    tgl   : tgl,
                    uraian: 'Talangan Kekurangan Uang Meja ('+periode+')',
                    tipe  : 'keluar',
                    nominal: kurang,
                    sumber: 'uang_meja'
                });
            }

            // KELUAR: bayar ke tuan rumah (total target)
            dbKas.push({
                id    : idBase + 2,
                tgl   : tgl,
                uraian: 'Bayar Uang Meja ke Tuan Rumah ('+periode+')',
                tipe  : 'keluar',
                nominal: target,
                sumber: 'uang_meja'
            });

            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            localStorage.setItem(sKey, JSON.stringify({tgl:tgl, terkumpul:terkumpul, target:target, kurang:kurang}));
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire('Berhasil!',
                'Uang meja '+periode+' diserahkan ke tuan rumah.<br>'
                +(kurang>0 ? 'Talangan kas: '+fmt(kurang) : 'Tidak ada talangan.'),
                'success')
                .then(function(){ loadAnalisaUangMeja(); });
        });
    };""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ {count}/2 patch berhasil!")
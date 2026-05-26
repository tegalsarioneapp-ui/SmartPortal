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

# Helper fungsi JS yang akan disisipkan
HELPER_JS = """
    // ═══ HELPER POS KAS ═══════════════════════════════════════════════
    // pos: 'kas_utama' | 'kas_sementara' | 'kas_terpisah'
    // kas_utama     = masuk db_kas (kas RT utama)
    // kas_sementara = masuk db_kas_sementara (disetor ke tuan rumah)
    // kas_terpisah  = masuk db_kas_terpisah (bendahara pembantu/arisan)
    window.getJenisIuranDenganPos = function() {
        var ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) {
            ji = [
                {nama:'Pembangunan', nominal:10000, pos:'kas_utama'},
                {nama:'Uang Meja',   nominal:5000,  pos:'kas_sementara'},
                {nama:'17 Agustus', nominal:5000,  pos:'kas_terpisah'},
                {nama:'Sosial',      nominal:5000,  pos:'kas_terpisah'}
            ];
            localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        }
        // Pastikan semua item punya field pos (migrasi data lama)
        var changed = false;
        ji.forEach(function(j) {
            if (!j.pos) {
                var nm = (j.nama || '').toLowerCase();
                if (nm.includes('bangun') || nm.includes('rt') || nm.includes('sampah')) {
                    j.pos = 'kas_utama';
                } else if (nm.includes('meja')) {
                    j.pos = 'kas_sementara';
                } else {
                    j.pos = 'kas_terpisah';
                }
                changed = true;
            }
        });
        if (changed) localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        return ji;
    };

    // Pisah nominal total ke pos masing-masing
    window.pecahNominalKePos = function(nominalTotal, bulanLabel, namaWarga, tgl) {
        var ji = window.getJenisIuranDenganPos();
        var totalStd = ji.reduce(function(s,x){ return s+(x.nominal||0); }, 0) || 25000;
        var hasilKas = [];         // masuk db_kas utama
        var hasilSementara = [];   // masuk db_kas_sementara
        var hasilTerpisah = [];    // masuk db_kas_terpisah
        var idBase = Date.now();

        ji.forEach(function(j, idx) {
            var jml = Math.round((j.nominal / totalStd) * nominalTotal);
            if (jml <= 0) return;
            var entry = {
                id: idBase + idx,
                tgl: tgl,
                uraian: j.nama + ' - Iuran ' + bulanLabel + ' (' + namaWarga + ')',
                tipe: 'masuk',
                nominal: jml,
                sumber: 'iuran',
                komponen: j.nama
            };
            if (j.pos === 'kas_utama')     hasilKas.push(entry);
            else if (j.pos === 'kas_sementara') hasilSementara.push(entry);
            else                            hasilTerpisah.push(entry);
        });

        // Simpan ke masing-masing storage
        if (hasilKas.length) {
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            hasilKas.forEach(function(e){ dbKas.push(e); });
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
        }
        if (hasilSementara.length) {
            var dbSem = JSON.parse(localStorage.getItem('db_kas_sementara') || '[]');
            hasilSementara.forEach(function(e){ dbSem.push(e); });
            localStorage.setItem('db_kas_sementara', JSON.stringify(dbSem));
        }
        if (hasilTerpisah.length) {
            var dbTer = JSON.parse(localStorage.getItem('db_kas_terpisah') || '[]');
            hasilTerpisah.forEach(function(e){ dbTer.push(e); });
            localStorage.setItem('db_kas_terpisah', JSON.stringify(dbTer));
        }
        return { kas: hasilKas, sementara: hasilSementara, terpisah: hasilTerpisah };
    };
    // ══════════════════════════════════════════════════════════════════
"""
# ═══ PATCH 1: Sisipkan helper sebelum renderJenisIuran ═══
patch("Sisipkan helper pos kas sebelum renderJenisIuran",
"""    window.renderJenisIuran = function() {""",
HELPER_JS + """    window.renderJenisIuran = function() {""")
# ═══ PATCH 2: Fix simpanBulan - pisah pos kas ═══
patch("simpanBulan pisah pos kas",
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
            // Pisah ke pos kas masing-masing
            var bulanLabel = bulanDipilih.length === 1
                ? bulanDipilih[0]
                : bulanDipilih[0].split(' ')[0] + '-' + bulanDipilih[bulanDipilih.length-1].split(' ')[0]
                  + ' ' + (bulanDipilih[0].split(' ')[1] || '');
            var hasilPos = window.pecahNominalKePos(totalNominal, bulanLabel, _iuranWargaTerpilih.nama, tgl);
            // db_kas sudah disimpan di dalam pecahNominalKePos
            // reload dbKas dari storage agar sinkron
            dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            window._iuranDbIuran = dbIuran;
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            // Buat ringkasan pos untuk notifikasi
            var infoKas = '';
            if (hasilPos.kas.length) infoKas += '<br>✅ Kas Utama: ' + fmt(hasilPos.kas.reduce(function(s,x){return s+x.nominal;},0));
            if (hasilPos.sementara.length) infoKas += '<br>⏳ Kas Sementara: ' + fmt(hasilPos.sementara.reduce(function(s,x){return s+x.nominal;},0));
            if (hasilPos.terpisah.length) infoKas += '<br>📋 Terpisah: ' + fmt(hasilPos.terpisah.reduce(function(s,x){return s+x.nominal;},0));
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                html: '<b>' + _iuranWargaTerpilih.nama + '</b> - ' + bulanDipilih.length + ' bulan<br>'
                    + '<b>Total: ' + fmt(totalNominal) + '</b>'
                    + infoKas
            });
            window.loadTabIuranKolektif();
            var chk = document.getElementById('iuran-override-check');
            var wrap = document.getElementById('iuran-override-wrap');
            if (chk) chk.checked = false;
            if (wrap) wrap.style.display = 'none';
        }""")
# ═══ PATCH 3: Fix inputIuranCepat - pisah pos kas ═══
patch("inputIuranCepat pisah pos kas",
"""            dbKas.push({
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
            }""",
"""            // Pisah ke pos kas masing-masing
            window.pecahNominalKePos(nominalIuran, bulan, w.nama, tgl);
            // Reload dbKas dari storage agar sinkron
            dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            localStorage.setItem('db_iuran', JSON.stringify(dbIuran2));
            if(typeof _sync !== 'undefined'){
                _sync.setItem('db_iuran', JSON.stringify(dbIuran2));
                _sync.setItem('db_kas', JSON.stringify(dbKas));
            }""")
# ═══ PATCH 4: Fix postingIuranKeKas - pisah pos kas ═══
patch("postingIuranKeKas pisah pos kas",
"""                    // Suntikkan per komponen ke Buku Kas
                    jiPosting.forEach(function(ji, idx) {
                        let jml = Math.round((ji.nominal / totalPerBulan) * total);
                        if (jml > 0) dbKas.push({ id: Date.now()+idx, tgl: tglSkrg, uraian: 'Setoran Iuran ('+ji.nama+')', tipe: 'masuk', nominal: jml });
                    }); 
                    
                    localStorage.setItem('db_kas', JSON.stringify(dbKas)); 
                    
                    // Tandai semua iuran menjadi SUDAH diposting (Masuk Kas)
                    unposted.forEach(x => x.posted = true); 
                    localStorage.setItem('db_iuran', JSON.stringify(dbIuran)); 
                    
                    // Segarkan seluruh tampilan
                    if(typeof syncSemuaData === 'function') syncSemuaData(); 
                    
                    Swal.fire('Berhasil!', 'Uang Kas berhasil dipecah otomatis dan masuk ke Buku Kas Utama!', 'success');""",
"""                    // Pisah per komponen ke pos kas masing-masing
                    var periodeLabel = unposted.length > 0
                        ? (unposted[0].bulan || tglSkrg)
                        : tglSkrg;
                    var namaGabung = unposted.length === 1
                        ? unposted[0].namaWarga
                        : unposted.length + ' warga';

                    // Kelompok per warga per bulan lalu pecah pos
                    var grupMap = {};
                    unposted.forEach(function(x) {
                        var key = String(x.idWarga) + '|' + (x.bulan || '');
                        if (!grupMap[key]) grupMap[key] = {
                            nama: x.namaWarga,
                            bulan: x.bulan || tglSkrg,
                            total: 0
                        };
                        grupMap[key].total += Number(x.nominal) || 0;
                    });

                    var totalKasUtama = 0;
                    var totalSementara = 0;
                    var totalTerpisah = 0;

                    Object.values(grupMap).forEach(function(g) {
                        var hasil = window.pecahNominalKePos(g.total, g.bulan, g.nama, tglSkrg);
                        totalKasUtama  += hasil.kas.reduce(function(s,x){return s+x.nominal;},0);
                        totalSementara += hasil.sementara.reduce(function(s,x){return s+x.nominal;},0);
                        totalTerpisah  += hasil.terpisah.reduce(function(s,x){return s+x.nominal;},0);
                    });

                    // Tandai semua iuran menjadi SUDAH diposting
                    unposted.forEach(function(x){ x.posted = true; });
                    localStorage.setItem('db_iuran', JSON.stringify(dbIuran));

                    // Segarkan seluruh tampilan
                    if(typeof syncSemuaData === 'function') syncSemuaData();

                    var infoPosting = '';
                    if (totalKasUtama)  infoPosting += '<br>✅ Kas Utama: <b>' + formatRp(totalKasUtama) + '</b>';
                    if (totalSementara) infoPosting += '<br>⏳ Kas Sementara: <b>' + formatRp(totalSementara) + '</b>';
                    if (totalTerpisah)  infoPosting += '<br>📋 Kas Terpisah: <b>' + formatRp(totalTerpisah) + '</b>';

                    Swal.fire({
                        icon: 'success',
                        title: 'Posting Berhasil!',
                        html: 'Total <b>' + formatRp(total) + '</b> sudah dipecah ke pos kas:'
                            + infoPosting
                    });""")
# ═══ PATCH 5: Fix lunasKurangBayarWarga - pisah pos kas ═══
patch("lunasKurangBayarWarga pisah pos kas",
"""            var nominal = result.value;
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
            if (typeof window.loadKasBendahara === 'function') window.loadKasBendahara();""",
"""            var nominal = result.value;
            var tgl = new Date().toISOString().split('T')[0];
            var bulanLabel = 'Kurang Bayar';
            // Pisah ke pos kas masing-masing
            var hasil = window.pecahNominalKePos(nominal, bulanLabel, namaWarga, tgl);
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            var infoLunas = '';
            if (hasil.kas.length) infoLunas += '<br>✅ Kas Utama: ' + hasil.kas.reduce(function(s,x){return s+x.nominal;},0).toLocaleString('id-ID');
            if (hasil.sementara.length) infoLunas += '<br>⏳ Kas Sementara: ' + hasil.sementara.reduce(function(s,x){return s+x.nominal;},0).toLocaleString('id-ID');
            if (hasil.terpisah.length) infoLunas += '<br>📋 Kas Terpisah: ' + hasil.terpisah.reduce(function(s,x){return s+x.nominal;},0).toLocaleString('id-ID');
            Swal.fire({
                icon: 'success',
                title: 'Pelunasan Berhasil!',
                html: '<b>' + namaWarga + '</b> Rp ' + nominal.toLocaleString('id-ID') + ' tercatat!' + infoLunas
            });
            window.loadTabIuranKolektif();
            if (typeof window.loadKasBendahara === 'function') window.loadKasBendahara();""")

# ═══ PATCH 6: renderJenisIuran tambah kolom Pos ═══
patch("renderJenisIuran tambah kolom Pos",
"""        html2 += '<tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;">Nama Jenis</th><th style="padding:8px;text-align:right;">Nominal</th><th style="padding:8px;">Aksi</th></tr>';
        ji.forEach(function(j, i) {
            html2 += '<tr style="border-bottom:1px solid #e2e8f0;">';
            html2 += '<td style="padding:8px;"><input type="text" value="'+j.nama+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;" onchange="updateJenisIuran('+i+',\'nama\',this.value)"></td>';
            html2 += '<td style="padding:8px;"><input type="number" value="'+j.nominal+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;text-align:right;" onchange="updateJenisIuran('+i+',\'nominal\',parseInt(this.value)||0)"></td>';
            html2 += '<td style="padding:8px;text-align:center;"><button onclick="hapusJenisIuran('+i+')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>';
            html2 += '</tr>';
        });
        html2 += '<tr style="background:#f8fafc;font-weight:700;"><td style="padding:8px;">TOTAL</td><td style="padding:8px;text-align:right;color:#10b981;">'+fmt(total)+'</td><td></td></tr>';""",
"""        html2 += '<tr style="background:#f1f5f9;">'
                + '<th style="padding:8px;text-align:left;">Nama Jenis</th>'
                + '<th style="padding:8px;text-align:right;">Nominal</th>'
                + '<th style="padding:8px;text-align:center;">Pos Kas</th>'
                + '<th style="padding:8px;">Aksi</th></tr>';
        var posOptions = [
            {val:'kas_utama',    label:'✅ Kas Utama'},
            {val:'kas_sementara',label:'⏳ Kas Sementara'},
            {val:'kas_terpisah', label:'📋 Kas Terpisah'}
        ];
        ji.forEach(function(j, i) {
            var posVal = j.pos || 'kas_utama';
            var selectOpts = posOptions.map(function(o){
                return '<option value="'+o.val+'"'+(posVal===o.val?' selected':'')+'>'+o.label+'</option>';
            }).join('');
            html2 += '<tr style="border-bottom:1px solid #e2e8f0;">';
            html2 += '<td style="padding:8px;"><input type="text" value="'+j.nama+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;" onchange="updateJenisIuran('+i+',\'nama\',this.value)"></td>';
            html2 += '<td style="padding:8px;"><input type="number" value="'+j.nominal+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;text-align:right;" onchange="updateJenisIuran('+i+',\'nominal\',parseInt(this.value)||0)"></td>';
            html2 += '<td style="padding:8px;"><select style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 6px;width:100%;font-size:0.82rem;" onchange="updateJenisIuran('+i+',\'pos\',this.value)">'+selectOpts+'</select></td>';
            html2 += '<td style="padding:8px;text-align:center;"><button onclick="hapusJenisIuran('+i+')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>';
            html2 += '</tr>';
        });
        html2 += '<tr style="background:#f8fafc;font-weight:700;"><td style="padding:8px;">TOTAL</td><td style="padding:8px;text-align:right;color:#10b981;">'+fmt(total)+'</td><td></td><td></td></tr>';""")

# ═══ PATCH 7: tambahJenisIuran - default pos kas_utama ═══
patch("tambahJenisIuran default pos kas_utama",
"""        ji.push({nama:'Jenis Baru',nominal:0});""",
"""        ji.push({nama:'Jenis Baru',nominal:0,pos:'kas_utama'});""")

# ═══ SIMPAN FILE ═══
with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ SELESAI! {count} patch berhasil diterapkan.")
# patch_bendahara.py
# Jalankan: python patch_bendahara.py

FILE = "artifacts/smart-portal-rt/index.html"

with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

ok = 0

def patch(label, old, new):
    global html, ok
    if old not in html:
        print("GAGAL:", label)
        exit(1)
    html = html.replace(old, new, 1)
    ok += 1
    print("OK:", label)

# PATCH 1: Fix key mismatch di simpanIuranKolektifBaru
# 'tanggal' -> 'tgl', 'keterangan' -> 'uraian'
patch("Fix key db_kas di simpanIuranKolektifBaru",
"dbKas.push({ id: idBase+1000+idx, tanggal: tgl, keterangan: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });",
"dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });"
)

# PATCH 2: Fix postingIuranKeKas hapus hardcode 20000
patch("Fix postingIuranKeKas dynamic",
"""            // Rumus pemecahan 20k -> 10k, 5k, 5k
            let posPembangunan = (10000 / 20000) * total;
            let posMeja = (5000 / 20000) * total;
            let posAgustus = (5000 / 20000) * total;""",
"""            // Baca komponen iuran dari db_jenis_iuran (dynamic)
            let jiPosting = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
            if (!jiPosting.length) jiPosting = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
            let totalPerBulan = jiPosting.reduce(function(s,x){ return s+(x.nominal||0); }, 0) || 20000;"""
)

# PATCH 3: Fix popup konfirmasi posting dynamic
patch("Fix popup posting dynamic",
"""            // Munculkan Pop-up Konfirmasi
            Swal.fire({
                title: 'Posting ' + formatRp(total) + ' ke Kas?', 
                html: `
                <div style="text-align:left; background:#f8fafc; padding:15px; border-radius:10px; border: 1px solid #cbd5e1; margin-top:10px;">
                    <p style="margin-top:0; font-size:0.9rem; color:var(--text-muted); font-weight:bold;">Sistem akan memecah otomatis ke Buku Kas:</p>
                    <div style="margin-bottom:8px;"><b>🏗️ Pembangunan:</b> <span style="color:var(--primary-blue); font-weight:900; float:right;">${formatRp(posPembangunan)}</span></div>
                    <div style="margin-bottom:8px;"><b>🪑 Uang Meja:</b> <span style="color:var(--accent-gold); font-weight:900; float:right;">${formatRp(posMeja)}</span></div>
                    <div><b>🇮🇩 17 Agustus:</b> <span style="color:var(--danger); font-weight:900; float:right;">${formatRp(posAgustus)}</span></div>
                </div>`,""",
"""            // Build detail HTML per komponen dynamic
            let detailHtmlPosting = jiPosting.map(function(ji, idx) {
                let jml = Math.round((ji.nominal / totalPerBulan) * total);
                return '<div style="margin-bottom:8px;"><b>' + ji.nama + ':</b>' +
                       '<span style="color:var(--primary-blue);font-weight:900;float:right;">' + formatRp(jml) + '</span></div>';
            }).join('');
            Swal.fire({
                title: 'Posting ' + formatRp(total) + ' ke Kas?',
                html: '<div style="text-align:left;background:#f8fafc;padding:15px;border-radius:10px;border:1px solid #cbd5e1;margin-top:10px;">' +
                      '<p style="margin-top:0;font-size:0.9rem;font-weight:bold;">Sistem akan memecah otomatis ke Buku Kas:</p>' +
                      detailHtmlPosting + '</div>',"""
)

# PATCH 4: Fix eksekusi posting ke db_kas dynamic
patch("Fix eksekusi posting db_kas dynamic",
"""                    // Suntikkan 3 Pos tersebut ke Buku Kas Umum
                    if(posPembangunan > 0) dbKas.push({ id: Date.now(), tgl: tglSkrg, uraian: 'Setoran Iuran (Dana Pembangunan)', tipe: 'masuk', nominal: posPembangunan }); 
                    if(posMeja > 0) dbKas.push({ id: Date.now()+1, tgl: tglSkrg, uraian: 'Setoran Iuran (Uang Meja)', tipe: 'masuk', nominal: posMeja }); 
                    if(posAgustus > 0) dbKas.push({ id: Date.now()+2, tgl: tglSkrg, uraian: 'Setoran Iuran (Dana 17 Agustus)', tipe: 'masuk', nominal: posAgustus });""",
"""                    // Suntikkan per komponen ke Buku Kas
                    jiPosting.forEach(function(ji, idx) {
                        let jml = Math.round((ji.nominal / totalPerBulan) * total);
                        if (jml > 0) dbKas.push({ id: Date.now()+idx, tgl: tglSkrg, uraian: 'Setoran Iuran ('+ji.nama+')', tipe: 'masuk', nominal: jml });
                    });"""
)

# PATCH 5: Fix loadMatriksIuran hapus hardcode
patch("Fix loadMatriksIuran dynamic",
"        let p1T = (10000 / 20000) * uangTertahan; let p2T = (5000 / 20000) * uangTertahan; let p3T = (5000 / 20000) * uangTertahan;\n        let p1M = (10000 / 20000) * uangMasukKas; let p2M = (5000 / 20000) * uangMasukKas; let p3M = (5000 / 20000) * uangMasukKas;",
"""        let _jiM = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!_jiM.length) _jiM = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        let _totM = _jiM.reduce(function(s,x){ return s+(x.nominal||0); }, 0) || 20000;
        let uangTertahanArr = _jiM.map(function(ji){ return Math.round((ji.nominal/_totM)*uangTertahan); });
        let uangMasukArr = _jiM.map(function(ji){ return Math.round((ji.nominal/_totM)*uangMasukKas); });
        let p1T = uangTertahanArr[0]||0; let p2T = uangTertahanArr[1]||0; let p3T = uangTertahanArr[2]||0;
        let p1M = uangMasukArr[0]||0; let p2M = uangMasukArr[1]||0; let p3M = uangMasukArr[2]||0;"""
)

# PATCH 6: Fix detail breakdown label di loadMatriksIuran
patch("Fix label breakdown matriks",
"""        let detailTertahan = `<div style="font-size:0.85rem; font-weight:600; margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1; color:var(--text-muted); line-height:1.6; width:100%;"><span style="color:var(--primary-dark)">• Pembangunan:</span> ${fmt(p1T)}<br><span style="color:var(--primary-dark)">• Uang Meja:</span> ${fmt(p2T)}<br><span style="color:var(--primary-dark)">• 17 Agustus:</span> ${fmt(p3T)}</div>`;
        let detailMasuk = `<div style="font-size:0.85rem; font-weight:600; margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1; color:var(--text-muted); line-height:1.6; width:100%;"><span style="color:var(--primary-dark)">• Pembangunan:</span> ${fmt(p1M)}<br><span style="color:var(--primary-dark)">• Uang Meja:</span> ${fmt(p2M)}<br><span style="color:var(--primary-dark)">• 17 Agustus:</span> ${fmt(p3M)}</div>`;""",
"""        let detailTertahan = '<div style="font-size:0.85rem;font-weight:600;margin-top:12px;padding-top:10px;border-top:1px dashed #cbd5e1;color:var(--text-muted);line-height:1.6;width:100%;">' +
            _jiM.map(function(ji,i){ return '<span style="color:var(--primary-dark)">• '+ji.nama+':</span> '+fmt(uangTertahanArr[i]||0); }).join('<br>') + '</div>';
        let detailMasuk = '<div style="font-size:0.85rem;font-weight:600;margin-top:12px;padding-top:10px;border-top:1px dashed #cbd5e1;color:var(--text-muted);line-height:1.6;width:100%;">' +
            _jiM.map(function(ji,i){ return '<span style="color:var(--primary-dark)">• '+ji.nama+':</span> '+fmt(uangMasukArr[i]||0); }).join('<br>') + '</div>';"""
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\nSELESAI! {ok} patch berhasil diterapkan.")
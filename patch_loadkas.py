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

# PATCH: Upgrade loadKasBendahara
# - Isi ben-lap-saldo-awal (ID baru, tidak duplikat)
# - Isi ben-lap-saldo-akhir (ID baru, tidak duplikat)
# - Hitung & isi ben-total-masuk dan ben-total-keluar
# - Tetap isi ben-saldo-kas-input dan ben-display-saldo-awal (di tab ben-input)
patch("Upgrade loadKasBendahara",
"window.loadKasBendahara = function() { let dbKas = JSON.parse(localStorage.getItem('db_kas')) || []; let sAwal = parseInt(localStorage.getItem('db_saldo_awal')) || 0; if(document.getElementById('ben-display-saldo-awal')) document.getElementById('ben-display-saldo-awal').innerText = fmt(sAwal); let sAkhir = sAwal; let tb = document.getElementById('tbody-laporan-kas'); if(tb) { tb.innerHTML=''; dbKas.sort((a,b)=>new Date(a.tgl)-new Date(b.tgl)).forEach(k => { if(k.tipe==='masuk') sAkhir+=k.nominal; else sAkhir-=k.nominal; tb.innerHTML+=`<tr><td>${k.tgl}</td><td><b>${k.uraian}</b></td><td>${k.tipe}</td><td>${fmt(k.nominal)} <small>(Saldo: ${fmt(sAkhir)})</small></td><td><button class=\"btn-table btn-tbl-del\" onclick=\"hapusKas(${k.id})\"><i class=\"fa-solid fa-trash\"></i></button></td></tr>`; }); } if(document.getElementById('warga-saldo-kas')) document.getElementById('warga-saldo-kas').innerText=fmt(sAkhir); if(document.getElementById('ben-saldo-kas-input')) document.getElementById('ben-saldo-kas-input').innerText=fmt(sAkhir); };",
"""window.loadKasBendahara = function() {
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
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\nSELESAI!", ok, "patch berhasil diterapkan.")
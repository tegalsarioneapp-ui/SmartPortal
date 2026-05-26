FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# ── PATCH 1: btnAgustus → tombol dengan PIN modal ──
OLD1 = """        var btnAgustus = '<div style="margin-top:12px;padding:10px;border-radius:10px;background:var(--bg-light,#f8fafc);border:1px solid var(--border-color,#e2e8f0);font-size:0.82rem;color:var(--text-muted);text-align:center;"><i class="fa-solid fa-piggy-bank" style="color:#f59e0b;"></i> Dipegang Bendahara Pembantu</div>';"""

NEW1 = """        var stAgustus   = localStorage.getItem('setor_agustus_'+periode.replace(/ /g,'_'));
        var btnAgustus  = stAgustus
            ? '<div style="margin-top:12px;padding:10px 14px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;display:flex;align-items:center;gap:8px;">'
              +'<i class="fa-solid fa-circle-check" style="color:#f97316;"></i>'
              +'<span style="font-size:0.82rem;font-weight:700;color:#c2410c;">Dicatat BA — '
              +new Date(JSON.parse(stAgustus).tgl).toLocaleDateString('id-ID')+'</span>'
              +'</div>'
            : '<button onclick="catatAgustusBA()" style="margin-top:12px;width:100%;padding:10px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-weight:700;font-size:0.85rem;">'
              +'<i class="fa-solid fa-lock"></i> Catat BA (PIN Bendahara Pembantu)'
              +'</button>';"""

# ── PATCH 2: Tambah fungsi catatAgustusBA setelah catatSosialBA ──
OLD2 = """        if(typeof syncSemuaData==='function') syncSemuaData(true);
        Toast.fire({icon:'success',title:'Dana Sosial dicatat di BA (tidak masuk Kas Utama)'});
        if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();
    };"""

NEW2 = """        if(typeof syncSemuaData==='function') syncSemuaData(true);
        Toast.fire({icon:'success',title:'Dana Sosial dicatat di BA (tidak masuk Kas Utama)'});
        if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();
    };

    window.catatAgustusBA = function() {
        var param   = JSON.parse(localStorage.getItem('db_param_pertemuan')||'{}');
        var pinSave = param.pinBenPembantu || '1234';
        var periode = window.currentPeriodeKey || '';
        var sKey    = 'setor_agustus_'+periode.replace(/ /g,'_');
        if(localStorage.getItem(sKey)) return Swal.fire('Info','Sudah dicatat BA bulan ini.','info');

        Swal.fire({
            title: '<i class="fa-solid fa-lock" style="color:#f97316;"></i> PIN Bendahara Pembantu',
            html: '<p style="font-size:0.85rem;color:#64748b;margin-bottom:12px;">Masukkan PIN untuk mencatat saldo 17 Agustus</p>'
                + '<input id="swal-pin-agustus" type="password" maxlength="4" inputmode="numeric" '
                + 'style="width:100%;padding:12px;border:2px solid #f97316;border-radius:10px;font-size:1.4rem;letter-spacing:8px;text-align:center;" '
                + 'placeholder="••••">',
            confirmButtonText: '<i class="fa-solid fa-check"></i> Konfirmasi',
            confirmButtonColor: '#f97316',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            focusConfirm: false,
            didOpen: function() {
                document.getElementById('swal-pin-agustus').focus();
            },
            preConfirm: function() {
                var pin = (document.getElementById('swal-pin-agustus').value||'').trim();
                if(!pin) { Swal.showValidationMessage('PIN tidak boleh kosong'); return false; }
                if(pin !== pinSave) { Swal.showValidationMessage('PIN salah!'); return false; }
                return true;
            }
        }).then(function(result) {
            if(!result.isConfirmed) return;
            var dbIuran   = JSON.parse(localStorage.getItem('db_iuran')||'[]');
            var now       = new Date();
            var bulanNama = new Intl.DateTimeFormat('id-ID',{month:'long'}).format(now);
            var tahunSkg  = now.getFullYear();
            var ji        = getJenisIuranMap();
            var iuranBln  = dbIuran.filter(function(x){
                return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()
                    && String(x.tahun||tahunSkg)===String(tahunSkg);
            });
            var nomAgustus = 0;
            ji.forEach(function(j){
                if((j.nama||'').toLowerCase().indexOf('agustus')!==-1) nomAgustus = j.nominal||0;
            });
            var totalAgustus = iuranBln.length * nomAgustus;
            // Hitung saldo kumulatif
            var dbPertemuan  = JSON.parse(localStorage.getItem('db_pertemuan')||'[]');
            var kumulatif    = dbPertemuan.reduce(function(s,p){ return s+(p.agustusTerkumpul||0); },0) + totalAgustus;
            localStorage.setItem(sKey, JSON.stringify({
                tgl      : new Date().toISOString(),
                nominal  : totalAgustus,
                kumulatif: kumulatif,
                jumlah   : iuranBln.length
            }));
            // ✅ TIDAK masuk KAS Utama — hanya catat BA
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire({
                icon : 'success',
                title: 'Berhasil Dicatat!',
                html : '<b>Bulan ini:</b> '+fmt(totalAgustus)+'<br><b>Saldo Kumulatif:</b> '+fmt(kumulatif),
                confirmButtonColor: '#f97316'
            });
            if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();
        });
    };"""

def patch(label, old, new):
    global html
    if old not in html:
        print(f"GAGAL: {label} — string tidak ditemukan")
        exit(1)
    html = html.replace(old, new, 1)
    print(f"OK: {label}")

patch("btnAgustus → tombol PIN", OLD1, NEW1)
patch("Tambah fungsi catatAgustusBA", OLD2, NEW2)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("✅ Semua patch selesai!")
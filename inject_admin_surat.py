FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()

ANCHOR = 'window.cetakPDFSurat'
idx = html.find(ANCHOR)
print(f'Anchor pos: {idx}')

NEW_FUNS = r"""window.loadSuratAdmin = function() {
    try {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var tbody = document.getElementById('tbody-surat-admin');
        if (!tbody) return;
        if (db.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;"><i class="fa-solid fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>Belum ada pengajuan surat.</td></tr>';
            return;
        }
        db.sort(function(a,b){ return (b.id||0)-(a.id||0); });
        var rows = '';
        db.forEach(function(s) {
            var status = s.status || 'Menunggu Acc';
            var badge = status === 'Selesai'
                ? '<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">Selesai</span>'
                : status === 'Ditolak'
                ? '<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">Ditolak</span>'
                : '<span style="background:#fef9c3;color:#ca8a04;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">Menunggu</span>';
            var aksi = status === 'Selesai'
                ? '<button onclick="cetakPDFSurat('+s.id+',false)" style="padding:6px 10px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-size:0.78rem;cursor:pointer;margin-right:4px;"><i class=\"fa-solid fa-print\"></i> Cetak</button>'
                  + '<button onclick="cetakPDFSurat('+s.id+',true)" style="padding:6px 10px;background:#0f766e;color:#fff;border:none;border-radius:8px;font-size:0.78rem;cursor:pointer;"><i class=\"fa-solid fa-copy\"></i> Salinan</button>'
                : status === 'Ditolak'
                ? '<span style="color:#94a3b8;font-size:0.8rem;">Ditolak</span>'
                : '<button onclick="approveSurat('+s.id+')" style="padding:6px 10px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-size:0.78rem;cursor:pointer;margin-right:4px;"><i class=\"fa-solid fa-check\"></i> Acc</button>'
                  + '<button onclick="rejectSurat('+s.id+')" style="padding:6px 10px;background:#dc2626;color:#fff;border:none;border-radius:8px;font-size:0.78rem;cursor:pointer;"><i class=\"fa-solid fa-times\"></i> Tolak</button>';
            rows += '<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">'
                + '<td style="padding:10px 12px;">' + (s.tglPengajuan||'-') + '</td>'
                + '<td style="padding:10px 12px;font-weight:600;">' + (s.nama||'-') + '</td>'
                + '<td style="padding:10px 12px;font-size:0.82rem;color:#64748b;">' + (s.nik||'-') + '</td>'
                + '<td style="padding:10px 12px;">' + ((s.keperluan||'-')+'').substring(0,40) + '</td>'
                + '<td style="padding:10px 12px;">' + badge + '</td>'
                + '<td style="padding:10px 12px;text-align:center;">' + aksi + '</td>'
                + '</tr>';
        });
        tbody.innerHTML = rows;
        if (typeof window.updateNavBadges === 'function') window.updateNavBadges();
    } catch(e) { console.error('loadSuratAdmin:', e); }
};

window.approveSurat = function(id) {
    var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
    var i = db.findIndex(function(s){ return s.id === id; });
    if (i === -1) return Swal.fire('Error','Data tidak ditemukan','error');
    Swal.fire({
        title: '<i class="fa-solid fa-file-signature"></i> Setujui Pengajuan',
        html: '<p style="color:#64748b;margin-bottom:12px;">Masukkan nomor surat dan token untuk warga.</p>'
            + '<input id="sw-nosurat" placeholder="Nomor Surat (cth: 001/RT01/VI/2025)" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;margin-bottom:8px;font-size:0.9rem;">'
            + '<input id="sw-token" placeholder="Token (6 digit, cth: 225513)" maxlength="10" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;">',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-check"></i> Setujui',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#16a34a',
        preConfirm: function() {
            var no = (document.getElementById('sw-nosurat').value||'').trim();
            var tk = (document.getElementById('sw-token').value||'').trim();
            if (!no) { Swal.showValidationMessage('Nomor surat wajib diisi!'); return false; }
            if (!tk) { Swal.showValidationMessage('Token wajib diisi!'); return false; }
            return { noSurat: no, token: tk };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            db[i].status   = 'Selesai';
            db[i].noSurat  = result.value.noSurat;
            db[i].token    = result.value.token;
            db[i].tglAcc   = new Date().toLocaleDateString('id-ID');
            localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
            Swal.fire({
                icon: 'success',
                title: 'Surat Disetujui!',
                html: '<b>No Surat:</b> ' + result.value.noSurat
                    + '<br><b>Token Warga:</b> <span style="font-size:1.4rem;font-weight:800;letter-spacing:4px;color:#1d4ed8;">' + result.value.token + '</span>'
                    + '<br><small style="color:#64748b;">Berikan token ini kepada warga untuk download surat.</small>',
                confirmButtonText: 'OK & Cetak Arsip',
                confirmButtonColor: '#1d4ed8'
            }).then(function(r2) {
                if (r2.isConfirmed && typeof cetakPDFSurat === 'function') {
                    cetakPDFSurat(id, true);
                }
            });
            if (typeof loadSuratAdmin === 'function') loadSuratAdmin();
        }
    });
};

window.rejectSurat = function(id) {
    var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
    var i = db.findIndex(function(s){ return s.id === id; });
    if (i === -1) return Swal.fire('Error','Data tidak ditemukan','error');
    Swal.fire({
        title: 'Tolak Pengajuan?',
        html: '<input id="sw-alasan" placeholder="Alasan penolakan..." style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;">',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-times"></i> Tolak',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc2626',
        preConfirm: function() {
            var alasan = (document.getElementById('sw-alasan').value||'').trim();
            if (!alasan) { Swal.showValidationMessage('Alasan wajib diisi!'); return false; }
            return alasan;
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            db[i].status = 'Ditolak';
            db[i].alasan = result.value;
            localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
            Swal.fire('Ditolak','Pengajuan telah ditolak.','info');
            if (typeof loadSuratAdmin === 'function') loadSuratAdmin();
        }
    });
};

"""

if idx != -1:
    html = html[:idx] + NEW_FUNS + html[idx:]
    print('OK: fungsi admin surat diinject')
else:
    print('GAGAL: anchor tidak ditemukan')

# Verifikasi
print()
print('=== VERIFIKASI ===')
for fn in ['loadSuratAdmin','approveSurat','rejectSurat','cetakPDFSurat']:
    c = html.count(f'window.{fn}')
    print(f'  {"OK" if c>=1 else "!!"} {fn}: {c}x')
print('  tbody-surat-admin:', 'tbody-surat-admin' in html)

f = open(FILE, 'w', encoding='utf-8')
f.write(html)
f.close()
print()
print('File saved!')

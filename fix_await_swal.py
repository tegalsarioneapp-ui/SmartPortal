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
    print(f"OK: {label}")

patch("Ganti await Swal ke .then()",
"""        if (pakaiOverride) {
            var konfirmasiOverride = await Swal.fire({
                title: 'Konfirmasi Override Nominal',
                html: '<div style="text-align:left; font-size:0.9rem;">' +
                      '<b>Nominal override:</b> ' + fmt(nominalOverride) + '/bulan<br>' +
                      '<b>Jumlah bulan:</b> ' + bulanDipilih.length + ' bulan<br>' +
                      '<b>Total:</b> ' + fmt(nominalOverride * bulanDipilih.length) + '<br><br>' +
                      '<span style="color:#f59e0b; font-size:0.85rem;">⚠️ Nominal ini akan digunakan untuk semua bulan yang dipilih, ' +
                      'menggantikan nominal otomatis per periode.</span></div>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Gunakan Override',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#f59e0b'
            });
            if (!konfirmasiOverride.isConfirmed) return;
        }

        bulanDipilih.forEach(function(bulan, idx) {
            // Nominal: override manual atau otomatis per periode
            var nominalIuran = pakaiOverride ? nominalOverride : window.getNominalByBulan(bulan);
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });
        localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
        localStorage.setItem('db_kas', JSON.stringify(dbKas));
        window._iuranDbIuran = dbIuran;
        Swal.fire('Berhasil!', _iuranWargaTerpilih.nama+' - '+bulanDipilih.length+' bulan tercatat!', 'success');
        window.loadTabIuranKolektif();
    };""",
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
        }

        if (pakaiOverride) {
            Swal.fire({
                title: 'Konfirmasi Override Nominal',
                html: '<div style="text-align:left; font-size:0.9rem;">' +
                      '<b>Nominal override:</b> ' + fmt(nominalOverride) + '/bulan<br>' +
                      '<b>Jumlah bulan:</b> ' + bulanDipilih.length + ' bulan<br>' +
                      '<b>Total:</b> ' + fmt(nominalOverride * bulanDipilih.length) + '<br><br>' +
                      '<span style="color:#f59e0b; font-size:0.85rem;">⚠️ Nominal ini akan digunakan untuk semua bulan yang dipilih, ' +
                      'menggantikan nominal otomatis per periode.</span></div>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Gunakan Override',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#f59e0b'
            }).then(function(result) {
                if (!result.isConfirmed) return;
                simpanBulan(nominalOverride);
            });
        } else {
            simpanBulan(null);
        }
    };""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ {count}/1 patch selesai!")
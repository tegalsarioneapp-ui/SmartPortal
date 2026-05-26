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

# ═══ PATCH 1: hitungKurangBayar — universal, pakai getNominalByBulan ═══
patch("hitungKurangBayar universal",
"""    window.hitungKurangBayar = function() {
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var hasil = [];

        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var nominalDibayar = Number(x.nominal) || 0;
            var tahun = 2026;
            // Coba baca tahun dari field tanggal jika ada
            if (x.tanggal) {
                var t = new Date(x.tanggal);
                if (!isNaN(t)) tahun = t.getFullYear();
            }
            var seharusnya = getNominalSeharusnya(x.bulan, tahun);
            var kurang = seharusnya - nominalDibayar;
            if (kurang > 0) {
                var warga = dbWarga.find(function(w) {
                    return String(w.id) === String(x.idWarga);
                });
                hasil.push({
                    idIuran: x.id,
                    idWarga: x.idWarga,
                    namaWarga: x.namaWarga || (warga ? warga.nama : 'Unknown'),
                    bulan: x.bulan,
                    tanggal: x.tanggal || '',
                    nominalDibayar: nominalDibayar,
                    seharusnya: seharusnya,
                    kurang: kurang
                });
            }
        });

        // Urutkan: nama warga → bulan
        hasil.sort(function(a, b) {
            if (a.namaWarga < b.namaWarga) return -1;
            if (a.namaWarga > b.namaWarga) return 1;
            return BULAN_LIST.indexOf(a.bulan) - BULAN_LIST.indexOf(b.bulan);
        });

        return hasil;
    };""",
"""    window.hitungKurangBayar = function() {
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var hasil = [];
        var BULAN_ORDER = ['Januari','Februari','Maret','April','Mei','Juni',
                           'Juli','Agustus','September','Oktober','November','Desember'];

        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var nominalDibayar = Number(x.nominal) || 0;

            // Format bulan bisa "Januari" (lama) atau "Januari 2026" (baru)
            // Normalisasi ke format "Bulan YYYY" untuk getNominalByBulan
            var bulanKey = x.bulan || '';
            var parts = bulanKey.trim().split(' ');
            if (parts.length === 1) {
                // Format lama — ambil tahun dari tanggal
                var tahun = 2026;
                if (x.tanggal) {
                    var t = new Date(x.tanggal);
                    if (!isNaN(t)) tahun = t.getFullYear();
                }
                bulanKey = parts[0] + ' ' + tahun;
            }

            var seharusnya = window.getNominalByBulan(bulanKey);
            var kurang = seharusnya - nominalDibayar;

            if (kurang > 0) {
                var warga = dbWarga.find(function(w) {
                    return String(w.id) === String(x.idWarga);
                });
                hasil.push({
                    idIuran: x.id,
                    idWarga: x.idWarga,
                    namaWarga: x.namaWarga || (warga ? warga.nama : 'Unknown'),
                    bulan: bulanKey,
                    bulanAsli: x.bulan,
                    tanggal: x.tanggal || '',
                    nominalDibayar: nominalDibayar,
                    seharusnya: seharusnya,
                    kurang: kurang
                });
            }
        });

        // Sort: nama warga → tahun → urutan bulan
        hasil.sort(function(a, b) {
            if (a.namaWarga < b.namaWarga) return -1;
            if (a.namaWarga > b.namaWarga) return 1;
            var aParts = a.bulan.split(' ');
            var bParts = b.bulan.split(' ');
            var aTahun = parseInt(aParts[1]) || 2026;
            var bTahun = parseInt(bParts[1]) || 2026;
            if (aTahun !== bTahun) return aTahun - bTahun;
            return BULAN_ORDER.indexOf(aParts[0]) - BULAN_ORDER.indexOf(bParts[0]);
        });

        return hasil;
    };""")

# ═══ PATCH 2: lunasiSatuKurangBayar — cocokkan bulanAsli ═══
patch("lunasiSatuKurangBayar pakai bulanAsli",
"""            // Update nominal di db_iuran
            dbIuran.forEach(function(x) {
                if (String(x.idWarga) === String(idWarga) && x.bulan === bulan && x.posted) {
                    x.nominal = (Number(x.nominal) || 0) + kurang;
                    x.sudahLunasKurang = true;
                }
            });

            // Catat ke kas
            dbKas.push({
                id: Date.now(),
                tgl: tgl,
                uraian: 'Pelunasan kurang bayar ' + bulan + ' - ' + namaWarga + ' (Uang Sosial)',
                tipe: 'masuk',
                nominal: kurang,
                sumber: 'iuran'
            });""",
"""            // Update nominal di db_iuran
            // bulan bisa format "Januari 2026" atau "Januari" (lama)
            dbIuran.forEach(function(x) {
                var bulanNorm = x.bulan || '';
                var parts = bulanNorm.trim().split(' ');
                if (parts.length === 1 && x.tanggal) {
                    var t = new Date(x.tanggal);
                    if (!isNaN(t)) bulanNorm = parts[0] + ' ' + t.getFullYear();
                }
                if (String(x.idWarga) === String(idWarga) && bulanNorm === bulan && x.posted) {
                    x.nominal = (Number(x.nominal) || 0) + kurang;
                    x.sudahLunasKurang = true;
                }
            });

            // Catat ke kas — uraian dinamis
            dbKas.push({
                id: Date.now(),
                tgl: tgl,
                uraian: 'Pelunasan kurang bayar ' + bulan + ' - ' + namaWarga,
                tipe: 'masuk',
                nominal: kurang,
                sumber: 'iuran'
            });""")

# ═══ PATCH 3: lunasiSemuaKurangBayar — cocokkan bulanAsli ═══
patch("lunasiSemuaKurangBayar pakai bulanAsli",
"""            data.forEach(function(x) {
                dbIuran.forEach(function(rec) {
                    if (String(rec.idWarga) === String(x.idWarga) && rec.bulan === x.bulan && rec.posted) {
                        rec.nominal = (Number(rec.nominal) || 0) + x.kurang;
                        rec.sudahLunasKurang = true;
                    }
                });
                dbKas.push({
                    id: Date.now() + Math.random(),
                    tgl: tgl,
                    uraian: 'Pelunasan kurang bayar ' + x.bulan + ' - ' + x.namaWarga + ' (Uang Sosial)',
                    tipe: 'masuk',
                    nominal: x.kurang,
                    sumber: 'iuran'
                });
            });""",
"""            data.forEach(function(x) {
                dbIuran.forEach(function(rec) {
                    var bulanNorm = rec.bulan || '';
                    var parts = bulanNorm.trim().split(' ');
                    if (parts.length === 1 && rec.tanggal) {
                        var t = new Date(rec.tanggal);
                        if (!isNaN(t)) bulanNorm = parts[0] + ' ' + t.getFullYear();
                    }
                    if (String(rec.idWarga) === String(x.idWarga) && bulanNorm === x.bulan && rec.posted) {
                        rec.nominal = (Number(rec.nominal) || 0) + x.kurang;
                        rec.sudahLunasKurang = true;
                    }
                });
                dbKas.push({
                    id: Date.now() + Math.random(),
                    tgl: tgl,
                    uraian: 'Pelunasan kurang bayar ' + x.bulan + ' - ' + x.namaWarga,
                    tipe: 'masuk',
                    nominal: x.kurang,
                    sumber: 'iuran'
                });
            });""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
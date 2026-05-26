FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = "    window.inputIuranCepat = function(idWarga, bulan) {"

NEW = """    // Helper nominal berdasarkan periode historis
    window.getNominalByBulan = function(bulan) {
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                     'Juli','Agustus','September','Oktober','November','Desember'];
        // Periode lama: Sep 2025 - Mei 2026 = 20.000
        var periodeLama = [
            'September 2025','Oktober 2025','November 2025','Desember 2025',
            'Januari 2026','Februari 2026','Maret 2026','April 2026','Mei 2026'
        ];
        if (periodeLama.indexOf(bulan) !== -1) return 20000;
        // Selain itu pakai nominal dari settings (dinamis)
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        return Number(dbSettings.nominalIuran) || 25000;
    };

    window.inputIuranCepat = function(idWarga, bulan) {"""

if OLD not in html:
    print("GAGAL: anchor tidak ditemukan")
    exit(1)

html = html.replace(OLD, NEW, 1)

# PATCH 2: inputIuranCepat pakai getNominalByBulan
OLD2 = """        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var dbJenis = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        var breakdown = dbJenis.length > 0
            ? dbJenis.map(function(j){ return j.nama+': '+fmt(j.nominal); }).join(', ')
            : 'Total: '+fmt(nominalIuran);"""

NEW2 = """        var nominalIuran = window.getNominalByBulan(bulan);
        var dbJenis = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        // Kalau periode lama, breakdown tidak perlu pecah komponen
        var periodeLama = ['September 2025','Oktober 2025','November 2025','Desember 2025',
            'Januari 2026','Februari 2026','Maret 2026','April 2026','Mei 2026'];
        var breakdown = periodeLama.indexOf(bulan) !== -1
            ? '<span style="color:#f59e0b;">⚠️ Nominal historis periode lama</span>'
            : dbJenis.length > 0
                ? dbJenis.map(function(j){ return j.nama+': '+fmt(j.nominal); }).join(', ')
                : 'Total: '+fmt(nominalIuran);"""

if OLD2 not in html:
    print("GAGAL: patch nominal inputIuranCepat tidak ditemukan")
    exit(1)

html = html.replace(OLD2, NEW2, 1)
print("OK: inputIuranCepat pakai getNominalByBulan")

# PATCH 3: simpanIuranKolektifBaru pakai getNominalByBulan per bulan
OLD3 = """        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var tgl = new Date().toISOString().split('T')[0];
        var idBase = Date.now();
        bulanDipilih.forEach(function(bulan, idx) {
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });"""

NEW3 = """        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var tgl = new Date().toISOString().split('T')[0];
        var idBase = Date.now();
        bulanDipilih.forEach(function(bulan, idx) {
            // Nominal dinamis per bulan — historis 20rb, terbaru dari settings
            var nominalIuran = window.getNominalByBulan(bulan);
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });"""

if OLD3 not in html:
    print("GAGAL: patch simpanIuranKolektifBaru tidak ditemukan")
    exit(1)

html = html.replace(OLD3, NEW3, 1)
print("OK: simpanIuranKolektifBaru nominal per bulan")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\n✅ Semua patch selesai!")
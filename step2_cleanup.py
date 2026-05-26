FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Hapus bayarCepatTagihan lama
OLD_BAYAR = """    window.bayarCepatTagihan = function(idWarga, namaWarga) {
        let bulanSkg = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        let nominalDefault = JSON.parse(localStorage.getItem('db_settings'))?.nomIuran || 20000;
        Swal.fire({ title: 'Input Pembayaran', html: `Mencatat iuran untuk <b>${namaWarga}</b><br>Bulan: ${bulanSkg}`, input: 'number', inputValue: nominalDefault, inputLabel: 'Masukkan Nominal (Rp)', showCancelButton: true, confirmButtonText: 'Simpan Pembayaran', confirmButtonColor: '#10b981' }).then(res => {
            if(res.isConfirmed && res.value) {
                let db = JSON.parse(localStorage.getItem('db_iuran')) || [];
                db.push({ id: Date.now(), idWarga: idWarga, namaWarga: namaWarga, bulan: bulanSkg, nominal: parseInt(res.value), tglBayar: new Date().toLocaleDateString('id-ID'), posted: false });
                localStorage.setItem('db_iuran', JSON.stringify(db)); syncSemuaData(); Toast.fire({icon: 'success', title: 'Pembayaran Lunas!'});
            }
        });
    };

    window.eksekusiDanaTalangan = function() {
        let kurang = window.currentDefisitMeja || 0; let dbKas = JSON.parse(localStorage.getItem('db_kas')) || [];
        let sAwal = parseInt(localStorage.getItem('db_saldo_awal')) || 0; let tMasuk = dbKas.filter(x => x.tipe === 'masuk').reduce((s,i) => s + i.nominal, 0); let tKeluar = dbKas.filter(x => x.tipe === 'keluar').reduce((s,i) => s + i.nominal, 0); let saldoSkrg = sAwal + tMasuk - tKeluar;
        if(saldoSkrg < kurang) return Swal.fire('Gagal', 'Saldo Kas Utama tidak cukup untuk menalangi kekurangan ini!', 'error');
        Swal.fire({ title: 'Nalangi Uang Meja?', text: `Kas Utama akan dipotong sebesar ${fmt(kurang)} untuk mencukupi target Rp 250.000.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Talangi Sekarang' }).then(r => {
            if(r.isConfirmed) {
                let tgl = new Date().toISOString().split('T')[0]; let periode = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
                dbKas.push({ id: Date.now(), tgl: tgl, uraian: `Dana Talangan Uang Meja (${periode})`, tipe: 'keluar', nominal: kurang });
                localStorage.setItem('db_kas', JSON.stringify(dbKas)); syncSemuaData(); Swal.fire('Berhasil', 'Dana talangan tercatat di Buku Kas.', 'success');
            }
        });
    };"""

if OLD_BAYAR in html:
    html = html.replace(OLD_BAYAR, "")
    print("OK: Duplikat bayarCepatTagihan + eksekusiDanaTalangan lama dihapus")
else:
    print("GAGAL: duplikat tidak ditemukan!")
    exit(1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: Selesai!")
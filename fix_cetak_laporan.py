FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """        var all = dbKas.filter(function(k){
            if(!k.tgl) return false;
            var d = new Date(k.tgl);
            return d.getMonth()===bln && d.getFullYear()===thn;
        });
        all.sort(function(a,b){ return new Date(a.tgl)-new Date(b.tgl); });

        var utama  = all.filter(function(k){ return !isKhusus(k.uraian); });
        var khusus = all.filter(function(k){ return  isKhusus(k.uraian); });

        var totMU = utama.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKU = utama.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);
        var sAkh  = sAwal + totMU - totKU;
        var totMK = khusus.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKK = khusus.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);"""

NEW = """        var all = dbKas.filter(function(k){
            if(!k.tgl) return false;
            var d = new Date(k.tgl);
            return d.getMonth()===bln && d.getFullYear()===thn;
        });
        all.sort(function(a,b){ return new Date(a.tgl)-new Date(b.tgl); });

        // Kas Utama saja (sosial & agustus sudah tidak masuk db_kas)
        var utama  = all.filter(function(k){ return !isKhusus(k.uraian); });

        var totMU = utama.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKU = utama.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);
        var sAkh  = sAwal + totMU - totKU;

        // ── Dana Sosial dari setor_sosial_* ──
        var periodeKey = BULAN[bln]+'_'+thn;
        var dataSosial = JSON.parse(localStorage.getItem('setor_sosial_'+periodeKey)||'null');
        var totalSosial   = dataSosial ? (dataSosial.nominal||0) : 0;
        var jumlahSosial  = dataSosial ? (dataSosial.jumlah||0)  : 0;
        var tglSosial     = dataSosial ? new Date(dataSosial.tgl).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}) : '-';

        // ── Dana 17 Agustus dari setor_agustus_* ──
        var dataAgustus   = JSON.parse(localStorage.getItem('setor_agustus_'+periodeKey)||'null');
        var totalAgustus  = dataAgustus ? (dataAgustus.nominal||0)   : 0;
        var kumulatifAgus = dataAgustus ? (dataAgustus.kumulatif||0) : 0;
        var jumlahAgustus = dataAgustus ? (dataAgustus.jumlah||0)    : 0;
        var tglAgustus    = dataAgustus ? new Date(dataAgustus.tgl).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}) : '-';"""

if OLD not in html:
    print("GAGAL PATCH 1: string tidak ditemukan")
    exit(1)
html = html.replace(OLD, NEW, 1)
print("OK PATCH 1: variabel sosial & agustus ditambahkan")

# ── PATCH 2: Hapus rowsKhusus (tidak dipakai lagi) ──
OLD2 = """        var rowsKhusus = khusus.length === 0
            ? '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi dana khusus</td></tr>'
            : khusus.map(function(k,i){
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td></tr>';
              }).join('');"""

NEW2 = """        // rowsKhusus dihapus — sosial & agustus sudah punya seksi sendiri"""

if OLD2 not in html:
    print("GAGAL PATCH 2: rowsKhusus tidak ditemukan")
    exit(1)
html = html.replace(OLD2, NEW2, 1)
print("OK PATCH 2: rowsKhusus dihapus")

# ── PATCH 3: Ganti Bagian B & C di htmlOut ──
OLD3 = """<!-- BAGIAN B: DANA KHUSUS -->
<div class="section-title">B. Laporan Dana Khusus</div>
<div style="font-size:9.5pt;color:#475569;margin:-4px 0 8px;">(Uang Meja &bull; Uang Sosial &bull; 17 Agustus)</div>
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Total Pemasukan Dana Khusus</td><td class="val masuk">${fmtRp(totMK)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Dana Khusus</td><td class="val keluar">${fmtRp(totKK)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Dana Khusus</td><td class="val">${fmtRp(totMK-totKK)}</td></tr></tfoot>
</table>
<table class="trx">
  <thead><tr>
    <th style="width:35px;">No</th>
    <th style="width:90px;">Tanggal</th>
    <th>Uraian</th>
    <th style="width:110px;text-align:center;">Tipe</th>
    <th style="width:115px;text-align:right;">Nominal</th>
  </tr></thead>
  <tbody>${rowsKhusus}</tbody>
  <tfoot><tr>
    <td colspan="3" style="text-align:right;">SALDO DANA KHUSUS</td>
    <td colspan="2" style="text-align:right;">${fmtRp(totMK-totKK)}</td>
  </tr></tfoot>
</table>

<!-- REKAPITULASI -->
<div class="section-title">C. Rekapitulasi Keseluruhan</div>
<table class="rekap-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal Periode</td><td class="val">${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Kas Utama</td><td class="val masuk">${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Kas Utama</td><td class="val keluar">${fmtRp(totKU)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Dana Khusus</td><td class="val masuk">${fmtRp(totMK)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Dana Khusus</td><td class="val keluar">${fmtRp(totKK)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir Kas Utama</td><td class="val">${fmtRp(sAkh)}</td></tr></tfoot>
</table>"""

NEW3 = """<!-- BAGIAN B: DANA SOSIAL -->
<div class="section-title">B. Laporan Dana Sosial Arisan</div>
<div style="font-size:9.5pt;color:#475569;margin:-4px 0 8px;">Dikelola langsung oleh Arisan Ibu-Ibu — tidak masuk Kas Utama RT</div>
${dataSosial ? `
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Tanggal Dicatat</td><td class="val">${tglSosial}</td></tr>
    <tr><td class="lbl">Jumlah Warga Bayar</td><td class="val">${jumlahSosial} warga</td></tr>
    <tr><td class="lbl">Total Dana Sosial Terkumpul</td><td class="val masuk">${fmtRp(totalSosial)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Keterangan</td><td class="val">Langsung diserahkan ke Arisan</td></tr></tfoot>
</table>` : `
<div style="padding:14px;background:#f8fafc;border-radius:8px;color:#64748b;font-size:10pt;text-align:center;">
  Belum ada catatan BA Dana Sosial untuk periode ${blnStr}
</div>`}

<!-- BAGIAN C: DANA 17 AGUSTUS -->
<div class="section-title">C. Laporan Dana 17 Agustus</div>
<div style="font-size:9.5pt;color:#475569;margin:-4px 0 8px;">Dipegang Bendahara Pembantu — tidak masuk Kas Utama RT</div>
${dataAgustus ? `
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Tanggal Dicatat</td><td class="val">${tglAgustus}</td></tr>
    <tr><td class="lbl">Jumlah Warga Bayar</td><td class="val">${jumlahAgustus} warga</td></tr>
    <tr><td class="lbl">Terkumpul Bulan Ini</td><td class="val masuk">${fmtRp(totalAgustus)}</td></tr>
    <tr><td class="lbl">Saldo Kumulatif s.d. ${blnStr}</td><td class="val masuk">${fmtRp(kumulatifAgus)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Keterangan</td><td class="val">Dipegang Bendahara Pembantu</td></tr></tfoot>
</table>` : `
<div style="padding:14px;background:#f8fafc;border-radius:8px;color:#64748b;font-size:10pt;text-align:center;">
  Belum ada catatan BA Dana 17 Agustus untuk periode ${blnStr}
</div>`}

<!-- REKAPITULASI -->
<div class="section-title">D. Rekapitulasi Keseluruhan</div>
<table class="rekap-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal Periode</td><td class="val">${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Kas Utama</td><td class="val masuk">${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Kas Utama</td><td class="val keluar">${fmtRp(totKU)}</td></tr>
    <tr style="background:#f0fdf4;"><td class="lbl">Dana Sosial (di luar Kas)</td><td class="val" style="color:#166534;">${fmtRp(totalSosial)}</td></tr>
    <tr style="background:#fff7ed;"><td class="lbl">Dana 17 Agustus Kumulatif (di luar Kas)</td><td class="val" style="color:#c2410c;">${fmtRp(kumulatifAgus)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir Kas Utama</td><td class="val">${fmtRp(sAkh)}</td></tr></tfoot>
</table>"""

if OLD3 not in html:
    print("GAGAL PATCH 3: bagian B/C tidak ditemukan")
    exit(1)
html = html.replace(OLD3, NEW3, 1)
print("OK PATCH 3: Bagian B sosial + C agustus + D rekapitulasi")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("✅ Semua patch selesai!")
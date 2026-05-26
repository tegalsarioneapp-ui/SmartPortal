import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const START = "        var HARI_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];";
const END   = "        var bodyOnly = htmlOut;";
const idxStart = html.indexOf(START);
const idxEnd   = html.indexOf(END, idxStart);
if (idxStart===-1||idxEnd===-1){console.error("GAGAL",idxStart,idxEnd);process.exit(1);}
console.log("OK panjang:",idxEnd-idxStart);

const newBlock = `        var HARI_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        var tglObj          = new Date();
        var hariCetak       = HARI_ID[tglObj.getDay()];
        var tglCetakLengkap = tglObj.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});

        var htmlOut = \`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@page{size:A4;margin:2.5cm 2cm 2cm 2cm;}
*,*::before,*::after{box-sizing:border-box;}
body{font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;background:#fff;margin:0;padding:0;}
.kop-table{width:100%;border-collapse:collapse;}
.kop-logo{width:80px;text-align:center;vertical-align:middle;}
.kop-logo img{width:72px;height:auto;}
.kop-text{text-align:center;vertical-align:middle;padding:0 8px;}
.kop-text .b1{font-size:11pt;}
.kop-text .b2{font-size:12pt;font-weight:bold;letter-spacing:.5px;}
.kop-text .b3{font-size:13pt;font-weight:bold;letter-spacing:1px;}
.kop-text .b4{font-size:11pt;font-weight:bold;margin-top:2px;}
.kop-text .al{font-size:9pt;font-style:italic;margin-top:3px;}
hr.garis{border:none;border-top:3px double #000;margin:6px 0 0;}
.judul{text-align:center;font-size:13pt;font-weight:bold;text-decoration:underline;text-transform:uppercase;margin:16px 0 4px;}
.sub{text-align:center;font-size:10pt;margin-bottom:4px;}
.nomor{text-align:center;font-size:10pt;margin-bottom:14px;}
.pembuka{text-align:justify;text-indent:30px;line-height:1.8;margin:14px 0 10px;font-size:10.5pt;}
.tbl-pihak{width:100%;border:none;border-collapse:collapse;margin-left:20px;line-height:1.8;font-size:10.5pt;}
.tbl-pihak td{border:none;padding:1px 4px;vertical-align:top;}
.section-title{font-size:11pt;font-weight:bold;text-transform:uppercase;margin:20px 0 6px;border-bottom:2px solid #000;padding-bottom:3px;}
table.trx{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:10pt;}
table.trx th{background:#f0f0f0;color:#000;border:1px solid #000;padding:6px 8px;text-align:left;font-weight:700;}
table.trx td{border:1px solid #000;padding:5px 8px;color:#000;background:#fff;}
table.trx tbody tr:nth-child(even) td{background:#fafafa;}
table.trx tfoot td{background:#f0f0f0;font-weight:700;border:1px solid #000;}
.masuk{color:#14532d;}.keluar{color:#7f1d1d;}
.sum-table{width:60%;border-collapse:collapse;margin:8px 0 16px;}
.sum-table td{border:1px solid #000;padding:5px 10px;font-size:10pt;}
.sum-table .lbl{font-weight:600;}.sum-table .val{text-align:right;font-weight:700;}
.sum-table tfoot td{background:#f0f0f0;font-weight:700;}
.rekap-table{width:70%;border-collapse:collapse;margin:8px 0 16px;}
.rekap-table td{border:1px solid #000;padding:5px 10px;font-size:10pt;}
.rekap-table .lbl{font-weight:600;}.rekap-table .val{text-align:right;font-weight:700;}
.rekap-table tfoot td{background:#f0f0f0;font-weight:800;font-size:11pt;}
.penutup{text-align:justify;text-indent:30px;line-height:1.8;margin:20px 0 10px;font-size:10.5pt;}
.ttd-table{width:100%;border:none;border-collapse:collapse;margin-top:40px;text-align:center;}
.ttd-table td{border:none;padding:4px 8px;vertical-align:top;font-size:10.5pt;line-height:1.8;}
.ttd-nama{font-weight:bold;text-decoration:underline;margin-top:56px;display:block;}
.pagebreak{page-break-after:always;}
@media print{body{padding-top:15px;}}
</style></head><body>
<!-- KOP -->
<table class="kop-table"><tr>
  <td class="kop-logo"><img src="\${img_src}" onerror="this.style.display='none'"></td>
  <td class="kop-text">
    <div class="b1">PEMERINTAH KOTA SEMARANG</div>
    <div class="b2">KECAMATAN CANDISARI</div>
    <div class="b3">KELURAHAN TEGALSARI</div>
    <div class="b4">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>
    <div class="al">Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang &mdash; Provinsi Jawa Tengah 50196</div>
  </td>
  <td class="kop-logo"></td>
</tr></table>
<hr class="garis">

<!-- JUDUL -->
<div class="judul">Berita Acara Laporan Kas RT 005</div>
<div class="sub">RT 005 / RW 012 &mdash; Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>
<div class="nomor">Periode: \${blnStr}</div>

<!-- TEKS PEMBUKA -->
<p class="pembuka">Pada hari ini, <strong>\${hariCetak}</strong> tanggal <strong>\${tglCetakLengkap}</strong>, bertempat di lingkungan RT 005 Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang, yang bertanda tangan di bawah ini:</p>

<table class="tbl-pihak">
  <tr><td style="width:3%;">1.</td><td style="width:18%;">Nama</td><td style="width:2%;">:</td><td><strong>\${namaBen}</strong></td></tr>
  <tr><td></td><td>Jabatan</td><td>:</td><td>Bendahara RT 005</td></tr>
  <tr><td></td><td colspan="3">Selanjutnya disebut sebagai <strong>PIHAK PERTAMA (Pembuat Laporan)</strong>.</td></tr>
  <tr><td colspan="4" style="height:10px;"></td></tr>
  <tr><td>2.</td><td>Nama</td><td>:</td><td><strong>\${namaRT}</strong></td></tr>
  <tr><td></td><td>Jabatan</td><td>:</td><td>Ketua RT 005</td></tr>
  <tr><td></td><td colspan="3">Selanjutnya disebut sebagai <strong>PIHAK KEDUA (Pemeriksa / Menyetujui)</strong>.</td></tr>
</table>

<p class="pembuka">Menyatakan dengan sesungguhnya bahwa PIHAK PERTAMA telah menyusun dan menyerahkan Laporan Keuangan (Buku Kas) RT 005 Periode Bulan \${blnStr} kepada PIHAK KEDUA, dengan rincian data keuangan sebagai berikut:</p>

<!-- BAGIAN A: KAS UTAMA -->
<div class="section-title">A. Laporan Kas Utama</div>
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal</td><td class="val">\${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan</td><td class="val">\${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran</td><td class="val">\${fmtRp(totKU)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir</td><td class="val">\${fmtRp(sAkh)}</td></tr></tfoot>
</table>
<table class="trx">
  <thead><tr>
    <th style="width:35px;">No</th><th style="width:85px;">Tanggal</th>
    <th>Uraian Transaksi</th>
    <th style="width:100px;text-align:center;">Tipe</th>
    <th style="width:110px;text-align:right;">Nominal</th>
    <th style="width:110px;text-align:right;">Saldo</th>
  </tr></thead>
  <tbody>\${rowsUtama}</tbody>
  <tfoot><tr>
    <td colspan="4" style="text-align:right;font-weight:700;">SALDO AKHIR KAS UTAMA</td>
    <td colspan="2" style="text-align:right;font-weight:800;">\${fmtRp(sAkh)}</td>
  </tr></tfoot>
</table>
<!-- BAGIAN A: KAS UTAMA -->
<div class="section-title">A. Laporan Kas Utama</div>
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal</td><td class="val">\${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan</td><td class="val masuk">\${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran</td><td class="val keluar">\${fmtRp(totKU)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir</td><td class="val">\${fmtRp(sAkh)}</td></tr></tfoot>
</table>
<table class="trx">
  <thead><tr>
    <th style="width:35px;">No</th>
    <th style="width:90px;">Tanggal</th>
    <th>Uraian Transaksi</th>
    <th style="width:110px;text-align:center;">Tipe</th>
    <th style="width:115px;text-align:right;">Nominal</th>
    <th style="width:115px;text-align:right;">Saldo</th>
  </tr></thead>
  <tbody>\${rowsUtama}</tbody>
  <tfoot><tr>
    <td colspan="4" style="text-align:right;">SALDO AKHIR KAS UTAMA</td>
    <td colspan="2" style="text-align:right;">\${fmtRp(sAkh)}</td>
  </tr></tfoot>
</table>

<!-- BAGIAN B: DANA KHUSUS -->
<div class="section-title">B. Laporan Dana Khusus</div>
<div style="font-size:9.5pt;color:#475569;margin:-4px 0 8px;">(Uang Meja &bull; Uang Sosial &bull; 17 Agustus)</div>
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Total Pemasukan Dana Khusus</td><td class="val masuk">\${fmtRp(totMK)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Dana Khusus</td><td class="val keluar">\${fmtRp(totKK)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Dana Khusus</td><td class="val">\${fmtRp(totMK-totKK)}</td></tr></tfoot>
</table>
<table class="trx">
  <thead><tr>
    <th style="width:35px;">No</th>
    <th style="width:90px;">Tanggal</th>
    <th>Uraian</th>
    <th style="width:110px;text-align:center;">Tipe</th>
    <th style="width:115px;text-align:right;">Nominal</th>
  </tr></thead>
  <tbody>\${rowsKhusus}</tbody>
  <tfoot><tr>
    <td colspan="3" style="text-align:right;">SALDO DANA KHUSUS</td>
    <td colspan="2" style="text-align:right;">\${fmtRp(totMK-totKK)}</td>
  </tr></tfoot>
</table>

<!-- REKAPITULASI -->
<div class="section-title">C. Rekapitulasi Keseluruhan</div>
<table class="rekap-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal Periode</td><td class="val">\${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Kas Utama</td><td class="val masuk">\${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Kas Utama</td><td class="val keluar">\${fmtRp(totKU)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Dana Khusus</td><td class="val masuk">\${fmtRp(totMK)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Dana Khusus</td><td class="val keluar">\${fmtRp(totKK)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir Kas Utama</td><td class="val">\${fmtRp(sAkh)}</td></tr></tfoot>
</table>

<!-- TEKS PENUTUP -->
<p class="penutup">Demikian Berita Acara Laporan Kas ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Apabila di kemudian hari terdapat kekeliruan dalam laporan ini, maka akan dilakukan perbaikan sebagaimana mestinya.</p>

<!-- TTD -->
<table class="ttd-table">
  <tr>
    <td style="width:50%;"></td>
    <td style="width:50%;">Semarang, \${tglCetakLengkap}</td>
  </tr>
  <tr>
    <td>Mengetahui / Menyetujui,<br><strong>PIHAK KEDUA</strong><br>Ketua RT 005<span class="ttd-nama">( \${namaRT} )</span></td>
    <td>Dibuat dan Dilaporkan Oleh,<br><strong>PIHAK PERTAMA</strong><br>Bendahara RT 005<span class="ttd-nama">( \${namaBen} )</span></td>
  </tr>
</table>

</body></html>\`;

        `;

html = html.substring(0, idxStart) + newBlock + html.substring(idxEnd);
writeFileSync(FILE, html, "utf8");
console.log("PATCH SELESAI!");
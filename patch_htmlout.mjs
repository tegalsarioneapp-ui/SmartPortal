import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cari awal dan akhir htmlOut
const idxStart = html.indexOf("var htmlOut = ");
const idxEnd   = html.indexOf("// Download sebagai PDF", idxStart);

if (idxStart === -1 || idxEnd === -1) {
    console.error("❌ GAGAL - htmlOut tidak ditemukan");
    process.exit(1);
}

console.log("idxStart:", idxStart, "idxEnd:", idxEnd);

// Template baru berbasis raw HTML dari Gemini
// Semua variabel runtime tetap pakai: blnStr, namaRT, namaBen, tglCetak,
// sAwal, totMU, totKU, sAkh, rowsUtama, khusus, fmtRp, all
const newHtmlOut = `var htmlOut = (function(){
    var sosial  = khusus.filter(function(k){return (k.uraian||'').toLowerCase().indexOf('sosial')!==-1;});
    var meja    = khusus.filter(function(k){return (k.uraian||'').toLowerCase().indexOf('uang meja')!==-1;});
    var agustus = khusus.filter(function(k){var u=(k.uraian||'').toLowerCase();return u.indexOf('agustus')!==-1;});

    function tblIuran(rows){
        if(rows.length===0) return '<tr><td colspan="5" class="text-center">Tidak ada transaksi</td></tr>';
        return rows.map(function(k,i){
            return '<tr>'
                +'<td class="text-center">'+(i+1)+'</td>'
                +'<td>'+k.tanggal+'</td>'
                +'<td>'+(k.uraian||'-')+'</td>'
                +'<td class="text-right">'+fmtRp(k.nominal)+'</td>'
                +'<td class="text-right">-</td>'
                +'</tr>';
        }).join('');
    }

    var css = '<style>'
        +'@page{size:A4;margin:20mm;}'
        +'body{font-family:"Times New Roman",Times,serif;font-size:11pt;color:#000;line-height:1.3;}'
        +'.kop-surat{text-align:center;border-bottom:3px double #000;padding-bottom:10px;margin-bottom:20px;position:relative;}'
        +'.kop-surat img{position:absolute;left:0;top:0;width:70px;}'
        +'.kop-surat h1{font-size:14pt;margin:0;font-weight:bold;}'
        +'.kop-surat h2{font-size:14pt;margin:0;font-weight:bold;}'
        +'.kop-surat h3{font-size:12pt;margin:0;font-weight:bold;}'
        +'.kop-surat p{font-size:10pt;margin:5px 0 0 0;}'
        +'.judul-dokumen{text-align:center;margin-bottom:20px;}'
        +'.judul-dokumen h4{font-size:12pt;margin:0;text-decoration:underline;font-weight:bold;text-transform:uppercase;}'
        +'.judul-dokumen p{margin:5px 0 0 0;}'
        +'.section-title{font-weight:bold;margin-top:15px;margin-bottom:5px;font-size:11pt;}'
        +'.sub-section-title{font-weight:bold;margin-top:10px;margin-bottom:5px;font-size:10pt;padding-left:15px;}'
        +'table{width:100%;border-collapse:collapse;margin-bottom:15px;}'
        +'th,td{border:1px solid #000;padding:6px;text-align:left;vertical-align:top;}'
        +'th{background-color:#e0e0e0;text-align:center;font-weight:bold;}'
        +'.text-center{text-align:center;}'
        +'.text-right{text-align:right;}'
        +'.font-bold{font-weight:bold;}'
        +'.ttd-container{width:100%;margin-top:40px;page-break-inside:avoid;}'
        +'.ttd-table{width:100%;border:none;}'
        +'.ttd-table td{border:none;text-align:center;width:50%;padding:0;}'
        +'.spacer{height:80px;}'
        +'</style>';

    var kopHtml = '<div class="kop-surat">'
        +'<img src="/Lambang_Kota_Semarang.png" alt="Logo Semarang">'
        +'<h1>PEMERINTAH KOTA SEMARANG</h1>'
        +'<h2>KECAMATAN CANDISARI</h2>'
        +'<h3>KELURAHAN TEGALSARI</h3>'
        +'<h2>PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</h2>'
        +'<p>Sekretariat: RT 005 / RW 012 Kelurahan Tegalsari, Kota Semarang</p>'
        +'</div>';

    var judulHtml = '<div class="judul-dokumen">'
        +'<h4>BERITA ACARA LAPORAN KAS RT</h4>'
        +'<p>Periode: '+blnStr+'</p>'
        +'</div>';

    var ttdHtml = '<div class="ttd-container">'
        +'<table class="ttd-table"><tr>'
        +'<td>Mengetahui,<br>Ketua RT 005</td>'
        +'<td>Semarang, '+tglCetak+'<br>Bendahara RT 005</td>'
        +'</tr><tr>'
        +'<td class="spacer"></td>'
        +'<td class="spacer"></td>'
        +'</tr><tr>'
        +'<td><u><b>'+namaRT+'</b></u></td>'
        +'<td><u><b>'+namaBen+'</b></u></td>'
        +'</tr></table>'
        +'</div>';

    var bagianA = '<div class="section-title">A. Laporan Kas Utama (Transaksi Keluar Masuk &amp; Iuran Pembangunan)</div>'
        +'<table><thead><tr>'
        +'<th width="5%">No</th>'
        +'<th width="15%">Tanggal</th>'
        +'<th width="35%">Uraian Transaksi</th>'
        +'<th width="10%">Tipe</th>'
        +'<th width="15%">Nominal</th>'
        +'<th width="20%">Saldo</th>'
        +'</tr></thead><tbody>'
        +rowsUtama
        +'</tbody><tfoot><tr>'
        +'<td colspan="5" class="text-right font-bold">SALDO AKHIR KAS UTAMA</td>'
        +'<td class="text-right font-bold">'+fmtRp(sAkh)+'</td>'
        +'</tr></tfoot></table>';

    var bagianB = '<div class="section-title">B. Laporan Iuran Terpisah</div>'
        +'<div class="sub-section-title">1. Kas Uang Makan</div>'
        +'<table style="width:95%;margin-left:auto;"><thead><tr>'
        +'<th width="5%">No</th><th width="15%">Tanggal</th>'
        +'<th width="45%">Uraian Transaksi</th>'
        +'<th width="15%">Nominal</th><th width="20%">Saldo</th>'
        +'</tr></thead><tbody>'+tblIuran(meja)+'</tbody></table>'

        +'<div class="sub-section-title">2. Kas Uang 17 Agustus</div>'
        +'<table style="width:95%;margin-left:auto;"><thead><tr>'
        +'<th width="5%">No</th><th width="15%">Tanggal</th>'
        +'<th width="45%">Uraian Transaksi</th>'
        +'<th width="15%">Nominal</th><th width="20%">Saldo</th>'
        +'</tr></thead><tbody>'+tblIuran(agustus)+'</tbody></table>'

        +'<div class="sub-section-title">3. Kas Uang Sosial</div>'
        +'<table style="width:95%;margin-left:auto;"><thead><tr>'
        +'<th width="5%">No</th><th width="15%">Tanggal</th>'
        +'<th width="45%">Uraian Transaksi</th>'
        +'<th width="15%">Nominal</th><th width="20%">Saldo</th>'
        +'</tr></thead><tbody>'+tblIuran(sosial)+'</tbody></table>';

    var lampiran = '<div style="page-break-before:always;"></div>'
        +kopHtml+judulHtml
        +'<div class="section-title">LAMPIRAN &mdash; ALUR TRANSAKSI KAS UTAMA</div>'
        +'<table><thead><tr>'
        +'<th width="5%">No</th>'
        +'<th width="15%">Tanggal</th>'
        +'<th width="35%">Uraian Transaksi</th>'
        +'<th width="10%">Tipe</th>'
        +'<th width="15%">Nominal</th>'
        +'<th width="20%">Saldo</th>'
        +'</tr></thead><tbody>'
        +rowsUtama
        +'</tbody><tfoot><tr>'
        +'<td colspan="5" class="text-right font-bold">TOTAL TRANSAKSI</td>'
        +'<td class="text-right font-bold">'+all.length+' transaksi</td>'
        +'</tr></tfoot></table>'
        +ttdHtml;

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">'
        +'<title>Laporan Kas RT 005</title>'+css+'</head><body>'
        +kopHtml+judulHtml
        +bagianA+bagianB
        +ttdHtml
        +lampiran
        +'</body></html>';
})();
`;

const oldBlock = html.substring(idxStart, idxEnd);
html = html.replace(oldBlock, newHtmlOut + "\n            ");
writeFileSync(FILE, html, "utf8");
console.log("✅ htmlOut baru (template Gemini) berhasil diinjek!");

// Verifikasi
console.log("kop-surat:", html.includes("kop-surat") ? "✅" : "❌");
console.log("judul-dokumen:", html.includes("judul-dokumen") ? "✅" : "❌");
console.log("bagianA:", html.includes("Laporan Kas Utama") ? "✅" : "❌");
console.log("bagianB:", html.includes("Laporan Iuran Terpisah") ? "✅" : "❌");
console.log("lampiran:", html.includes("ALUR TRANSAKSI") ? "✅" : "❌");
console.log("ttd:", html.includes("ttd-container") ? "✅" : "❌");

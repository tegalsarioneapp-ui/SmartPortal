import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idxStart = html.indexOf("var htmlOut = (function");
const idxEnd   = html.indexOf("window.downloadPdfFromHtml", idxStart);

const oldBlock = html.substring(idxStart, idxEnd);

// Ambil variabel yang sudah ada di scope (img_src, rowsUtama, dll)
const newBlock = `var img_src = '/Lambang_Kota_Semarang.png';
        var htmlOut = \`<html>
<head>
<style>
    @page { size: A4; margin: 25mm 20mm; background-color: #ffffff; }
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 0; padding: 0; color: #000; }
    .header-table { display: table; width: 100%; margin-bottom: 5px; }
    .header-row { display: table-row; }
    .logo-cell { display: table-cell; width: 15%; vertical-align: middle; text-align: center; }
    .logo-cell img { width: 85px; height: 85px; object-fit: contain; }
    .text-cell { display: table-cell; width: 70%; vertical-align: middle; text-align: center; }
    .spacer-cell { display: table-cell; width: 15%; }
    .instansi-1 { font-size: 13pt; line-height: 1.2; }
    .instansi-2 { font-size: 15pt; font-weight: bold; line-height: 1.2; letter-spacing: 1px; }
    .instansi-3 { font-size: 17pt; font-weight: bold; line-height: 1.2; }
    .alamat { font-size: 9.5pt; margin-top: 5px; font-style: italic; }
    .line-thick { border-top: 3px solid black; margin-top: 10px; }
    .line-thin { border-top: 1px solid black; margin-top: 2px; margin-bottom: 25px; }
    .title-container { text-align: center; margin-bottom: 20px; }
    .title { font-size: 13pt; font-weight: bold; text-decoration: underline; margin-bottom: 3px; }
    .nomor { font-size: 11pt; }
    .content { text-align: justify; line-height: 1.5; }
    .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; font-size: 11pt; }
    .table-kas { width: 100%; border-collapse: collapse; margin: 5px 0 15px 0; }
    .table-kas th, .table-kas td { border: 1px solid black; padding: 8px; }
    .table-kas th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
    .td-center { text-align: center; }
    .td-right { text-align: right; }
    .signature-table { display: table; width: 100%; margin-top: 35px; page-break-inside: avoid; }
    .signature-row { display: table-row; }
    .signature-cell { display: table-cell; width: 33.33%; text-align: center; vertical-align: top; }
    .signature-name { margin-top: 65px; font-weight: bold; text-decoration: underline; }
    @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .table-kas th { background-color: #f2f2f2 !important; }
        page-break-inside: avoid;
    }
</style>
</head>
<body>
    <div class="header-table">
        <div class="header-row">
            <div class="logo-cell">
                <img src="\${img_src}" alt="Logo">
            </div>
            <div class="text-cell">
                <div class="instansi-1">PEMERINTAH KOTA SEMARANG</div>
                <div class="instansi-2">KECAMATAN CANDISARI</div>
                <div class="instansi-3">KELURAHAN TEGALSARI</div>
                <div class="alamat">Jalan Tegalsari Barat, Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>
            </div>
            <div class="spacer-cell"></div>
        </div>
    </div>
    <div class="line-thick"></div>
    <div class="line-thin"></div>
    <div class="title-container">
        <div class="title">BERITA ACARA LAPORAN KAS</div>
        <div class="nomor">Periode: \${bulanLabel}</div>
    </div>
    <div class="content">
        <div class="section-title">A. LAPORAN KAS UTAMA</div>
        <table class="table-kas">
            <thead>
                <tr>
                    <th style="width:8%;">No</th>
                    <th style="width:52%;">Uraian</th>
                    <th style="width:40%;">Jumlah (Rp)</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="td-center">1</td><td>Saldo Awal</td><td class="td-right">\${fmt(saldoAwal)}</td></tr>
                <tr><td class="td-center">2</td><td>Total Pemasukan</td><td class="td-right">\${fmt(totalMasuk)}</td></tr>
                <tr><td class="td-center">3</td><td>Total Pengeluaran</td><td class="td-right">(\${fmt(totalKeluar)})</td></tr>
                <tr><td colspan="2" class="td-right"><strong>SALDO AKHIR :</strong></td><td class="td-right"><strong>\${fmt(saldoAkhir)}</strong></td></tr>
            </tbody>
        </table>
        <div class="section-title">B. RINCIAN TRANSAKSI KAS</div>
        <table class="table-kas">
            <thead>
                <tr>
                    <th style="width:5%;">No</th>
                    <th style="width:15%;">Tanggal</th>
                    <th style="width:40%;">Keterangan</th>
                    <th style="width:20%;">Debit (Rp)</th>
                    <th style="width:20%;">Kredit (Rp)</th>
                </tr>
            </thead>
            <tbody>\${rowsUtama}</tbody>
        </table>
    </div>
    <div class="signature-table">
        <div class="signature-row">
            <div class="signature-cell">
                <div>Mengetahui,</div>
                <div>Ketua RT 005</div>
                <div class="signature-name">\${ttdKiri}</div>
            </div>
            <div class="signature-cell"></div>
            <div class="signature-cell">
                <div>Semarang, \${bulanLabel}</div>
                <div>Bendahara RT 005</div>
                <div class="signature-name">\${ttdKanan}</div>
            </div>
        </div>
    </div>
</body>
</html>\`;
        `;

if (!html.includes(oldBlock)) {
    console.error("❌ GAGAL - blok lama tidak cocok");
    process.exit(1);
}

html = html.replace(oldBlock, newBlock);
writeFileSync(FILE, html, "utf8");
console.log("✅ htmlOut berhasil diganti!");

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "artifacts/smart-portal-rt/index.html");
let html = readFileSync(FILE, "utf8");


// ── PATCH 1: Inject definisi buatKop() dan buatCSS() sebelum _doCetakKas ──
const oldDoCetak = `    window._doCetakKas = function(bln, thn) {`;

const newDoCetak = `    function buatKop(namaRT, namaRW) {
        return '<div style="display:flex;align-items:center;gap:16px;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:16px;">'+
            '<img src="/Lambang_Kota_Semarang.png" style="width:65px;height:auto;" onerror="this.style.display=\\'none\\'">'+
            '<div style="flex:1;text-align:center;">'+
                '<div style="font-size:13px;font-weight:700;text-transform:uppercase;">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>'+
                '<div style="font-size:11px;text-transform:uppercase;">Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>'+
                '<div style="font-size:10px;color:#475569;">Provinsi Jawa Tengah 50196</div>'+
            '</div>'+
            '<img src="/Lambang_Kota_Semarang.png" style="width:65px;height:auto;" onerror="this.style.display=\\'none\\'">'+
        '</div>';
    }

    function buatCSS() {
        return '<style>'+
            'body{font-family:"Times New Roman",Times,serif;font-size:11px;color:#000;background:#fff;margin:0;padding:20px;}'+
            '.judul{text-align:center;font-size:14px;font-weight:700;text-transform:uppercase;margin:10px 0 4px;}'+
            '.sub{text-align:center;font-size:10px;color:#475569;margin-bottom:10px;}'+
            'table{width:100%;border-collapse:collapse;margin:12px 0;font-size:10px;}'+
            'th{background:#1e293b !important;color:#fff !important;border:1px solid #000;padding:6px 8px;text-align:left;}'+
            'td{border:1px solid #000;padding:5px 8px;color:#000 !important;background:#fff !important;}'+
            'tbody tr:nth-child(even) td{background:#f8fafc !important;}'+
            'tfoot td{background:#f1f5f9 !important;font-weight:700;}'+
            '.masuk{color:#166534 !important;}'+
            '.keluar{color:#991b1b !important;}'+
            '.sum{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;padding:10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;}'+
            '.sb{flex:1;min-width:140px;display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:4px;}'+
            '.sb .l{font-size:9px;color:#475569;font-weight:600;}'+
            '.sb .v{font-size:11px;font-weight:700;color:#000;}'+
            '.ttd{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;}'+
            '.ttd-box{text-align:center;width:200px;font-size:10px;line-height:1.6;}'+
            '.pagebreak{page-break-after:always;}'+
            '</style>';
    }

    window._doCetakKas = function(bln, thn) {`;

// ── PATCH 2: Ganti window.open + w.print() → downloadPdfFromHtml ──
const oldOpen = `        var w = window.open('', '_blank');\n        if (w) { w.document.write(htmlOut); w.document.close(); setTimeout(function(){ w.print(); }, 800); }`;

const newOpen = `        // Download sebagai PDF\n        var bodyOnly = htmlOut.replace(/^[\\s\\S]*?<body[^>]*>/i,'').replace(/<\\/body>[\\s\\S]*$/i,'');\n        window.downloadPdfFromHtml(bodyOnly, 'BA_Kas_' + blnStr.replace(/\\s+/g,'_'));`;

if (html.includes(oldOpen)) {
    html = html.replace(oldOpen, newOpen);
    console.log("✅ PATCH 2: window.open diganti downloadPdfFromHtml");
} else {
    console.error("❌ PATCH 2 GAGAL");
    const idx = html.indexOf("window.open('', '_blank')");
    console.log("Substring:", JSON.stringify(html.substring(idx - 30, idx + 120)));
    process.exit(1);
}

writeFileSync(FILE, html, "utf8");
console.log("✅ Selesai!");
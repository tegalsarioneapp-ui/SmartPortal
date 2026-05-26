import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const MARKER = "    window._doCetakKas = function(bln, thn) {";

if (!html.includes(MARKER)) {
    const idx = html.indexOf("window._doCetakKas");
    console.error("GAGAL, substring:", JSON.stringify(html.substring(idx-10, idx+60)));
    process.exit(1);
}

const buatFuncs = `    function buatKop(namaRT, namaRW) {
        return '<div style="display:flex;align-items:center;gap:16px;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:16px;">'
            + '<div style="flex:1;text-align:center;">'
            + '<div style="font-size:13px;font-weight:700;text-transform:uppercase;">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>'
            + '<div style="font-size:11px;">Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>'
            + '</div>'
            + '</div>';
    }
    function buatCSS() {
        return '<style>'
            + 'body{font-family:"Times New Roman",serif;font-size:11px;color:#000;background:#fff;margin:0;padding:20px;}'
            + '.judul{text-align:center;font-size:14px;font-weight:700;text-transform:uppercase;margin:10px 0 4px;}'
            + '.sub{text-align:center;font-size:10px;color:#475569;margin-bottom:10px;}'
            + 'table{width:100%;border-collapse:collapse;margin:12px 0;font-size:10px;}'
            + 'th{background:#1e293b;color:#fff;border:1px solid #000;padding:6px 8px;text-align:left;}'
            + 'td{border:1px solid #000;padding:5px 8px;}'
            + 'tbody tr:nth-child(even) td{background:#f8fafc;}'
            + 'tfoot td{background:#f1f5f9;font-weight:700;}'
            + '.masuk{color:#166534;}'
            + '.keluar{color:#991b1b;}'
            + '.sum{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;padding:10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;}'
            + '.sb{flex:1;min-width:140px;display:flex;justify-content:space-between;padding:4px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:4px;}'
            + '.sb .l{font-size:9px;color:#475569;font-weight:600;}'
            + '.sb .v{font-size:11px;font-weight:700;}'
            + '.ttd{display:flex;justify-content:space-between;margin-top:32px;}'
            + '.ttd-box{text-align:center;width:200px;font-size:10px;line-height:1.6;}'
            + '.pagebreak{page-break-after:always;}'
            + '</style>';
    }
`;

html = html.replace(MARKER, buatFuncs + MARKER);
writeFileSync(FILE, html, "utf8");
console.log("✅ buatKop + buatCSS berhasil diinjek!");

// Verifikasi
const check = html.includes("function buatKop");
console.log("Verifikasi buatKop:", check ? "✅ ADA" : "❌ TIDAK ADA");

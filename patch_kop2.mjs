import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const oldCSS = `    function buatCSS() {
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
    }`;

const newCSS = `    function buatCSS() {
        return '<style>'
            + 'body{font-family:"Times New Roman",Times,serif;font-size:11pt;color:#000;background:#fff;margin:0;padding:24px 32px;}'
            + 'table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10pt;}'
            + 'th{background:#f0f0f0;color:#000;border:1px solid #000;padding:6px 8px;text-align:left;font-weight:700;}'
            + 'td{border:1px solid #000;padding:5px 8px;color:#000;background:#fff;}'
            + 'tbody tr:nth-child(even) td{background:#fafafa;}'
            + 'tfoot td{background:#f0f0f0;font-weight:700;border:1px solid #000;}'
            + '.judul{text-align:center;font-size:13pt;font-weight:700;text-transform:uppercase;text-decoration:underline;margin:14px 0 4px;}'
            + '.sub{text-align:center;font-size:10pt;margin-bottom:14px;color:#000;}'
            + '.section-title{font-size:11pt;font-weight:700;text-transform:uppercase;margin:20px 0 6px;border-bottom:2px solid #000;padding-bottom:3px;}'
            + '.sum-table{width:60%;margin:10px 0 16px 0;border-collapse:collapse;}'
            + '.sum-table td{border:1px solid #000;padding:5px 10px;font-size:10pt;background:#fff;}'
            + '.sum-table .lbl{width:65%;font-weight:600;}'
            + '.sum-table .val{width:35%;text-align:right;font-weight:700;}'
            + '.sum-table tfoot td{background:#f0f0f0;font-weight:700;}'
            + '.ttd{display:flex;justify-content:space-between;margin-top:48px;}'
            + '.ttd-box{text-align:center;width:220px;font-size:10pt;line-height:2;}'
            + '.ttd-name{font-weight:700;text-decoration:underline;}'
            + '.pagebreak{page-break-after:always;}'
            + '@media print{body{padding:16px 24px;}.pagebreak{page-break-after:always;}}'
            + '</style>';
    }`;

if (html.includes(oldCSS)) {
    html = html.replace(oldCSS, newCSS);
    writeFileSync(FILE, html, "utf8");
    console.log("✅ buatCSS resmi berhasil diperbarui!");
} else {
    console.error("❌ GAGAL - string tidak ditemukan");
    const idx = html.indexOf("function buatCSS");
    console.log("Substring:", JSON.stringify(html.substring(idx, idx+200)));
    process.exit(1);
}

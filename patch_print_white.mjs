import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "artifacts/smart-portal-rt/index.html");
let html = readFileSync(FILE, "utf8");

// ── PATCH: Force white background di PDF (override dark mode) ─────────────
const oldHolder = `        var holder = document.createElement('div');\r\n        holder.style.cssText = 'position:fixed; left:-10000px; top:0; width:794px; padding:0; background:white; color:black; font-family:\"Times New Roman\",Times,serif; z-index:-1;';\r\n        holder.innerHTML = '<div class=\"gt-pdf-page\" style=\"background:white; color:black; padding:0;\">' + htmlBody + '</div>';`;

const newHolder = `        var holder = document.createElement('div');\r\n        holder.style.cssText = 'position:fixed; left:-10000px; top:0; width:794px; padding:0; background:white; color:black; font-family:\"Times New Roman\",Times,serif; z-index:-1;';\r\n        // Reset dark mode agar PDF selalu putih\r\n        var pdfResetCSS = '<style>'+\r\n            ':root, html, body { color-scheme: light !important; background: white !important; color: black !important; }'+\r\n            '*, *::before, *::after { background-color: white !important; color: black !important; border-color: #94a3b8 !important; box-shadow: none !important; }'+\r\n            'table, thead, tbody, tfoot, tr, th, td { background-color: white !important; color: black !important; }'+\r\n            'thead tr th { background-color: #1e293b !important; color: white !important; }'+\r\n            'tbody tr:nth-child(even) td { background-color: #f1f5f9 !important; }'+\r\n            '.masuk, .masuk * { color: #166534 !important; background-color: transparent !important; }'+\r\n            '.keluar, .keluar * { color: #991b1b !important; background-color: transparent !important; }'+\r\n            'img { filter: none !important; }'+\r\n            '.sum { background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; }'+\r\n            '.sb { background-color: transparent !important; }'+\r\n            '.sb .l { color: #334155 !important; }'+\r\n            '.sb .v { background-color: transparent !important; }'+\r\n            '</style>';\r\n        holder.innerHTML = pdfResetCSS + '<div class=\"gt-pdf-page\" style=\"background:white !important; color:black !important; padding:0;\">' + htmlBody + '</div>';`;

if (html.includes(oldHolder)) {
    html = html.replace(oldHolder, newHolder);
    console.log("✅ PATCH: Force white PDF berhasil");
} else {
    console.error("❌ Tidak ditemukan - cek manual");
    // Debug char per char
    const idx = html.indexOf("var holder = document.createElement('div');");
    console.log("Index ditemukan di:", idx);
    console.log("Substring:", JSON.stringify(html.substring(idx, idx + 200)));
    process.exit(1);
}

writeFileSync(FILE, html, "utf8");
console.log("✅ Selesai! index.html sudah diupdate");
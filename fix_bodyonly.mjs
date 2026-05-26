import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const oldStr = `window.downloadPdfFromHtml(bodyOnly, 'BA_Kas_'`;
const newStr = `var bodyOnly = htmlOut;
        window.downloadPdfFromHtml(bodyOnly, 'BA_Kas_'`;

if (html.includes(oldStr)) {
    html = html.replace(oldStr, newStr);
    writeFileSync(FILE, html, "utf8");
    console.log("✅ bodyOnly ditambahkan!");
} else {
    console.error("❌ GAGAL - string tidak ditemukan");
}

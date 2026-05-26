import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idxStart = html.indexOf("var htmlOut = (function");
const idxEnd   = html.indexOf("window.downloadPdfFromHtml", idxStart);

if (idxStart === -1 || idxEnd === -1) {
    console.error("❌ GAGAL - marker tidak ditemukan");
    process.exit(1);
}

const oldBlock = html.substring(idxStart, idxEnd);
console.log("✅ Blok lama ditemukan, panjang:", oldBlock.length, "karakter");
console.log("Preview awal:", JSON.stringify(oldBlock.substring(0, 100)));
console.log("Preview akhir:", JSON.stringify(oldBlock.substring(oldBlock.length - 100)));

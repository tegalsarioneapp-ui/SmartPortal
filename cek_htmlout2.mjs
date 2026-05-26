import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cari blok var htmlOut lama
const idxStart = html.indexOf("var htmlOut = (function");
const idxEnd   = html.indexOf("printViaIframe(htmlOut", idxStart);

if (idxStart === -1) {
    console.error("❌ GAGAL - var htmlOut tidak ditemukan");
    process.exit(1);
}
if (idxEnd === -1) {
    console.error("❌ GAGAL - printViaIframe tidak ditemukan");
    process.exit(1);
}

const oldBlock = html.substring(idxStart, idxEnd);
console.log("✅ Blok lama ditemukan, panjang:", oldBlock.length, "karakter");
console.log("Preview awal:", JSON.stringify(oldBlock.substring(0, 80)));
console.log("Preview akhir:", JSON.stringify(oldBlock.substring(oldBlock.length - 80)));

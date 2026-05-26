import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cek fungsi downloadPdfFromHtml
const idx1 = html.indexOf("window.downloadPdfFromHtml = function");
console.log("=== downloadPdfFromHtml ===");
console.log(JSON.stringify(html.substring(idx1, idx1+300)));

// Cek tombol cetak kas
const idx2 = html.indexOf("_doCetakKas");
console.log("\n=== _doCetakKas ===");
console.log(JSON.stringify(html.substring(idx2, idx2+200)));

// Cek apakah fungsi cetak dipanggil
const idx3 = html.indexOf("onclick=\"_doCetakKas");
console.log("\n=== tombol cetak ===");
console.log(JSON.stringify(html.substring(idx3, idx3+100)));

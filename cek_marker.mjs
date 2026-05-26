import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idxStart = html.indexOf("var htmlOut = (function");
console.log("idxStart:", idxStart);

// Cari semua kemungkinan penutup setelah htmlOut
const markers = [
    "printViaIframe",
    "downloadPdfFromHtml",
    "window.downloadPdf",
    "htmlOut)",
    "htmlOut,",
    "htmlOut;",
];

markers.forEach(m => {
    const idx = html.indexOf(m, idxStart);
    console.log(`${m} → idx:${idx} | Line:~${html.substring(0,idx).split("\n").length}`);
});

// Lihat 200 karakter setelah htmlOut
console.log("\nSnippet setelah htmlOut:");
console.log(JSON.stringify(html.substring(idxStart + 20, idxStart + 200)));

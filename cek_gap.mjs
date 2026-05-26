import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idxHtmlOut = html.indexOf("var htmlOut");
const idxDownload = html.indexOf("window.downloadPdfFromHtml", idxHtmlOut);

// Lihat semua kode antara htmlOut dan downloadPdfFromHtml
console.log(JSON.stringify(html.substring(idxHtmlOut + 10, idxDownload)));

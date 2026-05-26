import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const markers = [
    "_doCetakKas",
    "var htmlOut = (function",
    "kop-surat",
    "ttdHtml",
    "rowsUtama",
    "bagianA",
    "bagianB",
    "lampiran"
];

markers.forEach(m => {
    const idx = html.indexOf(m);
    console.log(`Line ~${html.substring(0,idx).split("\n").length} | idx:${idx} | ${m}`);
});

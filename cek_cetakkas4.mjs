import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Lihat sisa _doCetakKas setelah rowsUtama
console.log(html.substring(413165+3000, 413165+5000));

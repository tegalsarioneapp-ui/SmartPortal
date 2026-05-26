import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Lihat _doCetakKas lengkap dari idx 413165
console.log(html.substring(413165, 413165+3000));

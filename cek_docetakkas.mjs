import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cari fungsi _doCetakKas lengkap
const idx = html.indexOf("function _doCetakKas");
console.log(JSON.stringify(html.substring(idx, idx+600)));

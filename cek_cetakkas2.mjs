import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cari semua variasi _doCetakKas
const terms = [
    "function _doCetakKas",
    "window._doCetakKas",
    "_doCetakKas = function",
    "_doCetakKas",
];

terms.forEach(t => {
    let idx = -1;
    let all = [];
    while((idx = html.indexOf(t, idx+1)) !== -1) {
        all.push(idx);
    }
    console.log(`"${t}" → ditemukan ${all.length}x di idx: ${all.join(', ')}`);
    if(all.length > 0) {
        console.log("  Snippet:", JSON.stringify(html.substring(all[0], all[0]+150)));
    }
});

import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Fix 1: CSS logo - paksa width & height fixed
const oldCSS = `+'.kop-surat img{position:absolute;left:0;top:50%;transform:translateY(-50%);width:75px;height:auto;}'`;
const newCSS = `+'.kop-surat img{position:absolute;left:0;top:50%;transform:translateY(-50%);width:60px;height:60px;object-fit:contain;}'`;

// Fix 2: ganti src logo Wikipedia ke lokal
const oldSrc = `+'<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lambang_Kota_Semarang.png/403px-Lambang_Kota_Semarang.png" alt="Logo Semarang">'`;
const newSrc = `+'<img src="/Lambang_Kota_Semarang.png" alt="Logo Semarang" style="width:60px;height:60px;object-fit:contain;">'`;

let ok1 = false, ok2 = false;

if (html.includes(oldCSS)) {
    html = html.replace(oldCSS, newCSS);
    ok1 = true;
    console.log("✅ CSS logo diperbaiki!");
} else {
    console.error("❌ CSS logo tidak ditemukan");
    const idx = html.indexOf("kop-surat img");
    console.log("Snippet CSS:", JSON.stringify(html.substring(idx-5, idx+120)));
}

if (html.includes(oldSrc)) {
    html = html.replace(oldSrc, newSrc);
    ok2 = true;
    console.log("✅ src logo diganti ke lokal!");
} else {
    console.error("❌ src logo tidak ditemukan");
    const idx = html.indexOf("Lambang_Kota_Semarang");
    console.log("Snippet src:", JSON.stringify(html.substring(idx-50, idx+150)));
}

if (ok1 || ok2) {
    writeFileSync(FILE, html, "utf8");
    console.log("✅ File tersimpan!");
}

import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const oldKop = `+'<img src="/Lambang_Kota_Semarang.png" alt="Logo Semarang">'`;
const newKop = `+'<img src="/Lambang_Kota_Semarang.png" alt="Logo Semarang" style="width:60px;height:60px;object-fit:contain;position:absolute;left:0;top:50%;transform:translateY(-50%);">'`;

if (html.includes(oldKop)) {
    html = html.replace(oldKop, newKop);
    writeFileSync(FILE, html, "utf8");
    console.log("✅ inline style logo ditambahkan!");
} else {
    console.error("❌ GAGAL - string tidak ditemukan");
    const idx = html.indexOf("Lambang_Kota_Semarang.png");
    console.log("Snippet:", JSON.stringify(html.substring(idx-20, idx+100)));
}

import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const oldLogo = `+'.kop-surat img{position:absolute;left:0;top:50%;transform:translateY(-50%);width:55px;height:auto;}'`;
const newLogo = `+'.kop-surat img{position:absolute;left:0;top:50%;transform:translateY(-50%);width:75px;height:auto;}'`;

if (html.includes(oldLogo)) {
    html = html.replace(oldLogo, newLogo);
    writeFileSync(FILE, html, "utf8");
    console.log("✅ logo diubah ke width:75px!");
} else {
    console.error("❌ GAGAL - string tidak ditemukan");
    const idx = html.indexOf("kop-surat img");
    console.log("Snippet:", JSON.stringify(html.substring(idx-5, idx+120)));
}

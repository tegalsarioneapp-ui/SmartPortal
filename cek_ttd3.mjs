import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Bangun newHtml sebagai variabel terpisah
const ttdBlock = 
    '<div class="ttd">'
    + '<div class="ttd-box">'
    + 'Mengetahui,<br>Ketua RT 005<br><br><br><br>'
    + '<span class="ttd-name">Bapak Karsimin</span>'
    + '</div>'
    + '<div class="ttd-box">'
    + 'Semarang, '+new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"})+'<br>'
    + 'Bendahara RT 005<br><br><br><br>'
    + '<span class="ttd-name">Christian Eka</span>'
    + '</div>'
    + '</div>';

// Simpan ttdBlock ke file sementara
writeFileSync("_ttd.txt", ttdBlock, "utf8");
console.log("✅ ttdBlock tersimpan");
console.log(ttdBlock);

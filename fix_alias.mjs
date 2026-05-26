import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const oldStr = `        var img_src = '/Lambang_Kota_Semarang.png';
        var htmlOut =`;

const newStr = `        var img_src = '/Lambang_Kota_Semarang.png';
        // alias variabel agar htmlOut baru bisa pakai nama konsisten
        var fmt        = fmtRp;
        var saldoAwal  = sAwal;
        var totalMasuk = totMU;
        var totalKeluar= totKU;
        var saldoAkhir = sAkh;
        var bulanLabel = blnStr;
        var ttdKiri    = namaRT;
        var ttdKanan   = namaBen;
        var htmlOut =`;

if (html.includes(oldStr)) {
    html = html.replace(oldStr, newStr);
    writeFileSync(FILE, html, "utf8");
    console.log("✅ Alias variabel ditambahkan!");
} else {
    console.error("❌ GAGAL - string tidak ditemukan");
}

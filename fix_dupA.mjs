import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cek berapa kali "A. Laporan Kas Utama" muncul
const count = (html.match(/A\. Laporan Kas Utama/g)||[]).length;
console.log("A. Laporan Kas Utama muncul:", count, "kali");

// Hapus blok duplikat PERTAMA (yang ada sebelum blok kedua)
// Blok duplikat: dari section-title A pertama sampai sebelum section-title A kedua
const MARK_START = `<div class="section-title">A. Laporan Kas Utama</div>
<table class="sum-table">`;

const idx1 = html.indexOf(MARK_START);
const idx2 = html.indexOf(MARK_START, idx1 + 1);

if (idx1 === -1 || idx2 === -1) {
    console.error("❌ Penanda tidak ditemukan!", idx1, idx2);
    process.exit(1);
}

console.log("Duplikat 1 di:", idx1);
console.log("Duplikat 2 di:", idx2);

// Hapus dari idx1 sampai idx2 (buang blok pertama)
html = html.substring(0, idx1) + html.substring(idx2);

// Verifikasi
const countAfter = (html.match(/A\. Laporan Kas Utama/g)||[]).length;
console.log("Setelah fix, muncul:", countAfter, "kali");

writeFileSync(FILE, html, "utf8");
console.log("✅ SELESAI!");

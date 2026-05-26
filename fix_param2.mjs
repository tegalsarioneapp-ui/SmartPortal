import { readFileSync, writeFileSync } from "fs";
const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");

// Hapus card Parameter pakai regex (ignore whitespace variation)
const before = html.length;
html = html.replace(
  /<div class="card" style="border-top: 4px solid var\(--success\);">\s*<h3>Parameter<\/h3>\s*<div class="form-group"><label>Nominal Iuran \(Rp\)<\/label><input type="number" id="set_nominal_iuran"><\/div>\s*<div class="form-group"><label>Bunga Koperasi \(%\)<\/label><input type="number" id="set_bunga_kop"><\/div>\s*<button class="btn-submit bg-blue" onclick="simpanPengaturanSistem\(\)">Simpan Pengaturan<\/button>\s*<\/div>/,
  ``
);

if (html.length === before) {
  console.error("GAGAL: Tidak ada perubahan");
  process.exit(1);
}

writeFileSync(file, html, "utf8");
console.log("OK: Card Parameter dihapus");

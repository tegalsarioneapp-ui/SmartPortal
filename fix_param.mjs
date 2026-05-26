import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");

// Hapus seluruh card Parameter (Nominal Iuran + Bunga Koperasi + tombol Simpan)
const oldStr = `                <div class="card" style="border-top: 4px solid var(--success);">
                    <h3>Parameter</h3>
                    <div class="form-group"><label>Nominal Iuran (Rp)</label><input type="number" id="set_nominal_iuran"></div>
                    <div class="form-group"><label>Bunga Koperasi (%)</label><input type="number" id="set_bunga_kop"></div>
                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>`;

const newStr = `                <div class="card" style="border-top: 4px solid var(--success);">
                    <h3>Parameter</h3>
                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>`;

if (!html.includes(oldStr)) {
    console.error("GAGAL: String tidak ditemukan");
    process.exit(1);
}

html = html.replace(oldStr, newStr);
writeFileSync(file, html, "utf8");
console.log("OK: Card Parameter disederhanakan");

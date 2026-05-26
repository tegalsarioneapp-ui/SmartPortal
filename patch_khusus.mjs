import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "artifacts/smart-portal-rt/index.html");
let html = readFileSync(FILE, "utf8");

// ── PATCH 2: Update ringkasan summary Dana Khusus ────────────────────────
const oldSum = `'<div class="sum">'+\n` +
               `                '<div class="sb"><div class="l">Total Pemasukan Dana Khusus</div><div class="v" style="color:#166534 !important;">'+fmtRp(totMK)+'</div></div>'+\n` +
               `                '<div class="sb"><div class="l">Total Pengeluaran Dana Khusus</div><div class="v" style="color:#991b1b !important;">'+fmtRp(totKK)+'</div></div>'+\n` +
               `                '<div class="sb"><div class="l">Saldo Dana Khusus</div><div class="v" style="color:#92400e !important;">'+fmtRp(totMK-totKK)+'</div></div>'+\n` +
               `            '</div>'+`;

const newSum = `'<div class="sum">'+\n` +
               `                (function(){\n` +
               `                var sosial  = khusus.filter(function(k){return (k.uraian||'').toLowerCase().indexOf('sosial')!==-1;});\n` +
               `                var meja    = khusus.filter(function(k){return (k.uraian||'').toLowerCase().indexOf('uang meja')!==-1;});\n` +
               `                var agustus = khusus.filter(function(k){var u=(k.uraian||'').toLowerCase();return u.indexOf('agustus')!==-1;});\n` +
               `                var totSos  = sosial.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);\n` +
               `                var totMej  = meja.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);\n` +
               `                var totAgs  = agustus.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);\n` +
               `                return '<div class="sb"><div class="l">Uang Sosial</div><div class="v" style="color:#1d4ed8 !important;">'+fmtRp(totSos)+'</div></div>'+\n` +
               `                       '<div class="sb"><div class="l">Uang Meja</div><div class="v" style="color:#6d28d9 !important;">'+fmtRp(totMej)+'</div></div>'+\n` +
               `                       '<div class="sb"><div class="l">Dana 17 Agustus</div><div class="v" style="color:#b45309 !important;">'+fmtRp(totAgs)+'</div></div>'+\n` +
               `                       '<div class="sb"><div class="l">Total Pemasukan</div><div class="v" style="color:#166534 !important;">'+fmtRp(totMK)+'</div></div>'+\n` +
               `                       '<div class="sb"><div class="l">Total Pengeluaran</div><div class="v" style="color:#991b1b !important;">'+fmtRp(totKK)+'</div></div>'+\n` +
               `                       '<div class="sb"><div class="l">Saldo Dana Khusus</div><div class="v" style="color:#92400e !important;">'+fmtRp(totMK-totKK)+'</div></div>';\n` +
               `                })()+\n` +
               `            '</div>'+`;

if (html.includes(oldSum)) {
    html = html.replace(oldSum, newSum);
    console.log("✅ PATCH 2: Ringkasan Dana Khusus diupdate");
} else {
    console.error("❌ PATCH 2: Masih tidak ditemukan - debug spasi:");
    // Cek exact string di line 6665-6669
    const lines = html.split('\n');
    const l = lines[6664]; // L6665 (0-indexed)
    console.log("Spasi awal L6665:", JSON.stringify(l.substring(0, 20)));
    console.log("Full L6666:", JSON.stringify(lines[6665]));
    process.exit(1);
}

writeFileSync(FILE, html, "utf8");
console.log("✅ Selesai! index.html sudah diupdate");
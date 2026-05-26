import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const oldMargin = `@page{size:A4;margin:2.5cm 2cm 2cm 2cm;}`;
const newMargin = `@page{size:A4;margin:3cm 3cm 3cm 4cm;}`;

if (!html.includes(oldMargin)) {
    console.error("❌ String tidak ditemukan!");
    // Cek margin yang ada
    const m = html.match(/@page\{[^}]+\}/);
    console.log("Margin saat ini:", m ? m[0] : "tidak ditemukan");
    process.exit(1);
}

html = html.replace(oldMargin, newMargin);
writeFileSync(FILE, html, "utf8");
console.log("✅ Margin berhasil diupdate!");
console.log("Baru:", newMargin);

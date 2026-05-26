import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// ── Cari batas htmlOut lama (dari var htmlOut = ` sampai `; berikutnya) ──
const idxHtmlStart = html.indexOf("        var htmlOut = `<html>");
const idxHtmlEnd   = html.indexOf("        var bodyOnly = htmlOut;", idxHtmlStart);
if (idxHtmlStart === -1 || idxHtmlEnd === -1) {
    console.error("❌ Penanda tidak ditemukan!");
    console.log("idxHtmlStart:", idxHtmlStart, "idxHtmlEnd:", idxHtmlEnd);
    process.exit(1);
}

const oldBlock = html.substring(idxHtmlStart, idxHtmlEnd);
console.log("✅ Blok htmlOut ditemukan, panjang:", oldBlock.length);
console.log("Preview akhir:", JSON.stringify(oldBlock.slice(-80)));

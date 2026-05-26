import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cek dulu TTD lama
const idxTtd = html.indexOf("ttd-box");
console.log("ttd-box index:", idxTtd);
console.log("Substring TTD:", JSON.stringify(html.substring(idxTtd-20, idxTtd+200)));

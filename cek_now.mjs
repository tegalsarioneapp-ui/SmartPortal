import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idxStart = html.indexOf("var htmlOut = ");
const idxEnd = html.indexOf("// Download sebagai PDF", idxStart);
console.log("=== ISI htmlOut SEKARANG ===");
console.log(html.substring(idxStart, idxEnd));

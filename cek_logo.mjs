import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idx = html.indexOf("kop-surat img");
console.log("Snippet:", JSON.stringify(html.substring(idx-5, idx+150)));

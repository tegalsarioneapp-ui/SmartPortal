import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idx = html.indexOf("kopHtml");
console.log("Snippet kopHtml:", JSON.stringify(html.substring(idx, idx+400)));

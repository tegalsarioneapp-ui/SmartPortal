import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

const idxStart = html.indexOf("var htmlOut = (function");
const idxEnd   = html.indexOf("printViaIframe(htmlOut", idxStart);
console.log(html.substring(idxStart, idxEnd + 30));

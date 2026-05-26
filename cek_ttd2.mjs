import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cari semua ttd-box di luar CSS
let idx = 0;
let count = 0;
while (true) {
    idx = html.indexOf("ttd-box", idx+1);
    if (idx === -1) break;
    count++;
    const snippet = html.substring(idx-30, idx+120);
    // Hanya tampilkan yang bukan di dalam CSS string
    if (!snippet.includes("font-size:10pt")) {
        console.log("=== INDEX:", idx, "===");
        console.log(JSON.stringify(snippet));
    }
}
console.log("Total ttd-box ditemukan:", count);

// Cari juga blok ttd di htmlOut
const idxHtml = html.indexOf("htmlOut");
console.log("\nhtmlOut pertama di index:", idxHtml);
const idxTtd2 = html.indexOf("ttd", idxHtml);
console.log("ttd setelah htmlOut:", idxTtd2);
console.log("Snippet:", JSON.stringify(html.substring(idxTtd2-10, idxTtd2+300)));

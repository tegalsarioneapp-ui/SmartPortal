import { readFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");

// Cari semua variasi nama fungsi download PDF
const terms = [
    "downloadPdfFromHtml",
    "downloadPdf",
    "html2canvas",
    "jsPDF",
    "window.jsPDF",
];

terms.forEach(t => {
    const idx = html.indexOf(t);
    console.log(`"${t}" → idx:${idx}`);
    if(idx !== -1) {
        console.log("  Snippet:", JSON.stringify(html.substring(idx, idx+100)));
    }
});

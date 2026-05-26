import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let lines = readFileSync(file, "utf8").split("\n");

// Validasi dan hapus 3 baris bermasalah
const expectedLines = [
    '<div class="card" style="display:none">',
    '    </div>',
    '</div>'
];

let foundIndex = -1;

// Cari exact match dari pattern 3 baris
for (let i = 0; i < lines.length - 2; i++) {
    if (lines[i].trim() === expectedLines[0].trim() &&
        lines[i + 1].trim() === expectedLines[1].trim() &&
        lines[i + 2].trim() === expectedLines[2].trim()) {
        foundIndex = i;
        break;
    }
}

if (foundIndex !== -1) {
    console.log("Ditemukan di baris:", foundIndex + 1);
    console.log("Line " + (foundIndex + 1) + ":", lines[foundIndex]);
    console.log("Line " + (foundIndex + 2) + ":", lines[foundIndex + 1]);
    console.log("Line " + (foundIndex + 3) + ":", lines[foundIndex + 2]);
    lines.splice(foundIndex, 3);
    writeFileSync(file, lines.join("\n"), "utf8");
    console.log("OK: Fix div bermasalah dihapus");
} else {
    console.log("INFO: Pattern tidak ditemukan (mungkin sudah dihapus sebelumnya)");
    process.exit(0);
}

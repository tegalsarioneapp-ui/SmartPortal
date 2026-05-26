import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let lines = readFileSync(file, "utf8").split("\n");

// Cek line 3920, 3921, 3922 (index 3919, 3920, 3921)
console.log("Line 3920:", lines[3919]);
console.log("Line 3921:", lines[3920]);
console.log("Line 3922:", lines[3921]);

// Hapus 3 baris bermasalah (index 3919, 3920, 3921)
// <div class="card" style="display:none">
//     </div>
// </div>
lines.splice(3919, 3);

writeFileSync(file, lines.join("\n"), "utf8");
console.log("OK: Fix div bermasalah dihapus");

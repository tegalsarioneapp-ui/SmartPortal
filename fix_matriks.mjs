import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let lines = readFileSync(file, "utf8").split("\n");

// Cari pattern original berdasarkan content
const oldPattern1 = "        let p1T = (10000 / 20000) * uangTertahan; let p2T = (5000 / 20000) * uangTertahan; let p3T = (5000 / 20000) * uangTertahan;";
const oldPattern2 = "        let p1M = (10000 / 20000) * uangMasukKas; let p2M = (5000 / 20000) * uangMasukKas; let p3M = (5000 / 20000) * uangMasukKas;";

const newLines = `        let _ji = JSON.parse(localStorage.getItem('db_jenis_iuran'))||[{nama:'Pembangunan',nominal:10000},{nama:'Uang Meja',nominal:5000},{nama:'17 Agustus',nominal:5000},{nama:'Sosial',nominal:5000}];
        let _tot = _ji.reduce((s,x)=>s+(parseInt(x.nominal)||0),0)||20000;
        let pT = _ji.map(j => (parseInt(j.nominal)||0)/_tot * uangTertahan);
        let pM = _ji.map(j => (parseInt(j.nominal)||0)/_tot * uangMasukKas);`;

let foundIndex = -1;
for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes("let p1T = (10000 / 20000) * uangTertahan") &&
        lines[i + 1].includes("let p1M = (10000 / 20000) * uangMasukKas")) {
        foundIndex = i;
        break;
    }
}

if (foundIndex !== -1) {
    console.log("Ditemukan di line:", foundIndex + 1);
    console.log("Line " + (foundIndex + 1) + ":", lines[foundIndex]);
    console.log("Line " + (foundIndex + 2) + ":", lines[foundIndex + 1]);
    lines.splice(foundIndex, 2, ...newLines.split("\n"));
    writeFileSync(file, lines.join("\n"), "utf8");
    console.log("OK: loadMatriksIuran proporsi dinamis");
} else {
    console.log("INFO: Pattern tidak ditemukan (mungkin sudah dipatch)");
    process.exit(0);
}

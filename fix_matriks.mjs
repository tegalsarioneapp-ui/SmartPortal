import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let lines = readFileSync(file, "utf8").split("\n");

// Line 7600 dan 7601 (index 7599 dan 7600)
console.log("Line 7599:", lines[7599]);
console.log("Line 7600:", lines[7600]);

const newLines = `        let _ji = JSON.parse(localStorage.getItem('db_jenis_iuran'))||[{nama:'Pembangunan',nominal:10000},{nama:'Uang Meja',nominal:5000},{nama:'17 Agustus',nominal:5000},{nama:'Sosial',nominal:5000}];
        let _tot = _ji.reduce((s,x)=>s+(parseInt(x.nominal)||0),0)||20000;
        let p1T = (_ji[0]?_ji[0].nominal:10000)/_tot*uangTertahan; let p2T = (_ji[1]?_ji[1].nominal:5000)/_tot*uangTertahan; let p3T = (_ji[2]?_ji[2].nominal:5000)/_tot*uangTertahan;
        let p1M = (_ji[0]?_ji[0].nominal:10000)/_tot*uangMasukKas; let p2M = (_ji[1]?_ji[1].nominal:5000)/_tot*uangMasukKas; let p3M = (_ji[2]?_ji[2].nominal:5000)/_tot*uangMasukKas;`;

// Replace 2 baris (index 7599 dan 7600) dengan 4 baris baru
lines.splice(7599, 2, ...newLines.split("\n"));

writeFileSync(file, lines.join("\n"), "utf8");
console.log("OK: loadMatriksIuran proporsi dinamis");

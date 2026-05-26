import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let patchCount = 0;

/**
 * Replace a target substring in the in-memory HTML and record the patch.
 *
 * If the target substring is not found, logs an error and exits the process with code 1.
 * On success, replaces the first occurrence of `oldStr` in the surrounding `html` variable,
 * increments the surrounding `patchCount`, and logs success.
 *
 * @param {string} label - Human-readable patch label used in logs.
 * @param {string} oldStr - The exact substring to locate in `html`.
 * @param {string} newStr - The replacement string to insert for the first match of `oldStr`.
 */
function patch(label, oldStr, newStr) {
  if (!html.includes(oldStr)) {
    console.error("GAGAL:", label);
    console.error("String tidak ditemukan di file");
    process.exit(1);
  }
  html = html.replace(oldStr, newStr);
  patchCount++;
  console.log("OK:", label);
}

// PATCH 1: hitungOtomatisIuran dinamis
patch("hitungOtomatisIuran dinamis",
`    window.hitungOtomatisIuran = function() { let t = document.querySelectorAll('.cb-bulan:checked').length * 20000; if(document.getElementById('ben-iuran-amt')) document.getElementById('ben-iuran-amt').value = t; };`,
`    window.hitungOtomatisIuran = function() {
        let jenisIuran = JSON.parse(localStorage.getItem('db_jenis_iuran')) || [{nama:'Pembangunan',nominal:10000},{nama:'Uang Meja',nominal:5000},{nama:'17 Agustus',nominal:5000},{nama:'Sosial',nominal:5000}];
        let totalPerBulan = jenisIuran.reduce((s,x) => s + (parseInt(x.nominal)||0), 0);
        let t = document.querySelectorAll('.cb-bulan:checked').length * totalPerBulan;
        if(document.getElementById('ben-iuran-amt')) document.getElementById('ben-iuran-amt').value = t;
    };`
);

// PATCH 2: simpanIuranKolektif nominal dinamis
patch("simpanIuranKolektif nominal dinamis",
`                nominal: 20000,`,
`                nominal: (function(){ let j=JSON.parse(localStorage.getItem('db_jenis_iuran'))||[{nama:'Pembangunan',nominal:10000},{nama:'Uang Meja',nominal:5000},{nama:'17 Agustus',nominal:5000},{nama:'Sosial',nominal:5000}]; return j.reduce((s,x)=>s+(parseInt(x.nominal)||0),0); })(),`
);

// PATCH 3: loadMatriksIuran proporsi dinamis
patch("loadMatriksIuran proporsi dinamis",
`        let p1T = (10000 / 20000) * uangTertahan; let p2T = (5000 / 20000) * uangTertahan; let p3T = (5000 / 20000) * uangTertahan;
        let p1M = (10000 / 20000) * uangMasukKas; let p2M = (5000 / 20000) * uangMasukKas; let p3M = (5000 / 20000) * uangMasukKas;`,
`        let _ji = JSON.parse(localStorage.getItem('db_jenis_iuran'))||[{nama:'Pembangunan',nominal:10000},{nama:'Uang Meja',nominal:5000},{nama:'17 Agustus',nominal:5000},{nama:'Sosial',nominal:5000}];
        let _tot = _ji.reduce((s,x)=>s+(parseInt(x.nominal)||0),0)||20000;
        let pT = _tot === 0 ? _ji.map(j => 0) : _ji.map(j => (parseInt(j.nominal)||0)/_tot * uangTertahan);
        let pM = _tot === 0 ? _ji.map(j => 0) : _ji.map(j => (parseInt(j.nominal)||0)/_tot * uangMasukKas);`
);


writeFileSync(file, html, "utf8");
console.log("SELESAI! Total " + patchCount + " patch berhasil.");

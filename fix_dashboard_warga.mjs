import { readFileSync, writeFileSync } from 'fs';

const file = 'artifacts/smart-portal-rt/index.html';
let html = readFileSync(file, 'utf8');

const oldEnding = `    if (typeof window.gtRefreshDashboard === 'function') window.gtRefreshDashboard();
};`;

const newEnding = `    if (typeof window.gtRefreshDashboard === 'function') window.gtRefreshDashboard();
    try{ patchRekapArisan(); }catch(e){}
};
window.loadDashboardWarga.__gtV12 = true;`;

const oldPatch = `if (typeof window.loadDashboardWarga === 'function' && !window.loadDashboardWarga.__gtV12) {
      var origDw = window.loadDashboardWarga;
      window.loadDashboardWarga = function(){
        var r = origDw.apply(this, arguments);
        try{ patchRekapArisan(); }catch(e){}
        return r;
      };
      window.loadDashboardWarga.__gtV12 = true;
      clearInterval(_dwi);
    }`;

const newPatch = `// patch wrapper dihapus - sudah terintegrasi di loadDashboardWarga`;

if (!html.includes(oldEnding)) {
    console.error('GAGAL: oldEnding tidak ditemukan!');
    process.exit(1);
}
if (!html.includes(oldPatch)) {
    console.error('GAGAL: oldPatch tidak ditemukan!');
    process.exit(1);
}

html = html.replace(oldEnding, newEnding);
html = html.replace(oldPatch, newPatch);

writeFileSync(file, html, 'utf8');
console.log('BERHASIL: index.html sudah diupdate!');

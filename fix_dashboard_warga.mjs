import { readFileSync, writeFileSync } from 'fs';

const file = 'artifacts/smart-portal-rt/index.html';
let html;
try {
    html = readFileSync(file, 'utf8');
} catch (error) {
    console.error(`Failed to read ${file}: ${error.message}`);
    process.exit(1);
}

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

// Check if already patched (idempotent)
if (html.includes(newEnding) && html.includes(newPatch)) {
    console.log('Already patched - skipping (idempotent)');
} else if (html.includes(oldEnding) && html.includes(oldPatch)) {
    // Apply the patch
    html = html.replace(oldEnding, newEnding);
    html = html.replace(oldPatch, newPatch);
} else {
    console.error('GAGAL: Neither old nor new patterns found in the file!');
    process.exit(1);
}

try {
    writeFileSync(file, html, 'utf8');
    console.log('BERHASIL: index.html sudah diupdate!');
} catch (error) {
    console.error(`Failed to write ${file}: ${error.message}`);
    process.exit(1);
}

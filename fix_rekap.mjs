import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let patchCount = 0;

function patch(label, oldStr, newStr) {
  if (html.includes(newStr)) {
    console.log("SKIP (sudah dipatch):", label);
    return;
  }
  if (!html.includes(oldStr)) {
    console.error("GAGAL:", label);
    process.exit(1);
  }
  html = html.replace(oldStr, newStr);
  patchCount++;
  console.log("OK:", label);
}

// PATCH 1: Saldo Kas — samakan dengan loadDashboardWarga()
// Gunakan ben_saldo_awal jika ada (valid number), baru fallback ke db_saldo_awal.
patch(
  "Saldo Kas: gunakan ben_saldo_awal seperti loadDashboardWarga",
  `            var saldoAwal = parseFloat(localStorage.getItem('db_saldo_awal') || '0');`,
  `            var benSaldoAwalStr = localStorage.getItem('ben_saldo_awal');
            var _benSaldoAwal = parseFloat(benSaldoAwalStr || '0');
            var saldoAwal = (benSaldoAwalStr !== null && !isNaN(_benSaldoAwal)) ? _benSaldoAwal : parseFloat(localStorage.getItem('db_saldo_awal') || '0');`
);

// PATCH 2 & 3: Arisan & Tuan Rumah — baca db_info_arisan terlebih dahulu
// (sumber resmi yang diisi melalui form "Atur Penerima Arisan & Tuan Rumah"),
// baru fallback ke perhitungan dari array db_arisan. Set each field independently.
patch(
  "Arisan & Tuan Rumah: utamakan db_info_arisan",
  `            // ── Arisan & Tuan Rumah ──
            var arisanDb = JSON.parse(localStorage.getItem('db_arisan') || '[]');
            var elArisan = document.getElementById('wfb-arisan');
            var elHost = document.getElementById('wfb-host');
            if (arisanDb.length > 0) {
                var last = arisanDb[arisanDb.length - 1];
                if (elArisan) {
                    var namaPemenang = last.pemenang || last.nama || '—';
                    elArisan.textContent = namaPemenang.split(/\\s+/).slice(0,2).join(' ');
                }
                // Host berikutnya: cari yang belum menang
                var sudahMenang = arisanDb.map(function(a){ return a.pemenang || a.nama || ''; });
                var allWarga = wargaDb.map(function(w){ return w.namaKK || w.nama || ''; });
                var belumMenang = allWarga.filter(function(n){ return n && sudahMenang.indexOf(n) === -1; });
                if (elHost) elHost.textContent = belumMenang.length > 0 ? belumMenang[0].split(/\\s+/).slice(0,2).join(' ') : (last.host || '—');
            } else {
                if (elArisan) elArisan.textContent = '—';
                if (elHost) elHost.textContent = '—';
            }`,
  `            // ── Arisan & Tuan Rumah ──
            // Utamakan db_info_arisan (diisi via form admin "Atur Penerima Arisan & Tuan Rumah"),
            // sehingga sinkron dengan tampilan di "Ringkasan Lingkungan".
            var elArisan = document.getElementById('wfb-arisan');
            var elHost = document.getElementById('wfb-host');
            var infoArisan = null;
            try { infoArisan = JSON.parse(localStorage.getItem('db_info_arisan') || 'null'); } catch(_){}

            // Set arisan name independently
            if (infoArisan && infoArisan.arisanNama) {
                if (elArisan) elArisan.textContent = infoArisan.arisanNama;
            } else {
                // Fallback: turunkan dari array db_arisan
                var arisanDb = JSON.parse(localStorage.getItem('db_arisan') || '[]');
                if (arisanDb.length > 0) {
                    var last = arisanDb[arisanDb.length - 1];
                    if (elArisan) {
                        var namaPemenang = last.pemenang || last.nama || '—';
                        elArisan.textContent = namaPemenang.split(/\\s+/).slice(0,2).join(' ');
                    }
                } else {
                    if (elArisan) elArisan.textContent = '—';
                }
            }

            // Set host name independently
            if (infoArisan && infoArisan.hostNama) {
                if (elHost) elHost.textContent = infoArisan.hostNama;
            } else {
                // Fallback: turunkan dari array db_arisan
                var arisanDb = JSON.parse(localStorage.getItem('db_arisan') || '[]');
                if (arisanDb.length > 0) {
                    var last = arisanDb[arisanDb.length - 1];
                    var sudahMenang = arisanDb.map(function(a){ return a.pemenang || a.nama || ''; });
                    var allWarga = wargaDb.map(function(w){ return w.namaKK || w.nama || ''; });
                    var belumMenang = allWarga.filter(function(n){ return n && sudahMenang.indexOf(n) === -1; });
                    if (elHost) elHost.textContent = belumMenang.length > 0 ? belumMenang[0].split(/\\s+/).slice(0,2).join(' ') : (last.host || '—');
                } else {
                    if (elHost) elHost.textContent = '—';
                }
            }`
);

writeFileSync(file, html, "utf8");
console.log("SELESAI! Total " + patchCount + " patch berhasil.");

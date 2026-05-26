import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let patchCount = 0;

/**
 * Apply a single string-replacement patch to the in-memory HTML, aborting the process if the target string is not found.
 * @param {string} label - Short label used in console logs to identify this patch.
 * @param {string} oldStr - Substring to locate in the HTML; the first occurrence will be replaced.
 * @param {string} newStr - Replacement string that will substitute the first occurrence of `oldStr`.
 * 
 * Side effects: modifies the surrounding `html` variable, increments `patchCount`, logs success or failure to the console,
 * and calls `process.exit(1)` if `oldStr` is not present.
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
        let p1T = (_ji[0]?_ji[0].nominal:10000)/_tot*uangTertahan; let p2T = (_ji[1]?_ji[1].nominal:5000)/_tot*uangTertahan; let p3T = (_ji[2]?_ji[2].nominal:5000)/_tot*uangTertahan;
        let p1M = (_ji[0]?_ji[0].nominal:10000)/_tot*uangMasukKas; let p2M = (_ji[1]?_ji[1].nominal:5000)/_tot*uangMasukKas; let p3M = (_ji[2]?_ji[2].nominal:5000)/_tot*uangMasukKas;`
);

// PATCH 4: Tambah fungsi manajemen jenis iuran sebelum loadPengaturan
patch("Fungsi manajemen jenis iuran",
`    window.loadPengaturan = function() {`,
`    window.getJenisIuran = function() {
        return JSON.parse(localStorage.getItem('db_jenis_iuran')) || [
            {nama:'Pembangunan', nominal:10000},
            {nama:'Uang Meja', nominal:5000},
            {nama:'17 Agustus', nominal:5000},
            {nama:'Sosial', nominal:5000}
        ];
    };
    window.renderJenisIuran = function() {
        let list = document.getElementById('jenis-iuran-list');
        if(!list) return;
        let data = window.getJenisIuran();
        let total = data.reduce((s,x)=>s+(parseInt(x.nominal)||0),0);
        list.innerHTML = data.map(function(item, idx) {
            return '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;" id="row-iuran-' + idx + '">' +
                '<input type="text" placeholder="Nama Komponen" value="' + item.nama + '" ' +
                'id="ji-nama-' + idx + '" style="flex:2;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;">' +
                '<input type="number" placeholder="Nominal" value="' + item.nominal + '" ' +
                'id="ji-nominal-' + idx + '" onchange="updateTotalIuranPreview()" ' +
                'style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;">' +
                '<button onclick="hapusKomponenIuran(' + idx + ')" ' +
                'style="padding:8px 12px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-weight:700;">X</button>' +
                '</div>';
        }).join('');
        window.updateTotalIuranPreview();
    };
    window.updateTotalIuranPreview = function() {
        let data = window.getJenisIuran();
        let total = 0;
        data.forEach(function(item, idx) {
            let el = document.getElementById('ji-nominal-' + idx);
            if(el) total += parseInt(el.value)||0;
        });
        let prev = document.getElementById('total-iuran-preview');
        if(prev) prev.innerHTML = 'Total Iuran per Bulan: <span style="font-size:1.2rem;">' + fmt(total) + '</span>';
    };
    window.tambahKomponenIuran = function() {
        let data = window.getJenisIuran();
        data.push({nama:'Komponen Baru', nominal:0});
        localStorage.setItem('db_jenis_iuran', JSON.stringify(data));
        window.renderJenisIuran();
    };
    window.hapusKomponenIuran = function(idx) {
        let data = window.getJenisIuran();
        if(data.length <= 1) return Swal.fire('Minimal 1','Harus ada minimal 1 komponen iuran.','warning');
        data.splice(idx, 1);
        localStorage.setItem('db_jenis_iuran', JSON.stringify(data));
        window.renderJenisIuran();
    };
    window.simpanJenisIuran = function() {
        let data = window.getJenisIuran();
        let hasil = data.map(function(item, idx) {
            return {
                nama: (document.getElementById('ji-nama-' + idx)||{}).value || item.nama,
                nominal: parseInt((document.getElementById('ji-nominal-' + idx)||{}).value)||0
            };
        });
        let total = hasil.reduce((s,x)=>s+(x.nominal||0),0);
        if(total <= 0) return Swal.fire('Nominal Kosong','Pastikan total nominal iuran lebih dari 0.','warning');
        localStorage.setItem('db_jenis_iuran', JSON.stringify(hasil));
        if(typeof syncSemuaData === 'function') syncSemuaData(true);
        Swal.fire('Berhasil','Komponen iuran berhasil disimpan. Total: ' + fmt(total) + ' / bulan.','success');
    };
    window.loadPengaturan = function() {`
);

// PATCH 5: Tambah card Komponen Iuran di HTML Pengaturan
patch("Card Komponen Iuran di HTML",
`                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
            </div>`,
`                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
            </div>

            <div class="card" style="border-top: 4px solid #f59e0b;">
                <h3 style="margin-bottom:6px;"><i class="fa-solid fa-coins" style="color:#f59e0b;"></i> Komponen Iuran Warga</h3>
                <p style="font-size:0.83rem;color:#64748b;margin-bottom:16px;">Atur nama dan nominal tiap komponen. Total dihitung otomatis. Klik Simpan setelah selesai.</p>
                <div id="jenis-iuran-list"></div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                    <button class="btn-action bg-green" onclick="tambahKomponenIuran()"><i class="fa-solid fa-plus"></i> Tambah Komponen</button>
                    <button class="btn-action bg-blue" onclick="simpanJenisIuran()"><i class="fa-solid fa-floppy-disk"></i> Simpan Komponen</button>
                </div>
                <div id="total-iuran-preview" style="margin-top:14px;padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;font-weight:700;color:#166534;"></div>
            </div>`
);

// PATCH 6: loadPengaturan — tambah renderJenisIuran di dalamnya
patch("loadPengaturan panggil renderJenisIuran",
`        if(document.getElementById('set_nominal_iuran')) document.getElementById('set_nominal_iuran').value = s.nomIuran;`,
`        if(document.getElementById('set_nominal_iuran')) document.getElementById('set_nominal_iuran').value = s.nomIuran;
        if(typeof window.renderJenisIuran === 'function') window.renderJenisIuran();`
);

writeFileSync(file, html, "utf8");
console.log("SELESAI! Total " + patchCount + " patch berhasil.");

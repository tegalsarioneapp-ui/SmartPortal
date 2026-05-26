import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let patchCount = 0;

function patch(label, oldStr, newStr) {
  if (!html.includes(oldStr)) {
    console.error("GAGAL:", label);
    process.exit(1);
  }
  html = html.replace(oldStr, newStr);
  patchCount++;
  console.log("OK:", label);
}

// PATCH 4: Tambah fungsi manajemen jenis iuran
patch("Fungsi manajemen jenis iuran",
`    window.loadPengaturan = function() {`,
`    window.getJenisIuran = function() {
        try {
            const stored = localStorage.getItem('db_jenis_iuran');
            if (!stored) throw new Error('No data');
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid data');
            return parsed;
        } catch (e) {
            return [
                {nama:'Pembangunan', nominal:10000},
                {nama:'Uang Meja', nominal:5000},
                {nama:'17 Agustus', nominal:5000},
                {nama:'Sosial', nominal:5000}
            ];
        }
    };
    window.renderJenisIuran = function() {
        let list = document.getElementById('jenis-iuran-list');
        if(!list) return;
        let data = window.getJenisIuran();
        list.innerHTML = '';
        data.forEach(function(item, idx) {
            let row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:10px;align-items:center;margin-bottom:10px;';

            let inputNama = document.createElement('input');
            inputNama.type = 'text';
            inputNama.placeholder = 'Nama Komponen';
            inputNama.value = item.nama;
            inputNama.id = 'ji-nama-' + idx;
            inputNama.style.cssText = 'flex:2;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;';

            let inputNominal = document.createElement('input');
            inputNominal.type = 'number';
            inputNominal.placeholder = 'Nominal';
            inputNominal.value = item.nominal;
            inputNominal.id = 'ji-nominal-' + idx;
            inputNominal.style.cssText = 'flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;';
            inputNominal.addEventListener('input', function() { window.updateTotalIuranPreview(); });

            let btnHapus = document.createElement('button');
            btnHapus.textContent = '✕';
            btnHapus.style.cssText = 'padding:8px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:1rem;';
            btnHapus.addEventListener('click', function() { window.hapusKomponenIuran(idx); });

            row.appendChild(inputNama);
            row.appendChild(inputNominal);
            row.appendChild(btnHapus);
            list.appendChild(row);
        });
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
        if(prev) prev.innerHTML = 'Total Iuran per Bulan: <span style="font-size:1.2rem;margin-left:8px;">' + fmt(total) + '</span>';
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
        let hasil = [];
        let valid = true;
        data.forEach(function(item, idx) {
            let nama = (document.getElementById('ji-nama-' + idx)||{}).value||'';
            let nominal = parseInt((document.getElementById('ji-nominal-' + idx)||{}).value)||0;
            if(!nama.trim()) { valid = false; return; }
            hasil.push({nama: nama.trim(), nominal: nominal});
        });
        if(!valid) return Swal.fire('Nama Kosong','Semua komponen harus punya nama.','warning');
        if(hasil.length === 0) return Swal.fire('Kosong','Minimal 1 komponen iuran.','warning');
        localStorage.setItem('db_jenis_iuran', JSON.stringify(hasil));
        if(typeof syncSemuaData === 'function') syncSemuaData(true);
        Swal.fire('Berhasil','Komponen iuran berhasil disimpan.','success');
        window.renderJenisIuran();
    };
    window.loadPengaturan = function() {`
);

// PATCH 5: Tambah card Komponen Iuran di tab Pengaturan
patch("Card Komponen Iuran di Pengaturan",
`                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>`,
`                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
            </div>

            <div class="card" style="border-top: 4px solid #f59e0b;">
                <div class="card-title-header" style="margin-bottom:16px;">
                    <h3><i class="fa-solid fa-coins" style="color:#f59e0b;"></i> Komponen Iuran Warga</h3>
                    <span style="font-size:0.82rem;color:#64748b;">Atur nama dan nominal tiap komponen. Total dihitung otomatis.</span>
                </div>
                <div id="jenis-iuran-list" style="margin-bottom:16px;"></div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                    <button class="btn-action bg-green" onclick="window.tambahKomponenIuran()"><i class="fa-solid fa-plus"></i> Tambah Komponen</button>
                    <button class="btn-action bg-blue" onclick="window.simpanJenisIuran()"><i class="fa-solid fa-floppy-disk"></i> Simpan</button>
                </div>
                <div id="total-iuran-preview" style="padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;font-weight:700;color:#166534;font-size:1rem;"></div>
            </div>

            <div class="card" style="display:none">`
);

// PATCH 6: Panggil renderJenisIuran di loadPengaturan
patch("Panggil renderJenisIuran di loadPengaturan",
`        if(typeof loadPengaturan === 'function') loadPengaturan();`,
`        if(typeof loadPengaturan === 'function') loadPengaturan();
        if(typeof window.renderJenisIuran === 'function') window.renderJenisIuran();`
);

writeFileSync(file, html, "utf8");
console.log("SELESAI! Total", patchCount, "patch berhasil.");

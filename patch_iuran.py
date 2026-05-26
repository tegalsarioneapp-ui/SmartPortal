import re

file = 'artifacts/smart-portal-rt/index.html'
with open(file, 'r', encoding='utf-8') as f:
    html = f.read()

count = 0

def patch(label, old, new):
    global html, count
    if old not in html:
        print(f'GAGAL: {label}')
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f'OK: {label}')

# PATCH 1: Card Jenis Iuran di Pengaturan
patch('Card Jenis Iuran',
'<button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>\n                </div>\n            </div>',
'''<button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
                <div class="card" style="border-top:4px solid #6366f1; margin-top:0;">
                  <h3><i class="fa-solid fa-list-check" style="color:#6366f1;"></i> Jenis Iuran</h3>
                  <p style="font-size:0.82rem;color:#64748b;margin-bottom:12px;">Atur komponen iuran bulanan. Total nominal otomatis dihitung.</p>
                  <div id="list-jenis-iuran" style="margin-bottom:12px;"></div>
                  <button class="btn-action bg-blue" style="width:100%;" onclick="tambahJenisIuran()"><i class="fa-solid fa-plus"></i> Tambah Jenis Iuran</button>
                </div>
            </div>''')

# PATCH 2: hitungOtomatisIuran dinamis
patch('hitungOtomatisIuran',
"window.hitungOtomatisIuran = function() { let t = document.querySelectorAll('.cb-bulan:checked').length * 20000; if(document.getElementById('ben-iuran-amt')) document.getElementById('ben-iuran-amt').value = t; };",
"""window.hitungOtomatisIuran = function() {
    let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
    if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
    let tot = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
    let t = document.querySelectorAll('.cb-bulan:checked').length * tot;
    if(document.getElementById('ben-iuran-amt')) document.getElementById('ben-iuran-amt').value = t;
};""")

# PATCH 3: simpanIuranKolektif breakdown dinamis
patch('simpanIuranKolektif breakdown',
"        // Catat ke Kas Bendahara (3 baris breakdown)\n        dbKas.push({ id: randomID, idWarga: idWarga, tgl: tglSekarang, uraian: `Iuran Kas RT (${bln}) - ${namaWarga}`, tipe: 'masuk', nominal: 10000 });\n        dbKas.push({ id: randomID + 1, idWarga: idWarga, tgl: tglSekarang, uraian: `Iuran Sampah (${bln}) - ${namaWarga}`, tipe: 'masuk', nominal: 5000 });\n        dbKas.push({ id: randomID + 2, idWarga: idWarga, tgl: tglSekarang, uraian: `Iuran Sosial (${bln}) - ${namaWarga}`, tipe: 'masuk', nominal: 5000 });",
"""        // Catat ke Kas Bendahara (dinamis dari db_jenis_iuran)
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        ji.forEach(function(j, idx) {
            dbKas.push({ id: randomID + idx, idWarga: idWarga, tgl: tglSekarang, uraian: `Iuran ${j.nama} (${bln}) - ${namaWarga}`, tipe: 'masuk', nominal: j.nominal });
        });""")

# PATCH 4: nominal db_iuran dinamis
patch('db_iuran nominal dinamis',
"                nominal: 20000,",
"""                nominal: (function(){ let ji = JSON.parse(localStorage.getItem('db_jenis_iuran')||'[]'); return ji.length ? ji.reduce(function(s,x){return s+(x.nominal||0);},0) : 20000; })(),""")

# PATCH 5: loadPengaturan tambah renderJenisIuran
patch('loadPengaturan renderJenisIuran',
"if(document.getElementById('set_nominal_iuran')) document.getElementById('set_nominal_iuran').value = s.nomIuran;",
"if(document.getElementById('set_nominal_iuran')) document.getElementById('set_nominal_iuran').value = s.nomIuran;\n        if(typeof renderJenisIuran === 'function') renderJenisIuran();")

# PATCH 6: Tambah fungsi-fungsi baru sebelum </script> terakhir
NEW_JS = """
    // === JENIS IURAN DINAMIS ===
    window.renderJenisIuran = function() {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) {
            ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
            localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        }
        let el = document.getElementById('list-jenis-iuran');
        if (!el) return;
        let total = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
        let html2 = '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">';
        html2 += '<tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;">Nama Jenis</th><th style="padding:8px;text-align:right;">Nominal</th><th style="padding:8px;">Aksi</th></tr>';
        ji.forEach(function(j, i) {
            html2 += '<tr style="border-bottom:1px solid #e2e8f0;">';
            html2 += '<td style="padding:8px;"><input type="text" value="'+j.nama+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;" onchange="updateJenisIuran('+i+',\\'nama\\',this.value)"></td>';
            html2 += '<td style="padding:8px;"><input type="number" value="'+j.nominal+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;text-align:right;" onchange="updateJenisIuran('+i+',\\'nominal\\',parseInt(this.value)||0)"></td>';
            html2 += '<td style="padding:8px;text-align:center;"><button onclick="hapusJenisIuran('+i+')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>';
            html2 += '</tr>';
        });
        html2 += '<tr style="background:#f8fafc;font-weight:700;"><td style="padding:8px;">TOTAL</td><td style="padding:8px;text-align:right;color:#10b981;">'+fmt(total)+'</td><td></td></tr>';
        html2 += '</table>';
        el.innerHTML = html2;
        let elNom = document.getElementById('set_nominal_iuran');
        if (elNom) elNom.value = total;
    };

    window.tambahJenisIuran = function() {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        ji.push({nama:'Jenis Baru',nominal:0});
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        renderJenisIuran();
    };

    window.hapusJenisIuran = function(idx) {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        ji.splice(idx, 1);
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        renderJenisIuran();
    };

    window.updateJenisIuran = function(idx, field, val) {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        ji[idx][field] = val;
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        let elNom = document.getElementById('set_nominal_iuran');
        let total = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
        if (elNom) elNom.value = total;
    };
"""

# Sisipkan sebelum </script> terakhir
last_script = html.rfind('</script>')
if last_script == -1:
    print('GAGAL: </script> tidak ditemukan!')
    exit(1)
html = html[:last_script] + NEW_JS + html[last_script:]
count += 1
print('OK: Fungsi JS baru ditambahkan')

with open(file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nSelesai! {count} patches berhasil.')
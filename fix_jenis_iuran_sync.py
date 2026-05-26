FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK: {label}")

# PATCH 1: updateJenisIuran — tambah sync db_settings.nominalIuran
patch("updateJenisIuran sync nominal",
"""    window.updateJenisIuran = function(idx, field, val) {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        ji[idx][field] = val;
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        let elNom = document.getElementById('set_nominal_iuran');
        let total = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
        if (elNom) elNom.value = total;
    };""",
"""    window.updateJenisIuran = function(idx, field, val) {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        ji[idx][field] = val;
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        let total = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
        // Sync ke db_settings.nominalIuran otomatis
        let dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        dbSettings.nominalIuran = total;
        localStorage.setItem('db_settings', JSON.stringify(dbSettings));
        let elNom = document.getElementById('set_nominal_iuran');
        if (elNom) elNom.value = total;
        renderJenisIuran();
    };""")

# PATCH 2: hapusJenisIuran — tambah sync db_settings.nominalIuran
patch("hapusJenisIuran sync nominal",
"""    window.hapusJenisIuran = function(idx) {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        ji.splice(idx, 1);
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        renderJenisIuran();
    };""",
"""    window.hapusJenisIuran = function(idx) {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        ji.splice(idx, 1);
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        // Sync ke db_settings.nominalIuran otomatis
        let total = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
        let dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        dbSettings.nominalIuran = total;
        localStorage.setItem('db_settings', JSON.stringify(dbSettings));
        renderJenisIuran();
        Swal.fire({toast:true, position:'top-end', icon:'success', title:'Komponen dihapus. Total iuran: '+fmt(total), showConfirmButton:false, timer:2000});
    };""")

# PATCH 3: tambahJenisIuran — tambah sync db_settings.nominalIuran
patch("tambahJenisIuran sync nominal",
"""    window.tambahJenisIuran = function() {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        ji.push({nama:'Jenis Baru',nominal:0});
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        renderJenisIuran();
    };""",
"""    window.tambahJenisIuran = function() {
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        ji.push({nama:'Jenis Baru',nominal:0});
        localStorage.setItem('db_jenis_iuran', JSON.stringify(ji));
        let total = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
        let dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        dbSettings.nominalIuran = total;
        localStorage.setItem('db_settings', JSON.stringify(dbSettings));
        renderJenisIuran();
    };""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
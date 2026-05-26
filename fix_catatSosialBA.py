FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Line 7791 (index 7790) terpotong, line 7792 (index 7791) kosong
# Ganti line 7791 dengan versi lengkap + tutup fungsi
# lalu hapus line 7792 yang kosong

OLD_791 = "        var iuranBln = dbIuran.filter(function(x){ return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()&&String\n"

NEW_791 = (
    "        var iuranBln = dbIuran.filter(function(x){ return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()&&String(x.idWarga); });\n"
    "        var totalSosial = iuranBln.reduce(function(s,x){ var ji2=getJenisIuranMap(); return s+(ji2.sosial||0); },0);\n"
    "        var sKey2 = 'setor_sosial_'+periode.replace(/ /g,'_');\n"
    "        localStorage.setItem(sKey2, JSON.stringify({tgl:new Date().toISOString(),nominal:totalSosial}));\n"
    "        var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');\n"
    "        dbKas.push({id:Date.now(),tgl:new Date().toISOString().split('T')[0],uraian:'Dana Sosial Arisan '+bulanNama+' '+tahunSkg,tipe:'masuk',nominal:totalSosial});\n"
    "        localStorage.setItem('db_kas',JSON.stringify(dbKas));\n"
    "        localStorage.setItem('ts_kas',new Date().toISOString());\n"
    "        if(typeof syncSemuaData==='function') syncSemuaData(true);\n"
    "        Toast.fire({icon:'success',title:'Dana Sosial dicatat ke BA & Kas'});\n"
    "        if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();\n"
    "    };\n"
)

found = False
for i, line in enumerate(lines):
    if line == OLD_791:
        lines[i] = NEW_791
        # Hapus line kosong setelahnya (index i+1)
        if i+1 < len(lines) and lines[i+1].strip() == '':
            lines.pop(i+1)
        found = True
        print("OK: catatSosialBA diperbaiki")
        break

if not found:
    print("GAGAL: string tidak ditemukan!")
    exit(1)

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Selesai!")
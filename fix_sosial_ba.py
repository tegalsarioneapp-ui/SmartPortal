FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """        var iuranBln = dbIuran.filter(function(x){ return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()&&String(x.idWarga); });
        var totalSosial = iuranBln.reduce(function(s,x){ var ji2=getJenisIuranMap(); return s+(ji2.sosial||0); },0);
        var sKey2 = 'setor_sosial_'+periode.replace(/ /g,'_');
        localStorage.setItem(sKey2, JSON.stringify({tgl:new Date().toISOString(),nominal:totalSosial}));
        var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
        dbKas.push({id:Date.now(),tgl:new Date().toISOString().split('T')[0],uraian:'Dana Sosial Arisan '+bulanNama+' '+tahunSkg,tipe:'masuk',nominal:totalSosial});
        localStorage.setItem('db_kas',JSON.stringify(dbKas));
        localStorage.setItem('ts_kas',new Date().toISOString());
        if(typeof syncSemuaData==='function') syncSemuaData(true);
        Toast.fire({icon:'success',title:'Dana Sosial dicatat ke BA & Kas'});
        if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();
    };"""

NEW = """        var iuranBln = dbIuran.filter(function(x){
            return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()
                && String(x.tahun||tahunSkg)===String(tahunSkg);
        });
        var nomSosial = 0;
        ji.forEach(function(j){
            if((j.nama||'').toLowerCase().indexOf('sosial')!==-1) nomSosial = j.nominal||0;
        });
        var totalSosial = iuranBln.length * nomSosial;
        var sKey2 = 'setor_sosial_'+periode.replace(/ /g,'_');
        localStorage.setItem(sKey2, JSON.stringify({
            tgl     : new Date().toISOString(),
            nominal : totalSosial,
            jumlah  : iuranBln.length
        }));
        if(typeof syncSemuaData==='function') syncSemuaData(true);
        Toast.fire({icon:'success',title:'Dana Sosial dicatat di BA (tidak masuk Kas Utama)'});
        if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();
    };"""

if OLD not in html:
    print("GAGAL: string lama tidak ditemukan")
    exit(1)

html = html.replace(OLD, NEW, 1)
with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("OK: catatSosialBA diperbaiki - sosial tidak masuk kas utama")
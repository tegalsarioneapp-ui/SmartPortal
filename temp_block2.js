
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
            html2 += '<td style="padding:8px;"><input type="text" value="'+j.nama+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;" onchange="updateJenisIuran('+i+',\'nama\',this.value)"></td>';
            html2 += '<td style="padding:8px;"><input type="number" value="'+j.nominal+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;text-align:right;" onchange="updateJenisIuran('+i+',\'nominal\',parseInt(this.value)||0)"></td>';
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
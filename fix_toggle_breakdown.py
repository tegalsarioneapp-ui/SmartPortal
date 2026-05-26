FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """        // Breakdown
        var dbJenis = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        var elBreak = document.getElementById('iuran-breakdown-display');
        if (elBreak && dbJenis.length > 0 && allChecked.length > 0) {
            var breakHtml = dbJenis.map(function(j) {
                return j.nama + ': Rp ' + (Number(j.nominal) * allChecked.length).toLocaleString('id-ID');
            }).join(' &nbsp;|&nbsp; ');
            elBreak.innerHTML = breakHtml;
        } else if (elBreak) {
            elBreak.innerText = '';
        }
    };"""

NEW = """        // Breakdown — pisah periode lama vs terbaru
        var elBreak = document.getElementById('iuran-breakdown-display');
        if (elBreak && allChecked.length > 0) {
            var periodeLama = ['September 2025','Oktober 2025','November 2025','Desember 2025',
                'Januari 2026','Februari 2026','Maret 2026','April 2026','Mei 2026'];
            var jumlahLama = 0, jumlahBaru = 0;
            allChecked.forEach(function(el2) {
                var b = el2.getAttribute('data-bulan');
                if (periodeLama.indexOf(b) !== -1) jumlahLama++;
                else jumlahBaru++;
            });
            var parts = [];
            if (jumlahLama > 0) {
                parts.push('<span style="color:#f59e0b;">⚠️ ' + jumlahLama + ' bulan historis × ' + fmt(20000) + ' = ' + fmt(jumlahLama * 20000) + '</span>');
            }
            if (jumlahBaru > 0) {
                var dbJenis = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
                var nomBaru = window.getNominalByBulan('Juni 2026');
                var breakDetail = dbJenis.length > 0
                    ? dbJenis.map(function(j){ return j.nama+': '+fmt(j.nominal); }).join(', ')
                    : fmt(nomBaru);
                parts.push('<span style="color:#10b981;">✅ ' + jumlahBaru + ' bulan terbaru × ' + fmt(nomBaru) + ' = ' + fmt(jumlahBaru * nomBaru) + '</span><br><small style="color:#64748b;">' + breakDetail + '</small>');
            }
            elBreak.innerHTML = parts.join('<br>');
        } else if (elBreak) {
            elBreak.innerText = '';
        }
    };"""

if OLD not in html:
    print("GAGAL: anchor tidak ditemukan")
    exit(1)

html = html.replace(OLD, NEW, 1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: fix breakdown toggleBulanIuran pisah periode lama vs terbaru")
print("✅ Patch selesai!")
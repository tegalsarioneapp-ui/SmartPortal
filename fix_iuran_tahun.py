FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        return False
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK: {label}")
    return True

# ═══ PATCH 1: Tambah selector tahun di HTML atas grid bulan ═══
patch("Tambah selector tahun di HTML",
"""                    <div id="iuran-bulan-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;">
                        <!-- diisi loadBulanIuran() -->
                        <div style="text-align:center; color:var(--text-muted); padding:20px; grid-column:1/-1;">Pilih warga untuk melihat status bulan</div>
                    </div>""",
"""                    <!-- Selector Tahun -->
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                        <label style="font-size:0.85rem; font-weight:700; color:var(--text-muted); white-space:nowrap;"><i class="fa-solid fa-calendar"></i> Tahun:</label>
                        <select id="iuran-tahun-select" onchange="reloadBulanIuranTahun()" style="border:1px solid var(--border-color,#e2e8f0); border-radius:8px; padding:6px 12px; font-size:0.9rem; font-weight:700; background:var(--bg-light); color:var(--text-dark); cursor:pointer;">
                            <option value="2025">2025</option>
                            <option value="2026" selected>2026</option>
                            <option value="2027">2027</option>
                        </select>
                        <span style="font-size:0.78rem; color:var(--text-muted);">Pilih tahun iuran yang akan dicatat</span>
                    </div>
                    <div id="iuran-bulan-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;">
                        <!-- diisi loadBulanIuran() -->
                        <div style="text-align:center; color:var(--text-muted); padding:20px; grid-column:1/-1;">Pilih warga untuk melihat status bulan</div>
                    </div>""")

# ═══ PATCH 2: loadBulanIuran pakai tahun + format "Januari 2026" ═══
patch("loadBulanIuran pakai tahun",
"""    window.loadBulanIuran = function(w) {
        var grid = document.getElementById('iuran-bulan-grid');
        if (!grid) return;
        var dbIuran = window._iuranDbIuran || JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                     'Juli','Agustus','September','Oktober','November','Desember'];
        var html = '';
        var totalDipilih = 0;
        var jumlahDipilih = 0;

        BULAN.forEach(function(bulan) {
            var sudahBayar = dbIuran.some(function(x) {
                return String(x.idWarga) === String(w.id) && x.bulan === bulan && x.posted;
            });
            if (sudahBayar) {
                html += '<div style="padding:10px 6px; border-radius:10px; text-align:center; font-size:0.82rem; font-weight:700;' +
                    'background:#dcfce7; color:#166534; border:2px solid #86efac; cursor:not-allowed;">' +
                    '<i class="fa-solid fa-check"></i><br>' + bulan + '</div>';
            } else {
                html += '<div data-bulan="' + bulan + '" data-checked="false" onclick="toggleBulanIuran(this)" ' +
                    'style="padding:10px 6px; border-radius:10px; text-align:center; font-size:0.82rem; font-weight:700;' +
                    'background:var(--gt-surface,#f8fafc); color:var(--text-dark); border:2px solid #e2e8f0; cursor:pointer;' +
                    'transition:all 0.15s;">' +
                    bulan + '</div>';
            }
        });

        grid.innerHTML = html;

        // Reset total
        var elTotal = document.getElementById('iuran-total-display');
        if (elTotal) elTotal.innerText = 'Rp 0';
        var elBreak = document.getElementById('iuran-breakdown-display');
        if (elBreak) elBreak.innerText = '';
    };""",
"""    window.loadBulanIuran = function(w) {
        var grid = document.getElementById('iuran-bulan-grid');
        if (!grid) return;
        var dbIuran = window._iuranDbIuran || JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var selTahun = document.getElementById('iuran-tahun-select');
        var tahun = selTahun ? selTahun.value : String(new Date().getFullYear());
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                     'Juli','Agustus','September','Oktober','November','Desember'];
        var html = '';

        BULAN.forEach(function(bulan) {
            var bulanTahun = bulan + ' ' + tahun;  // format: "Januari 2026"
            var sudahBayar = dbIuran.some(function(x) {
                return String(x.idWarga) === String(w.id) && x.bulan === bulanTahun && x.posted;
            });
            var nominal = window.getNominalByBulan(bulanTahun);
            if (sudahBayar) {
                html += '<div style="padding:10px 6px; border-radius:10px; text-align:center; font-size:0.82rem; font-weight:700;' +
                    'background:#dcfce7; color:#166534; border:2px solid #86efac; cursor:not-allowed;" title="Sudah lunas">' +
                    '<i class="fa-solid fa-check"></i><br>' + bulan + '<br>' +
                    '<span style="font-size:0.7rem; font-weight:600;">'+fmt(nominal)+'</span></div>';
            } else {
                html += '<div data-bulan="' + bulanTahun + '" data-checked="false" onclick="toggleBulanIuran(this)" ' +
                    'style="padding:10px 6px; border-radius:10px; text-align:center; font-size:0.82rem; font-weight:700;' +
                    'background:var(--gt-surface,#f8fafc); color:var(--text-dark); border:2px solid #e2e8f0; cursor:pointer;' +
                    'transition:all 0.15s;">' +
                    bulan + '<br>' +
                    '<span style="font-size:0.7rem; color:#64748b; font-weight:600;">'+fmt(nominal)+'</span></div>';
            }
        });

        grid.innerHTML = html;

        // Reset total
        var elTotal = document.getElementById('iuran-total-display');
        if (elTotal) elTotal.innerText = 'Rp 0';
        var elBreak = document.getElementById('iuran-breakdown-display');
        if (elBreak) elBreak.innerText = '';
    };

    // Reload grid saat tahun berubah
    window.reloadBulanIuranTahun = function() {
        if (window._iuranWargaTerpilih) {
            window.loadBulanIuran(window._iuranWargaTerpilih);
        }
    };""")

# ═══ PATCH 3: toggleBulanIuran hitung nominal per bulan ═══
patch("toggleBulanIuran nominal per bulan",
"""    window.toggleBulanIuran = function(el) {
        var checked = el.getAttribute('data-checked') === 'true';
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;

        if (checked) {
            el.setAttribute('data-checked', 'false');
            el.style.background = 'var(--gt-surface,#f8fafc)';
            el.style.borderColor = '#e2e8f0';
            el.style.color = 'var(--text-dark)';
        } else {
            el.setAttribute('data-checked', 'true');
            el.style.background = 'var(--primary-blue)';
            el.style.borderColor = 'var(--primary-blue)';
            el.style.color = '#fff';
        }

        // Hitung total
        var allChecked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        var total = allChecked.length * nominalIuran;
        var elTotal = document.getElementById('iuran-total-display');
        if (elTotal) elTotal.innerText = 'Rp ' + total.toLocaleString('id-ID');""",
"""    window.toggleBulanIuran = function(el) {
        var checked = el.getAttribute('data-checked') === 'true';

        if (checked) {
            el.setAttribute('data-checked', 'false');
            el.style.background = 'var(--gt-surface,#f8fafc)';
            el.style.borderColor = '#e2e8f0';
            el.style.color = 'var(--text-dark)';
        } else {
            el.setAttribute('data-checked', 'true');
            el.style.background = 'var(--primary-blue)';
            el.style.borderColor = 'var(--primary-blue)';
            el.style.color = '#fff';
        }

        // Hitung total — nominal per bulan (historis vs terbaru)
        var allChecked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        var total = 0;
        allChecked.forEach(function(el2) {
            total += window.getNominalByBulan(el2.getAttribute('data-bulan'));
        });
        var elTotal = document.getElementById('iuran-total-display');
        if (elTotal) elTotal.innerText = fmt(total);""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n{'✅' if count==3 else '⚠️'} {count}/3 patch selesai!")
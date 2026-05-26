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

# ═══ PATCH 1: Tambah toggle override nominal di HTML ═══
patch("Tambah override nominal di HTML",
"""                    <div style="background:var(--bg-light); border-radius:10px; padding:14px; margin-bottom:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Total Pembayaran:</span>
                            <span id="iuran-total-display" style="font-size:1.4rem; font-weight:800; color:var(--accent-gold);">Rp 0</span>
                        </div>
                        <div id="iuran-breakdown-display" style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;"></div>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <button class="btn-submit bg-gold" style="flex:1;" onclick="simpanIuranKolektifBaru()">
                            <i class="fa-solid fa-save"></i> Catat Pembayaran
                        </button>
                        <button class="btn-submit" style="width:auto; background:#64748b;" onclick="resetPilihWargaIuran()">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>""",
"""                    <!-- Override Nominal -->
                    <div style="background:var(--bg-light); border-radius:10px; padding:12px 14px; margin-bottom:10px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0;">
                            <input type="checkbox" id="iuran-override-check" onchange="toggleOverrideNominal()" style="width:16px;height:16px;cursor:pointer;">
                            Override Nominal Manual
                            <span style="font-size:0.75rem; font-weight:400; color:#94a3b8;">(untuk data historis/khusus)</span>
                        </label>
                        <div id="iuran-override-wrap" style="display:none; margin-top:10px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:0.85rem; color:var(--text-muted); white-space:nowrap;">Rp</span>
                                <input type="number" id="iuran-override-nominal" min="0" step="1000"
                                    placeholder="Contoh: 20000"
                                    oninput="hitungTotalOverride()"
                                    style="flex:1; border:2px solid #f59e0b; border-radius:8px; padding:8px 12px;
                                           font-size:1rem; font-weight:700; color:var(--text-dark);
                                           background:var(--bg-card,#fff); outline:none;">
                            </div>
                            <div style="font-size:0.75rem; color:#f59e0b; margin-top:6px;">
                                ⚠️ Nominal ini berlaku untuk <b>semua bulan</b> yang dipilih
                            </div>
                        </div>
                    </div>

                    <div style="background:var(--bg-light); border-radius:10px; padding:14px; margin-bottom:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Total Pembayaran:</span>
                            <span id="iuran-total-display" style="font-size:1.4rem; font-weight:800; color:var(--accent-gold);">Rp 0</span>
                        </div>
                        <div id="iuran-breakdown-display" style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;"></div>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <button class="btn-submit bg-gold" style="flex:1;" onclick="simpanIuranKolektifBaru()">
                            <i class="fa-solid fa-save"></i> Catat Pembayaran
                        </button>
                        <button class="btn-submit" style="width:auto; background:#64748b;" onclick="resetPilihWargaIuran()">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>""")

# ═══ PATCH 2: Tambah fungsi toggleOverrideNominal + hitungTotalOverride ═══
patch("Tambah fungsi override nominal",
"""    window.reloadBulanIuranTahun = function() {
        if (window._iuranWargaTerpilih) {
            window.loadBulanIuran(window._iuranWargaTerpilih);
        }
    };""",
"""    window.reloadBulanIuranTahun = function() {
        if (window._iuranWargaTerpilih) {
            window.loadBulanIuran(window._iuranWargaTerpilih);
        }
    };

    window.toggleOverrideNominal = function() {
        var chk  = document.getElementById('iuran-override-check');
        var wrap = document.getElementById('iuran-override-wrap');
        if (!chk || !wrap) return;
        wrap.style.display = chk.checked ? 'block' : 'none';
        if (!chk.checked) {
            // Kembali ke hitung otomatis
            var allChecked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
            var total = 0;
            allChecked.forEach(function(el) {
                total += window.getNominalByBulan(el.getAttribute('data-bulan'));
            });
            var elTotal = document.getElementById('iuran-total-display');
            if (elTotal) elTotal.innerText = fmt(total);
        } else {
            window.hitungTotalOverride();
        }
    };

    window.hitungTotalOverride = function() {
        var nomInput = document.getElementById('iuran-override-nominal');
        var elTotal  = document.getElementById('iuran-total-display');
        var elBreak  = document.getElementById('iuran-breakdown-display');
        if (!nomInput || !elTotal) return;
        var nom = parseInt(nomInput.value) || 0;
        var allChecked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        var jumlah = allChecked.length;
        var total  = nom * jumlah;
        elTotal.innerText = fmt(total);
        if (elBreak) {
            elBreak.innerHTML = jumlah > 0
                ? '<span style="color:#f59e0b;">⚠️ Override: ' + fmt(nom) + ' × ' + jumlah + ' bulan = ' + fmt(total) + '</span>'
                : '';
        }
    };""")

# ═══ PATCH 3: simpanIuranKolektifBaru cek override ═══
patch("simpanIuranKolektifBaru cek override nominal",
"""        bulanDipilih.forEach(function(bulan, idx) {
            // Nominal dinamis per bulan — historis 20rb, terbaru dari settings
            var nominalIuran = window.getNominalByBulan(bulan);
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });""",
"""        // Cek override nominal
        var overrideChk = document.getElementById('iuran-override-check');
        var overrideNom = document.getElementById('iuran-override-nominal');
        var pakaiOverride = overrideChk && overrideChk.checked && overrideNom && parseInt(overrideNom.value) > 0;
        var nominalOverride = pakaiOverride ? parseInt(overrideNom.value) : 0;

        if (pakaiOverride) {
            var konfirmasiOverride = await Swal.fire({
                title: 'Konfirmasi Override Nominal',
                html: '<div style="text-align:left; font-size:0.9rem;">' +
                      '<b>Nominal override:</b> ' + fmt(nominalOverride) + '/bulan<br>' +
                      '<b>Jumlah bulan:</b> ' + bulanDipilih.length + ' bulan<br>' +
                      '<b>Total:</b> ' + fmt(nominalOverride * bulanDipilih.length) + '<br><br>' +
                      '<span style="color:#f59e0b; font-size:0.85rem;">⚠️ Nominal ini akan digunakan untuk semua bulan yang dipilih, ' +
                      'menggantikan nominal otomatis per periode.</span></div>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Gunakan Override',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#f59e0b'
            });
            if (!konfirmasiOverride.isConfirmed) return;
        }

        bulanDipilih.forEach(function(bulan, idx) {
            // Nominal: override manual atau otomatis per periode
            var nominalIuran = pakaiOverride ? nominalOverride : window.getNominalByBulan(bulan);
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count}/3 patch selesai!")
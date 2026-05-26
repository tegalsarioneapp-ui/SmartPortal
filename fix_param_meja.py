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

# ── PATCH 1: Tambah input iuranMeja di form Parameter Pertemuan ──
patch('Input iuranMeja di form',
'                                <small style="color:var(--text-muted);font-size:0.75rem;">Jumlah yang disetor ke tuan rumah setiap pertemuan</small>',
'''                                <small style="color:var(--text-muted);font-size:0.75rem;">Jumlah yang disetor ke tuan rumah setiap pertemuan (bisa berubah sesuai kesepakatan)</small>''')

patch('Tambah field iuran wajib meja',
'                            <div class="form-group" style="margin:0;">\n                                <label style="font-weight:700;font-size:0.85rem;">\n                                    <i class="fa-solid fa-lock" style="color:#6366f1;"></i>\n                                    PIN Bendahara Pembantu (4 digit)',
'''                            <div class="form-group" style="margin:0;">
                                <label style="font-weight:700;font-size:0.85rem;">
                                    <i class="fa-solid fa-coins" style="color:#10b981;"></i>
                                    Iuran Wajib Uang Meja per Warga (Rp)
                                </label>
                                <input type="number" id="set_iuran_meja" placeholder="5000"
                                    style="padding:10px 12px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:10px;font-size:0.95rem;width:100%;background:var(--bg-card,#fff);color:var(--text-dark,#1e293b);">
                                <small style="color:var(--text-muted);font-size:0.75rem;">Iuran wajib per warga setiap pertemuan RT (bisa berubah sesuai kesepakatan)</small>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-weight:700;font-size:0.85rem;">
                                    <i class="fa-solid fa-lock" style="color:#6366f1;"></i>
                                    PIN Bendahara Pembantu (4 digit)''')

# ── PATCH 2: Simpan iuranMeja di fungsi simpan parameter ──
patch('Simpan iuranMeja',
'        param.targetUangMeja = targetMeja;',
'''        param.targetUangMeja = targetMeja;
        var iuranMeja = parseInt(document.getElementById('set_iuran_meja').value) || 5000;
        param.iuranMeja = iuranMeja;''')

# ── PATCH 3: Load iuranMeja di loadPengaturan ──
patch('Load iuranMeja di loadPengaturan',
"        if(document.getElementById('set_target_uang_meja')) document.getElementById('set_target_uang_meja').value = param.targetUangMeja || 250000;",
"""        if(document.getElementById('set_target_uang_meja')) document.getElementById('set_target_uang_meja').value = param.targetUangMeja || 250000;
        if(document.getElementById('set_iuran_meja')) document.getElementById('set_iuran_meja').value = param.iuranMeja || 5000;""")

# ── PATCH 4: loadAnalisaUangMeja pakai param.iuranMeja ──
patch('loadAnalisaUangMeja pakai iuranMeja dinamis',
'        var ji = JSON.parse(localStorage.getItem(\'db_jenis_iuran\')||\'null\');',
"""        var param   = JSON.parse(localStorage.getItem('db_param_pertemuan')||'{}');
        var iuranMejaPerWarga = param.iuranMeja || 5000;
        var ji = JSON.parse(localStorage.getItem('db_jenis_iuran')||'null');""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\\n✅ Semua {count} patch selesai!")
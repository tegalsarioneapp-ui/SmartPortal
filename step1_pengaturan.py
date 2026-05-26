FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# ══════════════════════════════════════════════════════════
# PATCH 1: Tambah ACC baru "Pertemuan RT" di HTML Pengaturan
# ══════════════════════════════════════════════════════════
OLD_ACC = '            <!-- ACC 3: GANTI PASSWORD -->'
NEW_ACC = '''            <!-- ACC 2b: PARAMETER PERTEMUAN RT -->
            <div class="acc-card">
                <div class="acc-header" onclick="toggleAcc('acc-pertemuan-param',this)">
                    <span><i class="fa-solid fa-people-roof" style="color:#f59e0b;margin-right:8px;"></i> Parameter Pertemuan RT</span>
                    <i class="fa-solid fa-chevron-down acc-chevron"></i>
                </div>
                <div class="acc-body" id="acc-pertemuan-param">
                    <div class="acc-body-inner">
                        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px;">
                            <i class="fa-solid fa-circle-info" style="color:#3b82f6;"></i>
                            Atur target uang meja tuan rumah dan PIN Bendahara Pembantu. Kedua nilai ini bisa diubah sewaktu-waktu sesuai kesepakatan warga.
                        </p>
                        <div class="form-grid" style="gap:14px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-weight:700;font-size:0.85rem;">
                                    <i class="fa-solid fa-mug-hot" style="color:#f59e0b;"></i>
                                    Target Uang Meja Tuan Rumah (Rp)
                                </label>
                                <input type="number" id="set_target_uang_meja" placeholder="250000"
                                    style="padding:10px 12px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:10px;font-size:0.95rem;width:100%;background:var(--bg-card,#fff);color:var(--text-dark,#1e293b);">
                                <small style="color:var(--text-muted);font-size:0.75rem;">Jumlah yang disetor ke tuan rumah setiap pertemuan</small>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-weight:700;font-size:0.85rem;">
                                    <i class="fa-solid fa-lock" style="color:#6366f1;"></i>
                                    PIN Bendahara Pembantu (4 digit)
                                </label>
                                <div style="position:relative;">
                                    <input type="password" id="set_pin_ben_pembantu" placeholder="••••"
                                        maxlength="4" pattern="[0-9]{4}" inputmode="numeric"
                                        style="padding:10px 40px 10px 12px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:10px;font-size:1.1rem;letter-spacing:6px;width:100%;background:var(--bg-card,#fff);color:var(--text-dark,#1e293b);">
                                    <button onclick="togglePinVisibility('set_pin_ben_pembantu','icon-pin-eye')"
                                        type="button"
                                        style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;">
                                        <i id="icon-pin-eye" class="fa-solid fa-eye-slash"></i>
                                    </button>
                                </div>
                                <small style="color:var(--text-muted);font-size:0.75rem;">Dipakai Bendahara Pembantu untuk akses menu Pertemuan RT</small>
                            </div>
                        </div>
                        <div style="background:var(--bg-light,#f8fafc);border:1px solid var(--border-color,#e2e8f0);border-radius:10px;padding:12px 14px;margin-top:14px;font-size:0.8rem;color:var(--text-muted);">
                            <i class="fa-solid fa-shield-halved" style="color:#10b981;"></i>
                            <strong>Catatan keamanan:</strong> PIN tidak ditampilkan setelah disimpan. Catat PIN sebelum menekan simpan.
                        </div>
                        <button class="btn-submit bg-blue" style="margin-top:16px;width:100%;" onclick="simpanParameterPertemuan()">
                            <i class="fa-solid fa-floppy-disk"></i> Simpan Parameter Pertemuan
                        </button>
                    </div>
                </div>
            </div>

            <!-- ACC 3: GANTI PASSWORD -->'''

# ══════════════════════════════════════════════════════════
# PATCH 2: Update simpanPengaturanSistem — tambah field baru
# ══════════════════════════════════════════════════════════
OLD_SIMPAN = '''    window.simpanPengaturanSistem = function() {
        let settings = {
            namaRT: document.getElementById('set_nama_rt').value || "Bapak Kasimin",
            namaRW: document.getElementById('set_nama_rw').value || "Bapak Mulyono",
            namaBen: document.getElementById('set_nama_ben').value || "Bapak Parmin",
            nomIuran: parseInt(document.getElementById('set_nominal_iuran').value) || 20000,
            bungaKop: parseInt(document.getElementById('set_bunga_kop').value) || 10
        };
        localStorage.setItem('db_settings', JSON.stringify(settings)); if (typeof syncSemuaData === 'function') syncSemuaData(true); Swal.fire('Berhasil', 'Parameter sistem diperbarui.', 'success');
    };'''

NEW_SIMPAN = '''    window.simpanPengaturanSistem = function() {
        let settings = {
            namaRT: document.getElementById('set_nama_rt').value || "Bapak Kasimin",
            namaRW: document.getElementById('set_nama_rw').value || "Bapak Mulyono",
            namaBen: document.getElementById('set_nama_ben').value || "Bapak Parmin",
            nomIuran: parseInt(document.getElementById('set_nominal_iuran').value) || 20000,
            bungaKop: parseInt(document.getElementById('set_bunga_kop').value) || 10
        };
        localStorage.setItem('db_settings', JSON.stringify(settings));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);
        Swal.fire('Berhasil', 'Parameter sistem diperbarui.', 'success');
    };

    // ── Parameter Pertemuan RT (target meja + PIN ben pembantu) ──
    window.simpanParameterPertemuan = function() {
        let targetMeja = parseInt(document.getElementById('set_target_uang_meja').value);
        let pin        = (document.getElementById('set_pin_ben_pembantu').value || '').trim();

        if (!targetMeja || targetMeja < 1000) {
            return Swal.fire('Periksa Input', 'Target uang meja harus diisi dan minimal Rp 1.000.', 'warning');
        }
        if (pin && (!/^[0-9]{4}$/.test(pin))) {
            return Swal.fire('PIN Tidak Valid', 'PIN harus 4 digit angka.', 'warning');
        }

        let param = JSON.parse(localStorage.getItem('db_param_pertemuan') || '{}');
        param.targetUangMeja = targetMeja;
        if (pin) param.pinBenPembantu = pin;

        localStorage.setItem('db_param_pertemuan', JSON.stringify(param));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);

        // Reset field PIN setelah simpan (keamanan)
        document.getElementById('set_pin_ben_pembantu').value = '';

        Swal.fire({
            icon: 'success',
            title: 'Parameter Disimpan!',
            html: `Target Uang Meja: <b>Rp ${targetMeja.toLocaleString('id-ID')}</b><br>` +
                  (pin ? '<span style="color:#10b981;"><i class="fa-solid fa-check"></i> PIN Bendahara Pembantu diperbarui</span>' : 'PIN tidak diubah'),
            confirmButtonColor: '#6366f1'
        });
    };

    // ── Toggle visibility PIN input ──
    window.togglePinVisibility = function(inputId, iconId) {
        let inp  = document.getElementById(inputId);
        let icon = document.getElementById(iconId);
        if (!inp) return;
        if (inp.type === 'password') {
            inp.type = 'text';
            if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
        } else {
            inp.type = 'password';
            if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
        }
    };'''

# ══════════════════════════════════════════════════════════
# PATCH 3: Update loadPengaturan — load nilai target meja
# ══════════════════════════════════════════════════════════
OLD_LOAD = '''        if(typeof renderJenisIuran === 'function') renderJenisIuran();
        if(document.getElementById('set_bunga_kop')) document.getElementById('set_bunga_kop').value = s.bungaKop;'''

NEW_LOAD = '''        if(typeof renderJenisIuran === 'function') renderJenisIuran();
        if(document.getElementById('set_bunga_kop')) document.getElementById('set_bunga_kop').value = s.bungaKop;

        // Load parameter pertemuan
        let _param = JSON.parse(localStorage.getItem('db_param_pertemuan') || '{}');
        let _elMeja = document.getElementById('set_target_uang_meja');
        let _elPin  = document.getElementById('set_pin_ben_pembantu');
        if (_elMeja) _elMeja.value = _param.targetUangMeja || 250000;
        if (_elPin)  { _elPin.value = ''; _elPin.placeholder = _param.pinBenPembantu ? '••••  (sudah diset)' : 'Belum diset'; }'''

# Apply patches
errors = []
for label, old, new in [
    ("ACC Parameter Pertemuan", OLD_ACC, NEW_ACC),
    ("simpanPengaturanSistem + simpanParameterPertemuan", OLD_SIMPAN, NEW_SIMPAN),
    ("loadPengaturan + load param", OLD_LOAD, NEW_LOAD),
]:
    if old in html:
        html = html.replace(old, new, 1)
        print(f"OK: {label}")
    else:
        errors.append(label)
        print(f"GAGAL: {label}")

if errors:
    print(f"\nGAGAL total: {len(errors)} patch — cek manual!")
else:
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(html)
    print("\nOK: Semua patch berhasil! File disimpan.")
file = 'artifacts/smart-portal-rt/index.html'
with open(file, 'r', encoding='utf-8') as f:
    html = f.read()

def patch(label, old, new):
    global html
    if old not in html:
        print(f'GAGAL: {label}')
        exit(1)
    html = html.replace(old, new, 1)
    print(f'OK: {label}')

patch('ACC 2 Password',
'''            <!-- ===== KARTU GANTI PASSWORD SISTEM ===== -->
            <div class="card" style="margin-top:0;border-top:4px solid #ef4444;">
                <div class="card-title-header" style="margin-bottom:4px;">
                    <h3><i class="fa-solid fa-key" style="color:#ef4444;"></i> Ganti Password Sistem</h3>
                </div>
                <p style="font-size:0.83rem;color:#64748b;margin-bottom:16px;">Ubah password default login petugas. Kosongkan field yang tidak ingin diubah. Password tersimpan di server dan berlaku di semua perangkat.</p>
                <div class="form-grid" style="gap:12px;">
                    <div class="form-group">
                        <label><i class="fa-solid fa-user-shield" style="color:#6366f1;"></i> Password Admin</label>
                        <input type="password" id="set_pw_admin" placeholder="(default: admin005)" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-vault" style="color:#f59e0b;"></i> Password Bendahara</label>
                        <input type="password" id="set_pw_bendahara" placeholder="(default: benda005)" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-handshake" style="color:#10b981;"></i> Password Koperasi</label>
                        <input type="password" id="set_pw_koperasi" placeholder="(default: koperasi005)" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-users" style="color:#3b82f6;"></i> Password Warga (akses umum)</label>
                        <input type="password" id="set_pw_warga" placeholder="(default: rt005)" autocomplete="new-password">
                    </div>
                </div>
                <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:10px 14px;margin:12px 0;font-size:0.8rem;color:#78350f;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Catat password baru sebelum menyimpan. Jika lupa, hubungi pengembang untuk reset.
                </div>
                <button class="btn-submit" style="background:#ef4444;" onclick="simpanPasswordSistem()"><i class="fa-solid fa-floppy-disk"></i> Simpan Password Baru</button>
            </div>''',
'''
            <!-- ACC 2: PASSWORD -->
            <div class="acc-card">
                <div class="acc-header" onclick="toggleAcc('acc-password',this)">
                    <span><i class="fa-solid fa-key" style="color:#ef4444;margin-right:8px;"></i> Keamanan &amp; Password Sistem</span>
                    <i class="fa-solid fa-chevron-down acc-chevron"></i>
                </div>
                <div class="acc-body" id="acc-password">
                    <div class="acc-body-inner">
                        <p style="font-size:0.83rem;color:#64748b;margin-bottom:16px;">Ubah password default login petugas. Kosongkan field yang tidak ingin diubah.</p>
                        <div class="form-grid" style="gap:12px;">
                            <div class="form-group">
                                <label><i class="fa-solid fa-user-shield" style="color:#6366f1;"></i> Password Admin</label>
                                <input type="password" id="set_pw_admin" placeholder="(default: admin005)" autocomplete="new-password">
                            </div>
                            <div class="form-group">
                                <label><i class="fa-solid fa-vault" style="color:#f59e0b;"></i> Password Bendahara</label>
                                <input type="password" id="set_pw_bendahara" placeholder="(default: benda005)" autocomplete="new-password">
                            </div>
                            <div class="form-group">
                                <label><i class="fa-solid fa-handshake" style="color:#10b981;"></i> Password Koperasi</label>
                                <input type="password" id="set_pw_koperasi" placeholder="(default: koperasi005)" autocomplete="new-password">
                            </div>
                            <div class="form-group">
                                <label><i class="fa-solid fa-users" style="color:#3b82f6;"></i> Password Warga</label>
                                <input type="password" id="set_pw_warga" placeholder="(default: rt005)" autocomplete="new-password">
                            </div>
                        </div>
                        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:10px 14px;margin:12px 0;font-size:0.8rem;color:#78350f;">
                            <i class="fa-solid fa-triangle-exclamation"></i> Catat password baru sebelum menyimpan.
                        </div>
                        <button class="btn-submit" style="background:#ef4444;" onclick="simpanPasswordSistem()"><i class="fa-solid fa-floppy-disk"></i> Simpan Password Baru</button>
                    </div>
                </div>
            </div>''')

with open(file, 'w', encoding='utf-8') as f:
    f.write(html)
print('Part 2 selesai!')
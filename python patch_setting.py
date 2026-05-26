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

patch('CSS Accordion',
'</style>',
'''<style>
.acc-card{border-radius:14px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.07);border:1px solid #e2e8f0;}
.acc-header{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;cursor:pointer;font-weight:700;font-size:0.95rem;background:var(--card-bg,#fff);transition:background 0.2s;user-select:none;}
.acc-header:hover{background:#f8fafc;}
.acc-header.open{border-bottom:1px solid #e2e8f0;}
.acc-chevron{transition:transform 0.3s;font-size:0.85rem;color:#94a3b8;}
.acc-header.open .acc-chevron{transform:rotate(180deg);}
.acc-body{max-height:0;overflow:hidden;transition:max-height 0.4s ease;}
.acc-body.expanded{max-height:9999px;}
.acc-body-inner{padding:16px;}
</style>
</style>''')

patch('ACC 1 Identitas Iuran',
'''            <div class="form-grid">
                <div class="card" style="border-top: 4px solid var(--accent-gold);">
                    <h3>Identitas Lingkungan</h3>
                    <div class="form-group"><label>Nama RT</label><input type="text" id="set_nama_rt"></div>
                    <div class="form-group"><label>Nama RW</label><input type="text" id="set_nama_rw"></div>
                    <div class="form-group"><label>Nama Bendahara</label><input type="text" id="set_nama_ben"></div>
                </div>
                <div class="card" style="border-top: 4px solid var(--success);">
                    <h3>Parameter</h3>
                    <div class="form-group"><label>Nominal Iuran (Rp)</label><input type="number" id="set_nominal_iuran" disabled style="background:#f1f5f9;color:#94a3b8;"></div>
                    <div class="form-group"><label>Bunga Koperasi (%)</label><input type="number" id="set_bunga_kop"></div>
                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
                <div class="card" style="border-top:4px solid #6366f1; margin-top:0;">
                  <h3><i class="fa-solid fa-list-check" style="color:#6366f1;"></i> Jenis Iuran</h3>
                  <p style="font-size:0.82rem;color:#64748b;margin-bottom:12px;">Atur komponen iuran bulanan. Total nominal otomatis dihitung.</p>
                  <div id="list-jenis-iuran" style="margin-bottom:12px;"></div>
                  <button class="btn-action bg-blue" style="width:100%;" onclick="tambahJenisIuran()"><i class="fa-solid fa-plus"></i> Tambah Jenis Iuran</button>
                </div>
            </div>''',
'''
            <!-- ACC 1: IDENTITAS & IURAN -->
            <div class="acc-card">
                <div class="acc-header open" onclick="toggleAcc('acc-identitas',this)">
                    <span><i class="fa-solid fa-house-circle-check" style="color:var(--accent-gold);margin-right:8px;"></i> Identitas Lingkungan &amp; Iuran</span>
                    <i class="fa-solid fa-chevron-down acc-chevron"></i>
                </div>
                <div class="acc-body expanded" id="acc-identitas">
                    <div class="acc-body-inner">
                        <div class="form-grid">
                            <div class="card" style="border-top:4px solid var(--accent-gold);margin:0;">
                                <h3>Identitas Lingkungan</h3>
                                <div class="form-group"><label>Nama RT</label><input type="text" id="set_nama_rt"></div>
                                <div class="form-group"><label>Nama RW</label><input type="text" id="set_nama_rw"></div>
                                <div class="form-group"><label>Nama Bendahara</label><input type="text" id="set_nama_ben"></div>
                                <div class="form-group"><label>Bunga Koperasi (%)</label><input type="number" id="set_bunga_kop"></div>
                                <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()"><i class="fa-solid fa-floppy-disk"></i> Simpan Pengaturan</button>
                            </div>
                            <div class="card" style="border-top:4px solid #6366f1;margin:0;">
                                <h3><i class="fa-solid fa-list-check" style="color:#6366f1;"></i> Jenis Iuran</h3>
                                <p style="font-size:0.82rem;color:#64748b;margin-bottom:12px;">Atur komponen iuran bulanan. Total nominal otomatis dihitung.</p>
                                <div id="list-jenis-iuran" style="margin-bottom:12px;"></div>
                                <button class="btn-action bg-blue" style="width:100%;" onclick="tambahJenisIuran()"><i class="fa-solid fa-plus"></i> Tambah Jenis Iuran</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>''')

with open(file, 'w', encoding='utf-8') as f:
    f.write(html)
print('Part 1 selesai!')
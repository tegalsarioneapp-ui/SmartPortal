FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = '''            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="card" style="margin-bottom:0; border-top: 5px solid var(--accent-gold); padding: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
                        <h3 style="margin:0; font-size:1.1rem;"><i class="fa-solid fa-mug-hot" style="color:var(--accent-gold);"></i> Pos Uang Meja (250k)</h3>
                        <div id="badge-status-meja"></div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 10px; margin-top: 15px;">
                        <div style="background:#f0fdf4; padding:15px; border-radius:12px; border:1px solid #bbf7d0; display:flex; justify-content:space-between; align-items:center;">
                            <div><div style="color:#166534; font-size:0.8rem; font-weight:bold;">TERKUMPUL</div><div id="tagih-meja-peserta" style="font-size:0.75rem; color:#15803d; font-weight:bold;">0 Orang</div></div>
                            <div id="tagih-meja-terkumpul" style="font-size:1.5rem; font-weight:900; color:#15803d;">Rp 0</div>
                        </div>
                        <div style="background:#fef2f2; padding:15px; border-radius:12px; border:1px solid #fecaca; display:flex; justify-content:space-between; align-items:center;">
                            <div style="color:#991b1b; font-size:0.8rem; font-weight:bold;">KEKURANGAN</div>
                            <div id="tagih-meja-kurang" style="font-size:1.5rem; font-weight:900; color:#b91c1c;">Rp 0</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-bottom:0; border-top: 5px solid var(--primary-blue); padding: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
                        <h3 style="margin:0; font-size:1.1rem;"><i class="fa-solid fa-person-digging" style="color:var(--primary-blue);"></i> Pos Pembangunan</h3>
                        <div id="badge-status-bangun"></div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 10px; margin-top: 15px;">
                        <div style="background:#f0f9ff; padding:15px; border-radius:12px; border:1px solid #bfdbfe; display:flex; justify-content:space-between; align-items:center;">
                            <div style="color:#1d4ed8; font-size:0.8rem; font-weight:bold;">TERKUMPUL</div>
                            <div id="tagih-bangun-terkumpul" style="font-size:1.5rem; font-weight:900; color:#1d4ed8;">Rp 0</div>
                        </div>
                        <div style="background:#fffbeb; padding:15px; border-radius:12px; border:1px solid #fde68a; display:flex; justify-content:space-between; align-items:center;">
                            <div style="color:#b45309; font-size:0.8rem; font-weight:bold;">BELUM MASUK</div>
                            <div id="tagih-bangun-kurang" style="font-size:1.5rem; font-weight:900; color:#b45309;">Rp 0</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-bottom:0; border-top: 5px solid var(--danger); padding: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
                        <h3 style="margin:0; font-size:1.1rem;"><i class="fa-solid fa-flag" style="color:var(--danger);"></i> Pos 17 Agustus</h3>
                        <div id="badge-status-agustus"></div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 10px; margin-top: 15px;">
                        <div style="background:#f0f9ff; padding:15px; border-radius:12px; border:1px solid #bfdbfe; display:flex; justify-content:space-between; align-items:center;">
                            <div style="color:#1d4ed8; font-size:0.8rem; font-weight:bold;">TERKUMPUL</div>
                            <div id="tagih-agustus-terkumpul" style="font-size:1.5rem; font-weight:900; color:#1d4ed8;">Rp 0</div>
                        </div>
                        <div style="background:#fffbeb; padding:15px; border-radius:12px; border:1px solid #fde68a; display:flex; justify-content:space-between; align-items:center;">
                            <div style="color:#b45309; font-size:0.8rem; font-weight:bold;">BELUM MASUK</div>
                            <div id="tagih-agustus-kurang" style="font-size:1.5rem; font-weight:900; color:#b45309;">Rp 0</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="border-top: 4px solid var(--success);">
                <div class="card-title-header" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin:0;" onclick="togglePenagihanList()">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <h3 style="margin:0;"><i class="fa-solid fa-users-viewfinder"></i> Daftar Penagihan Warga</h3>
                        <span style="font-size:0.85rem; background:#f1f5f9; padding:4px 10px; border-radius:20px; color:var(--text-muted);"><i class="fa-solid fa-hand-pointer"></i> Klik Buka/Tutup</span>
                    </div>
                    <i id="icon-toggle-penagihan" class="fa-solid fa-chevron-down" style="font-size:1.5rem; color:var(--primary-dark); transition:0.3s;"></i>
                </div>
                
                <div id="container-penagihan-list" style="display:none; margin-top:20px; border-top:2px solid #f1f5f9; padding-top:20px;">
                    <div style="margin-bottom:15px; position:relative;">
                        <i class="fa-solid fa-search" style="position:absolute; left:15px; top:15px; color:var(--text-muted);"></i>
                        <input type="text" id="search-tagihan" class="search-box" style="padding-left:40px; width:100%; max-width:350px; font-size:0.95rem; border-radius:30px;" placeholder="Cari nama warga..." onkeyup="cariTagihan()">
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr><th>Nama Warga</th><th>Rincian Iuran (20k)</th><th>Status Bayar</th><th style="text-align:center;">Tindakan</th></tr>
                            </thead>
                            <tbody id="tbody-daftar-warga-final"></tbody>
                        </table>
                    </div>
                </div>
            </div>'''

NEW = '''            <!-- ANALISA-WRAP: diisi oleh loadAnalisaUangMeja() -->
            <div id="analisa-wrap"></div>'''

if OLD not in html:
    print("GAGAL: String HTML lama tidak ditemukan!")
    exit(1)

html = html.replace(OLD, NEW, 1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: HTML kartu lama diganti analisa-wrap")
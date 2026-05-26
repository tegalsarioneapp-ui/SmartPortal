FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

old2 = """            <!-- Riwayat Hari Ini -->
            <div class="card" style="margin-top:18px; border-top:4px solid var(--primary-blue);">
                <div class="card-title-header"><h3><i class="fa-solid fa-clock-rotate-left"></i> Riwayat Iuran Hari Ini</h3></div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Warga</th><th>Bulan Dibayar</th><th>Nominal</th><th>Status</th></tr></thead>
                        <tbody id="tbody-iuran-hari-ini"></tbody>
                    </table>
                </div>
            </div>
        </div>"""

new2 = """            <!-- Riwayat Hari Ini -->
            <div class="card" style="margin-top:18px; border-top:4px solid var(--primary-blue);">
                <div class="card-title-header"><h3><i class="fa-solid fa-clock-rotate-left"></i> Riwayat Iuran Hari Ini</h3></div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Warga</th><th>Bulan Dibayar</th><th>Nominal</th><th>Status</th></tr></thead>
                        <tbody id="tbody-iuran-hari-ini"></tbody>
                    </table>
                </div>
            </div>

            <!-- Kurang Bayar -->
            <div class="card" style="margin-top:18px; border-top:4px solid #f59e0b;" id="card-kurang-bayar">
                <div class="card-title-header" style="flex-wrap:wrap; gap:8px;">
                    <h3><i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i> Daftar Kurang Bayar</h3>
                    <span style="font-size:0.78rem; color:#64748b; background:#fef9c3; border:1px solid #fde047; padding:4px 10px; border-radius:20px;">
                        Jan-Mei 2026 = Rp 20.000 &nbsp;|&nbsp; Jun 2026+ = Rp 25.000
                    </span>
                </div>
                <p style="font-size:0.82rem; color:#64748b; margin-bottom:12px;">
                    Warga yang membayar Rp 20.000 untuk bulan Jan-Mei 2026 — kurang Rp 5.000/bulan (komponen Uang Sosial).
                </p>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Warga</th><th>Bulan</th><th>Dibayar</th><th>Seharusnya</th><th>Kurang</th><th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-kurang-bayar">
                            <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">Memuat...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                    <button class="btn-action bg-gold" onclick="lunasiSemuaKurangBayar()">
                        <i class="fa-solid fa-check-double"></i> Lunasi Semua Kekurangan
                    </button>
                    <span id="kurang-bayar-total" style="font-size:0.85rem; color:#92400e; font-weight:700;"></span>
                </div>
            </div>
        </div>"""

if old2 in html:
    html = html.replace(old2, new2, 1)
    print("OK: PATCH 2 - card kurang bayar")
else:
    print("GAGAL: PATCH 2")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("PART 1B SELESAI")
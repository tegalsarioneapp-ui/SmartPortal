FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

old1 = """            <div class="card">
                <div class="card-title-header">
                    <h3><i class="fa-solid fa-list"></i> Riwayat Transaksi Kas</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr><th>Tanggal</th><th>Uraian</th><th>Tipe</th><th>Nominal / Saldo</th><th>Aksi</th></tr>
                        </thead>
                        <tbody id="tbody-laporan-kas"></tbody>
                    </table>
                </div>
            </div>"""

new1 = """            <div class="card">
                <div class="card-title-header">
                    <h3><i class="fa-solid fa-list"></i> Riwayat Transaksi Kas</h3>
                    <span id="kas-filter-info" style="font-size:0.8rem;color:#64748b;font-weight:600;"></span>
                </div>
                <!-- Filter Bar -->
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; padding:14px; background:var(--bg-light,#f8fafc); border-radius:10px;">
                    <div style="display:flex; flex-direction:column; gap:4px; flex:1; min-width:140px;">
                        <label style="font-size:0.78rem; font-weight:700; color:#64748b;">Dari Tanggal</label>
                        <input type="date" id="kas-filter-dari" onchange="filterLaporanKas()"
                            style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; background:#fff; color:inherit;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; flex:1; min-width:140px;">
                        <label style="font-size:0.78rem; font-weight:700; color:#64748b;">Sampai Tanggal</label>
                        <input type="date" id="kas-filter-sampai" onchange="filterLaporanKas()"
                            style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; background:#fff; color:inherit;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; flex:1; min-width:120px;">
                        <label style="font-size:0.78rem; font-weight:700; color:#64748b;">Tipe</label>
                        <select id="kas-filter-tipe" onchange="filterLaporanKas()"
                            style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; background:#fff; color:inherit;">
                            <option value="">Semua</option>
                            <option value="masuk">Pemasukan</option>
                            <option value="keluar">Pengeluaran</option>
                        </select>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; flex:2; min-width:180px;">
                        <label style="font-size:0.78rem; font-weight:700; color:#64748b;">Cari Uraian</label>
                        <input type="search" id="kas-filter-cari" placeholder="Ketik kata kunci..." oninput="filterLaporanKas()"
                            style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; background:#fff; color:inherit;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; justify-content:flex-end;">
                        <label style="font-size:0.78rem; font-weight:700; color:#64748b;">&nbsp;</label>
                        <button class="btn-action" style="background:#64748b; color:#fff; padding:8px 14px;" onclick="resetFilterKas()">
                            <i class="fa-solid fa-rotate-left"></i> Reset
                        </button>
                    </div>
                </div>
                <!-- Stat filter -->
                <div id="kas-filter-stat" style="display:none; margin-bottom:12px; padding:10px 14px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; font-size:0.85rem; color:#1e40af; font-weight:600;"></div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr><th>Tanggal</th><th>Uraian</th><th>Tipe</th><th>Nominal / Saldo</th><th>Aksi</th></tr>
                        </thead>
                        <tbody id="tbody-laporan-kas"></tbody>
                    </table>
                </div>
            </div>"""

if old1 in html:
    html = html.replace(old1, new1, 1)
    print("OK: PATCH 1 - filter bar HTML")
else:
    print("GAGAL: PATCH 1")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("P1 SELESAI")
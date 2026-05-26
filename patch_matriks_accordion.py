import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# ══════════════════════════════════════════════════════
# BAGIAN 1: CSS baru untuk accordion
# ══════════════════════════════════════════════════════
CSS_OLD = "#ben-matriks .table-responsive table {"
CSS_NEW = """/* ── Accordion Matriks ── */
.mtrx-accordion-wrap { display:flex; flex-direction:column; gap:6px; }
.mtrx-row-header {
    display:flex; align-items:center; gap:10px;
    padding:12px 16px; border-radius:12px;
    background:#fff; border:1px solid #e2e8f0;
    cursor:pointer; transition:all 0.2s;
    box-shadow:0 1px 4px rgba(0,0,0,0.04);
}
.mtrx-row-header:hover { background:#f8faff; border-color:#a5b4fc; box-shadow:0 2px 8px rgba(99,102,241,0.10); }
.mtrx-row-header.open { background:linear-gradient(135deg,#eef2ff,#f5f3ff); border-color:#6366f1; box-shadow:0 2px 12px rgba(99,102,241,0.15); }
.mtrx-chevron { transition:transform 0.3s; color:#6366f1; font-size:0.85rem; margin-left:auto; flex-shrink:0; }
.mtrx-row-header.open .mtrx-chevron { transform:rotate(180deg); }
.mtrx-row-body {
    display:none; overflow:hidden;
    background:#fafbff; border:1px solid #e2e8f0;
    border-top:none; border-radius:0 0 12px 12px;
    margin-top:-6px; padding:0;
    transition:all 0.3s;
}
.mtrx-row-body.open { display:block; }
.mtrx-bulan-grid {
    display:grid; grid-template-columns:repeat(6,1fr);
    gap:8px; padding:16px;
}
.mtrx-bulan-cell {
    display:flex; flex-direction:column; align-items:center;
    gap:4px; padding:8px 4px; border-radius:10px;
    font-size:0.72rem; font-weight:700; cursor:pointer;
    transition:transform 0.15s, box-shadow 0.15s;
    border:1px solid transparent;
}
.mtrx-bulan-cell:hover { transform:scale(1.08); box-shadow:0 2px 8px rgba(0,0,0,0.12); }
.mtrx-bulan-cell .bulan-icon { font-size:1.1rem; }
.mtrx-bulan-cell.lunas   { background:#dcfce7; border-color:#86efac; color:#166534; }
.mtrx-bulan-cell.pending { background:#fef9c3; border-color:#fde047; color:#854d0e; }
.mtrx-bulan-cell.belum   { background:#fee2e2; border-color:#fca5a5; color:#991b1b; }
.mtrx-bulan-cell.future  { background:#f1f5f9; border-color:#e2e8f0; color:#cbd5e1; cursor:default; }
.mtrx-detail-bar {
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
    padding:10px 16px 14px; border-top:1px solid #e2e8f0;
    font-size:0.82rem;
}
.mtrx-pbar-wrap { flex:1; min-width:120px; background:#e2e8f0; border-radius:999px; height:8px; overflow:hidden; }
.mtrx-pbar { height:100%; border-radius:999px; transition:width 0.5s ease; }
.mtrx-nama-col { flex:1; min-width:0; }
.mtrx-nama-text { font-weight:800; color:#1e293b; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mtrx-prog-inline { display:flex; align-items:center; gap:6px; margin-top:3px; }
.mtrx-prog-inline-bar { width:80px; background:#e2e8f0; border-radius:999px; height:6px; overflow:hidden; }
.mtrx-prog-inline-fill { height:100%; border-radius:999px; transition:width 0.5s; }

#ben-matriks .table-responsive table {"""

html = html.replace(CSS_OLD, CSS_NEW, 1)
print("CSS OK" if CSS_NEW[:30] in html else "CSS GAGAL")

# ══════════════════════════════════════════════════════
# BAGIAN 2: Ganti HTML tabel → div accordion container
# ══════════════════════════════════════════════════════
HTML_OLD = """             <div style="background:#fff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #e2e8f0;overflow:hidden;">
                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <span style="font-weight:700;color:#1e293b;font-size:0.95rem;"><i class="fa-solid fa-table" style="color:#6366f1;"></i> Tabel Matriks Iuran</span>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:0.75rem;font-weight:600;">
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;border-radius:50%;background:#10b981;display:inline-block;"></span> Lunas & Posting</span>
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;border-radius:50%;background:#f59e0b;display:inline-block;"></span> Bayar, Belum Posting</span>
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;border-radius:50%;background:#ef4444;display:inline-block;"></span> Belum Bayar</span>
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;border-radius:50%;background:#e2e8f0;display:inline-block;"></span> Bulan Belum Tiba</span>
                    </div>
                </div>
                <div class="table-responsive">
                    <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
                        <thead>
                            <tr style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;">
                                <th style="padding:12px 16px;text-align:left;font-weight:700;white-space:nowrap;position:sticky;left:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);z-index:2;">Nama Warga</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Jan</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Feb</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Mar</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Apr</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Mei</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Jun</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Jul</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Agu</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Sep</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Okt</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Nov</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:42px;">Des</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:70px;">Total</th>
                                <th style="padding:12px 8px;text-align:center;font-weight:700;min-width:80px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-global-iuran"></tbody>"""

HTML_NEW = """             <div style="background:#fff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #e2e8f0;overflow:hidden;">
                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <span style="font-weight:700;color:#1e293b;font-size:0.95rem;"><i class="fa-solid fa-list-ul" style="color:#6366f1;"></i> Daftar Warga — Klik untuk Detail Bulan</span>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.75rem;font-weight:600;">
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;border-radius:3px;background:#dcfce7;border:1px solid #86efac;display:inline-block;"></span> Lunas</span>
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;border-radius:3px;background:#fef9c3;border:1px solid #fde047;display:inline-block;"></span> Belum Posting</span>
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;border-radius:3px;background:#fee2e2;border:1px solid #fca5a5;display:inline-block;"></span> Belum Bayar</span>
                        <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;border-radius:3px;background:#f1f5f9;border:1px solid #e2e8f0;display:inline-block;"></span> Belum Tiba</span>
                    </div>
                </div>
                <div style="padding:16px;" id="mtrx-accordion-outer">
                    <div class="mtrx-accordion-wrap" id="tbody-global-iuran"></div>"""

if HTML_OLD in html:
    html = html.replace(HTML_OLD, HTML_NEW, 1)
    print("HTML tabel OK")
else:
    print("HTML tabel GAGAL — cek spasi/indent")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("File tersimpan.")

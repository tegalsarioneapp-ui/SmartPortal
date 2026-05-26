FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# ── FIX 1: Tombol Refresh warnanya tidak kelihatan ──
OLD1 = '<button class="btn-action" style="background:#f1f5f9;color:#475569;padding:10px 16px;" onclick="loadMatriksIuran()"><i class="fa-solid fa-rotate"></i> Refresh</button>'
NEW1 = '<button class="btn-action" style="background:#fff;color:#6366f1;padding:10px 16px;border:2px solid #6366f1;font-weight:700;" onclick="loadMatriksIuran()"><i class="fa-solid fa-rotate"></i> Refresh</button>'

# ── FIX 2: Hapus sisa tfoot lama yang mengambang ──
OLD2 = '''                    <div class="mtrx-accordion-wrap" id="tbody-global-iuran"></div>
                        <tfoot>
                            <tr id="tfoot-total-matriks" style="background:#f8fafc;font-weight:800;border-top:2px solid #e2e8f0;">
                                <td style="padding:10px 16px;color:#6366f1;">TOTAL</td>'''
NEW2 = '''                    <div class="mtrx-accordion-wrap" id="tbody-global-iuran"></div>'''

if OLD1 in html:
    html = html.replace(OLD1, NEW1, 1)
    print("OK: tombol refresh diperbaiki!")
else:
    print("SKIP: tombol refresh tidak ditemukan - cek manual")

if OLD2 in html:
    html = html.replace(OLD2, NEW2, 1)
    print("OK: tfoot lama dihapus!")
else:
    print("SKIP: tfoot tidak ditemukan - cek manual")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("Selesai!")

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()
ok = 0

def patch(label, old, new):
    global html, ok
    if old not in html:
        print("GAGAL:", label)
        exit(1)
    html = html.replace(old, new, 1)
    ok += 1
    print("OK:", label)

# PATCH 1: Rename duplikat ben-display-saldo-awal di tab ben-laporan (line 3549)
# Yang di ben-input (line 3458) tetap, yang di ben-laporan diganti ID baru
patch("Rename duplikat ben-display-saldo-awal di ben-laporan",
"""                <div class="stat-box" style="border-color:var(--primary-blue);">
                    <i class="fa-solid fa-wallet bg-icon" style="color:var(--primary-blue) !important;"></i>
                    <h4>Saldo Awal</h4>
                    <h2 id="ben-display-saldo-awal">Rp 0</h2>
                </div>""",
"""                <div class="stat-box" style="border-color:var(--primary-blue);">
                    <i class="fa-solid fa-wallet bg-icon" style="color:var(--primary-blue) !important;"></i>
                    <h4>Saldo Awal</h4>
                    <h2 id="ben-lap-saldo-awal">Rp 0</h2>
                </div>"""
)

# PATCH 2: Rename duplikat ben-saldo-kas-input di tab ben-laporan (line 3564)
patch("Rename duplikat ben-saldo-kas-input di ben-laporan",
"""                <div class="stat-box" style="border-color:var(--accent-gold);">
                    <i class="fa-solid fa-vault bg-icon" style="color:var(--accent-gold) !important;"></i>
                    <h4>Saldo Akhir</h4>
                    <h2 id="ben-saldo-kas-input">Rp 0</h2>
                </div>""",
"""                <div class="stat-box" style="border-color:var(--accent-gold);">
                    <i class="fa-solid fa-vault bg-icon" style="color:var(--accent-gold) !important;"></i>
                    <h4>Saldo Akhir</h4>
                    <h2 id="ben-lap-saldo-akhir">Rp 0</h2>
                </div>"""
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\nSELESAI!", ok, "patch berhasil diterapkan.")
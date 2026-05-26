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

# PATCH: Rename duplikat ben-saldo-kas-input di ben-laporan (line 3564)
patch("Rename duplikat ben-saldo-kas-input di ben-laporan",
"""                <div class="stat-box" style="border-color:var(--accent-gold);">
                    <i class="fa-solid fa-sack-dollar bg-icon" style="color:var(--accent-gold) !important;"></i>
                    <h4>Saldo Akhir</h4>
                    <h2 id="ben-saldo-kas-input">Rp 0</h2>
                </div>""",
"""                <div class="stat-box" style="border-color:var(--accent-gold);">
                    <i class="fa-solid fa-sack-dollar bg-icon" style="color:var(--accent-gold) !important;"></i>
                    <h4>Saldo Akhir</h4>
                    <h2 id="ben-lap-saldo-akhir">Rp 0</h2>
                </div>"""
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\nSELESAI!", ok, "patch berhasil diterapkan.")
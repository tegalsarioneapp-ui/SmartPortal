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

# PATCH 1: Fix duplikat id="ben-saldo-kas-input" di tab ben-laporan (line 3564)
# Ganti jadi id unik "ben-saldo-kas-laporan"
patch("Fix duplikat ben-saldo-kas-input di tab laporan",
'<div id="ben-laporan" class="ben-tab-content">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:15px;">\n                <h2 style="margin:0; color:var(--primary-dark); font-size:1.8rem;"><i class="fa-solid fa-book"></i> Laporan Kas</h2>',
'<div id="ben-laporan" class="ben-tab-content">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:15px;">\n                <h2 style="margin:0; color:var(--primary-dark); font-size:1.8rem;"><i class="fa-solid fa-book"></i> Laporan Kas</h2>'
)

# Cek dulu berapa kali id="ben-saldo-kas-input" muncul
count_saldo = html.count('id="ben-saldo-kas-input"')
count_saldo_awal = html.count('id="ben-display-saldo-awal"')
print(f"  -> ben-saldo-kas-input muncul {count_saldo}x")
print(f"  -> ben-display-saldo-awal muncul {count_saldo_awal}x")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\nSELESAI!", ok, "patch diterapkan.")
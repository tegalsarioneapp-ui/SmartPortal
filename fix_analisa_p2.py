FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK: {label}")

# PATCH 1: Fix targetMeja dari db_param_pertemuan
patch('Fix targetMeja dari param',
"        var targetMeja      = settings.targetUangMeja||250000;",
"        var param2 = JSON.parse(localStorage.getItem('db_param_pertemuan')||'{}');\n        var targetMeja = param2.targetUangMeja||250000;")

# PATCH 2: Fix judul kartu hardcode 250k → dinamis
patch('Fix judul pos uang meja hardcode',
"+'<span style=\"font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);\"><i class=\"fa-solid fa-mug-hot\" style=\"color:#f59e0b;margin-right:6px;\"></i>Uang Meja</span>'",
"+'<span style=\"font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);\"><i class=\"fa-solid fa-mug-hot\" style=\"color:#f59e0b;margin-right:6px;\"></i>Uang Meja ('+fmt(targetMeja)+')</span>'")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
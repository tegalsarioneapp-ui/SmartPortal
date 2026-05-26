FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """        // Kartu Sosial
        +'<div style="background:var(--bg-card,#fff);border-radius:16px
        ;padding:20px;border:1px solid var(--border-color,#e2e8f0);border-top:4px solid #8b5cf6;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'"""

NEW = """        // Kartu Sosial
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);border-top:4px solid #8b5cf6;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'"""

if OLD in html:
    html = html.replace(OLD, NEW)
    print("OK: String terpotong diperbaiki")
else:
    print("GAGAL: string tidak ditemukan!")
    exit(1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)
print("OK: Selesai!")
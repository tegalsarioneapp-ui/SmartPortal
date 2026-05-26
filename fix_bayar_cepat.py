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

# Ganti bayarCepatTagihan → inputIuranCepat
# inputIuranCepat butuh (idWarga, bulan) bukan (idWarga, nama)
patch('Fix bayarCepatTagihan → inputIuranCepat',
"""                    +'<button onclick="bayarCepatTagihan('+w.id+',\\''+w.nama.replace(/'/g,"\\\\'")+'\\')\" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;font-size:0.8rem;">'
                    +'<i class="fa-solid fa-bolt"></i> Bayar Cepat</button>'""",
"""                    +'<button onclick="inputIuranCepat('+w.id+',\\''+bulanNama+'\\')\" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;font-size:0.8rem;">'
                    +'<i class="fa-solid fa-bolt"></i> Bayar Cepat</button>'""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
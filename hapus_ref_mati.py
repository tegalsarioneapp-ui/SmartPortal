FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

patches = [
    (
        "if(typeof loadKasBendahara === 'function') { loadKasBendahara(); loaded = true; }",
        ""
    ),
    (
        "if(typeof loadMatriksIuran === 'function') { loadMatriksIuran(); loaded = true; }",
        ""
    ),
    (
        "if(typeof loadAnalisaUangMeja === 'function') { loadAnalisaUangMeja(); loaded = true; }",
        ""
    ),
    (
        "if(typeof loadArsipBA === 'function') { loadArsipBA(); loaded = true; }",
        ""
    ),
]

for old, new in patches:
    if old in html:
        html = html.replace(old, new)
        print(f"✅ Hapus: {old[:60]}...")
    else:
        print(f"❌ Tidak ditemukan: {old[:60]}...")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\nSelesai!")
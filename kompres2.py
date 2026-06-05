from PIL import Image
import os, sys

# Auto-detect root
CANDIDATES = [
    "artifacts/smart-portal-rt/public",
    "smart-portal-rt/public",
    "public",
]

PUBLIC = None
for c in CANDIDATES:
    if os.path.exists(c):
        pngs = [f for f in os.listdir(c) if f.endswith('.png')]
        if pngs:
            PUBLIC = c
            break

if not PUBLIC:
    print("ERROR: Folder public/ tidak ditemukan!")
    print("Jalankan script ini dari root folder SmartPortal-1")
    print(f"Cwd saat ini: {os.getcwd()}")
    sys.exit(1)

print(f"PUBLIC folder ditemukan: {PUBLIC}")
print(f"Working dir: {os.getcwd()}")

# Auto-detect index.html
IDX_CANDIDATES = [
    "artifacts/smart-portal-rt/index.html",
    "smart-portal-rt/index.html",
    "index.html",
]
IDX = None
for c in IDX_CANDIDATES:
    if os.path.exists(c):
        IDX = c
        break

print(f"index.html ditemukan: {IDX}")

# List semua PNG yang ada
print("\nPNG files ditemukan:")
all_pngs = [f for f in os.listdir(PUBLIC) if f.endswith('.png')]
for p in all_pngs:
    sz = os.path.getsize(os.path.join(PUBLIC, p)) / 1024
    print(f"  {p} ({sz:.1f} KB)")

# Target kompresi
targets = [
    ("t1-logo.png",       "t1-logo.webp",        400,  400,  80),
    ("benny-avatar.png",  "benny-avatar.webp",   400,  400,  82),
    ("splash-scene.png",  "splash-scene.webp",   1280, None, 80),
    ("splash-hero.png",   "splash-hero.webp",    1280, None, 80),
    ("lambang_kota_semarang.png", "lambang_kota_semarang.webp", 400, 400, 85),
]

print("\n" + "=" * 55)
print("  MULAI KOMPRESI")
print("=" * 55)

total_before = 0
total_after  = 0
results      = []

for inp, out, max_w, max_h, quality in targets:
    inp_path = os.path.join(PUBLIC, inp)
    out_path = os.path.join(PUBLIC, out)

    if not os.path.exists(inp_path):
        print(f"\n  SKIP: {inp} tidak ada di {PUBLIC}")
        continue

    size_before = os.path.getsize(inp_path) / 1024
    print(f"\n  Proses: {inp} ({size_before:.1f} KB) ...")

    try:
        img = Image.open(inp_path)
        w_orig, h_orig = img.size
        print(f"    Mode: {img.mode}, Ukuran: {w_orig}x{h_orig}")

        # Konversi mode
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode in ("RGBA", "LA"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Resize
        if max_w and max_h:
            img.thumbnail((max_w, max_h), Image.LANCZOS)
        elif max_w and w_orig > max_w:
            ratio = max_w / w_orig
            img = img.resize((max_w, int(h_orig * ratio)), Image.LANCZOS)

        # Simpan
        img.save(out_path, "WEBP", quality=quality, method=6)

        size_after = os.path.getsize(out_path) / 1024
        hemat = ((size_before - size_after) / size_before) * 100
        w2, h2 = img.size

        total_before += size_before
        total_after  += size_after
        results.append((inp, out, size_before, size_after, hemat))

        print(f"    {size_before:.1f} KB → {size_after:.1f} KB (hemat {hemat:.0f}%)")
        print(f"    Resolusi: {w_orig}x{h_orig} → {w2}x{h2}")

    except Exception as e:
        print(f"    GAGAL: {e}")
        import traceback
        traceback.print_exc()

# Update index.html
if IDX and results:
    print(f"\n\nUpdate referensi di {IDX} ...")
    with open(IDX, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    html_new = html
    ganti = 0
    for inp, out, *_ in results:
        if inp in html_new:
            html_new = html_new.replace(inp, out)
            ganti += 1
            print(f"  {inp} → {out}")
    if ganti:
        with open(IDX, "w", encoding="utf-8") as f:
            f.write(html_new)
        print(f"  index.html diperbarui ({ganti} referensi)")
    else:
        print(f"  Tidak ada referensi PNG di index.html")

# Update src/
SRC_DIR = os.path.join(os.path.dirname(PUBLIC), "src")
if os.path.exists(SRC_DIR) and results:
    print(f"\nUpdate referensi di src/ ...")
    for root, dirs, files in os.walk(SRC_DIR):
        dirs[:] = [d for d in dirs if d != "node_modules"]
        for fname in files:
            if fname.endswith((".tsx",".ts",".css")):
                fp = os.path.join(root, fname)
                with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                changed = False
                for inp, out, *_ in results:
                    if inp in content:
                        content = content.replace(inp, out)
                        changed = True
                        print(f"  {inp} → {out} ({os.path.basename(fp)})")
                if changed:
                    with open(fp, "w", encoding="utf-8") as f:
                        f.write(content)

# Summary
print(f"\n{'=' * 55}")
print(f"  HASIL KOMPRESI")
print(f"{'=' * 55}")
if results:
    print(f"  {'File Output':<30} {'Sebelum':>9} {'Sesudah':>9} {'Hemat':>7}")
    print(f"  {'-'*57}")
    for inp, out, before, after, hemat in results:
        print(f"  {out:<30} {before:>8.1f}K {after:>8.1f}K {hemat:>6.0f}%")
    print(f"  {'-'*57}")
    if total_before > 0:
        total_hemat = ((total_before - total_after) / total_before) * 100
        print(f"  {'TOTAL':<30} {total_before:>8.1f}K {total_after:>8.1f}K {total_hemat:>6.0f}%")
        print(f"\n  Hemat total: {(total_before-total_after)/1024:.2f} MB")
    print(f"\n  PNG asli TIDAK dihapus — cek visual dulu!")
    print(f"  Jika OK, hapus PNG dengan:")
    for inp, out, *_ in results:
        print(f"    del \"{os.path.join(PUBLIC, inp)}\"")
    print(f"\n  Lalu commit:")
    print(f"    git add -A artifacts/smart-portal-rt/public/")
    print(f"    git commit -m \"perf: compress images to WebP (-XX MB)\"")
    print(f"    git push origin main")
else:
    print(f"  Tidak ada file yang dikompresi")
print(f"{'=' * 55}")

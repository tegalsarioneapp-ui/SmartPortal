from PIL import Image
import os

PUBLIC = "artifacts/smart-portal-rt/public"

targets = [
    # (file_input,        file_output,          max_width, max_height, quality)
    ("t1-logo.png",       "t1-logo.webp",        400,       400,        80),
    ("benny-avatar.png",  "benny-avatar.webp",   400,       400,        82),
    ("splash-scene.png",  "splash-scene.webp",   1280,      None,       80),
    ("splash-hero.png",   "splash-hero.webp",    1280,      None,       80),
    ("lambang_kota_semarang.png", "lambang_kota_semarang.webp", 400, 400, 85),
]

print("=" * 55)
print("  KOMPRESI GAMBAR → WebP")
print("=" * 55)

total_before = 0
total_after  = 0
results      = []

for inp, out, max_w, max_h, quality in targets:
    inp_path = os.path.join(PUBLIC, inp)
    out_path = os.path.join(PUBLIC, out)

    if not os.path.exists(inp_path):
        print(f"\n  SKIP (tidak ada): {inp}")
        continue

    size_before = os.path.getsize(inp_path) / 1024

    try:
        img = Image.open(inp_path)

        # Konversi RGBA → RGB jika perlu (WebP support RGBA tapi lebih safe)
        if img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode in ("RGBA", "LA"):
                background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Resize jika perlu
        w, h = img.size
        if max_w and max_h:
            # Thumbnail (maintain aspect ratio dalam kotak max_w x max_h)
            img.thumbnail((max_w, max_h), Image.LANCZOS)
        elif max_w and w > max_w:
            ratio = max_w / w
            new_h = int(h * ratio)
            img = img.resize((max_w, new_h), Image.LANCZOS)

        # Simpan WebP
        img.save(out_path, "WEBP", quality=quality, method=6)

        size_after = os.path.getsize(out_path) / 1024
        hemat      = ((size_before - size_after) / size_before) * 100

        total_before += size_before
        total_after  += size_after
        results.append((inp, out, size_before, size_after, hemat))

        print(f"\n  ✅ {inp}")
        print(f"     {size_before:>8.1f} KB  →  {size_after:>7.1f} KB  (hemat {hemat:.0f}%)")
        w2, h2 = img.size
        print(f"     Resolusi: {w}x{h} → {w2}x{h2}")

    except Exception as e:
        print(f"\n  ❌ GAGAL {inp}: {e}")

# ── Update referensi di index.html ──────────────────────
print("\n\n  Update referensi di index.html ...")
IDX = os.path.join("artifacts/smart-portal-rt", "index.html")

with open(IDX, "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

html_new = html
ganti = 0
for inp, out, *_ in results:
    if inp in html_new:
        html_new = html_new.replace(inp, out)
        ganti += 1
        print(f"  ✅ {inp} → {out} di index.html")

if ganti:
    with open(IDX, "w", encoding="utf-8") as f:
        f.write(html_new)
    print(f"  ✅ index.html diperbarui ({ganti} referensi)")
else:
    print(f"  ℹ️  Tidak ada referensi gambar di index.html yang perlu diubah")

# ── Cek referensi di src/ ────────────────────────────────
print("\n  Cek referensi di src/ ...")
for root, dirs, files in os.walk("artifacts/smart-portal-rt/src"):
    dirs[:] = [d for d in dirs if d not in ["node_modules"]]
    for fname in files:
        if fname.endswith((".tsx", ".ts", ".css", ".html")):
            fp = os.path.join(root, fname)
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            changed = False
            for inp, out, *_ in results:
                if inp in content:
                    content = content.replace(inp, out)
                    changed = True
                    print(f"  ✅ {inp} → {out} di {os.path.relpath(fp)}")
            if changed:
                with open(fp, "w", encoding="utf-8") as f:
                    f.write(content)

# ── Hapus PNG asli (optional — simpan dulu) ─────────────
print("\n  PNG asli disimpan (tidak dihapus otomatis)")
print("  Hapus manual setelah verifikasi visual OK:")
for inp, out, *_ in results:
    print(f"    del artifacts/smart-portal-rt/public/{inp}")

# ── Summary ─────────────────────────────────────────────
print(f"\n{'=' * 55}")
print(f"  HASIL KOMPRESI")
print(f"{'=' * 55}")
print(f"  {'File':<28} {'Sebelum':>9} {'Sesudah':>9} {'Hemat':>7}")
print(f"  {'-'*55}")
for inp, out, before, after, hemat in results:
    print(f"  {out:<28} {before:>8.1f}K {after:>8.1f}K {hemat:>6.0f}%")
print(f"  {'-'*55}")
if total_before > 0:
    total_hemat = ((total_before - total_after) / total_before) * 100
    print(f"  {'TOTAL':<28} {total_before:>8.1f}K {total_after:>8.1f}K {total_hemat:>6.0f}%")
    print(f"\n  💾 Hemat: {(total_before-total_after)/1024:.2f} MB")

print(f"\n  LANGKAH BERIKUTNYA:")
print(f"  1. Buka aplikasi → cek visual gambar OK")
print(f"  2. Jika OK → hapus PNG asli (perintah di atas)")
print(f"  3. git add + commit")
print(f"{'=' * 55}")

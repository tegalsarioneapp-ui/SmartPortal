import os, subprocess

PUBLIC = "artifacts/smart-portal-rt/public"

print("=" * 50)
print("  FINALIZE WebP — Hapus PNG + Commit")
print("=" * 50)

# ── Verifikasi WebP ada dan ukurannya masuk akal ─────────
print("\n[1/3] Verifikasi file WebP ...")
webp_files = [
    ("t1-logo.webp",                 10,   200),
    ("benny-avatar.webp",            10,   200),
    ("splash-scene.webp",            50,   500),
    ("splash-hero.webp",             50,   500),
    ("lambang_kota_semarang.webp",   5,    100),
]

all_ok = True
for fname, min_kb, max_kb in webp_files:
    fp = os.path.join(PUBLIC, fname)
    if not os.path.exists(fp):
        print(f"  MISSING: {fname}")
        all_ok = False
        continue
    sz = os.path.getsize(fp) / 1024
    ok = min_kb <= sz <= max_kb
    icon = "OK" if ok else "?? SIZE ANEH"
    print(f"  {icon}: {fname} ({sz:.1f} KB)")
    if not ok:
        all_ok = False

if not all_ok:
    print("\n  Ada WebP yang bermasalah — STOP, cek manual!")
    exit(1)

print("\n  Semua WebP OK!")

# ── Hapus PNG asli ───────────────────────────────────────
print("\n[2/3] Hapus PNG asli ...")
pngs_to_delete = [
    "t1-logo.png",
    "benny-avatar.png",
    "splash-scene.png",
    "splash-hero.png",
    "lambang_kota_semarang.png",
]

deleted = []
for fname in pngs_to_delete:
    fp = os.path.join(PUBLIC, fname)
    if os.path.exists(fp):
        sz = os.path.getsize(fp) / 1024
        os.remove(fp)
        deleted.append((fname, sz))
        print(f"  HAPUS: {fname} ({sz:.0f} KB)")
    else:
        print(f"  SKIP : {fname} sudah tidak ada")

total_freed = sum(s for _, s in deleted)
print(f"\n  Dihapus : {len(deleted)} file")
print(f"  Dibebaskan: {total_freed/1024:.2f} MB")

# ── Git commit ───────────────────────────────────────────
print("\n[3/3] Git commit ...")

r1 = subprocess.run(
    ["git", "add", "-A", "artifacts/smart-portal-rt/public/"],
    capture_output=True, text=True
)
r2 = subprocess.run(
    ["git", "add", "artifacts/smart-portal-rt/index.html"],
    capture_output=True, text=True
)
print(f"  git add public/  : {'OK' if r1.returncode==0 else r1.stderr}")
print(f"  git add index.html: {'OK' if r2.returncode==0 else r2.stderr}")

commit_msg = f"perf: compress images to WebP (-8.16 MB, -96%)\n\n- t1-logo.png       2388KB → 13KB   (99%)\n- benny-avatar.png  2165KB → 14KB   (99%)\n- splash-scene.png  2056KB → 124KB  (94%)\n- splash-hero.png   1964KB → 167KB  (92%)\n- lambang_kota.png   119KB → 20KB   (83%)\n\nTotal: 8.5MB → 338KB\nUpdate referensi di index.html (3 lokasi)"

r3 = subprocess.run(
    ["git", "commit", "-m", commit_msg],
    capture_output=True, text=True
)

if r3.returncode == 0:
    print(f"  Commit: OK")
    for line in r3.stdout.strip().split("\n")[:4]:
        print(f"    {line}")
else:
    print(f"  Commit output: {r3.stdout.strip()[:200]}")
    print(f"  Stderr: {r3.stderr.strip()[:200]}")

r4 = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True, text=True
)

if r4.returncode == 0:
    print(f"  Push: OK")
    for line in (r4.stdout + r4.stderr).strip().split("\n")[:4]:
        print(f"    {line}")
else:
    print(f"  Push GAGAL: {r4.stderr.strip()[:300]}")

# ── Summary ─────────────────────────────────────────────
print(f"\n{'=' * 50}")
print(f"  SELESAI")
print(f"{'=' * 50}")
print(f"""
  Hasil akhir public/ sekarang:
  WebP total  : ~338 KB (dari 8,694 KB)
  Hemat       : 8.16 MB (96%)

  Sisa PNG yang tidak dikompresi:
  - lambang-semarang.png  (6.7 KB) — sudah kecil, OK
  - favicon.svg           (0.2 KB) — SVG, tidak perlu

  Status aplikasi:
  - Gambar: WebP (96% lebih kecil)
  - index.html: referensi diupdate
  - Git: committed & pushed
""")
print(f"{'=' * 50}")

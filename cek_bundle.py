import os, re, glob

print("=== CEK BUNDLE — apakah password ter-embed ===")

# Cari di dist folder
dist = "artifacts/smart-portal-rt/dist/assets"
if not os.path.exists(dist):
    print("  [WARN] dist/ belum ada — jalankan pnpm build dulu")
    exit()

js_files = glob.glob(os.path.join(dist, "*.js"))
print(f"  Ditemukan {len(js_files)} JS bundle\n")

for f in js_files:
    with open(f, "r", encoding="utf-8", errors="ignore") as fh:
        content = fh.read()

    # Cari apakah password ter-embed
    hits = re.findall(r'rt005\w*', content)
    if hits:
        print(f"  [WARN] {os.path.basename(f)}: password ter-embed! {set(hits)}")
    else:
        print(f"  [OK]   {os.path.basename(f)}: tidak ada password")

    # Cari apakah env var kosong
    empty = re.findall(r'password\s*:\s*["\']{2}', content)
    if empty:
        print(f"  [INFO] {os.path.basename(f)}: password kosong ({len(empty)}x) — env var tidak di-set saat build")

import os, re, glob

print("=== CEK BUNDLE — apakah password ter-embed ===")

# Path yang benar
dist = "artifacts/smart-portal-rt/dist/assets"
if not os.path.exists(dist):
    # Coba cari dist di lokasi lain
    for alt in ["artifacts/smart-portal-rt/dist", "dist/assets", "dist"]:
        if os.path.exists(alt):
            print(f"  [INFO] dist ditemukan di: {alt}")
            dist = alt
            break
    else:
        print(f"  [FAIL] dist tidak ditemukan sama sekali")
        # List isi artifacts/smart-portal-rt
        base = "artifacts/smart-portal-rt"
        print(f"\n  Isi {base}:")
        for f in os.listdir(base):
            print(f"    {f}")
        exit()

js_files = glob.glob(os.path.join(dist, "*.js"))
print(f"  Ditemukan {len(js_files)} JS bundle di {dist}\n")

for f in sorted(js_files):
    with open(f, "r", encoding="utf-8", errors="ignore") as fh:
        content = fh.read()

    sz = os.path.getsize(f) // 1024
    print(f"  File: {os.path.basename(f)} ({sz} KB)")

    # Cari password ter-embed
    hits = re.findall(r'rt005\w*', content)
    if hits:
        print(f"    [WARN] password ter-embed: {set(hits)}")
    else:
        print(f"    [OK]   tidak ada password rt005")

    # Cari env var kosong string
    empty = re.findall(r'(?:VITE_PASSWORD|password)\s*[:=]\s*["\']{2}', content)
    if empty:
        print(f"    [INFO] password kosong {len(empty)}x — env var kosong saat build")

    # Cari spt- token pattern (generateToken output)
    token = re.findall(r'spt-', content)
    if token:
        print(f"    [OK]   token prefix spt- ditemukan")

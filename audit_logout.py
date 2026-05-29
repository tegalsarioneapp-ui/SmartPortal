import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cari semua tombol keluar/logout di HTML
print("=== TOMBOL KELUAR / LOGOUT (HTML) ===")
btns = re.findall(
    r'<button[^>]*>[^<]*(?:Keluar|keluar|Logout|logout|Sign\s*Out|signout)[^<]*</button>',
    html, re.IGNORECASE
)
for b in btns:
    clean = re.sub(r'\s+', ' ', b).strip()
    print(f"  {clean[:250]}")

# 2. Cari onclick yang memanggil fungsi logout
print("\n=== ONCLICK LOGOUT CALLS ===")
clicks = re.findall(
    r'onclick="[^"]*(?:logout|Logout|keluar|Keluar|signOut|keluarPortal|doLogout)[^"]*"',
    html, re.IGNORECASE
)
for c in clicks:
    print(f"  {c[:200]}")

# 3. Cari semua fungsi logout
print("\n=== FUNGSI LOGOUT / KELUAR ===")
fn_patterns = [
    r'function\s+logout\s*\([^)]*\)\s*\{',
    r'function\s+doLogout\s*\([^)]*\)\s*\{',
    r'function\s+keluarPortal\s*\([^)]*\)\s*\{',
    r'function\s+keluar\s*\([^)]*\)\s*\{',
    r'logout\s*=\s*function[^{]*\{',
    r'doLogout\s*=\s*function[^{]*\{',
    r'keluarPortal\s*=\s*function[^{]*\{',
    r'window\.logout\s*=',
    r'window\.doLogout\s*=',
    r'window\.keluarPortal\s*=',
]
for pat in fn_patterns:
    m = re.search(pat, html, re.IGNORECASE)
    if m:
        idx = m.start()
        print(f"\n-- {pat[:40]} --")
        print(html[idx:idx+600])
    else:
        print(f"  NOT FOUND: {pat[:40]}")

# 4. Cari semua posisi kata "keluar" / "logout"
print("\n=== SEMUA POSISI keluar/logout ===")
all_hits = list(re.finditer(r'(?:keluar|logout|doLogout|keluarPortal)', html, re.IGNORECASE))
print(f"Total: {len(all_hits)}x")
for h in all_hits[:30]:
    pos = h.start()
    ctx = html[pos-80:pos+100]
    clean = re.sub(r'\s+', ' ', ctx).strip()
    print(f"\n  pos {pos}: {clean[:250]}")

# 5. Cari di setiap portal (warga, admin, bendahara, koperasi)
print("\n=== KELUAR PER PORTAL ===")
portals = ['view-warga', 'view-admin', 'view-bendahara', 'view-koperasi']
for portal in portals:
    idx_start = html.find(f'id="{portal}"')
    if idx_start == -1:
        print(f"  {portal}: NOT FOUND")
        continue
    # ambil 200000 char dari portal ini
    chunk = html[idx_start:idx_start+200000]
    hits = re.findall(
        r'<button[^>]*(?:keluar|logout|Keluar|Logout)[^>]*>.*?</button>|'
        r'onclick="[^"]*(?:keluar|logout|Keluar|Logout)[^"]*"',
        chunk, re.IGNORECASE|re.DOTALL
    )
    print(f"\n  {portal} ({len(hits)} hits):")
    for h in hits[:5]:
        clean = re.sub(r'\s+', ' ', h).strip()
        print(f"    {clean[:200]}")

print("\nDone.")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# ─── STEP 1: Cari openAdminTab calls yang ada ───
admin_calls = re.findall(r"openAdminTab\(['\"]([^'\"]+)['\"]\)", html)
warga_calls = re.findall(r"openWargaTab\(['\"]([^'\"]+)['\"]\)", html)
print("=== openAdminTab calls ===")
for c in sorted(set(admin_calls)):
    print(c)
print("\n=== openWargaTab calls ===")
for c in sorted(set(warga_calls)):
    print(c)

# ─── STEP 2: Cari admin nav buttons ───
print("\n=== ADMIN NAV BUTTONS ===")
admin_btns = re.findall(r"<button[^>]*admin-tab-btn[^>]*>.*?</button>", html, re.DOTALL)
for b in admin_btns[:20]:
    clean = re.sub(r"\s+", " ", b).strip()
    print(clean[:250])

# ─── STEP 3: Cari fungsi openAdminTab ───
print("\n=== FUNGSI openAdminTab ===")
match = re.search(r"(function openAdminTab|window\.openAdminTab\s*=\s*function).{0,2000}", html, re.DOTALL)
if match:
    print(match.group(0)[:500])
else:
    print("TIDAK DITEMUKAN")

# ─── STEP 4: Cari toggleSidebar ───
print("\n=== FUNGSI toggleSidebar ===")
match2 = re.search(r"(function toggleSidebar|window\.toggleSidebar\s*=\s*function).{0,1000}", html, re.DOTALL)
if match2:
    print(match2.group(0)[:500])
else:
    print("TIDAK DITEMUKAN")

# ─── STEP 5: Cari sidebar HTML yang ada ───
print("\n=== SIDEBAR HTML ===")
sidebar = re.findall(r"<div[^>]*(?:sidebar|drawer)[^>]*>", html)
for s in sidebar[:10]:
    print(s[:200])

print("\nDone.")

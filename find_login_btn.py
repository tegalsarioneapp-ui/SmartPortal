import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari login form view
print("=== LOGIN FORM VIEW ===")
idx = html.find('id="login-form-view"')
if idx > -1:
    snippet = html[idx:idx+2000]
    clean = re.sub(r'\s+', ' ', snippet)
    print(clean[:1500])
else:
    print("TIDAK DITEMUKAN login-form-view")

# Cari semua button submit / buka portal
print("\n=== SEMUA BUTTON SUBMIT / LOGIN ===")
btns = re.findall(r'<button[^>]*(?:submit|btn-ultra|bukaFormLogin|login)[^>]*>.*?</button>', html, re.DOTALL | re.IGNORECASE)
for b in btns[:10]:
    clean = re.sub(r'\s+', ' ', b).strip()
    print(clean[:200])

# Cari bukaFormLogin
print("\n=== FUNGSI bukaFormLogin ===")
idx2 = html.find('bukaFormLogin')
if idx2 > -1:
    print(html[max(0,idx2-100):idx2+300])

# Cek apakah splash-view ada
print("\n=== SPLASH VIEW ===")
idx3 = html.find('id="splash-view"')
if idx3 > -1:
    snippet = html[idx3:idx3+500]
    clean = re.sub(r'\s+', ' ', snippet)
    print(clean[:400])
else:
    print("TIDAK DITEMUKAN splash-view")

print("\nDone.")

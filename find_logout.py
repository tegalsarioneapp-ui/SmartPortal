import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua logout
print("=== SEMUA ELEMEN LOGOUT ===")
logouts = re.findall(r'.{0,200}logout.{0,200}', html, re.IGNORECASE)
for i, l in enumerate(logouts[:10]):
    clean = re.sub(r'\s+', ' ', l).strip()
    print(f"\n[{i}] {clean}")

# Cari button logout
print("\n=== BUTTON LOGOUT ===")
btns = re.findall(r'<button[^>]*(?:logout|Logout|LOGOUT)[^>]*>.*?</button>', html, re.DOTALL)
for b in btns[:5]:
    clean = re.sub(r'\s+', ' ', b).strip()
    print(clean[:200])

# Cari area main-header lengkap
print("\n=== MAIN HEADER LENGKAP ===")
match = re.search(r'<div class="main-header no-print">.*?</div>\s*</div>', html, re.DOTALL)
if match:
    clean = re.sub(r'\s+', ' ', match.group(0)).strip()
    print(clean[:1000])

print("\nDone.")

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Ambil full HTML kop-surat-resmi pertama
idx = html.find('<div class="kop-surat-resmi">')
print("=== KOP SURAT RESMI HTML (500 chars) ===")
print(html[idx:idx+800])

# Cek CSS kop-surat-resmi
import re
print("\n=== CSS kop-surat-resmi ===")
hits = re.findall(r'[^{}]*kop-surat-resmi[^{}]*\{[^}]*\}', html, re.DOTALL)
for h in hits:
    print(re.sub(r'\s+', ' ', h).strip()[:300])

print("\n=== CSS kop-garis ===")
hits2 = re.findall(r'[^{}]*kop-garis[^{}]*\{[^}]*\}', html, re.DOTALL)
for h in hits2:
    print(re.sub(r'\s+', ' ', h).strip()[:300])

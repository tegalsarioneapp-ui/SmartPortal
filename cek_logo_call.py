import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek logo section lengkap
m = re.search(r'window\.cetakPDFSurat\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    content = m.group(0)
    
    # Cek logo full context
    print("=== LOGO FULL CONTEXT ===")
    idx = content.find('Lambang_Kota_Semarang')
    print(content[max(0,idx-200):idx+300])
    
    print()
    print("=== CARA LOGO DILOAD ===")
    print("pakai base64:", "base64" in content[idx-500:idx+500])
    print("pakai path /:", content[idx:idx+50])
    print("pakai db_settings logo:", "logo" in content[idx-500:idx+500])

print()
# Cek pemanggilan dari verifikasiTokenSurat
m2 = re.search(r'window\.verifikasiTokenSurat\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m2:
    content2 = m2.group(0)
    print("=== PANGGILAN cetakPDFSurat di verifikasiTokenSurat ===")
    for cm in re.finditer(r'cetakPDFSurat\([^)]+\)', content2):
        print("  " + cm.group(0))

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

m = re.search(r'window\.loadSuratWarga\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    content = m.group(0)
    
    # Cari semua onclick di dalam fungsi ini
    print("=== SEMUA ONCLICK di loadSuratWarga ===")
    for om in re.finditer(r'onclick=["\']([^"\']+)["\']', content):
        print("  " + om.group(1))
    
    print()
    print("=== BARIS TOMBOL DOWNLOAD (200 chars sebelum-sesudah) ===")
    idx = content.find('Download Surat')
    print(content[max(0,idx-300):idx+200])

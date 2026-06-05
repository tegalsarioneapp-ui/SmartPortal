import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Cek library PDF yang ada
print("=== [1] LIBRARY PDF ===")
scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>', html)
for s in scripts:
    if any(x in s.lower() for x in ['html2canvas','jspdf','pdf','canvas']):
        print(f"  FOUND: {s}")

print(f"  html2canvas mentions: {html.count('html2canvas')}")
print(f"  jsPDF mentions: {html.count('jsPDF')}")
print(f"  jspdf mentions: {html.count('jspdf')}")

# 2. Cek isi downloadPdfFromHtml FULL
print()
print("=== [2] downloadPdfFromHtml FULL ===")
idx = html.find("window.downloadPdfFromHtml")
if idx != -1:
    end = html.find("\nwindow.", idx+10)
    chunk = html[idx:end]
    print(re.sub(r'\s+', ' ', chunk).strip()[:3000])
else:
    print("  MISSING!")

# 3. Cek cetakPDFSurat bagian akhir (yg panggil download)
print()
print("=== [3] cetakPDFSurat — 500 CHAR TERAKHIR ===")
idx2 = html.find("window.cetakPDFSurat")
end2 = html.find("\nwindow.", idx2+10)
chunk2 = html[idx2:end2]
print(re.sub(r'\s+', ' ', chunk2[-500:]).strip())

# 4. Cek apakah ada printViaIframe sebagai fallback
print()
print("=== [4] printViaIframe ===")
idx3 = html.find("window.printViaIframe")
if idx3 != -1:
    end3 = html.find("\nwindow.", idx3+10)
    chunk3 = html[idx3:end3]
    print(re.sub(r'\s+', ' ', chunk3).strip()[:500])
else:
    print("  MISSING")

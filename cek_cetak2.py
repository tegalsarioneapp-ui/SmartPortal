import re

f = open('artifacts/smart-portal-rt/index.html','r',encoding='utf-8')
html = f.read()
f.close()

# Cek bagian akhir cetakPDFSurat - cara download
idx = html.find('window.cetakPDFSurat')
end = html.find('\nwindow.', idx+10)
chunk = html[idx:end]

print('=== AKHIR cetakPDFSurat ===')
print(re.sub(r'\s+',' ', chunk[-1500:]).strip())

print()
print('=== CEK PEMANGGILAN ===')
print('downloadPdfFromHtml:', 'downloadPdfFromHtml' in chunk)
print('printViaIframe:', 'printViaIframe' in chunk)
print('html2canvas:', 'html2canvas' in chunk)
print('jsPDF:', 'jsPDF' in chunk)
print('window.open:', 'window.open' in chunk)
print('iframe:', 'iframe' in chunk)

# Cek html2canvas & jsPDF library tersedia
print()
print('=== LIBRARY CDN ===')
libs = re.findall(r'<script[^>]*src="([^"]*(?:html2canvas|jspdf|jsPDF)[^"]*)"', html, re.IGNORECASE)
for l in libs:
    print(' ', l)
if not libs:
    print('  TIDAK ADA html2canvas/jsPDF CDN!')

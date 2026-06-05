import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek downloadPdfFromHtml bagian iframe/blob
m = re.search(r'window\.downloadPdfFromHtml\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    content = m.group(0)
    print("=== BAGIAN AKHIR downloadPdfFromHtml ===")
    print(content[1800:])

print()

# Cek cetakPDFSurat - cari via line number
lines = html.split('\n')
idx = html.find('window.cetakPDFSurat = function')
line_no = html.count('\n', 0, idx)
print("=== cetakPDFSurat mulai L" + str(line_no+1) + " ===")
# Tampilkan 80 baris dari situ
chunk = '\n'.join(lines[line_no:line_no+80])
# Cari return/download di chunk
print("return downloadPdfFromHtml:", "downloadPdfFromHtml" in chunk)
print("return window.printViaIframe:", "printViaIframe" in chunk)

# Cari akhir fungsi cetakPDFSurat
end_markers = ['window.downloadPdfFromHtml', 'return window.print', 'printViaIframe(', 'window.open(']
for em in end_markers:
    p = html.find(em, idx)
    if p != -1 and p < idx + 35000:
        print()
        print("=== " + em + " di pos " + str(p-idx) + " ===")
        print(re.sub(r'\s+', ' ', html[p:p+200]).strip())

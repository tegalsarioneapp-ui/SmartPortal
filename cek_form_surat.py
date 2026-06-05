FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek form pengajuan surat lengkap
print('=== FULL FORM PENGAJUAN SURAT ===')
idx = html.find('id="form-pengajuan-surat"')
if idx != -1:
    print(re.sub(r'\s+',' ', html[idx:idx+3000]).strip())
else:
    print('MISSING')

print()
# Cek tombol submit di dalam form
print('=== TOMBOL SUBMIT DALAM FORM ===')
chunk = html[idx:idx+3000] if idx != -1 else ''
btns = re.findall(r'<button[^>]*>.*?</button>', chunk, re.DOTALL)
for b in btns:
    print(' ', re.sub(r'\s+',' ', b).strip()[:200])

print()
# Cek apakah ada display:none di form
print('=== CEK DISPLAY:NONE FORM ===')
hits = re.findall(r'form-pengajuan-surat[^"]*"[^>]*style="[^"]*display\s*:\s*none', html)
print('display:none hits:', hits)

# Cek CSS yang hide form
print()
print('=== CEK CSS HIDE FORM ===')
idx2 = html.find('form-pengajuan-surat')
while idx2 != -1:
    ctx = re.sub(r'\s+',' ', html[idx2:idx2+200]).strip()
    print(f'  pos {idx2}:', ctx[:200])
    idx2 = html.find('form-pengajuan-surat', idx2+1)

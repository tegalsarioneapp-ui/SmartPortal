FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek callback yang ada sekarang
print('=== CEK CALLBACK TAB WARGA ===')
hits = re.findall(r"'warga-[^']+'\s*:\s*function[^}]+}", html)
for h in hits:
    import re as re2
    print(' ', re2.sub(r'\s+',' ',h).strip()[:150])

# Cek openWargaTab fungsi
print()
print('=== openWargaTab ===')
idx = html.find('openWargaTab')
if idx != -1:
    print(re.sub(r'\s+',' ', html[idx:idx+600]).strip()[:600])

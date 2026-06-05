FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek isi loadSuratWarga lengkap
print('=== loadSuratWarga FULL ===')
idx = html.find('window.loadSuratWarga = function')
if idx != -1:
    # Ambil sampai fungsi berikutnya
    end = html.find('\nwindow.', idx+10)
    print(re.sub(r'\s+',' ', html[idx:end]).strip()[:3000])

print()
# Cek apakah ada yang set display:none pada form-pengajuan-surat
print('=== SET DISPLAY NONE form-pengajuan-surat ===')
hits = list(re.finditer(r"form-pengajuan-surat[^;]*display[^;]*none", html))
print(f'Total: {len(hits)}x')
for h in hits:
    ctx = re.sub(r'\s+',' ', html[h.start()-100:h.start()+200]).strip()
    print(f'  pos {h.start()}:', ctx[:300])

print()
# Cek CSS warga-tab-content
print('=== CSS warga-tab-content ===')
hits2 = re.findall(r'\.warga-tab-content[^{]*\{[^}]*\}', html, re.DOTALL)
for h in hits2:
    clean = re.sub(r'\s+',' ',h).strip()
    if 'display' in clean or 'visibility' in clean or 'overflow' in clean:
        print(' ', clean[:300])

print()
# Cek apakah ada CSS yang hide .card di dalam tab
print('=== CSS HIDE .card di dalam tab ===')
hits3 = re.findall(r'warga-tab-content[^{]*\.card[^{]*\{[^}]*display\s*:\s*none[^}]*\}', html, re.DOTALL)
for h in hits3:
    print(' ', re.sub(r'\s+',' ',h).strip()[:300])

FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

print('=== SEMUA tracking-surat-section display block ===')
hits = list(re.finditer(r"tracking-surat-section[^;]*display[^;]*block", html))
print('Total:', len(hits))
for h in hits:
    ctx = re.sub(r'\s+',' ', html[h.start()-100:h.start()+200]).strip()
    print()
    print(f'pos {h.start()}:', ctx[:300])

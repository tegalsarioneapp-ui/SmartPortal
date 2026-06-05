FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

print('=== CEK scale(0.4) di CSS ===')
hits = list(re.finditer(r'scale\s*\(\s*0\.4', html))
print(f'Total: {len(hits)}x')
for h in hits:
    ctx = re.sub(r'\s+',' ', html[h.start()-200:h.start()+200]).strip()
    print(f'\n  pos {h.start()}:')
    print(f'  {ctx[:400]}')

print()
print('=== CEK transform.*0.4 di CSS ===')
hits2 = list(re.finditer(r'transform[^;]*0\.4[^;]*;', html))
print(f'Total: {len(hits2)}x')
for h in hits2:
    ctx = re.sub(r'\s+',' ', html[h.start()-200:h.start()+200]).strip()
    print(f'\n  pos {h.start()}:')
    print(f'  {ctx[:400]}')

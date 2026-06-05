FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cek semua pemanggilan prosesLoginUniversal di HTML
print('=== SEMUA CALL prosesLoginUniversal ===')
hits = list(re.finditer(r'prosesLoginUniversal', html))
print(f'Total: {len(hits)}x')
for h in hits:
    ctx = re.sub(r'\s+',' ', html[h.start()-80:h.start()+100]).strip()
    print(f'\n  pos {h.start()}: {ctx[:250]}')

# Cek apakah script #19 ada defer/async
print()
print('=== SCRIPT TAG #19 attributes ===')
tags = list(re.finditer(r'<script[^>]*>', html))
if len(tags) >= 19:
    print(tags[18].group(0))

# Cek login form onsubmit
print()
print('=== LOGIN FORM onsubmit ===')
idx = html.find('id="login-screen"')
chunk = html[idx:idx+5000]
forms = re.findall(r'<form[^>]*>|onsubmit="[^"]*"', chunk)
for f in forms:
    print(' ', f)

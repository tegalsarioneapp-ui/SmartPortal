FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Extract semua JS
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js = "\n".join(scripts)
lines = all_js.split('\n')

print('=== AREA LINE 10600-10615 ===')
for i in range(10595, min(10620, len(lines))):
    print(f'{i+1:6d}: {lines[i]}')

print()
print('=== CEK: await Swal di JS ===')
hits = list(re.finditer(r'await\s+Swal', all_js))
print(f'Total await Swal: {len(hits)}x')
for h in hits[:10]:
    line_no = all_js[:h.start()].count('\n') + 1
    print(f'  line {line_no}: {re.sub(chr(10)," ",all_js[h.start()-30:h.start()+80]).strip()}')

print()
print('=== CEK: async function di JS ===')
asyncs = list(re.finditer(r'async\s+function|async\s*\(', all_js))
print(f'Total async: {len(asyncs)}x')
for a in asyncs[:10]:
    line_no = all_js[:a.start()].count('\n') + 1
    print(f'  line {line_no}: {re.sub(chr(10)," ",all_js[a.start():a.start()+80]).strip()}')

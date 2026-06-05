FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js = "\n".join(scripts)
lines = all_js.split('\n')

print('=== AREA LINE 3760-3790 ===')
for i in range(3755, min(3795, len(lines))):
    print(f'{i+1:6d}: {lines[i]}')

print()
print('=== FULL FUNCTION SEKITAR await Swal ===')
idx = all_js.find('await Swal.fire')
print(re.sub(r'\s+',' ', all_js[idx-500:idx+800]).strip())

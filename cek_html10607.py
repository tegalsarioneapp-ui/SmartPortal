FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()
import re

# Cari di HTML langsung - line 10607
lines = html.split('\n')
print(f'Total lines HTML: {len(lines)}')
print()
print('=== HTML LINE 10600-10615 ===')
for i in range(10596, min(10618, len(lines))):
    print(f'{i+1:6d}: {lines[i]}')

print()
print('=== HTML LINE 10580-10610 (konteks lebih luas) ===')
for i in range(10575, min(10612, len(lines))):
    print(f'{i+1:6d}: {lines[i]}')

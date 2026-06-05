FILE = 'artifacts/smart-portal-rt/index.html'
f = open(FILE, 'r', encoding='utf-8')
html = f.read()
f.close()

# Lihat L9370-9390
lines = html.split('\n')
print('=== L9370-9390 ===')
for i in range(9369, min(9391, len(lines))):
    print(f'{i+1:6d}: {lines[i][:200]}')

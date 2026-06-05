FILE = 'artifacts/smart-portal-rt/index.html'
with open(FILE, 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find("btnAction = s.status === 'Selesai'")
actual = html[idx:idx+303]
print('ACTUAL repr:')
print(repr(actual))

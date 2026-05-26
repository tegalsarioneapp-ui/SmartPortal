FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", newline='') as f:
    html = f.read()
html = html.replace('\r\n', '\n')

lines = html.split('\n')
for i, l in enumerate(lines):
    if 'lunasKurangBayarWarga' in l and "''" in l:
        print(f"Line {i+1}: {repr(l)}")
        fixed = l.replace("'' + key + ''", "\\' + key + \\'")
        fixed = fixed.replace("'' + w.nama + ''", "\\' + w.nama + \\'")
        print(f"Fixed:  {repr(fixed)}")
        lines[i] = fixed

html = '\n'.join(lines)
html = html.replace('\n', '\r\n')
with open(FILE, "w", encoding="utf-8", newline='') as f:
    f.write(html)
print("SELESAI")
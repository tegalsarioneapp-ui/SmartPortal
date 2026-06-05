import re

# Cari di semua file yang relevan
import os
targets = []
for root, dirs, files in os.walk("artifacts/smart-portal-rt"):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for f in files:
        if f.endswith(('.tsx', '.jsx', '.html', '.css')):
            targets.append(os.path.join(root, f))

keyword = ['sidebar', 'mobile', 'left-panel', 'nav', 'hamburger', 'drawer']

for path in targets:
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    lines = content.split('\n')
    hits = []
    for i, line in enumerate(lines):
        if any(k in line.lower() for k in keyword):
            hits.append(f"  L{i+1}: {line.strip()[:100]}")
    if hits:
        print(f"\n=== {path} ({len(hits)} hits) ===")
        for h in hits[:15]:
            print(h)

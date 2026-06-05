import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

lines = content.split('\n')

# Cari openLeft dan openMobileLeft
for fname in ['openLeft', 'openMobileLeft', 'closePanels', 'ensureSide']:
    print(f"\n=== {fname} ===")
    for i, line in enumerate(lines):
        if f'function {fname}' in line:
            for j in range(i, min(i+25, len(lines))):
                print(f"  L{j+1}: {lines[j].rstrip()[:120]}")
                if j > i and lines[j].strip() in ['}', '};']:
                    break

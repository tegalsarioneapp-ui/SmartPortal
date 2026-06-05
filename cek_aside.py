import re

FILES = [
    "artifacts/smart-portal-rt/src/pages/portal-admin/index.tsx",
    "artifacts/smart-portal-rt/src/pages/portal-warga/index.tsx",
]

for FILE in FILES:
    with open(FILE, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split('\n')
    print(f"\n=== {FILE} ===")
    for i, line in enumerate(lines):
        if 'aside' in line.lower() or 'w-72' in line or 'fixed' in line.lower():
            print(f"  L{i+1}: {line.strip()[:120]}")

FILES = [
    "artifacts/smart-portal-rt/src/pages/portal-admin/index.tsx",
    "artifacts/smart-portal-rt/src/pages/portal-warga/index.tsx",
]
for FILE in FILES:
    with open(FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        if "85vw" in line or "w-72" in line:
            print(f"  {FILE} L{i+1}: {line.strip()[:100]}")

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("=== L18580 - L18610 ===")
for i in range(18578, min(18612, len(lines))):
    marker = " <<< ERROR" if i == 18592 else ""
    print(f"  L{i+1}: {lines[i].rstrip()[:250]}{marker}")

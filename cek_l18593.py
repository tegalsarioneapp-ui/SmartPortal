FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Tampilkan L18580 - L18610
print("=== SEKITAR L18593 ===")
for i, line in enumerate(lines[18575:18615], start=18576):
    marker = " <<< ERROR" if i == 18593 else ""
    print(f"  L{i}: {line.rstrip()[:200]}{marker}")

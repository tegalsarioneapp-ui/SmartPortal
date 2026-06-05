import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Tampilkan L6130-6145
print("=== L6130-6145 ===")
for i in range(6129, min(6145, len(lines))):
    print(str(i+1).rjust(6) + ": " + lines[i].rstrip())

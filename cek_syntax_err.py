import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split("\n")

print("=== L6090-6102 ===")
for i in range(6089, min(6102, len(lines))):
    print(str(i+1) + ": " + lines[i][:200])

print()
print("=== L10713-10725 ===")
for i in range(10712, min(10725, len(lines))):
    print(str(i+1) + ": " + lines[i][:200])

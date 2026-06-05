import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

lines = content.split('\n')

# Lihat L6700-L6710 exact
print("=== L6700-L6710 HAMBURGER BUTTON ===")
for i in range(6698, 6712):
    print(f"  L{i+1}: {lines[i].rstrip()}")

# Lihat L19290-L19300 override gtSpOpen
print("\n=== L19290-L19300 override gtSpOpen ===")
for i in range(19288, 19302):
    if i < len(lines):
        print(f"  L{i+1}: {lines[i].rstrip()}")

# Lihat L18854-L18865 oldGtSpOpen
print("\n=== L18854-L18865 oldGtSpOpen ===")
for i in range(18852, 18866):
    if i < len(lines):
        print(f"  L{i+1}: {lines[i].rstrip()}")

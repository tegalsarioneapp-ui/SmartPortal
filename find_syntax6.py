import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
block18 = scripts[18]
lines = block18.split('\n')

print(f"=== BLOCK 18 LINE 30-60 ===")
for i in range(29, 60):
    if i < len(lines):
        print(f"  {i+1}: {lines[i]}")

print("\nDone.")

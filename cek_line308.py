import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js = "\n".join(scripts)
lines = all_js.split("\n")

print("=== JS LINE 300-320 ===")
for i in range(299, min(320, len(lines))):
    print(f"  L{i+1}: {lines[i][:200]}")

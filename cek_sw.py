import re

FILE = "artifacts/smart-portal-rt/public/sw.js"
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

print("=== ISI sw.js ===")
print(f"  Size: {len(content)} chars")

# Cari semua baris yang mengandung rt005
print("\n=== BARIS MENGANDUNG rt005 ===")
lines = content.split("\n")
for i, line in enumerate(lines, 1):
    if "rt005" in line:
        print(f"  L{i}: {line.strip()[:200]}")

# Cari semua baris yang mengandung password
print("\n=== BARIS MENGANDUNG password ===")
for i, line in enumerate(lines, 1):
    if "password" in line.lower():
        print(f"  L{i}: {line.strip()[:200]}")

# Cari cache strategy
print("\n=== CACHE STRATEGY ===")
cache_hits = re.findall(r'cache\w*\s*[=:]\s*.{0,100}', content, re.IGNORECASE)
for h in cache_hits[:10]:
    print(f"  {h.strip()[:120]}")

import re
FILE = "artifacts/smart-portal-rt/public/_sync.js"
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

print("=== API_BASE_URL ===")
m = re.search(r'var API_BASE_URL\s*=\s*[^\n;]+;', content)
print(f"  {m.group(0) if m else 'NOT FOUND'}")

print("\n=== Semua URL yang dipakai ===")
for m in re.finditer(r"(https?://[^\s'\"`,)]+|['\"`]/api[^\s'\"`,)]*)", content):
    ln = content[:m.start()].count('\n') + 1
    print(f"  L{ln}: {m.group(0)[:80]}")

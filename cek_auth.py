import re

FILE = "artifacts/smart-portal-rt/src/contexts/auth-context.tsx"
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

print("=== ISI LENGKAP auth-context.tsx ===")
print(content)

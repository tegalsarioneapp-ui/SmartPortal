import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Ambil full fungsi approveSurat / accSurat
print("=== FULL POPUP ACC (L10660-10695) ===")
lines = html.split('\n')
for i in range(10650, min(10700, len(lines))):
    print(str(i+1).rjust(6) + ": " + lines[i][:120])

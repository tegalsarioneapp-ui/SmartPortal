FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(6089, min(6105, len(lines))):
    print(str(i+1) + ": " + repr(lines[i][:300]))

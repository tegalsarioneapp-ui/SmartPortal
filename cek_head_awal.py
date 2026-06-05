FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split("\n")
print("=== 20 BARIS PERTAMA ===")
for i in range(0, 20):
    print(str(i+1) + ": " + repr(lines[i][:200]))

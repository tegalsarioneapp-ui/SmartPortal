FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split('\n')
print("=== loadSuratAdmin L10600-10645 ===")
for i in range(10599, min(10645, len(lines))):
    print(str(i+1).rjust(6) + ": " + lines[i][:150])

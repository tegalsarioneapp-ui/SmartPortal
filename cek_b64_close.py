FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split("\n")
# Cek baris 5 (index 4) - panjang dan akhirnya
line5 = lines[4]
print("Panjang L5: " + str(len(line5)))
print("Akhir L5: " + repr(line5[-30:]))
print("L6: " + repr(lines[5]))

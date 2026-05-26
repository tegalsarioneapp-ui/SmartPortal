FILE = "artifacts/smart-portal-rt/index.html"
TXT  = "matriks_html.txt"

with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

with open(TXT, "r", encoding="utf-8") as f:
    new_block = f.read()

OLD_START = '        <div id="ben-matriks" class="ben-tab-content">'
OLD_END   = '        <div id="ben-penagihan" class="ben-tab-content">'

i_start = html.find(OLD_START)
i_end   = html.find(OLD_END)

if i_start == -1:
    print("GAGAL: ben-matriks tidak ditemukan")
    exit(1)
if i_end == -1:
    print("GAGAL: ben-penagihan tidak ditemukan")
    exit(1)

print(f"Ditemukan ben-matriks  : char {i_start}")
print(f"Ditemukan ben-penagihan: char {i_end}")
print(f"Panjang blok lama      : {i_end - i_start} chars")

html = html[:i_start] + new_block + "\n        " + html[i_end:]

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: ben-matriks berhasil diganti!")
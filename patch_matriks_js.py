FILE = "artifacts/smart-portal-rt/index.html"
TXT  = "matriks_js.txt"

with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

with open(TXT, "r", encoding="utf-8") as f:
    new_js = f.read()

START = "    window.loadMatriksIuran = function() {"
END   = "    window.cariTagihan = function(e) {"

i_start = html.find(START)
i_end   = html.find(END, i_start)

if i_start == -1:
    print("GAGAL: loadMatriksIuran tidak ditemukan")
    exit(1)
if i_end == -1:
    print("GAGAL: cariTagihan tidak ditemukan")
    exit(1)

print(f"loadMatriksIuran start : {i_start}")
print(f"cariTagihan start      : {i_end}")
print(f"Panjang blok lama      : {i_end - i_start} chars")

html = html[:i_start] + new_js + "\n\n    " + html[i_end:]

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: loadMatriksIuran berhasil diupgrade!")
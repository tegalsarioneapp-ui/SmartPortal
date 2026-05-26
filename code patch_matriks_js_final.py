FILE = "artifacts/smart-portal-rt/index.html"

with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Baca JS baru dari file txt
with open("js_accordion_a.txt", "r", encoding="utf-8") as f:
    NEW_JS = f.read()

START = "window.loadMatriksIuran = function() {"
END   = "window.cariTagihan = function"

i_start = html.find(START)
i_end   = html.find(END, i_start)

if i_start == -1: print("GAGAL: loadMatriksIuran tidak ditemukan"); exit(1)
if i_end   == -1: print("GAGAL: cariTagihan tidak ditemukan"); exit(1)

print(f"Start: {i_start}, End: {i_end}, Panjang lama: {i_end - i_start}")

html = html[:i_start] + NEW_JS + "\n\n    " + html[i_end:]

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("OK: loadMatriksIuran berhasil diganti!")

# Verifikasi
if "mtrx-accordion-wrap" in html and "toggleMtrxRow" in html:
    print("OK: accordion wrap & toggleMtrxRow ditemukan")
else:
    print("PERINGATAN: cek hasil patch!")
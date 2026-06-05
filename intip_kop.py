import os

FILE = "artifacts/smart-portal-rt/index.html"

if not os.path.exists(FILE):
    print("File tidak ditemukan!")
    exit()

with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

target = "PEMERINTAH KOTA SEMARANG"
pos = html.find(target)

if pos == -1:
    # Coba cari dengan variasi lowercase jika tidak ketemu
    pos = html.upper().find(target)

if pos == -1:
    print("Waduh, teks 'PEMERINTAH KOTA SEMARANG' tidak ditemukan di file ini.")
else:
    print(f"Target ditemukan di posisi karakter: {pos}")
    # Ambil 400 karakter sebelum dan 500 karakter sesudah kata kunci
    start = max(0, pos - 400)
    end = min(len(html), pos + 500)
    
    print("\n================== ISI KODE KOP SURAT ANDA SEBENARNYA ==================")
    print(html[start:end])
    print("========================================================================")

file = 'artifacts/smart-portal-rt/index.html'
with open(file, 'r', encoding='utf-8') as f:
    html = f.read()

# Cek apakah string target ada
targets = [
    'Identitas Lingkungan',
    'Ganti Password Sistem',
    'Backup &amp; Restore Database',
    'Notifikasi Push ke Warga',
    'Zona Berbahaya',
]
for t in targets:
    print('ADA' if t in html else 'TIDAK ADA', '|', t)

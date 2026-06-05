import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cari semua script block yang mengandung #t1s
scripts_with_pos = []
for m in re.finditer(r'<script([^>]*)>(.*?)</script>', html, re.DOTALL):
    if '#t1s' in m.group(2):
        line = html.count('\n', 0, m.start()) + 1
        scripts_with_pos.append((m.start(), m.end(), line, m.group(1), m.group(2)))

print("=== SCRIPT BLOCKS YANG MENGANDUNG #t1s ===")
print("Jumlah: " + str(len(scripts_with_pos)))
print()

for pos_start, pos_end, line, attrs, content in scripts_with_pos:
    print("Script L" + str(line) + " attrs=" + repr(attrs.strip()))
    print("  Panjang content: " + str(len(content)))
    # Cari posisi #t1s pertama
    t1s_pos = content.find('#t1s')
    print("  #t1s pertama di offset: " + str(t1s_pos))
    print("  100 chars sebelum #t1s:")
    print("    " + re.sub(r'\s+', ' ', content[max(0,t1s_pos-100):t1s_pos]).strip())
    print("  100 chars setelah #t1s:")
    print("    " + re.sub(r'\s+', ' ', content[t1s_pos:t1s_pos+100]).strip())
    print()
    # Cari tag </style> atau <style> yang hilang
    has_style_open = '<style' in content[:t1s_pos]
    has_style_close = '</style>' in content[:t1s_pos]
    print("  Ada <style> sebelum #t1s: " + str(has_style_open))
    print("  Ada </style> sebelum #t1s: " + str(has_style_close))
    print()
    # Tampilkan 200 chars di sekitar masalah
    print("  KONTEKS LENGKAP:")
    print(repr(content[max(0,t1s_pos-200):t1s_pos+300]))
    print()

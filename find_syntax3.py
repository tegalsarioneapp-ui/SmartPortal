import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Ekstrak semua script
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js = ""
line_map = []
for i, s in enumerate(scripts):
    start_line = len(all_js.split('\n'))
    all_js += s
    end_line = len(all_js.split('\n'))
    line_map.append((i, start_line, end_line))

with open("_temp_all.js", "w", encoding="utf-8") as f:
    f.write(all_js)

# Cek line 6340-6365
js_lines = all_js.split('\n')
print(f"Total JS lines: {len(js_lines)}")
print("\n=== JS LINE 6335-6365 ===")
for i in range(6333, 6365):
    if i < len(js_lines):
        print(f"{i+1}: {js_lines[i]}")

# Cari block mana yang bermasalah
for i, (bi, sl, el) in enumerate(line_map):
    if sl <= 6350 <= el:
        print(f"\nError ada di script block {bi} (line {sl}-{el})")
        break

print("\nDone.")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js  = "\n".join(scripts)
lines   = all_js.split('\n')

print(f"Total JS lines: {len(lines)}")

# Line 6905-akhir
print("\n=== LINE 6905 - AKHIR ===")
for i in range(6904, len(lines)):
    print(f"{i+1:6d}: {lines[i]}")

# Bracket balance
oc = all_js.count("{")
cc = all_js.count("}")
op = all_js.count("(")
cp = all_js.count(")")
print(f"\n{{ open : {oc}")
print(f"}} close: {cc}")
print(f"diff   : {oc-cc}")
print(f"( open : {op}")
print(f") close: {cp}")
print(f"diff   : {op-cp}")

# Temukan { terakhir yang tidak tertutup
depth = 0
last_open_pos = 0
for i, ch in enumerate(all_js):
    if ch == "{":
        depth += 1
        last_open_pos = i
    elif ch == "}":
        depth -= 1

ln = all_js[:last_open_pos].count("\n") + 1
print(f"\nDepth akhir : {depth}")
print(f"{{ terakhir di JS line: {ln}")
print(f"Konteks: {all_js[last_open_pos:last_open_pos+120].strip()}")

print("\nDone.")

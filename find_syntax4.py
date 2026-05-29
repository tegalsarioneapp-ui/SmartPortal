import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js = ""
for s in scripts:
    all_js += s + "\n"

js_lines = all_js.split('\n')

# Cek satu per satu script block sampai ketemu yang error
print("=== CEK TIAP SCRIPT BLOCK ===")
cumulative = ""
error_block = -1
for i, s in enumerate(scripts):
    cumulative += s + "\n"
    with open("_temp_check.js", "w", encoding="utf-8") as f:
        f.write(cumulative)
    result = subprocess.run(["node", "--check", "_temp_check.js"], capture_output=True, text=True)
    if result.stderr:
        print(f"ERROR pertama di block {i}: {result.stderr[:200]}")
        error_block = i
        break
    else:
        print(f"Block {i}: OK")

# Tampilkan isi block yang error
if error_block >= 0:
    print(f"\n=== ISI SCRIPT BLOCK {error_block} (500 chars terakhir) ===")
    snippet = scripts[error_block][-500:]
    lines = snippet.split('\n')
    for j, l in enumerate(lines):
        print(f"  {j}: {l}")

print("\nDone.")

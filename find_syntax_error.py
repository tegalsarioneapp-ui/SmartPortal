import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Ekstrak semua script ke file JS sementara
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script blocks: {len(scripts)}")

# Gabung semua script
all_js = ""
for i, s in enumerate(scripts):
    all_js += f"\n// === SCRIPT BLOCK {i} ===\n"
    all_js += s

with open("_temp_all.js", "w", encoding="utf-8") as f:
    f.write(all_js)

# Cek dengan node.js
print("\n=== NODE.JS SYNTAX CHECK ===")
result = subprocess.run(
    ["node", "--check", "_temp_all.js"],
    capture_output=True, text=True
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)

# Cari pola ')' yang mencurigakan di script baru kita
print("\n=== CEK SCRIPT gt-toggle-sidebar-restore ===")
idx = html.find('id="gt-toggle-sidebar-restore"')
if idx > -1:
    snippet = html[idx:idx+800]
    print(snippet)

print("\nDone.")

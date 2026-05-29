import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)

# Cek block 18 saja
block18 = scripts[18]
lines = block18.split('\n')
print(f"Block 18 total lines: {len(lines)}")

# Cek syntax block 18 saja
with open("_temp_b18.js", "w", encoding="utf-8") as f:
    f.write(block18)

result = subprocess.run(["node", "--check", "_temp_b18.js"], capture_output=True, text=True)
print(f"Block 18 alone: {result.stderr[:300] if result.stderr else 'OK'}")

# Cek block 17 akhir
block17 = scripts[17]
lines17 = block17.split('\n')
print(f"\n=== AKHIR BLOCK 17 (last 20 lines) ===")
for i, l in enumerate(lines17[-20:]):
    print(f"  {len(lines17)-20+i}: {l}")

# Cek awal block 18
print(f"\n=== AWAL BLOCK 18 (first 30 lines) ===")
for i, l in enumerate(lines[:30]):
    print(f"  {i}: {l}")

# Cari 'else' di block 18
print(f"\n=== CARI 'else' DI BLOCK 18 ===")
for i, l in enumerate(lines):
    if ' else ' in l or l.strip().startswith('else'):
        print(f"  line {i}: {l}")

print("\nDone.")

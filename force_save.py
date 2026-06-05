import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", newline="") as f:
    html = f.read()

print(f"Size awal: {len(html):,}")

# Cek kondisi sekarang
print(f"innerWidth<769 : {html.count('innerWidth<769')}")
print(f"innerWidth<768 : {html.count('innerWidth<768')}")
print(f"(s-60)<0       : {html.count('(s-60)<0')}")
print(f"s<60           : {html.count('s<60')}")

# Tampilkan semua < angka yang masih ada di script
print("\n=== SEMUA < ANGKA DI SCRIPT ===")
for i, s in enumerate(re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)):
    for m in re.finditer(r'\w<\d', s):
        ctx = s[max(0,m.start()-40):m.start()+50]
        print(f"  script#{i} pos {m.start()}: {repr(ctx)}")

# Tampilkan semua < di luar tag HTML di script
print("\n=== DETAIL L17148-17155 ===")
lines = html.split("\n")
for i in range(17147, min(17155, len(lines))):
    line = lines[i]
    lts = [j for j,c in enumerate(line) if c=="<"]
    print(f"L{i+1} ({len(line)} chars, {len(lts)}x '<'): {line[:300]}")

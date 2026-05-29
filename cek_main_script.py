import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

def get_line(h, pos):
    return h[:pos].count('\n') + 1

scripts = list(re.finditer(r'<script[^>]*>(.*?)</script>', html, re.DOTALL))
print(f"Total script tags: {len(scripts)}")

# Cek bracket balance SETIAP script
print("\n=== BRACKET BALANCE PER SCRIPT ===")
problem_scripts = []
for i, s in enumerate(scripts):
    c = s.group(1)
    oc = c.count('{')
    cc = c.count('}')
    op = c.count('(')
    cp = c.count(')')
    ln = get_line(html, s.start())
    lines_count = c.count('\n')
    status = "OK" if (oc==cc and op==cp) else "!! MASALAH"
    if oc != cc or op != cp:
        problem_scripts.append((i, s, ln, c))
    print(f"  Script[{i+1:2d}] L{ln:6d} ({lines_count:4d} lines) | {{={oc} }}={cc} d={oc-cc:+d} | (={op} )={cp} d={op-cp:+d} | {status}")

# Detail script bermasalah
print(f"\n=== DETAIL SCRIPT BERMASALAH ({len(problem_scripts)}x) ===")
for i, s, ln, content in problem_scripts:
    lines_s = content.split('\n')
    print(f"\n--- Script[{i+1}] L{ln} ({len(lines_s)} lines) ---")
    # 15 baris pertama
    print("[ AWAL ]")
    for l in lines_s[:15]:
        print(f"  {l[:120]}")
    # 15 baris terakhir
    print("[ AKHIR ]")
    for l in lines_s[-15:]:
        print(f"  {l[:120]}")

    # Temukan { yang tidak tertutup
    depth = 0
    last_opens = []
    for pos, ch in enumerate(content):
        if ch == '{':
            depth += 1
            last_opens.append(pos)
        elif ch == '}':
            depth -= 1
            if last_opens:
                last_opens.pop()
    print(f"\n  Depth akhir: {depth}")
    print(f"  { tidak tertutup ({len(last_opens)}x):")
    for p in last_opens[-5:]:
        lno = content[:p].count('\n') + 1
        print(f"    line {lno}: {content[p:p+80].strip()}")

print("\nDone.")

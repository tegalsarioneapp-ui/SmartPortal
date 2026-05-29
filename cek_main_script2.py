import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

def get_line(h, pos):
    return h[:pos].count('\n') + 1

scripts = list(re.finditer(r'<script[^>]*>(.*?)</script>', html, re.DOTALL))
print(f"Total script tags: {len(scripts)}")

print("\n=== BRACKET BALANCE PER SCRIPT ===")
problem_scripts = []
for i, s in enumerate(scripts):
    c = s.group(1)
    oc = c.count('{')
    cc = c.count('}')
    op = c.count('(')
    cp = c.count(')')
    ln = get_line(html, s.start())
    lc = c.count('\n')
    status = "OK" if (oc==cc and op==cp) else "!! MASALAH"
    if oc != cc or op != cp:
        problem_scripts.append((i, s, ln, c))
    print(f"  Script[{i+1:2d}] L{ln:6d} ({lc:4d} lines) | open={oc} close={cc} d={oc-cc:+d} | open(={op} close)={cp} d={op-cp:+d} | {status}")

print("\n=== DETAIL SCRIPT BERMASALAH ===")
for i, s, ln, content in problem_scripts:
    lines_s = content.split('\n')
    print(f"\n--- Script[{i+1}] L{ln} ({len(lines_s)} lines) ---")
    print("[ AWAL 15 baris ]")
    for l in lines_s[:15]:
        print(f"  {l[:120]}")
    print("[ AKHIR 15 baris ]")
    for l in lines_s[-15:]:
        print(f"  {l[:120]}")

    # Temukan bracket tidak tertutup
    depth = 0
    unclosed = []
    for pos, ch in enumerate(content):
        if ch == '{':
            depth += 1
            unclosed.append(pos)
        elif ch == '}':
            depth -= 1
            if unclosed:
                unclosed.pop()
    num_unclosed = len(unclosed)
    print(f"\n  Depth akhir   : {depth}")
    print(f"  Unclosed brace: {num_unclosed}x")
    for p in unclosed[-5:]:
        lno = content[:p].count('\n') + 1
        ctx = content[p:p+80].replace('\n',' ').strip()
        print(f"    JS line {lno}: {ctx}")

print("\nDone.")

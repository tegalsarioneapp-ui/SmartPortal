import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Temukan script yang tidak balance
opens  = list(re.finditer(r'<script[^>]*>', html))
closes = list(re.finditer(r'</script>', html))

print(f"opens : {len(opens)}x")
print(f"closes: {len(closes)}x")

# Pasangkan satu per satu
print("\n=== PASANGAN SCRIPT ===")
used_close = set()
orphan_closes = []
for i, op in enumerate(opens):
    # Cari close terdekat setelah open ini
    matched = None
    for cl in closes:
        if cl.start() > op.start() and cl not in used_close:
            matched = cl
            used_close.add(cl)
            break
    if matched:
        ln_o = html[:op.start()].count("\n") + 1
        ln_c = html[:matched.start()].count("\n") + 1
        tag = op.group()[:60]
        print(f"  [{i+1}] open L{ln_o} -> close L{ln_c} | {tag}")
    else:
        ln_o = html[:op.start()].count("\n") + 1
        print(f"  [{i+1}] open L{ln_o} -> !! TIDAK ADA CLOSE | {op.group()[:60]}")

# Cari close yang tidak punya pasangan
print("\n=== </script> TANPA PASANGAN (ORPHAN) ===")
for cl in closes:
    if cl not in used_close:
        ln = html[:cl.start()].count("\n") + 1
        ctx = html[max(0,cl.start()-100):cl.start()+20].replace("\n"," ").strip()
        print(f"  orphan </script> L{ln}: {ctx[:200]}")

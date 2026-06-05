import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

hits = list(re.finditer(r'document\.write', html))
print(f"document.write ditemukan: {len(hits)}x\n")

for h in hits:
    ln = html[:h.start()].count("\n") + 1
    # Tampilkan 300 chars sebelum dan sesudah untuk konteks lengkap
    start = max(0, h.start() - 100)
    end   = min(len(html), h.start() + 300)
    ctx   = html[start:end].replace("\n", "\\n")
    print(f"=== L{ln} (pos {h.start()}) ===")
    print(ctx)
    print()

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Cek apakah ada </body> dan </html>
print(f"</body>  ada: {'</body>' in html}")
print(f"</html>  ada: {'</html>' in html}")
print(f"Total chars: {len(html):,}")
print(f"Total baris: {html.count(chr(10)):,}")

# Cek 5 baris terakhir
lines = html.split("\n")
print("\n=== 5 BARIS TERAKHIR ===")
for i, line in enumerate(lines[-5:], start=len(lines)-4):
    print(f"  L{i}: {repr(line[:100])}")

# Cek apakah ada script yang tidak tertutup
import re
opens  = len(re.findall(r'<script[^>]*>', html))
closes = len(re.findall(r'</script>', html))
print(f"\nScript: {opens} opens / {closes} closes")

# Cek style yang tidak tertutup
s_opens  = len(re.findall(r'<style[^>]*>', html))
s_closes = len(re.findall(r'</style>', html))
print(f"Style:  {s_opens} opens / {s_closes} closes")

import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split("\n")
total = len(lines)
print(f"Total baris: {total}")

# Cari posisi </body> dan </html>
body_hits = [i+1 for i,l in enumerate(lines) if '</body>' in l]
html_hits = [i+1 for i,l in enumerate(lines) if '</html>' in l]
print(f"\n</body> di baris: {body_hits}")
print(f"</html> di baris: {html_hits}")

# Cek apa yang ada setelah </body></html> terakhir
if html_hits:
    last_html = max(html_hits)
    print(f"\n=== SETELAH </html> (L{last_html}) ===")
    for i in range(last_html-1, min(last_html+10, total)):
        print(f"  L{i+1}: {lines[i][:200]}")

# Cek apakah ada style yang tidak tertutup setelah </body>
last_body_pos = html.rfind('</body>')
last_style_pos = html.rfind('</style>')
print(f"\n</body>  posisi terakhir: {last_body_pos}")
print(f"</style> posisi terakhir: {last_style_pos}")
if last_style_pos > last_body_pos:
    print("!! MASALAH: <style> masih terbuka SETELAH </body>")
    # Tampilkan area setelah </body>
    print("\n=== KONTEN SETELAH </body> ===")
    after = html[last_body_pos:]
    print(after[:500])

import subprocess, os

FILE = "artifacts/smart-portal-rt/index.html"

# Baca file
with open(FILE, "rb") as f:
    data = f.read()

print(f"Size: {len(data):,} bytes")

# Tulis ulang dengan CRLF -> LF normalisasi
normalized = data.replace(b"\r\n", b"\n")
print(f"Size setelah normalize: {len(normalized):,} bytes")

with open(FILE, "wb") as f:
    f.write(normalized)

# Force git
os.system("git config core.autocrlf false")
os.system("git rm --cached artifacts/smart-portal-rt/index.html")
os.system("git add artifacts/smart-portal-rt/index.html")
r = subprocess.run(["git", "status", "artifacts/smart-portal-rt/index.html"], capture_output=True, text=True)
print(r.stdout)

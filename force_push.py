import subprocess, os

FILE = "artifacts/smart-portal-rt/index.html"

# 1. Baca file lokal
with open(FILE, "rb") as f:
    data = f.read()
print(f"Local size: {len(data):,}")

# 2. Buat blob object langsung
r = subprocess.run(
    ["git", "hash-object", "-w", FILE],
    capture_output=True, text=True
)
blob_hash = r.stdout.strip()
print(f"Blob hash: {blob_hash}")

# 3. Update index dengan blob baru
r2 = subprocess.run(
    ["git", "update-index", "--cacheinfo", f"100644,{blob_hash},artifacts/smart-portal-rt/index.html"],
    capture_output=True, text=True
)
print(f"Update index: {r2.returncode} {r2.stderr}")

# 4. Write tree
r3 = subprocess.run(["git", "write-tree"], capture_output=True, text=True)
tree_hash = r3.stdout.strip()
print(f"Tree hash: {tree_hash}")

# 5. Commit
r4 = subprocess.run(
    ["git", "commit-tree", tree_hash, "-p", "HEAD", "-m", 
     "fix: ganti operator < angka di script agar Vite HTML parser tidak error"],
    capture_output=True, text=True
)
commit_hash = r4.stdout.strip()
print(f"Commit hash: {commit_hash}")
print(f"Stderr: {r4.stderr}")

# 6. Update HEAD
r5 = subprocess.run(
    ["git", "update-ref", "HEAD", commit_hash],
    capture_output=True, text=True
)
print(f"Update HEAD: {r5.returncode} {r5.stderr}")

# 7. Push
print("\nPushing...")
r6 = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True)
print(r6.stdout)
print(r6.stderr)

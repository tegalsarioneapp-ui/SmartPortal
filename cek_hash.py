import hashlib, subprocess, os

f = open('artifacts/smart-portal-rt/index.html','rb')
data = f.read()
f.close()

md5 = hashlib.md5(data).hexdigest()
size = len(data)
print(f'Local file size : {size:,} bytes')
print(f'Local MD5       : {md5}')

# Cek git blob hash
result = subprocess.run(
    ['git', 'hash-object', 'artifacts/smart-portal-rt/index.html'],
    capture_output=True, text=True
)
print(f'Git blob hash   : {result.stdout.strip()}')

# Cek hash di HEAD
result2 = subprocess.run(
    ['git', 'ls-tree', 'HEAD', 'artifacts/smart-portal-rt/index.html'],
    capture_output=True, text=True
)
print(f'HEAD tree entry : {result2.stdout.strip()}')

import os, hashlib

# Cek semua _sync.js di seluruh project
print("=== SEMUA _sync.js ===")
for root, dirs, files in os.walk("."):
    # Skip node_modules
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
    for f in files:
        if f == "_sync.js":
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            md5 = hashlib.md5(content.encode()).hexdigest()[:8]
            # Cek API_BASE_URL di file ini
            import re
            m = re.search(r'var API_BASE_URL\s*=\s*[^\n;]+;', content)
            url_val = m.group(0) if m else "NOT FOUND"
            print(f"  {path}")
            print(f"    MD5: {md5} | Size: {len(content):,}")
            print(f"    API_BASE_URL: {url_val}")

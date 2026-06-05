IDX = "artifacts/smart-portal-rt/index.html"
with open(IDX, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

# Lihat L17125-17150 persis setelah patch
print("=== L17120-17155 SETELAH PATCH ===")
for i in range(17119, 17156):
    print(f"  L{i+1}: {lines[i].rstrip()[:130]}")

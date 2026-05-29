import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

lines = html.split('\n')

def get_line(pos):
    return html[:pos].count('\n') + 1

# ══════════════════════════════════════════════
# 1. Semua fungsi yang namanya mengandung "login/Login/keluar/Keluar/logout/portal/Portal"
# ══════════════════════════════════════════════
print("=== 1. SEMUA FUNGSI LOGIN/PORTAL ===")
fns = re.finditer(
    r'(function\s+(\w*[Ll]ogin\w*|\w*[Kk]eluar\w*|\w*[Ll]ogout\w*|\w*[Pp]ortal\w*|\w*[Ss]ession\w*)\s*\(|window\.(\w*[Ll]ogin\w*|\w*[Kk]eluar\w*|\w*[Ll]ogout\w*|\w*[Pp]ortal\w*|\w*[Ss]ession\w*)\s*=\s*function)',
    html
)
for m in fns:
    ln = get_line(m.start())
    name = m.group(2) or m.group(3)
    print(f"  L{ln:5d}: {name}")

# ══════════════════════════════════════════════
# 2. Semua onclick/onsubmit yang berhubungan login
# ══════════════════════════════════════════════
print("\n=== 2. ONCLICK/ONSUBMIT LOGIN ===")
triggers = re.finditer(
    r'(onclick|onsubmit)="([^"]*(?:login|Login|keluar|Keluar|logout|BukaPortal|bukaForm)[^"]*)"',
    html
)
for m in triggers:
    ln = get_line(m.start())
    print(f"  L{ln:5d}: [{m.group(1)}] {m.group(2)[:120]}")

# ══════════════════════════════════════════════
# 3. Semua pemanggilan BukaPortal
# ══════════════════════════════════════════════
print("\n=== 3. PEMANGGILAN BukaPortal ===")
calls = re.finditer(r'BukaPortal\s*\([^)]*\)', html)
for m in calls:
    ln = get_line(m.start())
    print(f"  L{ln:5d}: {m.group(0)}")

# ══════════════════════════════════════════════
# 4. Semua display manipulasi login-screen/login-form-view/splash-view
# ══════════════════════════════════════════════
print("\n=== 4. DISPLAY MANIPULASI LOGIN ELEMENTS ===")
manips = re.finditer(
    r'.{0,40}(login-screen|login-form-view|splash-view).{0,80}(display|style|show|hide).{0,60}',
    html
)
seen = set()
for m in manips:
    ln = get_line(m.start())
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    if clean not in seen:
        seen.add(clean)
        print(f"  L{ln:5d}: {clean[:160]}")

# ══════════════════════════════════════════════
# 5. localStorage keys terkait session/login
# ══════════════════════════════════════════════
print("\n=== 5. LOCALSTORAGE SESSION KEYS ===")
keys = re.findall(r"localStorage\.(getItem|setItem|removeItem)\(['\"]([^'\"]*(?:session|login|warga|auth|biometric|hint)[^'\"]*)['\"]", html)
seen2 = set()
for op, key in keys:
    if key not in seen2:
        seen2.add(key)
        print(f"  {op:12s}: {key}")

# ══════════════════════════════════════════════
# 6. Duplikat fungsi (sama nama lebih dari 1x)
# ══════════════════════════════════════════════
print("\n=== 6. DUPLIKAT FUNGSI ===")
all_fns = re.findall(
    r'(?:function\s+(\w+)\s*\(|window\.(\w+)\s*=\s*function)',
    html
)
from collections import Counter
fn_names = [a or b for a, b in all_fns]
counts = Counter(fn_names)
for name, cnt in counts.items():
    if cnt > 1 and any(k in name.lower() for k in ['login','keluar','logout','portal','session','splash','buka']):
        print(f"  {name}: {cnt}x")

# ══════════════════════════════════════════════
# 7. __GT_PORTAL_ACTIVE__ usage
# ══════════════════════════════════════════════
print("\n=== 7. __GT_PORTAL_ACTIVE__ USAGE ===")
usages = re.finditer(r'.{0,30}__GT_PORTAL_ACTIVE__.{0,60}', html)
for m in usages:
    ln = get_line(m.start())
    clean = re.sub(r'\s+', ' ', m.group(0)).strip()
    print(f"  L{ln:5d}: {clean}")

print("\nDone.")

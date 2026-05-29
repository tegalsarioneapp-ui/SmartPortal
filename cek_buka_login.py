import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# CEK 1: Isi fungsi bukaFormLogin
print("=== CEK 1: FUNGSI bukaFormLogin ===")
fn = re.search(
    r'(function bukaFormLogin|window\.bukaFormLogin\s*=\s*function).*?(?=\nwindow\.|\nfunction |\n\s*//\s*={5})',
    html, re.DOTALL
)
if fn:
    clean = re.sub(r'\s+', ' ', fn.group(0)).strip()
    print(clean[:600])
else:
    print("!! tidak ditemukan")

# CEK 2: Siapa yang memanggil bukaFormLogin
print("\n=== CEK 2: YANG MEMANGGIL bukaFormLogin ===")
calls = re.findall(r'.{0,100}bukaFormLogin.{0,100}', html)
for c in calls:
    clean = re.sub(r'\s+', ' ', c).strip()
    print(f"  {clean}")

# CEK 3: Splash screen HTML & tombolnya
print("\n=== CEK 3: SPLASH HTML ===")
splash = re.search(r'id="splash[^"]*".*?(?=id="login-screen")', html, re.DOTALL)
if splash:
    clean = re.sub(r'\s+', ' ', splash.group(0)).strip()
    print(clean[:800])
else:
    # cari dengan cara lain
    idx = html.find('id="splash')
    if idx > -1:
        print(html[idx:idx+1000])

# CEK 4: _t1dismiss / dismiss splash
print("\n=== CEK 4: FUNGSI DISMISS SPLASH ===")
fn2 = re.search(r'function _t1dismiss.*?(?=function |\Z)', html, re.DOTALL)
if fn2:
    clean = re.sub(r'\s+', ' ', fn2.group(0)).strip()
    print(clean[:600])

# CEK 5: Apakah login-screen display:none atau flex
print("\n=== CEK 5: LOGIN-SCREEN STYLE ===")
idx_ls = html.find('id="login-screen"')
print(html[idx_ls:idx_ls+200])

print("\nDone.")

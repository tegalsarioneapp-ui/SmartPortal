import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

m = re.search(r'window\.cetakPDFSurat\s*=\s*function.*?(?=\nwindow\.)', html, re.DOTALL)
if m:
    content = m.group(0)
    print("Panjang: " + str(len(content)))
    
    # Cek isSalinan logic
    print()
    print("=== isSalinan LOGIC ===")
    idx = content.find('isSalinan')
    while idx != -1:
        print(re.sub(r'\s+', ' ', content[max(0,idx-30):idx+100]).strip())
        print()
        idx = content.find('isSalinan', idx+1)
    
    # Cek logo/lambang
    print("=== LOGO/LAMBANG ===")
    for kw in ['logo', 'lambang', 'img', 'semarang', 'base64', 'db_logo', 'db_settings']:
        if kw.lower() in content.lower():
            idx = content.lower().find(kw.lower())
            print(kw + ": " + re.sub(r'\s+', ' ', content[idx:idx+150]).strip())
            print()

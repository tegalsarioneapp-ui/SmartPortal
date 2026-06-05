import re, subprocess

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
all_js = "\n".join(scripts)
with open("_chk.js", "w", encoding="utf-8") as f:
    f.write(all_js)

r = subprocess.run(["node","--check","_chk.js"], capture_output=True, text=True)
if r.stderr:
    print(f"!! JS ERROR:\n{r.stderr[:500]}")
    # Tampilkan konteks baris error
    err = re.search(r':(\d+)\n', r.stderr)
    if err:
        ln = int(err.group(1))
        js_lines = all_js.split("\n")
        print(f"\n=== KONTEKS L{ln} ===")
        for i in range(max(0,ln-5), min(len(js_lines),ln+5)):
            mark = " <<< ERROR" if i+1==ln else ""
            print(f"  L{i+1}: {js_lines[i][:200]}{mark}")
else:
    print("OK: JS syntax valid!")

opens  = len(re.findall(r'<script[^>]*>', html))
closes = len(re.findall(r'</script>', html))
print(f"Script balance: {opens}/{closes} {'OK' if opens==closes else '!! SELISIH'}")

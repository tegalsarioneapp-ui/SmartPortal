import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

print("=== FUNGSI NAVIGASI ===")
funcs = re.findall(r"function\s+(\w+)\s*\(", html)
nav_funcs = [f for f in funcs if any(k in f.lower() for k in ["tab","page","view","menu","nav","show","open","buka","tampil","switch"])]
for f in nav_funcs:
    print(f)

print("\n=== ID TAB/VIEW ===")
all_ids = re.findall(r"id=\"([^\"]*(?:tab|view|page|panel)[^\"]*)\"", html)
for i in sorted(set(all_ids)):
    print(i)

print("\n=== ONCLICK BUTTONS ===")
btns = re.findall(r"onclick=\"([^\"]{5,80})\"", html)
for b in list(dict.fromkeys(btns))[:40]:
    print(b)

print("\n=== HAMBURGER ===")
hamburgers = re.findall(r"<[^>]*(?:fa-bars|hamburger|menu.toggle)[^>]*>", html)
for h in hamburgers[:10]:
    print(h[:150])

print("\n=== SESSION VARS ===")
sessions = re.findall(r".{0,40}(?:loggedIn|currentUser|activeUser|loginAs).{0,40}", html)
for s in list(dict.fromkeys(sessions))[:15]:
    print(s.strip())

print("\nDone.")

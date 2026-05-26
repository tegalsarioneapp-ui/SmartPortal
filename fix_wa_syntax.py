FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """                    +'<a href="https://wa.me/62"+((w.noHp||'').replace(/[^0-9]/g,'').replace(/^0/,'')) '
                    +'target="_blank" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-weight:700;font-size:0.8rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
                    +'<i class="fa-brands fa-whatsapp"></i> Tagih</a>'"""

NEW = """                    +'<a href="https://wa.me/62'+(w.noHp||'').replace(/[^0-9]/g,'').replace(/^0/,'')+'" '
                    +'target="_blank" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-weight:700;font-size:0.8rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
                    +'<i class="fa-brands fa-whatsapp"></i> Tagih</a>'"""

if OLD not in html:
    print("GAGAL: string tidak ditemukan")
else:
    html = html.replace(OLD, NEW, 1)
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(html)
    print("OK: Fix syntax href WA")
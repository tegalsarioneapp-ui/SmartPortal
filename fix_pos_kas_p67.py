FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8", newline='') as f:
    html = f.read()

# Normalize line endings ke \n
html = html.replace('\r\n', '\n')

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        print(f"  String tidak ditemukan!")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK [{count}]: {label}")

# ═══ PATCH 6: renderJenisIuran tambah kolom Pos ═══
patch("renderJenisIuran tambah kolom Pos",
"""        html2 += '<tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;">Nama Jenis</th><th style="padding:8px;text-align:right;">Nominal</th><th style="padding:8px;">Aksi</th></tr>';\n        ji.forEach(function(j, i) {\n            html2 += '<tr style="border-bottom:1px solid #e2e8f0;">';\n            html2 += '<td style="padding:8px;"><input type="text" value="'+j.nama+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;" onchange="updateJenisIuran('+i+',\\'nama\\',this.value)"></td>';\n            html2 += '<td style="padding:8px;"><input type="number" value="'+j.nominal+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;text-align:right;" onchange="updateJenisIuran('+i+',\\'nominal\\',parseInt(this.value)||0)"></td>';\n            html2 += '<td style="padding:8px;text-align:center;"><button onclick="hapusJenisIuran('+i+')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>';\n            html2 += '</tr>';\n        });\n        html2 += '<tr style="background:#f8fafc;font-weight:700;"><td style="padding:8px;">TOTAL</td><td style="padding:8px;text-align:right;color:#10b981;">'+fmt(total)+'</td><td></td></tr>';""",
"""        html2 += '<tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;">Nama Jenis</th><th style="padding:8px;text-align:right;">Nominal</th><th style="padding:8px;text-align:center;">Pos Kas</th><th style="padding:8px;">Aksi</th></tr>';\n        var posOptions = [{val:'kas_utama',label:'✅ Kas Utama'},{val:'kas_sementara',label:'⏳ Kas Sementara'},{val:'kas_terpisah',label:'📋 Kas Terpisah'}];\n        ji.forEach(function(j, i) {\n            var posVal = j.pos || 'kas_utama';\n            var selectOpts = posOptions.map(function(o){ return '<option value="'+o.val+'"'+(posVal===o.val?' selected':'')+'>'+o.label+'</option>'; }).join('');\n            html2 += '<tr style="border-bottom:1px solid #e2e8f0;">';\n            html2 += '<td style="padding:8px;"><input type="text" value="'+j.nama+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;" onchange="updateJenisIuran('+i+',\\'nama\\',this.value)"></td>';\n            html2 += '<td style="padding:8px;"><input type="number" value="'+j.nominal+'" style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;width:100%;text-align:right;" onchange="updateJenisIuran('+i+',\\'nominal\\',parseInt(this.value)||0)"></td>';\n            html2 += '<td style="padding:8px;"><select style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 6px;width:100%;font-size:0.82rem;" onchange="updateJenisIuran('+i+',\\'pos\\',this.value)">'+selectOpts+'</select></td>';\n            html2 += '<td style="padding:8px;text-align:center;"><button onclick="hapusJenisIuran('+i+')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>';\n            html2 += '</tr>';\n        });\n        html2 += '<tr style="background:#f8fafc;font-weight:700;"><td style="padding:8px;">TOTAL</td><td style="padding:8px;text-align:right;color:#10b981;">'+fmt(total)+'</td><td></td><td></td></tr>';""")
# ═══ PATCH 7: tambahJenisIuran - default pos kas_utama ═══
patch("tambahJenisIuran default pos kas_utama",
"""        ji.push({nama:'Jenis Baru',nominal:0});""",
"""        ji.push({nama:'Jenis Baru',nominal:0,pos:'kas_utama'});""")

# ═══ SIMPAN FILE ═══
# Kembalikan ke \r\n saat simpan
html = html.replace('\n', '\r\n')
with open(FILE, "w", encoding="utf-8", newline='') as f:
    f.write(html)

print(f"\n✅ SELESAI! {count} patch berhasil diterapkan.")
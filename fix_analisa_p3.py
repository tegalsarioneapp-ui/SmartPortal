FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

count = 0
def patch(label, old, new):
    global html, count
    if old not in html:
        print(f"GAGAL: {label}")
        exit(1)
    html = html.replace(old, new, 1)
    count += 1
    print(f"OK: {label}")

# PATCH 1: Tambah tombol Tagih WA di samping Bayar Cepat
patch('Tambah tombol Tagih WA',
"                    +'<i class=\"fa-solid fa-bolt\"></i> Bayar Cepat</button>'",
"""                    +'<i class=\"fa-solid fa-bolt\"></i> Bayar Cepat</button>'
                    +'<a href=\"https://wa.me/62\"+((w.noHp||'').replace(/[^0-9]/g,'').replace(/^0/,'')) '
                    +'target=\"_blank\" '
                    +'style=\"padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-weight:700;font-size:0.8rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;\">'
                    +'<i class=\"fa-brands fa-whatsapp\"></i> Tagih</a>'""")

# PATCH 2: Tambah section Talangan Aktif setelah section Belum Bayar
patch('Tambah section Talangan Aktif',
"        +'</div>';\n    };",
"""        +'</div>'

        // ── SECTION TALANGAN AKTIF ──
        +(talangan
            ? '<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid #fecaca;border-left:4px solid #ef4444;margin-bottom:16px;">'
              +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
              +'<span style="font-weight:800;font-size:1rem;color:#991b1b;"><i class="fa-solid fa-shield-heart" style="margin-right:6px;"></i>Talangan Aktif</span>'
              +(sisaTalangan<=0 ? mkBadge('Lunas','#10b981','circle-check') : mkBadge('Belum Lunas','#ef4444','clock'))
              +'</div>'
              +'<div style="display:flex;flex-direction:column;gap:8px;">'
              +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fef2f2;border-radius:10px;">'
              +'<span style="font-size:0.82rem;font-weight:700;color:#991b1b;">Talangan '+periode+'</span>'
              +'<span style="font-weight:900;color:#991b1b;">'+fmt(talangan.nominal)+'</span>'
              +'</div>'
              +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#f0fdf4;border-radius:10px;">'
              +'<span style="font-size:0.82rem;font-weight:700;color:#166534;">Sudah Dikembalikan</span>'
              +'<span style="font-weight:900;color:#166534;">'+fmt(talangan.dikembalikan||0)+'</span>'
              +'</div>'
              +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fff7ed;border-radius:10px;">'
              +'<span style="font-size:0.82rem;font-weight:700;color:#c2410c;">Sisa Talangan</span>'
              +'<span style="font-weight:900;color:#c2410c;">'+fmt(sisaTalangan)+'</span>'
              +'</div>'
              +(sisaTalangan>0
                ? '<button onclick="catatPengembalianTalangan()" style="width:100%;margin-top:8px;padding:10px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;font-size:0.88rem;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fa-solid fa-rotate-left"></i> + Catat Pengembalian</button>'
                : '')
              +'</div>'
              +'</div>'
            : '')

        +'</div>';
    };""")

# PATCH 3: Fix hardcode settings.targetUangMeja di konfirmasi talangan
patch('Fix hardcode targetUangMeja di konfirmasi',
"html:'Kas Utama akan dipotong <b>'+fmt(kurang)+'</b><br>untuk mencukupi target tuan rumah <b>'+fmt((JSON.parse(localStorage.getItem('db_settings')||'{}').targetUangMeja||250000))+'</b>',",
"html:'Kas Utama akan dipotong <b>'+fmt(kurang)+'</b><br>untuk mencukupi target tuan rumah <b>'+fmt((JSON.parse(localStorage.getItem('db_param_pertemuan')||'{}').targetUangMeja||250000))+'</b>',")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
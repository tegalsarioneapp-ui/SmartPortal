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

# PATCH 1: Hapus section Belum Bayar dari loadAnalisaUangMeja
patch('Hapus section Belum Bayar',
"""        // ── SECTION BELUM BAYAR ──
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);margin-bottom:16px;">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">'
        +'<span style="font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);"><i class="fa-solid fa-users-viewfinder" style="color:#ef4444;margin-right:6px;"></i>Belum Bayar Bulan Ini</span>'
        +'<span style="background:#fef2f2;color:#991b1b;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;border:1px solid #fecaca;">'+belumBayar.length+' warga</span>'
        +'</div>'
        +(belumBayar.length===0
            ? '<div style="text-align:center;padding:24px;color:#10b981;font-weight:700;"><i class="fa-solid fa-circle-check" style="font-size:2rem;margin-bottom:8px;display:block;"></i>Semua warga sudah membayar!</div>'
            : '<div style="display:flex;flex-direction:column;gap:8px;" id="list-belum-bayar">'
              + belumBayar.map(function(w){
                  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-light,#f8fafc);border-radius:10px;border:1px solid var(--border-color,#e2e8f0);">'
                    +'<span style="font-weight:600;color:var(--text-dark,#1e293b);font-size:0.9rem;"><i class="fa-solid fa-user" style="color:#94a3b8;margin-right:6px;"></i>'+esc(w.nama)+'</span>'
                    +'<button onclick="inputIuranCepat('+w.id+',\''+bulanNama+'\')" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;font-size:0.8rem;">'
                    +'<i class="fa-solid fa-bolt"></i> Bayar Cepat</button>'
                    +'<a href="https://wa.me/62'+(w.noHp||'').replace(/[^0-9]/g,'').replace(/^0/,'')+'" '
                    +'target="_blank" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-weight:700;font-size:0.8rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
                    +'<i class="fa-brands fa-whatsapp"></i> Tagih</a>'
                    +'</div>';
              }).join('')
              +'</div>'
        )
        +'</div>'""",
"")

# PATCH 2: Tambah tombol Tagih WA di detailBar matriks iuran
patch('Tambah tombol Tagih WA di detailBar',
"""                    '<button class="btn-action" style="background:#0ea5e9;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="lihatKartuWarga('+w.id+')"><i class="fa-solid fa-id-card"></i></button>'+
                '</div>'+""",
"""                    '<button class="btn-action" style="background:#0ea5e9;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="lihatKartuWarga('+w.id+')"><i class="fa-solid fa-id-card"></i></button>'+
                    (kurangRow>0||stIni==='belum'
                        ? '<a href="https://wa.me/62'+(w.noHp||'').replace(/[^0-9]/g,'').replace(/^0/','')+
                          '?text='+encodeURIComponent(
                              'Assalamualaikum Wr. Wb.\\n'+
                              'Yth. Bapak/Ibu '+w.nama+'\\n\\n'+
                              'Dengan hormat, kami dari pengurus RT mengucapkan terima kasih atas perhatian Bapak/Ibu terhadap kegiatan lingkungan kita.\\n\\n'+
                              'Kami ingin mengingatkan dengan sopan bahwa iuran wajib bulanan untuk bulan '+bulanIni+' sebesar '+fmt(totalRow||0)+' belum tercatat.\\n\\n'+
                              'Mohon kiranya dapat segera diselesaikan agar kegiatan RT tetap berjalan lancar.\\n\\n'+
                              'Terima kasih atas kerja samanya.\\n'+
                              'Wassalamualaikum Wr. Wb.\\n'+
                              'Pengurus RT'
                          )+
                          '" target="_blank" '+
                          'style="padding:5px 10px;border-radius:8px;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-weight:700;font-size:0.75rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'+
                          '<i class="fa-brands fa-whatsapp"></i> Tagih</a>'
                        : ''
                    )+
                '</div>'+""")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n✅ Semua {count} patch selesai!")
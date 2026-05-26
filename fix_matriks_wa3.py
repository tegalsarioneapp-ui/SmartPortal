FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

OLD = """                    '<button class="btn-action" style="background:#0ea5e9;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="lihatKartuWarga('+w.id+')"><i class="fa-solid fa-id-card"></i></button>'+
                '</div>'+"""

NEW = """                    '<button class="btn-action" style="background:#0ea5e9;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="lihatKartuWarga('+w.id+')"><i class="fa-solid fa-id-card"></i></button>'+
                    (kurangRow>0||stIni==='belum'
                        ? '<a href="https://wa.me/62'+(w.noHp||'').replace(/[^0-9]/g,'').replace(/^0/,'')+
                          '?text='+encodeURIComponent(
                              'Assalamualaikum Wr. Wb.\\n'+
                              'Yth. Bapak/Ibu '+w.nama+'\\n\\n'+
                              'Dengan hormat, kami dari pengurus RT mengucapkan terima kasih atas perhatian dan keikutsertaan Bapak/Ibu dalam kegiatan lingkungan.\\n\\n'+
                              'Kami ingin mengingatkan dengan sopan bahwa iuran wajib bulanan untuk bulan '+bulanIni+' belum tercatat di data kami.\\n\\n'+
                              'Mohon kiranya dapat segera diselesaikan agar kegiatan RT tetap berjalan lancar.\\n\\n'+
                              'Terima kasih atas perhatian dan kerja samanya.\\n'+
                              'Wassalamualaikum Wr. Wb.\\n'+
                              'Pengurus RT'
                          )+
                          '" target="_blank" '+
                          'style="padding:5px 10px;border-radius:8px;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-weight:700;font-size:0.75rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'+
                          '<i class=\\"fa-brands fa-whatsapp\\"></i> Tagih WA</a>'
                        : ''
                    )+
                '</div>'+"""

if OLD not in html:
    print("GAGAL: string tidak ditemukan")
else:
    html = html.replace(OLD, NEW, 1)
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(html)
    print("OK: Tambah tombol Tagih WA di detailBar matriks")
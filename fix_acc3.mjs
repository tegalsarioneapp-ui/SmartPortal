import { readFileSync, writeFileSync } from "fs";
const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let n = 0;

function patchRegex(label, pattern, newStr) {
  if (!pattern.test(html)) { console.error("GAGAL:", label); process.exit(1); }
  html = html.replace(pattern, newStr);
  n++; console.log("OK:", label);
}

// Tutup ACC 4 Push + wrap Zona Berbahaya jadi ACC 5
patchRegex("Tutup Push + Accordion Zona Berbahaya",
  /                <p style="font-size:0\.78rem;color:#94a3b8;margin-top:10px;">\s*<i class="fa-solid fa-circle-info"><\/i>\s*[\s\S]*?<\/p>\s*<\/div>\s*<hr style="border-top:1px dashed #cbd5e1; margin: 30px 0 20px 0;">\s*<h3 style="color: var\(--danger\);">[\s\S]*?<\/h3>\s*<p style="font-size:0\.9rem;[\s\S]*?<\/p>\s*<button class="btn-submit bg-red" onclick="bukaMenuResetData\(\)"[\s\S]*?<\/button>\s*<\/div>/,
  `                <p style="font-size:0.78rem;color:#94a3b8;margin-top:10px;">
                    <i class="fa-solid fa-circle-info"></i>
                    Notifikasi dikirim ke semua warga yang sudah mengaktifkan izin notifikasi di perangkat mereka.
                    Warga bisa aktifkan di menu Portal Warga &rarr; Data Keluarga &rarr; Pengaturan Notifikasi.
                </p>
                </div>
              </div>
            </div>

            <!-- ACC 5: Zona Berbahaya -->
            <div class="acc-card" style="border-top:4px solid #ef4444;">
              <div class="acc-header" onclick="toggleAcc('acc-zona',this)">
                <h3><i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i> Zona Berbahaya (Reset Database)</h3>
                <span class="acc-arrow">&#9660;</span>
              </div>
              <div class="acc-body closed" id="acc-zona">
                <div class="acc-body-inner">
                  <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:15px;">Fitur ini digunakan untuk menghapus data spesifik atau mereset aplikasi ke pengaturan pabrik.</p>
                  <button class="btn-submit bg-red" onclick="bukaMenuResetData()" style="max-width:300px;margin:0 auto;box-shadow:0 10px 20px rgba(239,68,68,0.3) !important;"><i class="fa-solid fa-trash-can"></i> Hapus / Reset Data</button>
                </div>
              </div>
            </div>`
);

writeFileSync(file, html, "utf8");
console.log("SELESAI! Total", n, "patch berhasil");

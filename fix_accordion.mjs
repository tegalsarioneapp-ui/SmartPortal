import { readFileSync, writeFileSync } from "fs";

const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let patchCount = 0;

function patch(label, oldStr, newStr) {
  if (!html.includes(oldStr)) {
    console.error("GAGAL:", label);
    process.exit(1);
  }
  html = html.replace(oldStr, newStr);
  patchCount++;
  console.log("OK:", label);
}

// PATCH 1: Tambah CSS accordion
patch("CSS Accordion",
`</style>`,
`  .acc-header {
    display:flex; align-items:center; justify-content:space-between;
    cursor:pointer; user-select:none; padding:4px 0;
    background:none; border:none; width:100%; text-align:left; font:inherit;
  }
  .acc-header:hover { opacity:0.85; }
  .acc-header:focus { outline:2px solid var(--primary); outline-offset:2px; }
  .acc-header h3 { margin:0; pointer-events:none; }
  .acc-arrow {
    font-size:0.85rem; color:#94a3b8; transition:transform 0.3s;
    flex-shrink:0; margin-left:10px;
  }
  .acc-arrow.open { transform: rotate(180deg); }
  .acc-body {
    overflow:hidden; transition:max-height 0.35s ease, opacity 0.3s;
    max-height:2000px; opacity:1;
  }
  .acc-body.closed { max-height:0 !important; opacity:0; }
</style>`
);

// PATCH 2: Wrap card Identitas+Parameter dalam accordion
patch("Accordion Identitas+Parameter",
`            <div class="form-grid">
                <div class="card" style="border-top: 4px solid var(--accent-gold);">
                    <h3>Identitas Lingkungan</h3>`,
`            <div class="card" style="border-top:4px solid var(--accent-gold);padding-bottom:8px;">
              <button class="acc-header" onclick="toggleAcc('acc-identitas',this)" aria-expanded="true" aria-controls="acc-identitas">
                <h3><i class="fa-solid fa-id-card" style="color:var(--accent-gold);margin-right:8px;"></i>Identitas &amp; Parameter Sistem</h3>
                <span class="acc-arrow open">&#9660;</span>
              </button>
              <div class="acc-body" id="acc-identitas">
            <div class="form-grid" style="margin-top:12px;">
                <div class="card" style="border-top: 4px solid var(--accent-gold);">
                    <h3>Identitas Lingkungan</h3>`
);

// Tutup accordion Identitas+Parameter
patch("Tutup Accordion Identitas+Parameter",
`                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
            </div>

            <div class="card" style="border-top: 4px solid #f59e0b;">`,
`                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>
            </div>
              </div>
            </div>

            <div class="card" style="border-top: 4px solid #f59e0b;">`
);


// PATCH 3: Accordion Ganti Password
patch("Accordion Ganti Password",
`            <!-- ===== KARTU GANTI PASSWORD SISTEM ===== -->
            <div class="card" style="margin-top:0;border-top:4px solid #ef4444;">
                <div class="card-title-header" style="margin-bottom:4px;">
                    <h3><i class="fa-solid fa-key" style="color:#ef4444;"></i> Ganti Password Sistem</h3>
                </div>`,
`            <!-- ===== KARTU GANTI PASSWORD SISTEM ===== -->
            <div class="card" style="margin-top:0;border-top:4px solid #ef4444;padding-bottom:8px;">
              <button class="acc-header" onclick="toggleAcc('acc-password',this)" aria-expanded="false" aria-controls="acc-password">
                <h3><i class="fa-solid fa-key" style="color:#ef4444;margin-right:8px;"></i>Ganti Password Sistem</h3>
                <span class="acc-arrow">&#9660;</span>
              </button>
              <div class="acc-body closed" id="acc-password" hidden>`
);

patch("Tutup Accordion Password",
`                <button class="btn-submit" style="background:#ef4444;" onclick="simpanPasswordSistem()"><i class="fa-solid fa-floppy-disk"></i> Simpan Password Baru</button>
            </div>`,
`                <button class="btn-submit" style="background:#ef4444;" onclick="simpanPasswordSistem()"><i class="fa-solid fa-floppy-disk"></i> Simpan Password Baru</button>
              </div>
            </div>`
);

// PATCH 4: Accordion Backup & Restore
patch("Accordion Backup Restore",
`            <div class="card">
                <div class="card-title-header" style="margin-bottom:16px;">
                    <h3><i class="fa-solid fa-database" style="color:#10b981;"></i> Backup &amp; Restore Database</h3>`,
`            <div class="card" style="padding-bottom:8px;">
              <button class="acc-header" onclick="toggleAcc('acc-backup',this)" aria-expanded="false" aria-controls="acc-backup">
                <h3><i class="fa-solid fa-database" style="color:#10b981;margin-right:8px;"></i>Backup &amp; Restore Database</h3>
                <span class="acc-arrow">&#9660;</span>
              </button>
              <div class="acc-body closed" id="acc-backup" hidden>
                <div class="card-title-header" style="margin-bottom:16px;display:none;">
                    <h3><i class="fa-solid fa-database" style="color:#10b981;"></i> Backup &amp; Restore Database</h3>`
);

// PATCH 5: Accordion Info Aplikasi
patch("Accordion Info Aplikasi",
`            <!-- Info Aplikasi Card -->
            <div class="card" style="margin-top:16px;border-top:4px solid #6366f1;">
                <div class="card-title-header" style="margin-bottom:16px;">
                    <h3><i class="fa-solid fa-circle-info" style="color:#6366f1;"></i> Info Aplikasi</h3>
                </div>`,
`            <!-- Info Aplikasi Card -->
            <div class="card" style="margin-top:16px;border-top:4px solid #6366f1;padding-bottom:8px;">
              <button class="acc-header" onclick="toggleAcc('acc-info',this)" aria-expanded="false" aria-controls="acc-info">
                <h3><i class="fa-solid fa-circle-info" style="color:#6366f1;margin-right:8px;"></i>Info Aplikasi</h3>
                <span class="acc-arrow">&#9660;</span>
              </button>
              <div class="acc-body closed" id="acc-info" hidden>`
);

patch("Tutup Accordion Info Aplikasi",
`                    <button class="btn-action" style="background:#3b82f6;margin:0;" onclick="showAuditDetail()"><i class="fa-solid fa-stethoscope"></i> Audit Server</button>
                </div>
            </div>

            
            <!-- Push Notification Card -->`,
`                    <button class="btn-action" style="background:#3b82f6;margin:0;" onclick="showAuditDetail()"><i class="fa-solid fa-stethoscope"></i> Audit Server</button>
                </div>
              </div>
            </div>

            <!-- Push Notification Card -->`
);

// PATCH 6: Accordion Push Notification
patch("Accordion Push Notifikasi",
`            <div class="card" style="margin-top:16px;border-top:4px solid #7c3aed;">
                <div class="card-title-header" style="margin-bottom:16px;">
                    <h3><i class="fa-solid fa-bell" style="color:#7c3aed;"></i> Notifikasi Push ke Warga</h3>`,
`            <div class="card" style="margin-top:16px;border-top:4px solid #7c3aed;padding-bottom:8px;">
              <button class="acc-header" onclick="toggleAcc('acc-push',this)" aria-expanded="false" aria-controls="acc-push">
                <h3><i class="fa-solid fa-bell" style="color:#7c3aed;margin-right:8px;"></i>Notifikasi Push ke Warga</h3>
                <span class="acc-arrow">&#9660;</span>
              </button>
              <div class="acc-body closed" id="acc-push" hidden>
                <div class="card-title-header" style="margin-bottom:16px;display:none;">
                    <h3><i class="fa-solid fa-bell" style="color:#7c3aed;"></i> Notifikasi Push ke Warga</h3>`
);

patch("Tutup Accordion Push Notifikasi",
`                    Warga bisa aktifkan di menu Portal Warga &rarr; Data Keluarga &rarr; Pengaturan Notifikasi.
                </p>
            </div>`,
`                    Warga bisa aktifkan di menu Portal Warga &rarr; Data Keluarga &rarr; Pengaturan Notifikasi.
                </p>
              </div>
            </div>`
);

// PATCH 7: Tambah fungsi toggleAcc sebelum loadPengaturan
patch("Fungsi toggleAcc",
`    window.getJenisIuran = function() {`,
`    window.toggleAcc = function(id, header) {
        let body = document.getElementById(id);
        let arrow = header.querySelector('.acc-arrow');
        if(!body) return;
        let isClosed = body.classList.contains('closed');
        body.classList.toggle('closed', !isClosed);
        if(arrow) arrow.classList.toggle('open', isClosed);
        if(body.hasAttribute('hidden')) {
            body.removeAttribute('hidden');
            header.setAttribute('aria-expanded', 'true');
        } else {
            body.setAttribute('hidden', '');
            header.setAttribute('aria-expanded', 'false');
        }
    };
    window.getJenisIuran = function() {`
);

writeFileSync(file, html, "utf8");
console.log("SELESAI! Total " + patchCount + " patch berhasil.");

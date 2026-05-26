import { readFileSync, writeFileSync } from "fs";
const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let n = 0;

function patchRegex(label, pattern, newStr) {
  const before = html.length;
  html = html.replace(pattern, newStr);
  if (html.length === before && !pattern.test) {
    console.error("GAGAL:", label);
    process.exit(1);
  }
  n++; console.log("OK:", label);
}

// ACC 1: Identitas Lingkungan
patchRegex("Accordion Identitas",
  /<div id="pengaturan" class="admin-tab-content">\s*<div class="form-grid">\s*<div class="card" style="border-top: 4px solid var\(--accent-gold\);">\s*<h3>Identitas Lingkungan<\/h3>\s*<div class="form-group"><label>Nama RT<\/label><input type="text" id="set_nama_rt"><\/div>\s*<div class="form-group"><label>Nama RW<\/label><input type="text" id="set_nama_rw"><\/div>\s*<div class="form-group"><label>Nama Bendahara<\/label><input type="text" id="set_nama_ben"><\/div>\s*<\/div>\s*<\/div>/,
  `<div id="pengaturan" class="admin-tab-content">

            <!-- ACC 1: Identitas Lingkungan -->
            <div class="acc-card" style="border-top:4px solid var(--accent-gold);">
              <div class="acc-header" onclick="toggleAcc('acc-identitas',this)">
                <h3><i class="fa-solid fa-id-card" style="color:var(--accent-gold);"></i> Identitas Lingkungan</h3>
                <span class="acc-arrow open">&#9660;</span>
              </div>
              <div class="acc-body" id="acc-identitas">
                <div class="acc-body-inner">
                  <div class="form-group"><label>Nama RT</label><input type="text" id="set_nama_rt"></div>
                  <div class="form-group"><label>Nama RW</label><input type="text" id="set_nama_rw"></div>
                  <div class="form-group"><label>Nama Bendahara</label><input type="text" id="set_nama_ben"></div>
                  <button class="btn-submit bg-blue" style="margin-top:14px;" onclick="simpanPengaturanSistem()"><i class="fa-solid fa-floppy-disk"></i> Simpan Identitas</button>
                </div>
              </div>
            </div>`
);

// ACC 2: Backup & Restore
patchRegex("Accordion Backup",
  /<div class="card">\s*<div class="card-title-header" style="margin-bottom:16px;">\s*<h3><i class="fa-solid fa-database" style="color:#10b981;"><\/i> Backup &amp; Restore Database<\/h3>\s*<span id="backup-row-count"[^>]*><\/span>\s*<\/div>/,
  `<!-- ACC 2: Backup & Restore -->
            <div class="acc-card" style="border-top:4px solid #10b981;">
              <div class="acc-header" onclick="toggleAcc('acc-backup',this)">
                <h3><i class="fa-solid fa-database" style="color:#10b981;"></i> Backup &amp; Restore Database
                  <span id="backup-row-count" style="font-size:0.75rem;color:#64748b;font-weight:400;margin-left:8px;"></span>
                </h3>
                <span class="acc-arrow">&#9660;</span>
              </div>
              <div class="acc-body closed" id="acc-backup">
                <div class="acc-body-inner">`
);

// Tutup ACC 2 + buka ACC 3
patchRegex("Tutup Backup Buka Info",
  /(<p style="font-size:0\.78rem;color:#94a3b8;text-align:center;margin-top:8px;">[\s\S]*?<\/p>)\s*\s*<!-- Info Aplikasi Card -->/,
  `$1
                </div>
              </div>
            </div>

            <!-- ACC 3: Info Aplikasi -->`
);

// ACC 3: Info Aplikasi
patchRegex("Accordion Info Aplikasi",
  /<div class="card" style="margin-top:16px;border-top:4px solid #6366f1;">\s*<div class="card-title-header" style="margin-bottom:16px;">\s*<h3><i class="fa-solid fa-circle-info" style="color:#6366f1;"><\/i> Info Aplikasi<\/h3>\s*<\/div>/,
  `<div class="acc-card" style="border-top:4px solid #6366f1;">
              <div class="acc-header" onclick="toggleAcc('acc-info',this)">
                <h3><i class="fa-solid fa-circle-info" style="color:#6366f1;"></i> Info Aplikasi</h3>
                <span class="acc-arrow">&#9660;</span>
              </div>
              <div class="acc-body closed" id="acc-info">
                <div class="acc-body-inner">`
);

// Tutup ACC 3 + buka ACC 4
patchRegex("Tutup Info Buka Push",
  /<\/div>\s*<\/div>\s*\s*<!-- Push Notification Card -->\s*<d/,
  `</div>
              </div>
            </div>

            <!-- ACC 4: Push Notifikasi -->
            <d`
);

// ACC 4: Push Notifikasi
patchRegex("Accordion Push Notif",
  /<div class="card" style="margin-top:16px;border-top:4px solid #7c3aed;">\s*<div class="card-title-header" style="margin-bottom:16px;">\s*<h3><i class="fa-solid fa-bell" style="color:#7c3aed;"><\/i> Notifikasi Push ke Warga<\/h3>\s*<span id="push-sub-count"[^>]*><\/span>\s*<\/div>/,
  `<div class="acc-card" style="border-top:4px solid #7c3aed;">
              <div class="acc-header" onclick="toggleAcc('acc-push',this)">
                <h3><i class="fa-solid fa-bell" style="color:#7c3aed;"></i> Notifikasi Push ke Warga
                  <span id="push-sub-count" style="font-size:0.75rem;color:#7c3aed;font-weight:400;margin-left:6px;background:#f3e8ff;padding:2px 8px;border-radius:20px;"></span>
                </h3>
                <span class="acc-arrow">&#9660;</span>
              </div>
              <div class="acc-body closed" id="acc-push">
                <div class="acc-body-inner">`
);

writeFileSync(file, html, "utf8");
console.log("SELESAI! Total", n, "patch berhasil");

import { readFileSync, writeFileSync } from "fs";
const file = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(file, "utf8");
let n = 0;

function patch(label, oldStr, newStr) {
  if (!html.includes(oldStr)) { console.error("GAGAL:", label); process.exit(1); }
  html = html.replace(oldStr, newStr);
  n++; console.log("OK:", label);
}

// PATCH 1: CSS accordion
patch("CSS Accordion",
`</style>`,
`  .acc-card { border-radius:14px; margin-bottom:14px; overflow:hidden; border:1px solid #e2e8f0; }
  .acc-header { display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none; padding:14px 20px; background:#f8fafc; transition:background 0.2s; }
  .acc-header:hover { background:#f1f5f9; }
  .acc-header h3 { margin:0; font-size:0.97rem; display:flex; align-items:center; gap:10px; pointer-events:none; }
  .acc-arrow { font-size:0.75rem; color:#94a3b8; transition:transform 0.3s; flex-shrink:0; }
  .acc-arrow.open { transform:rotate(180deg); }
  .acc-body { overflow:hidden; transition:max-height 0.4s ease, opacity 0.3s; max-height:3000px; opacity:1; }
  .acc-body.closed { max-height:0 !important; opacity:0; }
  .acc-body-inner { padding:20px; border-top:1px solid #e2e8f0; }
</style>`
);

// PATCH 2: fungsi toggleAcc
patch("Fungsi toggleAcc",
`    window.loadPengaturan = function() {`,
`    window.toggleAcc = function(id, headerEl) {
        var body = document.getElementById(id);
        var arrow = headerEl ? headerEl.querySelector('.acc-arrow') : null;
        if (!body) return;
        var isClosed = body.classList.contains('closed');
        body.classList.toggle('closed', !isClosed);
        if (arrow) arrow.classList.toggle('open', isClosed);
    };
    window.loadPengaturan = function() {`
);

// PATCH 3: Hapus card Parameter (Nominal Iuran + Bunga Koperasi)
patch("Hapus card Parameter",
`                <div class="card" style="border-top: 4px solid var(--success);">
                    <h3>Parameter</h3>
                    <div class="form-group"><label>Nominal Iuran (Rp)</label><input type="number" id="set_nominal_iuran"></div>
                    <div class="form-group"><label>Bunga Koperasi (%)</label><input type="number" id="set_bunga_kop"></div>
                    <button class="btn-submit bg-blue" onclick="simpanPengaturanSistem()">Simpan Pengaturan</button>
                </div>`,
``
);

writeFileSync(file, html, "utf8");
console.log("SELESAI Part1:", n, "patch");

import { readFileSync, writeFileSync } from "fs";
const FILE = "artifacts/smart-portal-rt/index.html";
let html = readFileSync(FILE, "utf8");
let patchCount = 0;

function patch(label, oldStr, newStr) {
    if (!html.includes(oldStr)) {
        console.error("❌ GAGAL:", label);
        process.exit(1);
    }
    html = html.replace(oldStr, newStr);
    patchCount++;
    console.log("✅", label);
}

// ══════════════════════════════════════════
// PATCH 1: Ganti buatKop → format kop resmi
// ══════════════════════════════════════════
patch("buatKop resmi",
`    function buatKop(namaRT, namaRW) {
        return '<div style="display:flex;align-items:center;gap:16px;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:16px;">'
            + '<div style="flex:1;text-align:center;">'
            + '<div style="font-size:13px;font-weight:700;text-transform:uppercase;">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>'
            + '<div style="font-size:11px;">Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>'
            + '</div>'
            + '</div>';
    }`,
`    function buatKop(namaRT, namaRW) {
        return '<table style="width:100%;border:none;margin-bottom:0;border-collapse:collapse;">'
            + '<tr>'
            + '<td style="border:none;width:85px;vertical-align:middle;padding:0;">'
            + '<img src="/Lambang_Kota_Semarang.png" style="width:80px;height:auto;">'
            + '</td>'
            + '<td style="border:none;text-align:center;vertical-align:middle;padding:0 8px;">'
            + '<div style="font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;">PEMERINTAH KOTA SEMARANG</div>'
            + '<div style="font-size:11pt;font-weight:700;text-transform:uppercase;">KECAMATAN CANDISARI</div>'
            + '<div style="font-size:11pt;font-weight:700;text-transform:uppercase;">KELURAHAN TEGALSARI</div>'
            + '<div style="font-size:12pt;font-weight:700;text-transform:uppercase;">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>'
            + '</td>'
            + '<td style="border:none;width:85px;"></td>'
            + '</tr>'
            + '</table>'
            + '<div style="border-top:4px double #000;margin-top:8px;margin-bottom:18px;"></div>';
    }`
);

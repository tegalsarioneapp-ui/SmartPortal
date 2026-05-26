import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "artifacts/smart-portal-rt/index.html");
let html = readFileSync(FILE, "utf8");

function isKhusus(u) {
    var x = (u || '').toLowerCase();
    return ['uang meja','uang sosial','17 agustus','agustusan'].some(k => x.includes(k));
}

function fmtRp(n) { return 'Rp ' + Number(n||0).toLocaleString('id-ID'); }

function tglFmt(s) {
    if (!s) return '-';
    return new Date(s).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'});
}

function buatKop(namaRT, namaRW) {
    return '<div class="kop">' +
        '<img src="/Lambang_Kota_Semarang.png" style="filter:none !important;">' +
        '<div class="kop-text">' +
        '<div class="k1">Pemerintah Kota Semarang</div>' +
        '<div class="k1">Rukun Tetangga 005 / Rukun Warga 012</div>' +
        '<div class="k2">Kelurahan Tegalsari, Kecamatan Candisari</div>' +
        '<div class="k2">Jalan Tegalsari Raya Barat, Semarang</div>' +
        '</div></div>';
}

function buatCSS() {
    return '<style>' +
        '* { -webkit-print-color-adjust:exact !important; color-adjust:exact !important; }' +
        'body { font-family:Arial,sans-serif; font-size:12px; color:#000 !important; background:#fff !important; margin:0; padding:20px; }' +
        'h1,h2,h3,h4,p,td,th,span,div,b,small { color:#000 !important; background:transparent !important; }' +
        '.kop { display:flex; align-items:center; gap:14px; border-bottom:3px double #000; padding-bottom:8px; margin-bottom:6px; }' +
        '.kop img { width:66px; height:66px; object-fit:contain; }' +
        '.kop-text { flex:1; text-align:center; line-height:1.6; }' +
        '.k1 { font-size:13px; font-weight:bold; text-transform:uppercase; }' +
        '.k2 { font-size:11px; }' +
        '.judul { text-align:center; margin:14px 0 2px; font-size:13px; font-weight:bold; text-transform:uppercase; text-decoration:underline; }' +
        '.sub { text-align:center; margin:0 0 10px; font-size:11px; }' +
        '.sum { display:flex; gap:8px; margin:10px 0 14px; }' +
        '.sb { flex:1; border:1px solid #000; padding:7px 10px; border-radius:3px; }' +
        '.sb .l { font-size:9px; font-weight:700; text-transform:uppercase; }' +
        '.sb .v { font-size:13px; font-weight:800; margin-top:2px; }' +
        'table { width:100%; border-collapse:collapse; margin:8px 0 16px; }' +
        'thead th { background:#1e293b !important; color:#fff !important; padding:7px 8px; font-size:11px; border:1px solid #000; text-align:left; }' +
        'tbody td { padding:6px 8px; border:1px solid #94a3b8; font-size:11px; }' +
        'tbody tr:nth-child(even) td { background:#f8fafc !important; }' +
        '.masuk { color:#166534 !important; font-weight:700; }' +
        '.keluar { color:#991b1b !important; font-weight:700; }' +
        '.ttd { display:flex; justify-content:space-between; margin-top:40px; }' +
        '.ttd-box { text-align:center; width:44%; }' +
        '.pagebreak { page-break-before:always; margin-top:30px; }' +
        '@media print { body { padding:10px; } }' +
        '</style>';
}
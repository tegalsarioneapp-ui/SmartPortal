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
function buatRowsUtama(utama, sAwal) {
    if (utama.length === 0) return '<tr><td colspan="6" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi kas utama pada periode ini</td></tr>';
    var saldo = sAwal;
    return utama.map(function(k, i) {
        if (k.tipe === 'masuk') saldo += k.nominal;
        else saldo -= k.nominal;
        return '<tr>' +
            '<td style="text-align:center;">' + (i+1) + '</td>' +
            '<td>' + tglFmt(k.tgl) + '</td>' +
            '<td>' + (k.uraian||'-') + '</td>' +
            '<td style="text-align:center;" class="' + k.tipe + '">' + (k.tipe==='masuk'?'Pemasukan':'Pengeluaran') + '</td>' +
            '<td style="text-align:right;" class="' + k.tipe + '">' + fmtRp(k.nominal) + '</td>' +
            '<td style="text-align:right;font-weight:700;">' + fmtRp(saldo) + '</td>' +
            '</tr>';
    }).join('');
}

function buatRowsKhusus(khusus) {
    if (khusus.length === 0) return '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi dana khusus pada periode ini</td></tr>';
    return khusus.map(function(k, i) {
        return '<tr>' +
            '<td style="text-align:center;">' + (i+1) + '</td>' +
            '<td>' + tglFmt(k.tgl) + '</td>' +
            '<td>' + (k.uraian||'-') + '</td>' +
            '<td style="text-align:center;" class="' + k.tipe + '">' + (k.tipe==='masuk'?'Pemasukan':'Pengeluaran') + '</td>' +
            '<td style="text-align:right;" class="' + k.tipe + '">' + fmtRp(k.nominal) + '</td>' +
            '</tr>';
    }).join('');
}

function buatRowsLampiran(all) {
    if (all.length === 0) return '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi pada periode ini</td></tr>';
    return all.map(function(k, i) {
        return '<tr>' +
            '<td style="text-align:center;">' + (i+1) + '</td>' +
            '<td>' + tglFmt(k.tgl) + '</td>' +
            '<td>' + (k.uraian||'-') + '</td>' +
            '<td style="text-align:center;" class="' + k.tipe + '">' + (k.tipe==='masuk'?'Pemasukan':'Pengeluaran') + '</td>' +
            '<td style="text-align:right;" class="' + k.tipe + '">' + fmtRp(k.nominal) + '</td>' +
            '</tr>';
    }).join('');
}

function buatSeksiUtama(utama, sAwal, totMU, totKU, sAkh, kop, blnStr, tglCetak, namaRT, namaBen) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Laporan Kas RT 005</title>' + buatCSS() + '</head><body>' +
        kop +
        '<div class="judul">Berita Acara Laporan Kas Utama</div>' +
        '<div class="sub">RT 005 / RW 012 Kelurahan Tegalsari &mdash; Periode: ' + blnStr + '</div>' +
        '<div class="sum">' +
            '<div class="sb"><div class="l">Saldo Awal</div><div class="v">' + fmtRp(sAwal) + '</div></div>' +
            '<div class="sb"><div class="l">Total Pemasukan</div><div class="v" style="color:#166534 !important;">' + fmtRp(totMU) + '</div></div>' +
            '<div class="sb"><div class="l">Total Pengeluaran</div><div class="v" style="color:#991b1b !important;">' + fmtRp(totKU) + '</div></div>' +
            '<div class="sb"><div class="l">Saldo Akhir</div><div class="v" style="color:#92400e !important;">' + fmtRp(sAkh) + '</div></div>' +
        '</div>' +
        '<table><thead><tr>' +
            '<th style="width:35px;">No</th><th style="width:90px;">Tanggal</th><th>Uraian Transaksi</th>' +
            '<th style="width:90px;text-align:center;">Tipe</th><th style="width:110px;text-align:right;">Nominal</th>' +
            '<th style="width:110px;text-align:right;">Saldo</th>' +
        '</tr></thead><tbody>' + buatRowsUtama(utama, sAwal) + '</tbody>' +
        '<tfoot><tr>' +
            '<td colspan="4" style="text-align:right;font-weight:700;border:1px solid #000;padding:6px 8px;">SALDO AKHIR KAS UTAMA</td>' +
            '<td colspan="2" style="text-align:right;font-weight:800;font-size:13px;border:1px solid #000;padding:6px 8px;">' + fmtRp(sAkh) + '</td>' +
        '</tr></tfoot></table>' +
        '<div class="ttd">' +
            '<div class="ttd-box">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">' + namaRT + '</b></div>' +
            '<div class="ttd-box">Semarang, ' + tglCetak + '<br>Bendahara RT 005<br><br><br><br><b style="text-decoration:underline;">' + namaBen + '</b></div>' +
        '</div>' +
        '</body></html>';
}function buatSeksiKhusus(khusus, totMK, totKK, kop, blnStr, tglCetak, namaRT, namaBen) {
    var saldoKhusus = totMK - totKK;
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Laporan Dana Khusus RT 005</title>' + buatCSS() + '</head><body>' +
        kop +
        '<div class="judul">Laporan Dana Khusus</div>' +
        '<div class="sub">RT 005 / RW 012 Kelurahan Tegalsari &mdash; Periode: ' + blnStr + '</div>' +
        '<div class="sub" style="font-size:10px;color:#64748b !important;">(Uang Meja, Uang Sosial, 17 Agustus)</div>' +
        '<div class="sum">' +
            '<div class="sb"><div class="l">Total Pemasukan Dana Khusus</div><div class="v" style="color:#166534 !important;">' + fmtRp(totMK) + '</div></div>' +
            '<div class="sb"><div class="l">Total Pengeluaran Dana Khusus</div><div class="v" style="color:#991b1b !important;">' + fmtRp(totKK) + '</div></div>' +
            '<div class="sb"><div class="l">Saldo Dana Khusus</div><div class="v" style="color:#92400e !important;">' + fmtRp(saldoKhusus) + '</div></div>' +
        '</div>' +
        '<table><thead><tr>' +
            '<th style="width:35px;">No</th>' +
            '<th style="width:90px;">Tanggal</th>' +
            '<th>Uraian</th>' +
            '<th style="width:100px;text-align:center;">Tipe</th>' +
            '<th style="width:110px;text-align:right;">Nominal</th>' +
        '</tr></thead><tbody>' + buatRowsKhusus(khusus) + '</tbody>' +
        '<tfoot><tr>' +
            '<td colspan="3" style="text-align:right;font-weight:700;border:1px solid #000;padding:6px 8px;">SALDO DANA KHUSUS</td>' +
            '<td colspan="2" style="text-align:right;font-weight:800;font-size:13px;border:1px solid #000;padding:6px 8px;">' + fmtRp(saldoKhusus) + '</td>' +
        '</tr></tfoot></table>' +
        '<div class="ttd">' +
            '<div class="ttd-box">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">' + namaRT + '</b></div>' +
            '<div class="ttd-box">Semarang, ' + tglCetak + '<br>Bendahara RT 005<br><br><br><br><b style="text-decoration:underline;">' + namaBen + '</b></div>' +
        '</div>' +
        '</body></html>';
}

function buatLampiran(all, kop, blnStr, tglCetak, namaRT, namaBen) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lampiran Rincian Transaksi RT 005</title>' + buatCSS() + '</head><body>' +
        kop +
        '<div class="judul">Lampiran: Rincian Seluruh Transaksi Bendahara</div>' +
        '<div class="sub">RT 005 / RW 012 Kelurahan Tegalsari &mdash; Periode: ' + blnStr + '</div>' +
        '<table><thead><tr>' +
            '<th style="width:35px;">No</th>' +
            '<th style="width:90px;">Tanggal</th>' +
            '<th>Uraian Transaksi</th>' +
            '<th style="width:100px;text-align:center;">Tipe</th>' +
            '<th style="width:110px;text-align:right;">Nominal</th>' +
        '</tr></thead><tbody>' + buatRowsLampiran(all) + '</tbody>' +
        '<tfoot><tr>' +
            '<td colspan="3" style="text-align:right;font-weight:700;border:1px solid #000;padding:6px 8px;">TOTAL TRANSAKSI</td>' +
            '<td colspan="2" style="text-align:right;font-weight:800;font-size:13px;border:1px solid #000;padding:6px 8px;">' + all.length + ' transaksi</td>' +
        '</tr></tfoot></table>' +
        '<div class="ttd">' +
            '<div class="ttd-box">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">' + namaRT + '</b></div>' +
            '<div class="ttd-box">Semarang, ' + tglCetak + '<br>Bendahara RT 005<br><br><br><br><b style="text-decoration:underline;">' + namaBen + '</b></div>' +
        '</div>' +
        '</body></html>';
}
const newFunc = `
    window.cetakLaporanKas = function() {
        var now = new Date();
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var bulanOpts = BULAN.map(function(b,i){ return '<option value="'+i+'"'+(i===now.getMonth()?' selected':'')+'>'+b+'</option>'; }).join('');
        var thnOpts = '';
        for (var y = now.getFullYear()-2; y <= now.getFullYear()+1; y++) {
            thnOpts += '<option value="'+y+'"'+(y===now.getFullYear()?' selected':'')+'>'+y+'</option>';
        }
        Swal.fire({
            title: '<i class="fa-solid fa-print"></i> Cetak Laporan Kas',
            html: '<div style="text-align:left;font-size:0.9rem;color:#1e293b;">'+
                  '<label style="font-weight:700;display:block;margin-bottom:6px;">Pilih Bulan</label>'+
                  '<select id="swal-bulan" style="width:100%;padding:8px;border-radius:8px;border:1px solid #cbd5e1;margin-bottom:14px;">'+bulanOpts+'</select>'+
                  '<label style="font-weight:700;display:block;margin-bottom:6px;">Pilih Tahun</label>'+
                  '<select id="swal-tahun" style="width:100%;padding:8px;border-radius:8px;border:1px solid #cbd5e1;">'+thnOpts+'</select>'+
                  '</div>',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-file-pdf"></i> Cetak PDF',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#1e40af',
            background: '#fff',
            color: '#1e293b',
        }).then(function(r){
            if (!r.isConfirmed) return;
            var bln = parseInt(document.getElementById('swal-bulan').value);
            var thn = parseInt(document.getElementById('swal-tahun').value);
            window._doCetakKas(bln, thn);
        });
    };

    window._doCetakKas = function(bln, thn) {
        var BULAN    = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var dbKas    = JSON.parse(localStorage.getItem('db_kas')||'[]');
        var sAwal    = parseInt(localStorage.getItem('db_saldo_awal')||'0')||0;
        var st       = JSON.parse(localStorage.getItem('db_settings')||'{}');
        var namaRT   = st.namaRT  || 'Bapak Kasimin';
        var namaRW   = st.namaRW  || 'Bapak Mulyono';
        var namaBen  = st.namaBen || 'Bapak Parmin';
        var blnStr   = BULAN[bln] + ' ' + thn;
        var tglCetak = new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});

        function fmtRp(n){ return 'Rp '+Number(n||0).toLocaleString('id-ID'); }
        function tglFmt(s){ if(!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}); }
        function isKhusus(u){ var x=(u||'').toLowerCase(); return ['uang meja','uang sosial','17 agustus','agustusan'].some(function(k){return x.indexOf(k)!==-1;}); }

        var all = dbKas.filter(function(k){
            if(!k.tgl) return false;
            var d = new Date(k.tgl);
            return d.getMonth()===bln && d.getFullYear()===thn;
        });
        all.sort(function(a,b){ return new Date(a.tgl)-new Date(b.tgl); });

        var utama  = all.filter(function(k){ return !isKhusus(k.uraian); });
        var khusus = all.filter(function(k){ return  isKhusus(k.uraian); });

        var totMU = utama.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKU = utama.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);
        var sAkh  = sAwal + totMU - totKU;
        var totMK = khusus.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKK = khusus.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);

        var kop = buatKop(namaRT, namaRW);
        var css = buatCSS();

        var saldoRow = sAwal;
        var rowsUtama = utama.length === 0
            ? '<tr><td colspan="6" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi kas utama</td></tr>'
            : utama.map(function(k,i){
                if(k.tipe==='masuk') saldoRow+=k.nominal; else saldoRow-=k.nominal;
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td>'+
                    '<td style="text-align:right;font-weight:700;">'+fmtRp(saldoRow)+'</td></tr>';
              }).join('');

        var rowsKhusus = khusus.length === 0
            ? '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi dana khusus</td></tr>'
            : khusus.map(function(k,i){
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td></tr>';
              }).join('');

        var rowsLampiran = all.length === 0
            ? '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi</td></tr>'
            : all.map(function(k,i){
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td></tr>';
              }).join('');

        var ttd = '<div class="ttd">'+
            '<div class="ttd-box">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">'+namaRT+'</b></div>'+
            '<div class="ttd-box">Semarang, '+tglCetak+'<br>Bendahara RT 005<br><br><br><br><b style="text-decoration:underline;">'+namaBen+'</b></div>'+
            '</div>';

        var htmlOut = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Laporan Kas RT 005</title>'+css+'</head><body>'+
            kop+
            '<div class="judul">Berita Acara Laporan Kas Utama</div>'+
            '<div class="sub">RT 005 / RW 012 Kelurahan Tegalsari &mdash; Periode: '+blnStr+'</div>'+
            '<div class="sum">'+
                '<div class="sb"><div class="l">Saldo Awal</div><div class="v">'+fmtRp(sAwal)+'</div></div>'+
                '<div class="sb"><div class="l">Total Pemasukan</div><div class="v" style="color:#166534 !important;">'+fmtRp(totMU)+'</div></div>'+
                '<div class="sb"><div class="l">Total Pengeluaran</div><div class="v" style="color:#991b1b !important;">'+fmtRp(totKU)+'</div></div>'+
                '<div class="sb"><div class="l">Saldo Akhir</div><div class="v" style="color:#92400e !important;">'+fmtRp(sAkh)+'</div></div>'+
            '</div>'+
            '<table><thead><tr>'+
                '<th style="width:35px;">No</th><th style="width:90px;">Tanggal</th><th>Uraian Transaksi</th>'+
                '<th style="width:90px;text-align:center;">Tipe</th><th style="width:110px;text-align:right;">Nominal</th>'+
                '<th style="width:110px;text-align:right;">Saldo</th>'+
            '</tr></thead><tbody>'+rowsUtama+'</tbody>'+
            '<tfoot><tr>'+
                '<td colspan="4" style="text-align:right;font-weight:700;border:1px solid #000;padding:6px 8px;">SALDO AKHIR KAS UTAMA</td>'+
                '<td colspan="2" style="text-align:right;font-weight:800;font-size:13px;border:1px solid #000;padding:6px 8px;">'+fmtRp(sAkh)+'</td>'+
            '</tr></tfoot></table>'+
            ttd+
            '<div class="pagebreak"></div>'+
            kop+
            '<div class="judul">Laporan Dana Khusus</div>'+
            '<div class="sub">RT 005 / RW 012 Kelurahan Tegalsari &mdash; Periode: '+blnStr+'</div>'+
            '<div class="sub" style="font-size:10px;">(Uang Meja, Uang Sosial, 17 Agustus)</div>'+
            '<div class="sum">'+
                '<div class="sb"><div class="l">Total Pemasukan Dana Khusus</div><div class="v" style="color:#166534 !important;">'+fmtRp(totMK)+'</div></div>'+
                '<div class="sb"><div class="l">Total Pengeluaran Dana Khusus</div><div class="v" style="color:#991b1b !important;">'+fmtRp(totKK)+'</div></div>'+
                '<div class="sb"><div class="l">Saldo Dana Khusus</div><div class="v" style="color:#92400e !important;">'+fmtRp(totMK-totKK)+'</div></div>'+
            '</div>'+
            '<table><thead><tr>'+
                '<th style="width:35px;">No</th><th style="width:90px;">Tanggal</th><th>Uraian</th>'+
                '<th style="width:100px;text-align:center;">Tipe</th><th style="width:110px;text-align:right;">Nominal</th>'+
            '</tr></thead><tbody>'+rowsKhusus+'</tbody>'+
            '<tfoot><tr>'+
                '<td colspan="3" style="text-align:right;font-weight:700;border:1px solid #000;padding:6px 8px;">SALDO DANA KHUSUS</td>'+
                '<td colspan="2" style="text-align:right;font-weight:800;font-size:13px;border:1px solid #000;padding:6px 8px;">'+fmtRp(totMK-totKK)+'</td>'+
            '</tr></tfoot></table>'+
            ttd+
            '<div class="pagebreak"></div>'+
            kop+
            '<div class="judul">Lampiran: Rincian Seluruh Transaksi Bendahara</div>'+
            '<div class="sub">RT 005 / RW 012 Kelurahan Tegalsari &mdash; Periode: '+blnStr+'</div>'+
            '<table><thead><tr>'+
                '<th style="width:35px;">No</th><th style="width:90px;">Tanggal</th><th>Uraian Transaksi</th>'+
                '<th style="width:100px;text-align:center;">Tipe</th><th style="width:110px;text-align:right;">Nominal</th>'+
            '</tr></thead><tbody>'+rowsLampiran+'</tbody>'+
            '<tfoot><tr>'+
                '<td colspan="3" style="text-align:right;font-weight:700;border:1px solid #000;padding:6px 8px;">TOTAL TRANSAKSI</td>'+
                '<td colspan="2" style="text-align:right;font-weight:800;font-size:13px;border:1px solid #000;padding:6px 8px;">'+all.length+' transaksi</td>'+
            '</tr></tfoot></table>'+
            ttd+
            '</body></html>';

        var w = window.open('', '_blank');
        if (w) { w.document.write(htmlOut); w.document.close(); setTimeout(function(){ w.print(); }, 800); }
    };
`;

// ── Inject ke index.html ────────────────────────────────────────────────
const TARGET = 'window.cetakLaporanKas = function() {';
const startIdx = html.indexOf(TARGET);
if (startIdx === -1) { console.error("❌ cetakLaporanKas tidak ditemukan"); process.exit(1); }

let depth = 0;
let i = startIdx;

while (i < html.length) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
        depth--;
        if (depth === 0) { i++; break; }
    }
    i++;
}

// Cari titik koma penutup setelah }
while (i < html.length && (html[i] === ';' || html[i] === ' ' || html[i] === '\n' || html[i] === '\r')) {
    if (html[i] === ';') { i++; break; }
    i++;
}

const oldBlock = html.substring(startIdx, i);
console.log("✅ Fungsi lama ditemukan, panjang:", oldBlock.length, "karakter");

// ── Inject fungsi baru ─────────────────────────────────────────────────
html = html.substring(0, startIdx) + newFunc + html.substring(i);
writeFileSync(FILE, html, "utf8");
console.log("✅ patch_kas.mjs berhasil! File index.html sudah diupdate.");
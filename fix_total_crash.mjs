import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File index.html tidak ditemukan!`);
    process.exit(1);
}

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    console.log('🔄 Memulai pembersihan kode crash...');

    // A. Pembersihan Sintaks Error Lama (Broken Functions)
    // Mencari pola broken function dan sisa '}' yang berantakan
    htmlContent = htmlContent.replace(/window\.loadWargaFbRight\s*=\s*function[\s\S]*?\}\s*;/g, '');
    htmlContent = htmlContent.replace(/window\.loadWargaFbRight\s*=\s*function[\s\S]*?\n/g, '');
    
    // Perbaikan pola sintaks kaku lainnya jika ada
    htmlContent = htmlContent.replace(/;+\s*\}/g, ' }'); 

    // B. Kode Fungsi Bersih & Mandiri (Safe IIFE Wrapper)
    const secureFunctionCode = `
<script id="fix-fbright-sync">
(function() {
    window.loadWargaFbRight = function() {
        try {
            // Ambil data Saldo Kas
            const saldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal')) || parseFloat(localStorage.getItem('db_saldo_awal')) || 0;
            const dataKas = JSON.parse(localStorage.getItem('db_kas')) || [];
            const totalTransaksi = dataKas.reduce((sum, item) => {
                const nominal = parseFloat(item.nominal) || 0;
                return item.jenis === 'masuk' ? sum + nominal : sum - nominal;
            }, 0);
            const saldoAkhir = saldoAwal + totalTransaksi;
            
            const elSaldo = document.getElementById('wfb-saldo-kas');
            if(elSaldo) { elSaldo.innerText = 'Rp ' + saldoAkhir.toLocaleString('id-ID'); }

            // Ambil data Arisan & Host
            const infoArisan = JSON.parse(localStorage.getItem('db_info_arisan')) || {};
            const elArisan = document.getElementById('wfb-arisan');
            if(elArisan) { elArisan.innerText = infoArisan.arisanNama || '—'; }
            
            const elHost = document.getElementById('wfb-host');
            if(elHost) { elHost.innerText = infoArisan.hostNama || '—'; }
            console.log('✅ loadWargaFbRight disinkronkan.');
        } catch(e) { console.error('Error loadWargaFbRight:', e); }
    };
})();
</script>
`;

    // C. Suntikkan Kembali Fungsi Aman ke <head>
    htmlContent = htmlContent.replace('</head>', `${secureFunctionCode}\n</head>`);

    // D. Tulis File & Log Sukses
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 PERBAIKAN TOTAL SELESAI! Sintaks error dibersihkan dan kode panel kanan dipulihkan.');

} catch (error) {
    console.error('❌ Terjadi kegagalan saat menjalankan patch total:', error);
}

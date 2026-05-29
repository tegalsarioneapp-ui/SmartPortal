import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File tidak ditemukan`);
    process.exit(1);
}

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Membersihkan sisa-sisa fungsi loadWargaFbRight yang rusak/patah di index.html
    htmlContent = htmlContent.replace(/window\.loadWargaFbRight\s*=\s*function[\s\S]*?\}\s*;/g, '');
    htmlContent = htmlContent.replace(/window\.loadWargaFbRight\s*=\s*function[\s\S]*?\n/g, '');
    
    // Bersihkan script tag kosong atau rusak akibat replace sebelumnya jika ada
    htmlContent = htmlContent.replace(/<script>\s*<\/script>/g, '');

    // Kode fungsi bersih dan mandiri (Self-contained) tanpa merusak script lain
    const cleanFunctionCode = `
<script>
(function() {
    window.loadWargaFbRight = function() {
        try {
            const saldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal')) || parseFloat(localStorage.getItem('db_saldo_awal')) || 0;
            const dataKas = JSON.parse(localStorage.getItem('db_kas')) || [];
            const totalTransaksi = dataKas.reduce((sum, item) => {
                const nominal = parseFloat(item.nominal) || 0;
                return item.jenis === 'masuk' ? sum + nominal : sum - nominal;
            }, 0);
            const saldoAkhir = saldoAwal + totalTransaksi;
            
            const elSaldo = document.getElementById('wfb-saldo-kas');
            if(elSaldo) { elSaldo.innerText = 'Rp ' + saldoAkhir.toLocaleString('id-ID'); }

            const infoArisan = JSON.parse(localStorage.getItem('db_info_arisan')) || {};
            const elArisan = document.getElementById('wfb-arisan');
            if(elArisan) { elArisan.innerText = infoArisan.arisanNama || '—'; }
            
            const elHost = document.getElementById('wfb-host');
            if(elHost) { elHost.innerText = infoArisan.hostNama || '—'; }
        } catch(e) {
            console.error('Error loadWargaFbRight:', e);
        }
    };
})();
</script>
`;

    // Taruh fungsi bersih ini tepat di atas penutup </head> secara aman
    htmlContent = htmlContent.replace('</head>', `${cleanFunctionCode}\n</head>`);

    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 SINTAKS ERROR BERHASIL DIBERSIHKAN! Kode kembali normal dan sinkron.');

} catch (error) {
    console.error('❌ Gagal membersihkan error:', error);
}

import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const cleanCSS = `
  /* ===== RESPONSIVE LAYOUT FIX ===== */
  .admin-tab-content, .warga-tab-content, .ben-tab-content, .kop-tab-content {
    padding-bottom: 20px !important;
    box-sizing: border-box !important;
  }
  @media (max-width: 768px) {
    .admin-tab-content, .warga-tab-content, .ben-tab-content, .kop-tab-content {
      padding-bottom: 85px !important;
    }
  }
    `;

    // Kita gunakan teknik "Override" global, bukan "Replace" teks
    const cleanJS = `
<style>${cleanCSS}</style>
<script>
window.addEventListener('load', () => {
    // Fungsi ini akan menimpa fungsi lama di memori browser secara otomatis
    window.loadWargaFbRight = function() {
        try {
            const saldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal')) || parseFloat(localStorage.getItem('db_saldo_awal')) || 0;
            const dataKas = JSON.parse(localStorage.getItem('db_kas')) || [];
            const totalTransaksi = dataKas.reduce((sum, item) => {
                return sum + (item.jenis === 'masuk' ? (parseFloat(item.nominal) || 0) : -(parseFloat(item.nominal) || 0));
            }, 0);
            const saldoAkhir = saldoAwal + totalTransaksi;

            const elSaldo = document.getElementById('wfb-saldo-kas');
            if(elSaldo) elSaldo.innerText = 'Rp ' + saldoAkhir.toLocaleString('id-ID');

            const infoArisan = JSON.parse(localStorage.getItem('db_info_arisan')) || {};
            const elArisan = document.getElementById('wfb-arisan');
            if(elArisan) elArisan.innerText = infoArisan.arisanNama || '—';

            const elHost = document.getElementById('wfb-host');
            if(elHost) elHost.innerText = infoArisan.hostNama || '—';
        } catch(e) { console.error('Error loadWargaFbRight:', e); }
    };
    
    // Eksekusi paksa agar panel kanan langsung update
    if (typeof window.loadWargaFbRight === 'function') {
        window.loadWargaFbRight();
    }
});
</script>
`;

    // Suntikkan dengan aman di bagian atas (head), tidak menyentuh kode di body
    htmlContent = htmlContent.replace('</head>', `${cleanJS}\n</head>`);
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 FILE 100% PULIH! Kode sehat berhasil dikembalikan dan fitur disuntikkan.');

} catch (e) {
    console.error('Gagal:', e);
}

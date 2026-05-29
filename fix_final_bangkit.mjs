import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const responsiveCSS = `
  /* ===== SMART PORTAL RESPONSIVE LAYOUT ===== */
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

    const injectionScript = `
<style>${responsiveCSS}</style>
<script>
(function() {
    window.addEventListener('DOMContentLoaded', () => {
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
                console.log('✏️ Panel Kanan Berhasil Disinkronkan!');
            } catch(e) { console.error('Gagal sinkron panel kanan:', e); }
        };
        if(typeof window.loadWargaFbRight === 'function') window.loadWargaFbRight();
    });
})();
</script>
`;

    htmlContent = htmlContent.replace('</head>', `${injectionScript}\n</head>`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 JOSS! File index.html berhasil ditambal secara aman tanpa merusak kode asli!');

} catch (err) {
    console.error('Gagal mengeksekusi patch:', err);
}

import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    console.log('🔄 Menyisir dan menyuntikkan kode fitur secara steril...');

    // CSS Khusus Desktop Full Layout & Mobile Safe Padding
    const cleanCSS = `
  /* ===== STYLE REPAIR BY IDT ===== */
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

    // JavaScript Sinkronisasi Mandiri (Aman dari bentrok fungsi internal)
    const cleanJS = `
<style>${cleanCSS}</style>
<script>
(function() {
    // Dipasang di level paling luar/global agar aman
    window.addEventListener('load', () => {
        const syncPanelKanan = () => {
            try {
                // Perhitungan Kas Utama
                const saldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal')) || parseFloat(localStorage.getItem('db_saldo_awal')) || 0;
                const dataKas = JSON.parse(localStorage.getItem('db_kas')) || [];
                const totalTransaksi = dataKas.reduce((sum, item) => {
                    return sum + (item.jenis === 'masuk' ? (parseFloat(item.nominal) || 0) : -(parseFloat(item.nominal) || 0));
                }, 0);
                const saldoAkhir = saldoAwal + totalTransaksi;
                
                const elSaldo = document.getElementById('wfb-saldo-kas');
                if(elSaldo) elSaldo.innerText = 'Rp ' + saldoAkhir.toLocaleString('id-ID');

                // Data Arisan & Host dari Notulen
                const infoArisan = JSON.parse(localStorage.getItem('db_info_arisan')) || {};
                const elArisan = document.getElementById('wfb-arisan');
                if(elArisan) elArisan.innerText = infoArisan.arisanNama || '—';
                
                const elHost = document.getElementById('wfb-host');
                if(elHost) elHost.innerText = infoArisan.hostNama || '—';
            } catch(err) { console.error('Gagal sinkron:', err); }
        };

        // Daftarkan ke global window agar bisa dipanggil sistem asli
        window.loadWargaFbRight = syncPanelKanan;
        
        // Eksekusi langsung saat load pertama kali
        syncPanelKanan();
    });
})();
</script>
`;

    // Taruh tepat sebelum penutup </head> (Metode injeksi paling steril dan anti-gagal)
    htmlContent = htmlContent.replace('</head>', `${cleanJS}\n</head>`);
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 SELESAI! File disterilkan dan ditambal tanpa merusak struktur asli.');

} catch (e) {
    console.error('Gagal total:', e);
}

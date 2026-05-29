import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    console.log('📦 Menyuntikkan perbaikan layout desktop secara agresif...');

    const aggressiveCSS = `
  /* ===================================================
     FIX LAYOUT DESKTOP: RAMPING & FULL LAYOUT (BY IDT)
     =================================================== */
  
  /* 1. KONDISI MODE DESKTOP (Layar Lebar / Monitor) */
  @media (min-width: 769px) {
    /* Paksa semua kontainer utama menggunakan padding desktop ramping dan buang margin menggantung */
    .admin-tab-content, 
    .warga-tab-content, 
    .ben-tab-content, 
    .kop-tab-content,
    .main-content,
    .content-wrapper,
    main,
    #app,
    .app-container {
      padding-bottom: 20px !important;
      margin-bottom: 0 !important;
      box-sizing: border-box !important;
      height: auto !important;
    }

    /* Lenyapkan total elemen atau space navigasi mobile yang bocor / memakan tempat di desktop */
    .mobile-nav, 
    .bottom-nav, 
    .mobile-navigation,
    .nav-mobile,
    .bottom-bar,
    [class*="mobile-nav"], 
    [class*="bottom-nav"],
    [class*="bottom-bar"] {
      display: none !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      visibility: hidden !important;
    }
  }

  /* 2. KONDISI MODE MOBILE (HP) - Tetap Berikan Jarak Aman agar tidak tertutup */
  @media (max-width: 768px) {
    .admin-tab-content, 
    .warga-tab-content, 
    .ben-tab-content, 
    .kop-tab-content {
      padding-bottom: 90px !important;
    }
  }
    `;

    const perfectJS = `
<style>${aggressiveCSS}</style>
<script>
window.addEventListener('load', () => {
    const syncPanelKanan = () => {
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
        } catch(e) { console.error('Error panel kanan:', e); }
    };
    
    window.loadWargaFbRight = syncPanelKanan;
    syncPanelKanan();
});
</script>
`;

    // Pasang patch steril di dalam head
    htmlContent = htmlContent.replace('</head>', `${perfectJS}\n</head>`);
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 JOSS! Blokir navigasi mobile di desktop berhasil diterapkan!');

} catch (e) {
    console.error('Gagal mengeksekusi patch layout:', e);
}

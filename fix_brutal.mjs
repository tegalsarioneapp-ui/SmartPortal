import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const brutalCSS = `
  <style>
  @media (min-width: 769px) {
    /* Paksa semua elemen tidak memiliki padding bawah berlebihan di desktop */
    main, .main-content, #app, .app-container {
      padding-bottom: 20px !important;
      margin-bottom: 0 !important;
    }
  }
  </style>
    `;

    const brutalJS = `
<script>
window.addEventListener('load', () => {
    // 1. SINKRONISASI PANEL KANAN (Tetap dipertahankan karena sudah sukses)
    const syncPanel = () => {
        try {
            const saldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal')) || parseFloat(localStorage.getItem('db_saldo_awal')) || 0;
            const dataKas = JSON.parse(localStorage.getItem('db_kas')) || [];
            const total = dataKas.reduce((s, i) => s + (i.jenis === 'masuk' ? (parseFloat(i.nominal)||0) : -(parseFloat(i.nominal)||0)), 0);
            const elSaldo = document.getElementById('wfb-saldo-kas');
            if(elSaldo) elSaldo.innerText = 'Rp ' + (saldoAwal + total).toLocaleString('id-ID');
            
            const info = JSON.parse(localStorage.getItem('db_info_arisan')) || {};
            const elArisan = document.getElementById('wfb-arisan');
            if(elArisan) elArisan.innerText = info.arisanNama || '—';
            
            const elHost = document.getElementById('wfb-host');
            if(elHost) elHost.innerText = info.hostNama || '—';
        } catch(e) {}
    };
    window.loadWargaFbRight = syncPanel;
    syncPanel();

    // 2. PEMBUNUH NAVIGASI & RUANG KOSONG (Tanpa tebak-tebakan class)
    if(window.innerWidth > 768) {
        setTimeout(() => {
            const allElements = document.querySelectorAll('div, nav, footer');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                // Matikan elemen yang melayang/menempel di posisi bawah
                if(style.position === 'fixed' && style.bottom === '0px') {
                    el.style.setProperty('display', 'none', 'important');
                }
                // Pangkas padding bawah raksasa pembentuk ruang kosong
                if(parseInt(style.paddingBottom) > 60) {
                    el.style.setProperty('padding-bottom', '20px', 'important');
                }
            });
        }, 500); // Eksekusi setelah DOM selesai memuat rendering
    }

    // 3. PEMBERSIH BUG "undefined" PADA TABEL IURAN
    setTimeout(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes('undefined')) {
                node.nodeValue = node.nodeValue.replace(/undefined/g, '—');
            }
        }
    }, 800);
});
</script>
`;

    // Injeksi dengan aman
    htmlContent = htmlContent.replace('</head>', `${brutalCSS}\n${brutalJS}\n</head>`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 SCRIPT HUNTER BERHASIL DISUNTIKKAN!');
} catch (e) {
    console.error('Gagal:', e);
}

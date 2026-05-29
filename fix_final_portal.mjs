import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File tidak ditemukan di: ${htmlPath}`);
    process.exit(1);
}

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // =========================================================================
    // PERBAIKAN 1: RESPONSIVE LAYOUT DENGAN MEDIA QUERIES (DESKTOP VS MOBILE)
    // =========================================================================
    const dynamicLayoutCSS = `
  /* ===== SMART LAYOUT FIX: Desktop vs Mobile ===== */
  .admin-tab-content, .warga-tab-content,
  .ben-tab-content, .kop-tab-content {
    padding-bottom: 24px !important;   /* Default Desktop: Full & rapat ke bawah */
    overflow-x: auto !important;
    box-sizing: border-box !important;
  }
  html, body { margin-bottom: 0 !important; }

  /* Ganjalan 85px HANYA aktif di Layar HP (Mobile) agar tidak tertutup menu navigation */
  @media (max-width: 768px) {
    .admin-tab-content, .warga-tab-content,
    .ben-tab-content, .kop-tab-content {
      padding-bottom: 85px !important;
    }
    .card, .form-grid, .stat-grid {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
  }
  /* ===== END SMART LAYOUT FIX ===== */
    `;

    // Hapus CSS ganjalan kaku lama jika ada
    htmlContent = htmlContent.replace(/<style>[\s\S]*?LAYOUT FIX: Prevent bottom-nav overlap[\s\S]*?<\/style>/g, '');
    
    // Suntikkan CSS dinamis yang baru ke dalam </head>
    htmlContent = htmlContent.replace('</head>', `<style>${dynamicLayoutCSS}</style>\n</head>`);
    console.log('✅ 1. CSS Responsive Layout (Desktop vs Mobile) berhasil disuntikkan!');


    // =========================================================================
    // PERBAIKAN 2: SINKRONISASI JITU DATA PANEL KANAN (REKAP RT 005)
    // =========================================================================
    const newFunctionCode = `window.loadWargaFbRight = function() {
        try {
            // A. Sinkronisasi Saldo Kas Utama dengan Panel Kanan
            const saldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal')) || parseFloat(localStorage.getItem('db_saldo_awal')) || 0;
            const dataKas = JSON.parse(localStorage.getItem('db_kas')) || [];
            const totalTransaksi = dataKas.reduce((sum, item) => {
                const nominal = parseFloat(item.nominal) || 0;
                return item.jenis === 'masuk' ? sum + nominal : sum - nominal;
            }, 0);
            const saldoAkhir = saldoAwal + totalTransaksi;
            
            const elSaldo = document.getElementById('wfb-saldo-kas');
            if(elSaldo) {
                elSaldo.innerText = 'Rp ' + saldoAkhir.toLocaleString('id-ID');
            }

            // B. Sinkronisasi Nama Arisan & Tuan Rumah dari db_info_arisan
            const infoArisan = JSON.parse(localStorage.getItem('db_info_arisan')) || {};
            
            const elArisan = document.getElementById('wfb-arisan');
            if(elArisan) {
                elArisan.innerText = infoArisan.arisanNama || '—';
            }
            
            const elHost = document.getElementById('wfb-host');
            if(elHost) {
                elHost.innerText = infoArisan.hostNama || '—';
            }
            console.log('Fungsi panel kanan dipanggil & disinkronkan.');
        } catch(e) {
            console.error('Gagal memuat data panel kanan:', e);
        }
    };`;

    // Hapus fungsi loadWargaFbRight kaku lama jika ada
    const oldFunctionRegex = /window\.loadWargaFbRight\s*=\s*function\s*\(\)\s*\{[\s\S]*?\}\s*;/g;
    htmlContent = htmlContent.replace(oldFunctionRegex, '');

    // Suntikkan fungsi sinkronisasi yang baru tepat sebelum </head> berakhir
    htmlContent = htmlContent.replace('</head>', `<script>\n${newFunctionCode}\n</script>\n</head>`);
    console.log('✅ 2. Fungsi sinkronisasi Panel Kanan berhasil di-inject ke sistem!');

    // Tulis kembali perubahan ke index.html
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 SELESAI! Semua perbaikan sukses diterapkan secara lokal ke index.html!');

} catch (error) {
    console.error('❌ Terjadi kegagalan saat menjalankan patch final:', error);
}

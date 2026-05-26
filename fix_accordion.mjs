import fs from 'fs';
import path from 'path';

// Jalur menuju file index.html Anda
const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File tidak ditemukan di: ${htmlPath}`);
    process.exit(1);
}

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Kode CSS perbaikan layout dari CodeRabbit
    const layoutFixCSS = `
  /* ===== LAYOUT FIX: Prevent bottom-nav overlap ===== */
  .admin-tab-content, .warga-tab-content,
  .ben-tab-content, .kop-tab-content {
    padding-bottom: 80px !important;   /* Clear fixed bottom nav */
    overflow-x: auto !important;       /* Allow horizontal scroll, not clip */
    box-sizing: border-box !important;
  }
  /* Remove body margin-bottom */
  html, body { margin-bottom: 0 !important; }

  /* Responsive: card & form tidak meluber ke kanan */
  @media (max-width: 768px) {
    .card, .form-grid, .stat-grid {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
  }
  /* ===== END LAYOUT FIX ===== */
    `;

    // 1. Suntikkan CSS ke dalam tag </head> jika belum ada
    if (!htmlContent.includes('LAYOUT FIX: Prevent bottom-nav overlap')) {
        htmlContent = htmlContent.replace('</head>', `<style>${layoutFixCSS}</style>\n</head>`);
        console.log('✅ CSS Layout Fix berhasil disuntikkan ke </head>');
    } else {
        console.log('ℹ️ CSS Layout Fix sudah terpasang sebelumnya.');
    }

    // 2. Perbaiki max-height accordion dari 2000px ke 9999px agar tidak terpotong
    if (htmlContent.includes('max-height:2000px') || htmlContent.includes('max-height: 2000px')) {
        htmlContent = htmlContent.replace(/max-height\s*:\s*2000px/g, 'max-height:9999px');
        console.log('✅ Max-height Accordion berhasil dinaikkan ke 9999px');
    }

    // Tulis kembali perubahan ke index.html
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('🚀 Semua perbaikan sukses diterapkan ke index.html!');

} catch (error) {
    console.error('❌ Terjadi kegagalan saat menjalankan patch:', error);
}
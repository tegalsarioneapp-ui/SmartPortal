import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'artifacts', 'smart-portal-rt', 'index.html');

try {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Skrip murni JavaScript yang aman, tidak menyentuh CSS layout sama sekali
    const safeJS = `
<script>
window.addEventListener('load', () => {
    // 1. Kembalikan fungsi panel kanan yang sudah berhasil sebelumnya
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
        } catch(e) {}
    };
    
    window.loadWargaFbRight = syncPanelKanan;
    syncPanelKanan();

    // 2. Bersihkan teks 'undefined' secara spesifik pada sel tabel
    setTimeout(() => {
        const cells = document.querySelectorAll('td, span, div, p');
        cells.forEach(cell => {
            if (cell.childNodes.length === 1 && cell.childNodes[0].nodeType === Node.TEXT_NODE) {
                if (cell.innerText.trim() === 'undefined') {
                    cell.innerText = '—';
                }
            }
        });
    }, 1000);
});
</script>
`;

    htmlContent = htmlContent.replace('</head>', `${safeJS}\n</head>`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('✅ Rollback ke kondisi aman berhasil dieksekusi.');
} catch (e) {
    console.error('Error:', e);
}

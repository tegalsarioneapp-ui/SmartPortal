FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# ── Hapus filterMatriksIuran lama ────────────────────────────
OLD_FILTER = """    window.filterMatriksIuran = function(q) {
        try {
            q = String(q || '').trim().toLowerCase();
            var tb = document.getElementById('tbody-global-iuran');
            if (!tb) return;
            var rows = tb.querySelectorAll('tr');
            var shown = 0;
            rows.forEach(function(tr){
                var td = tr.querySelector('td');
                var nama = td ? td.innerText.toLowerCase() : '';
                var match = !q || nama.indexOf(q) !== -1;
                tr.style.display = match ? '' : 'none';
                if (match) shown++;
            });
            var info = document.getElementById('matriks-search-info');
            if (info) info.innerText = q ? (shown + ' warga cocok dengan "' + q + '"') : '';
        } catch(e) { console.warn('filterMatriksIuran error', e); }
    };"""

i = html.find(OLD_FILTER)
if i == -1:
    print("INFO: filterMatriksIuran lama tidak ditemukan")
else:
    html = html[:i] + html[i + len(OLD_FILTER):]
    print("OK: filterMatriksIuran lama dihapus")

# ── Hapus wrapper lama ────────────────────────────────────────
OLD_WRAP_START = "// === Hook: re-apply Matriks search filter setiap loadMatriksIuran selesai ==="
OLD_WRAP_END   = "    window.loadMatriksIuran = wrapped;\n"

i_wrap = html.find(OLD_WRAP_START)
if i_wrap == -1:
    print("INFO: wrapper lama tidak ditemukan")
else:
    i_wrap_end = html.find(OLD_WRAP_END, i_wrap)
    if i_wrap_end == -1:
        print("GAGAL: penutup wrapper tidak ditemukan")
        exit(1)
    html = html[:i_wrap] + html[i_wrap_end + len(OLD_WRAP_END):]
    print("OK: wrapper lama dihapus")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("SELESAI!")

    window.onerror = function(msg, src, line, col, err) {
        console.error('GLOBAL ERROR:', msg, 'at', src, 'line', line);
        document.title = 'ERR: ' + msg.substring(0,40);
    };
    window.onunhandledrejection = function(e) {
        console.error('UNHANDLED PROMISE:', e.reason);
    };
    








    function bukaFormLogin() {
        var splash = document.getElementById("splash-view");
        var loginForm = document.getElementById("login-form-view");
        if (!splash || !loginForm) return;
        splash.style.transition = "0.5s";
        splash.style.opacity = "0";
        splash.style.transform = "scale(1.2)";
        setTimeout(function() {
            splash.style.display = "none";
            loginForm.style.display = "block";
            var inp = document.getElementById("univ-id");
            if (inp) inp.focus();
        }, 500);
    }
    

    // === SERVICE WORKER (PWA) ===
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.info('[SW] Registered, scope:', reg.scope);
            }).catch(function(err) {
                console.warn('[SW] Registration failed:', err);
            });
        });
    }

    // === PWA INSTALL PROMPT (shim — satu handler terpusat di bawah, pakai window._gtDeferredPrompt) ===
    window.triggerPWAInstall = function() {
        var p = window._gtDeferredPrompt;
        if (!p) {
            Swal.fire('Info','Tombol install tidak tersedia.\nCoba buka aplikasi di browser Chrome/Edge dan refresh halaman.','info');
            return;
        }
        p.prompt();
        p.userChoice.then(function(result) {
            window._gtDeferredPrompt = null;
            var btn = document.getElementById('pwa-install-btn');
            if (btn) btn.style.display = 'none';
            if (typeof window._gtHideInstallBanner === 'function') window._gtHideInstallBanner();
        });
    };
    window.addEventListener('appinstalled', function() {
        window._gtDeferredPrompt = null;
        var btn = document.getElementById('pwa-install-btn');
        if (btn) btn.style.display = 'none';
        if (typeof window._gtHideInstallBanner === 'function') window._gtHideInstallBanner();
        if (typeof Toast !== 'undefined') Toast.fire({icon:'success', title:'Aplikasi berhasil diinstall!'});
    });
    

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


/* toggleSidebar — harus load lebih awal sebelum button render */
window.toggleSidebar = function() {
  var isMobile = window.innerWidth <= 768;
  if (isMobile) {
    if (typeof window.gtSpOpen === "function") {
      window.gtSpOpen();
    }
  } else {
    document.body.classList.toggle("sidebar-collapsed");
    var isCollapsed = document.body.classList.contains("sidebar-collapsed");
    try { localStorage.setItem("sidebar_state", isCollapsed ? "hidden" : "visible"); } catch(e) {}
    var btn = document.getElementById("gt-sidebar-toggle-btn");
    if (btn) {
      var ic = btn.querySelector("i");
      if (ic) ic.className = isCollapsed ? "fa-solid fa-bars" : "fa-solid fa-xmark";
    }
  }
};


/* Dismiss splash — show for ~3.2s then fade-scale out */
(function(){
  var _t1dismissed = false;
  function _t1dismiss(){
    if(_t1dismissed) return; _t1dismissed = true;
    var el = document.getElementById('t1-splash');
    if(!el || el.classList.contains('t1s-out')) return;
    el.classList.add('t1s-out');
    setTimeout(function(){ if(el && el.parentNode) el.parentNode.removeChild(el); }, 580);
  }
  /* Start loading bar fill after 120ms */
  setTimeout(function(){
    var f = document.getElementById('t1s-fill');
    if(f) f.style.width = '100%';
  }, 120);
  /* Hard dismiss at 10s */
  setTimeout(_t1dismiss, 10000);
  /* Also dismiss on load event (min 3s after load, cap 10s total) */
  window.addEventListener('load', function(){ setTimeout(_t1dismiss, 3000); });
})();


    // === Global state & helpers (must be initialized before any handler runs) ===
    var loggedInWarga = null;
    var Toast = (typeof Swal !== 'undefined') ? Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true
    }) : { fire: function(o){ try { console.log('[Toast]', o && o.title); } catch(e){} } };
    window.Toast = Toast;

    // Format Rupiah global (dipakai banyak loader: kas, iuran, koperasi, dll)
    window.fmt = function(v) { return 'Rp ' + Number(v || 0).toLocaleString('id-ID'); };
    var fmt = window.fmt;

    // ===== ACCORDION TOGGLE =====
    window.toggleAcc = function(id, header) {
        var body = document.getElementById(id);
        if (!body) return;
        var isOpen = body.classList.contains("open");
        if (isOpen) {
            body.classList.remove("open");
            body.style.display = "";
            if (header) header.classList.remove("open");
        } else {
            body.classList.add("open");
            body.style.display = "";
            if (header) header.classList.add("open");
        }
    };

    // ===== PRODUCTION-SAFE STORAGE & ESCAPE HELPERS (added by audit) =====
    window.safeGet = function(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (raw === null || raw === undefined || raw === '') return (fallback === undefined ? null : fallback);
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[safeGet] corrupt key ' + key, e);
            return (fallback === undefined ? null : fallback);
        }
    };
    window.safeSet = function(key, value) {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('[safeSet] failed to write ' + key, e);
            try { Toast.fire({ icon: 'error', title: 'Gagal menyimpan (storage penuh)' }); } catch(_) {}
            return false;
        }
    };
    window.escapeHtml = function(v) {
        if (v === null || v === undefined) return '';
        return String(v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    var esc = window.escapeHtml;

    // ===== Guest (Tamu) access guard =====
    // Mode tamu hanya boleh buka 3 tab: Beranda, Struktur Pengurus, Kontak Darurat.
    // Tab lain dicegat dengan notifikasi; restriksi sidebar sudah dilakukan di BukaPortal.
    window.GUEST_ALLOWED_TABS = ['warga-dashboard', 'warga-struktur', 'warga-darurat'];
    window.isGuestUser = function(){
        return !!(window.loggedInWarga && window.loggedInWarga.isGuest);
    };
    window.guestBlockNotice = function(){
        try {
            if (window.Swal && Swal.fire) {
                Swal.fire({
                    icon: 'info',
                    title: 'Akses Terbatas',
                    text: 'Tidak dapat akses, silahkan hubungi developer.',
                    confirmButtonText: 'Mengerti'
                });
            } else {
                alert('Tidak dapat akses, silahkan hubungi developer.');
            }
        } catch(e) {
            try { alert('Tidak dapat akses, silahkan hubungi developer.'); } catch(_){}
        }
    };
    (function installGuestGuard(){
        var attempts = 0;
        var iv = setInterval(function(){
            attempts++;
            if (typeof window.openWargaTab === 'function' && !window.openWargaTab.__gtGuestWrapped) {
                var orig = window.openWargaTab;
                window.openWargaTab = function(tabId){
                    if (window.isGuestUser() && window.GUEST_ALLOWED_TABS.indexOf(tabId) === -1) {
                        window.guestBlockNotice();
                        return;
                    }
                    return orig.apply(this, arguments);
                };
                window.openWargaTab.__gtGuestWrapped = true;
                clearInterval(iv);
            }
            if (attempts > 80) clearInterval(iv);
        }, 200);
    })();

    // ===== THEME (light/dark) bootstrap — injected by audit overhaul =====
    (function(){
        try {
            var saved = localStorage.getItem('gt_theme');
            var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            var theme = saved || (prefersDark ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        } catch(e){}
        window.gtToggleTheme = function(){
            var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            var next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('gt_theme', next); } catch(e){}
            var btn = document.getElementById('gt-theme-toggle');
            if (btn) btn.innerHTML = next === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        };
        function ensureToggle(){
            if (document.getElementById('gt-theme-toggle')) return;
            var hdr = document.querySelector('.main-header');
            if (!hdr) return;
            var btn = document.createElement('button');
            btn.id = 'gt-theme-toggle';
            btn.className = 'gt-theme-toggle no-print';
            btn.title = 'Ganti Mode Tampilan';
            btn.setAttribute('aria-label','Toggle dark mode');
            btn.onclick = window.gtToggleTheme;
            var cur = document.documentElement.getAttribute('data-theme');
            btn.innerHTML = cur === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            // Insert as the first item in the right-side action area
            var rightArea = hdr.querySelector('.action-btns') || hdr.lastElementChild || hdr;
            try { rightArea.insertBefore(btn, rightArea.firstChild); } catch(_) { hdr.appendChild(btn); }
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureToggle);
        else ensureToggle();
        // Re-ensure after potential DOM swaps
        setTimeout(ensureToggle, 600);
        setTimeout(ensureToggle, 2000);
    })();
    // ===== Citizen super-app dashboard injector — v2 =====
    (function(){
        function safeJSON(k, fb){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(_) { return fb; } }
        function fmtDate(s){ try { var d = new Date(s); if (isNaN(d)) return s||'-'; return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}); } catch(_) { return s||'-'; } }

        var SERVICES = [
            { id:'warga-surat',    icon:'fa-envelope-open-text', grad:'linear-gradient(135deg,#2563eb,#1d4ed8)', title:'Layanan Surat', desc:'Ajukan surat pengantar online' },
            { id:'warga-aduan',    icon:'fa-bullhorn',           grad:'linear-gradient(135deg,#ef4444,#b91c1c)', title:'Lapor Pak RT', desc:'Aduan & laporan warga' },
            { id:'warga-keuangan', icon:'fa-sack-dollar',        grad:'linear-gradient(135deg,#f59e0b,#b45309)', title:'Status Iuran', desc:'Riwayat pembayaran iuran' },
            { id:'warga-koperasi', icon:'fa-piggy-bank',         grad:'linear-gradient(135deg,#8b5cf6,#5b21b6)', title:'Koperasi RT', desc:'Tabungan & pinjaman' },
            { id:'warga-profil',   icon:'fa-id-badge',           grad:'linear-gradient(135deg,#06b6d4,#0e7490)', title:'Data Keluarga', desc:'Update kartu keluarga' },
            { id:'warga-struktur', icon:'fa-sitemap',            grad:'linear-gradient(135deg,#10b981,#047857)', title:'Struktur RT', desc:'Pengurus & jabatan' },
            { id:'warga-darurat',  icon:'fa-circle-exclamation', grad:'linear-gradient(135deg,#dc2626,#7f1d1d)', title:'Kontak Darurat', desc:'Akses cepat layanan SOS' }
        ];

        function renderTimeline(steps, currentIdx){
            var cols = steps.length;
            var pct = cols <= 1 ? 0 : Math.max(0, Math.min(currentIdx, cols-1)) / (cols-1) * 84;
            var html = '<div class="gt-timeline" style="--gt-tl-cols:'+cols+';">';
            html += '<div class="gt-tl-fill" style="width:'+pct+'%;"></div>';
            steps.forEach(function(s, i){
                var cls = i < currentIdx ? 'done' : (i === currentIdx ? 'active' : '');
                html += '<div class="gt-tl-step '+cls+'"><span class="gt-tl-dot"><i class="fa-solid '+s.icon+'"></i></span><span class="gt-tl-label">'+s.label+'</span></div>';
            });
            html += '</div>';
            return html;
        }

        function getCurrentUserNik(){
            try {
                var u = safeJSON('userAktif', null) || safeJSON('currentUser', null);
                if (u && (u.nik || u.id)) return u.nik || u.id;
            } catch(_){}
            return null;
        }

        function buildSuratStatus(){
            var warga = window.loggedInWarga;
            var arr = safeJSON('db_req_surat_v2', []);
            if (warga) arr = arr.filter(function(s){ return String(s.idWarga)===String(warga.id)||String(s.wargaId)===String(warga.id); });
            if (!arr.length) return '<div class="gt-status-empty"><i class="fa-regular fa-envelope"></i>Belum ada pengajuan surat. Ajukan dari menu Layanan Surat.</div>';
            arr.sort(function(a,b){ return new Date(b.tgl||b.tanggal||0)-new Date(a.tgl||a.tanggal||0); });
            var item = arr[0];
            var status = (item.status||'Menunggu').toString().toLowerCase();
            var cur = 0;
            if (/proses|review|verif|rt/.test(status)) cur = 1;
            if (/setuju|valid|approve/.test(status))   cur = 2;
            if (/selesai|terbit|cetak|ttd|done/.test(status)) cur = 3;
            var steps = [
                {icon:'fa-paper-plane', label:'Terkirim'},
                {icon:'fa-user-check',  label:'Proses RT'},
                {icon:'fa-stamp',       label:'Disetujui'},
                {icon:'fa-check-double',label:'Selesai'}
            ];
            var keperluan = (item.keperluan||item.jenis||'Surat Pengantar').toString();
            if (keperluan.length > 60) keperluan = keperluan.substring(0,60)+'...';
            var badgeCls = cur===3 ? 'badge-masuk' : 'badge-menunggu';
            return '<div class="gt-status-head"><div><h4 class="gt-status-title"><i class="fa-solid fa-envelope-circle-check" style="color:var(--gt-primary-600);"></i>'+escapeHtml(keperluan)+'</h4><div class="gt-status-meta">Diajukan '+fmtDate(item.tgl||item.tanggal)+'</div></div><span class="badge '+badgeCls+'">'+escapeHtml(item.status||'Menunggu')+'</span></div>'
                + renderTimeline(steps, cur);
        }

        function buildAduanStatus(){
            var warga = window.loggedInWarga;
            var arr = safeJSON('db_aduan', []);
            if (warga) arr = arr.filter(function(a){ return String(a.wargaId)===String(warga.id)||String(a.idPelapor)===String(warga.id); });
            if (!arr.length) return '<div class="gt-status-empty"><i class="fa-regular fa-comment-dots"></i>Belum ada aduan. Sampaikan via menu Lapor Pak RT.</div>';
            arr.sort(function(a,b){ return new Date(b.tgl||b.tanggal||0)-new Date(a.tgl||a.tanggal||0); });
            var it = arr[0];
            var st = (it.status||'Diterima').toString().toLowerCase();
            var cur = 0;
            if (/proses|tindak|review/.test(st)) cur = 1;
            if (/selesai|done|tutup|resolved/.test(st)) cur = 2;
            var steps = [
                {icon:'fa-inbox',             label:'Diterima'},
                {icon:'fa-screwdriver-wrench',label:'Ditindaklanjuti'},
                {icon:'fa-circle-check',      label:'Selesai'}
            ];
            var judul = (it.judul||it.kategori||'Aduan').toString();
            return '<div class="gt-status-head"><div><h4 class="gt-status-title"><i class="fa-solid fa-bullhorn" style="color:var(--gt-danger-500);"></i>'+escapeHtml(judul)+'</h4><div class="gt-status-meta">Dilaporkan '+fmtDate(it.tgl||it.tanggal)+' • '+escapeHtml(it.kategori||'-')+'</div></div><span class="badge '+(cur===2?'badge-masuk':'badge-menunggu')+'">'+escapeHtml(it.status||'Menunggu')+'</span></div>'
                + renderTimeline(steps, cur);
        }

        // ensureDashboardWidgets replaced by direct HTML + gtRefreshDashboard
        function ensureDashboardWidgets(){
            // Refresh status cards from correct data sources
            var s = document.getElementById('gt-status-surat'); if (s) s.innerHTML = buildSuratStatus();
            var a = document.getElementById('gt-status-aduan'); if (a) a.innerHTML = buildAduanStatus();
            // Populate greeting name
            var wEl = document.getElementById('warga-welcome-name');
            if (wEl && window.loggedInWarga && window.loggedInWarga.nama) {
                var nm = window.loggedInWarga.nama.trim().split(/\s+/).slice(0,2).join(' ');
                wEl.textContent = nm;
            }
            // Refresh greeting date/time
            var gEl = document.getElementById('warga-greeting-time');
            if (gEl) {
                var h = new Date().getHours();
                var salam = h < 11 ? 'Selamat Pagi ☀️' : h < 15 ? 'Selamat Siang 🌤️' : h < 18 ? 'Selamat Sore 🌇' : 'Selamat Malam 🌙';
                gEl.textContent = salam + ' · ' + new Date().toLocaleDateString('id-ID', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
            }
        }

        window.gtRefreshDashboard = function(){
            ensureDashboardWidgets();
            if (typeof window.loadWargaFbRight === 'function') {
                try { window.loadWargaFbRight(); } catch(e){}
            }
        };

        function boot(){ try { ensureDashboardWidgets(); } catch(e){ console.warn('gt-dashboard init', e); } }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
        else boot();
        setTimeout(boot, 900);
        setTimeout(boot, 2500);
        setTimeout(function(){ if(typeof window.loadWargaFbRight==='function') try{window.loadWargaFbRight();}catch(e){} }, 1200);
        setTimeout(function(){ if(typeof window.loadWargaFbRight==='function') try{window.loadWargaFbRight();}catch(e){} }, 3500);
        // Re-render status timelines whenever the user navigates back to dashboard
        var tries = 0;
        var w = setInterval(function(){
            tries++;
            if (typeof window.openWargaTab === 'function' && !window.openWargaTab.__gtWrapped){
                var orig = window.openWargaTab;
                window.openWargaTab = function(t){ var r = orig.apply(this, arguments); if (t === 'warga-dashboard') { setTimeout(function(){ ensureDashboardWidgets(); }, 80); } return r; };
                window.openWargaTab.__gtWrapped = true;
                clearInterval(w);
            }
            if (tries > 40) clearInterval(w);
        }, 250);
    })();
    // ===== Notification Center & Global Warga Search — v1 =====
    (function(){
        function safeJSON(k, fb){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(_){ return fb; } }
        function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
        function timeAgo(ts){
            var d = ts instanceof Date ? ts : new Date(ts);
            if (isNaN(d)) return '';
            var s = Math.max(0, Math.floor((Date.now() - d.getTime())/1000));
            if (s < 60) return 'baru saja';
            if (s < 3600) return Math.floor(s/60) + ' menit lalu';
            if (s < 86400) return Math.floor(s/3600) + ' jam lalu';
            if (s < 604800) return Math.floor(s/86400) + ' hari lalu';
            return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
        }
        function getReadMap(){ return safeJSON('gt_notif_read', {}) || {}; }
        function setReadMap(m){ try { localStorage.setItem('gt_notif_read', JSON.stringify(m)); } catch(_){} }

        /* -------------------- 1. NOTIFICATION CENTER -------------------- */
        function buildNotifications(){
            var out = [];
            // Aduan: each aduan creates a notif. If status changed, show as update.
            var aduan = safeJSON('db_aduan', []) || [];
            aduan.forEach(function(a){
                out.push({
                    id: 'aduan-' + a.id,
                    type: 'aduan',
                    icon: 'fa-bullhorn',
                    title: 'Aduan: ' + (a.judul || a.kategori || 'Laporan'),
                    sub: (a.namaPelapor ? a.namaPelapor + ' • ' : '') + (a.kategori || '') + ' • Status: ' + (a.status || 'Menunggu'),
                    ts: a.id || Date.now(),
                    onClick: function(){
                        if (typeof openWargaTab === 'function') { try { openWargaTab('warga-aduan'); } catch(_){} }
                        if (typeof window.openAdminTab === 'function') { try { openAdminTab('admin-aduan'); } catch(_){} }
                    }
                });
            });
            // Berita / pengumuman: latest news
            var berita = safeJSON('db_berita', []) || [];
            berita.forEach(function(b){
                out.push({
                    id: 'berita-' + b.id,
                    type: 'berita',
                    icon: 'fa-newspaper',
                    title: 'Pengumuman: ' + (b.judul || '-'),
                    sub: (b.kategori ? '['+b.kategori+'] ' : '') + (b.isi ? String(b.isi).substring(0,120) : ''),
                    ts: b.id || Date.now(),
                    onClick: function(){
                        if (typeof openWargaTab === 'function') { try { openWargaTab('warga-dashboard'); } catch(_){} }
                    }
                });
            });
            // Surat
            var surat = safeJSON('riwayatSurat', []) || safeJSON('dataSurat', []) || [];
            if (Array.isArray(surat)) {
                surat.forEach(function(s, i){
                    var sid = s.id || s.no_surat || ('surat-'+i);
                    out.push({
                        id: 'surat-' + sid,
                        type: 'surat',
                        icon: 'fa-envelope-open-text',
                        title: 'Surat: ' + (s.keperluan || s.req_keperluan || 'Pengajuan'),
                        sub: 'Status: ' + (s.status || 'Diproses') + (s.no_surat ? ' • '+s.no_surat : ''),
                        ts: new Date(s.tgl || s.tanggal || Date.now()).getTime() || Date.now(),
                        onClick: function(){
                            if (typeof openWargaTab === 'function') { try { openWargaTab('warga-surat'); } catch(_){} }
                        }
                    });
                });
            }
            // Sort newest first, cap to 30
            out.sort(function(a,b){ return (b.ts||0) - (a.ts||0); });
            return out.slice(0, 30);
        }

        function unreadCount(items){
            var read = getReadMap();
            var c = 0;
            items.forEach(function(i){ if (!read[i.id]) c++; });
            return c;
        }

        function ensureNotifPanel(){
            if (document.getElementById('gt-notif-panel')) return document.getElementById('gt-notif-panel');
            var bell = document.querySelector('.main-header .notif-bell');
            if (!bell) return null;
            var panel = document.createElement('div');
            panel.id = 'gt-notif-panel';
            panel.className = 'gt-notif-panel';
            // Make sure click-out closes
            document.addEventListener('click', function(e){
                var p = document.getElementById('gt-notif-panel');
                var b = document.querySelector('.main-header .notif-bell');
                if (!p || !p.classList.contains('open')) return;
                if (p.contains(e.target) || (b && b.contains(e.target))) return;
                p.classList.remove('open');
            });
            bell.appendChild(panel);
            return panel;
        }

        function renderNotif(){
            var bell = document.querySelector('.main-header .notif-bell');
            if (!bell) return;
            var items = buildNotifications();
            var read = getReadMap();
            var unread = unreadCount(items);

            var badge = bell.querySelector('.notif-badge');
            if (badge) {
                if (unread > 0) { badge.style.display = 'inline-flex'; badge.textContent = unread > 99 ? '99+' : String(unread); }
                else { badge.style.display = 'none'; }
            }

            var panel = ensureNotifPanel();
            if (!panel) return;
            var html = '<div class="gt-notif-head"><h4><i class="fa-solid fa-bell"></i> Notifikasi <span style="color:var(--gt-text-3);font-weight:500;font-size:0.82rem;">('+unread+' baru)</span></h4>'
                + (items.length ? '<button type="button" class="gt-notif-mark" onclick="window.gtMarkAllRead()">Tandai semua dibaca</button>' : '')
                + '</div><div class="gt-notif-body">';
            if (items.length === 0) {
                html += '<div class="gt-notif-empty"><i class="fa-regular fa-bell-slash"></i>Belum ada notifikasi.</div>';
            } else {
                items.forEach(function(it){
                    var u = !read[it.id];
                    html += '<div class="gt-notif-item ' + (u?'unread':'') + '" data-id="'+esc(it.id)+'">'
                        + '<div class="gt-notif-icon '+it.type+'"><i class="fa-solid '+it.icon+'"></i></div>'
                        + '<div class="gt-notif-text"><p class="gt-notif-title">'+esc(it.title)+'</p>'
                        + '<p class="gt-notif-sub">'+esc(it.sub)+'</p>'
                        + '<div class="gt-notif-time">'+esc(timeAgo(it.ts))+'</div></div></div>';
                });
            }
            html += '</div><div class="gt-notif-foot"><small>Diperbarui otomatis setiap 30 detik</small></div>';
            panel.innerHTML = html;

            // wire item clicks
            panel.querySelectorAll('.gt-notif-item').forEach(function(el){
                el.addEventListener('click', function(){
                    var id = el.getAttribute('data-id');
                    var rmap = getReadMap(); rmap[id] = Date.now(); setReadMap(rmap);
                    var item = items.find(function(x){ return x.id === id; });
                    if (item && typeof item.onClick === 'function') { try { item.onClick(); } catch(_){} }
                    panel.classList.remove('open');
                    renderNotif();
                });
            });
        }

        window.gtMarkAllRead = function(){
            var items = buildNotifications();
            var rmap = getReadMap();
            items.forEach(function(i){ rmap[i.id] = Date.now(); });
            setReadMap(rmap);
            renderNotif();
        };

        function wireBell(){
            var bell = document.querySelector('.main-header .notif-bell');
            if (!bell || bell.__gtWired) return;
            // Strip the legacy onclick (Swal alert) — use property reset, not removeAttribute (would re-fire on reload)
            try { bell.onclick = null; bell.removeAttribute('onclick'); } catch(_){}
            bell.addEventListener('click', function(e){
                e.stopPropagation();
                var p = ensureNotifPanel();
                if (!p) return;
                var open = p.classList.toggle('open');
                if (open) renderNotif();
            });
            bell.__gtWired = true;
            renderNotif();
        }

        /* -------------------- 2. GLOBAL WARGA SEARCH -------------------- */
        function getWarga(){
            var arr = safeJSON('db_warga', []) || [];
            return Array.isArray(arr) ? arr : [];
        }
        function highlight(text, q){
            if (!q) return esc(text);
            var t = String(text||''); var lo = t.toLowerCase(); var ql = q.toLowerCase();
            var i = lo.indexOf(ql);
            if (i < 0) return esc(t);
            return esc(t.substring(0,i)) + '<mark>' + esc(t.substring(i, i+q.length)) + '</mark>' + esc(t.substring(i+q.length));
        }
        function searchWarga(q){
            var arr = getWarga();
            if (!q || q.length < 1) return [];
            var ql = q.toLowerCase();
            var matches = [];
            for (var i = 0; i < arr.length && matches.length < 30; i++) {
                var w = arr[i] || {};
                var hay = [w.nama, w.nik, w.kk, w.alamat, w.pekerjaan, w.telp, w.istri].filter(Boolean).join(' ').toLowerCase();
                if (hay.indexOf(ql) >= 0) matches.push(w);
            }
            return matches.slice(0, 8);
        }

        function showWargaModal(w){
            var m = document.getElementById('gt-warga-modal');
            if (!m) {
                m = document.createElement('div');
                m.id = 'gt-warga-modal';
                m.className = 'gt-warga-modal';
                document.body.appendChild(m);
                m.addEventListener('click', function(e){
                    if (e.target === m || e.target.classList.contains('gt-warga-modal-close')) m.classList.remove('open');
                });
            }
            var initial = (w.nama || '?').trim().charAt(0).toUpperCase();
            var anak = Array.isArray(w.anak) ? w.anak.filter(Boolean).join(', ') : '';
            m.innerHTML = '<div class="gt-warga-modal-content" style="position:relative;">'
                + '<button type="button" class="gt-warga-modal-close">&times;</button>'
                + '<div class="gt-warga-modal-head">'
                +   '<div class="gt-warga-modal-avatar">'+esc(initial)+'</div>'
                +   '<div><h3>'+esc(w.nama || '-')+'</h3><p>'+esc(w.pekerjaan || 'Warga RT 005 Tegalsari')+'</p></div>'
                + '</div>'
                + '<div class="gt-warga-modal-body">'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">Nomor KK</span><span class="gt-fld-value">'+window._gtMaskData(w.kk, 4)+'</span></div>'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">NIK</span><span class="gt-fld-value">'+window._gtMaskData(w.nik, 4)+'</span></div>'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">Alamat</span><span class="gt-fld-value">'+esc(w.alamat || '-')+'</span></div>'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">Pekerjaan</span><span class="gt-fld-value">'+esc(w.pekerjaan || '-')+'</span></div>'
                +   (w.telp ? '<div class="gt-warga-field"><span class="gt-fld-label">Telepon</span><span class="gt-fld-value"><a href="tel:'+w.telp+'" style="color:var(--gt-primary-600);text-decoration:none;">'+window._gtMaskData(w.telp,4)+'</a></span></div>' : '')
                +   (w.istri ? '<div class="gt-warga-field"><span class="gt-fld-label">Nama Istri</span><span class="gt-fld-value">'+esc(w.istri)+'</span></div>' : '')
                +   (anak ? '<div class="gt-warga-field"><span class="gt-fld-label">Data Anak</span><span class="gt-fld-value">'+esc(anak)+'</span></div>' : '')
                +   (w.bpjs ? '<div class="gt-warga-field"><span class="gt-fld-label">No. BPJS</span><span class="gt-fld-value">'+esc(w.bpjs)+'</span></div>' : '')
                + '</div></div>';
            // Tambah toggle di footer modal jika admin logged in
            var isAdmin = (typeof loggedInAs !== 'undefined' && loggedInAs === 'admin') ||
                          document.getElementById('view-admin') && document.getElementById('view-admin').classList.contains('active');
            if (isAdmin) {
                var modalBody = m.querySelector('.gt-warga-modal-body');
                if (modalBody) {
                    var toggleDiv = document.createElement('div');
                    toggleDiv.style.cssText = 'margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);text-align:right;';
                    toggleDiv.innerHTML = '<button onclick="window.toggleDataSensitif();this.closest(\'.gt-warga-modal-content\').querySelector(\'.gt-warga-modal\')" style="background:' +
                        (window._GT_SHOW_SENSITIVE ? '#dc2626' : '#7c3aed') +
                        ';color:#fff;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:0.82rem;font-weight:600;">' +
                        '<i class="fa-solid ' + (window._GT_SHOW_SENSITIVE ? 'fa-eye-slash' : 'fa-eye') + '"></i> ' +
                        (window._GT_SHOW_SENSITIVE ? 'Sembunyikan Data' : 'Buka Data Sensitif') + '</button>';
                    modalBody.appendChild(toggleDiv);
                }
            }
            m.classList.add('open');
        }

        function ensureSearchBox(){
            if (document.getElementById('gt-search-input')) return;
            var hdr = document.querySelector('.main-header');
            if (!hdr) return;
            var wrap = document.createElement('div');
            wrap.className = 'gt-search-wrap no-print';
            wrap.innerHTML = '<i class="fa-solid fa-magnifying-glass gt-search-icon"></i>'
                + '<input id="gt-search-input" class="gt-search-input" type="search" autocomplete="off" placeholder="Cari warga (nama, NIK, KK, alamat...)" />'
                + '<button type="button" class="gt-search-clear" aria-label="Clear" title="Bersihkan"><i class="fa-solid fa-xmark"></i></button>'
                + '<div id="gt-search-results" class="gt-search-results"></div>';
            // Insert before the action-btns (right cluster) so it sits in the middle/right
            var rightArea = hdr.querySelector('.action-btns') || hdr.lastElementChild;
            try { hdr.insertBefore(wrap, rightArea); } catch(_) { hdr.appendChild(wrap); }

            var input = wrap.querySelector('#gt-search-input');
            var box   = wrap.querySelector('#gt-search-results');
            var clearBtn = wrap.querySelector('.gt-search-clear');
            var activeIdx = -1;
            var current = [];

            function render(q){
                current = searchWarga(q);
                activeIdx = -1;
                if (!q) { box.classList.remove('open'); box.innerHTML = ''; return; }
                if (current.length === 0) {
                    box.innerHTML = '<div class="gt-search-empty"><i class="fa-regular fa-face-frown" style="font-size:1.5rem;display:block;margin-bottom:8px;color:var(--gt-text-muted);"></i>Tidak ada warga cocok dengan "<b>'+esc(q)+'</b>"</div>';
                } else {
                    var html = '';
                    current.forEach(function(w, i){
                        var initial = (w.nama || '?').trim().charAt(0).toUpperCase();
                        html += '<div class="gt-search-row" data-idx="'+i+'">'
                            + '<div class="gt-search-avatar">'+esc(initial)+'</div>'
                            + '<div class="gt-search-info">'
                            +   '<p class="gt-sr-name">'+highlight(w.nama || '-', q)+'</p>'
                            +   '<div class="gt-sr-meta">NIK '+highlight(w.nik || '-', q)+' • '+highlight(w.alamat || '-', q)+'</div>'
                            + '</div></div>';
                    });
                    html += '<div class="gt-search-foot"><span>'+current.length+' hasil</span><span><kbd>↑</kbd><kbd>↓</kbd> navigasi • <kbd>Enter</kbd> buka • <kbd>Esc</kbd> tutup</span></div>';
                    box.innerHTML = html;
                    box.querySelectorAll('.gt-search-row').forEach(function(row){
                        row.addEventListener('mousedown', function(e){
                            e.preventDefault();
                            var idx = parseInt(row.getAttribute('data-idx'),10);
                            showWargaModal(current[idx]);
                            box.classList.remove('open');
                        });
                    });
                }
                box.classList.add('open');
            }

            input.addEventListener('input', function(){
                var q = input.value.trim();
                if (q) wrap.classList.add('has-query'); else wrap.classList.remove('has-query');
                render(q);
            });
            input.addEventListener('focus', function(){ if (input.value.trim()) render(input.value.trim()); });
            input.addEventListener('keydown', function(e){
                var rows = box.querySelectorAll('.gt-search-row');
                if (e.key === 'ArrowDown' && rows.length) { e.preventDefault(); activeIdx = Math.min(rows.length-1, activeIdx+1); rows.forEach(function(r,i){ r.classList.toggle('active', i===activeIdx); }); rows[activeIdx].scrollIntoView({block:'nearest'}); }
                else if (e.key === 'ArrowUp' && rows.length) { e.preventDefault(); activeIdx = Math.max(0, activeIdx-1); rows.forEach(function(r,i){ r.classList.toggle('active', i===activeIdx); }); rows[activeIdx].scrollIntoView({block:'nearest'}); }
                else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && current[activeIdx]) { showWargaModal(current[activeIdx]); box.classList.remove('open'); } else if (current[0]) { showWargaModal(current[0]); box.classList.remove('open'); } }
                else if (e.key === 'Escape') { input.value=''; wrap.classList.remove('has-query'); box.classList.remove('open'); input.blur(); }
            });
            clearBtn.addEventListener('click', function(){ input.value=''; wrap.classList.remove('has-query'); box.classList.remove('open'); input.focus(); });

            document.addEventListener('click', function(e){
                if (!wrap.contains(e.target)) box.classList.remove('open');
            });

            // Global keyboard shortcut: Ctrl+K / Cmd+K focuses search
            document.addEventListener('keydown', function(e){
                if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                    e.preventDefault(); input.focus(); input.select();
                }
            });
        }

        /* -------------------- BOOT + POLLING -------------------- */
        function boot(){
            try { wireBell(); } catch(e){ console.warn('notif wire', e); }
            try { ensureSearchBox(); } catch(e){ console.warn('search inject', e); }
            try { renderNotif(); } catch(e){}
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
        else boot();
        setTimeout(boot, 800);
        setTimeout(boot, 2500);
        // Poll for new notifications every 30s; also re-render after data sync
        setInterval(function(){ try { renderNotif(); } catch(_){} }, 30000);

        // Hook into existing syncSemuaData if present so notifications refresh immediately after writes
        var hookTries = 0;
        var hk = setInterval(function(){
            hookTries++;
            if (typeof window.syncSemuaData === 'function' && !window.syncSemuaData.__gtWrapped) {
                var orig = window.syncSemuaData;
                window.syncSemuaData = function(){ var r = orig.apply(this, arguments); try { renderNotif(); } catch(_){} return r; };
                window.syncSemuaData.__gtWrapped = true;
                clearInterval(hk);
            }
            if (hookTries > 40) clearInterval(hk);
        }, 250);
    })();
    // ===== Mobile sticky bottom nav (role-aware) — v1 =====
    (function(){
        var WARGA_NAV = [
            { id:'warga-dashboard', icon:'fa-house',                 label:'Beranda' },
            { id:'warga-surat',     icon:'fa-envelope-open-text',    label:'Surat' },
            { id:'warga-aduan',     icon:'fa-bullhorn',              label:'Lapor' },
            { id:'warga-keuangan',  icon:'fa-sack-dollar',           label:'Iuran' },
            { id:'warga-profil',    icon:'fa-id-badge',              label:'Profil' }
        ];
        // Bottom-nav khusus mode Tamu: hanya 3 menu yang diizinkan
        var WARGA_NAV_GUEST = [
            { id:'warga-dashboard', icon:'fa-house',         label:'Beranda' },
            { id:'warga-struktur',  icon:'fa-sitemap',       label:'Pengurus' },
            { id:'warga-darurat',   icon:'fa-truck-medical', label:'Darurat' }
        ];
        var BENDAHARA_NAV = [
            { id:'ben-input',     icon:'fa-cash-register', label:'Input' },
            { id:'ben-laporan',   icon:'fa-book',          label:'Laporan' },
            { id:'ben-matriks',   icon:'fa-table-cells',   label:'Matriks' },
            { id:'ben-arsip',     icon:'fa-folder-open',   label:'Arsip' }
        ];

        function activeView(){
            var v = document.querySelector('#view-warga');
            if (v && getComputedStyle(v).display !== 'none') return 'warga';
            v = document.querySelector('#view-bendahara');
            if (v && getComputedStyle(v).display !== 'none') return 'bendahara';
            v = document.querySelector('#view-koperasi');
            if (v && getComputedStyle(v).display !== 'none') return 'koperasi';
            v = document.querySelector('#view-admin');
            if (v && getComputedStyle(v).display !== 'none') return 'admin';
            return null;
        }

        function go(id, role){
            try {
                if (role === 'warga' && typeof window.openWargaTab === 'function') return window.openWargaTab(id);
                if (role === 'bendahara' && typeof window.openBenTab === 'function') return window.openBenTab(id);
                if (role === 'koperasi' && typeof window.openKopTab === 'function') return window.openKopTab(id);
                if (role === 'admin' && typeof window.openAdminTab === 'function') return window.openAdminTab(id);
            } catch(_){}
        }

        function currentTabId(role){
            var sel = role === 'warga' ? '.warga-tab-content.active'
                    : role === 'bendahara' ? '.ben-tab-content.active'
                    : role === 'koperasi' ? '.kop-tab-content.active'
                    : '.admin-tab-content.active';
            var el = document.querySelector(sel);
            return el ? el.id : null;
        }

        function ensureNav(){
            // Only render once main-app is visible
            var app = document.getElementById('main-app');
            if (!app || getComputedStyle(app).display === 'none') {
                var existing = document.getElementById('gt-bottom-nav');
                if (existing) existing.remove();
                return;
            }
            var role = activeView();
            if (!role) return;
            var __isG = !!(window.loggedInWarga && window.loggedInWarga.isGuest);
            var items = role === 'warga' ? (__isG ? WARGA_NAV_GUEST : WARGA_NAV) : role === 'bendahara' ? BENDAHARA_NAV : null;
            if (!items) {
                // Hide nav for views without a defined map (admin/koperasi keep their horizontal strip)
                var ex = document.getElementById('gt-bottom-nav'); if (ex) ex.remove();
                return;
            }
            var nav = document.getElementById('gt-bottom-nav');
            var fresh = false;
            if (!nav) {
                nav = document.createElement('nav');
                nav.id = 'gt-bottom-nav';
                nav.className = 'gt-bottom-nav no-print';
                nav.setAttribute('aria-label', 'Navigasi utama');
                document.body.appendChild(nav);
                fresh = true;
            }
            var cur = currentTabId(role);
            var html = '<div class="gt-bottom-nav-row" style="--gt-bn-cols:' + items.length + ';">';
            items.forEach(function(it){
                var active = it.id === cur ? 'active' : '';
                html += '<button type="button" class="gt-bn-item ' + active + '" data-id="' + it.id + '">'
                     + '<i class="fa-solid ' + it.icon + '"></i><span>' + it.label + '</span></button>';
            });
            html += '</div>';
            nav.innerHTML = html;
            nav.dataset.role = role;
            nav.querySelectorAll('.gt-bn-item').forEach(function(btn){
                btn.addEventListener('click', function(){
                    var id = btn.getAttribute('data-id');
                    go(id, role);
                    setTimeout(ensureNav, 60);
                });
            });
        }

        function boot(){ try { ensureNav(); } catch(e) { console.warn('bn init', e); } }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
        else boot();
        setTimeout(boot, 600);
        setTimeout(boot, 2200);
        // Re-render whenever role/tab might change
        ['openWargaTab','openBenTab','openKopTab','openAdminTab','tampilkanView'].forEach(function(fn){
            var t = 0;
            var w = setInterval(function(){
                t++;
                if (typeof window[fn] === 'function' && !window[fn].__gtBnWrapped) {
                    var orig = window[fn];
                    window[fn] = function(){ var r = orig.apply(this, arguments); setTimeout(ensureNav, 50); return r; };
                    window[fn].__gtBnWrapped = true;
                    clearInterval(w);
                }
                if (t > 60) clearInterval(w);
            }, 250);
        });
        // Hook syncSemuaData too
        var s=0; var ws = setInterval(function(){ s++;
            if (typeof window.syncSemuaData === 'function' && !window.syncSemuaData.__gtBnWrapped) {
                var o = window.syncSemuaData;
                window.syncSemuaData = function(){ var r = o.apply(this, arguments); setTimeout(ensureNav, 60); return r; };
                window.syncSemuaData.__gtBnWrapped = true;
                clearInterval(ws);
            }
            if (s > 60) clearInterval(ws);
        }, 250);
    })();
    (function(){
        // Undo the v7 "strip pull-tab" behavior: re-create the handle
        // on every nav we see, if it's missing.
        function ensurePullTab(){
            try {
                document.querySelectorAll('.admin-nav-tabs, .nav-tabs').forEach(function(footer){
                    if (footer.querySelector('.pull-tab-bca')) return;
                    var pull = document.createElement('div');
                    pull.className = 'pull-tab-bca';
                    pull.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
                    pull.addEventListener('click', function(){
                        footer.classList.toggle('hidden-footer');
                        var icon = pull.querySelector('i');
                        if (footer.classList.contains('hidden-footer')) {
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-up');
                        } else {
                            icon.classList.remove('fa-chevron-up');
                            icon.classList.add('fa-chevron-down');
                        }
                    });
                    footer.appendChild(pull);
                });
            } catch(_){}
        }
        // First-load only: make sure the bar isn't stuck hidden from a
        // prior session.
        try {
            document.querySelectorAll('.admin-nav-tabs.hidden-footer, .nav-tabs.hidden-footer')
                .forEach(function(el){ el.classList.remove('hidden-footer'); });
        } catch(_){}

        ensurePullTab();
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensurePullTab);
        [400, 900, 1600, 3000].forEach(function(t){ setTimeout(ensurePullTab, t); });
        ['openWargaTab','openBenTab','openKopTab','openAdminTab','tampilkanView','syncSemuaData'].forEach(function(fn){
            var tries = 0;
            var w = setInterval(function(){
                tries++;
                if (typeof window[fn] === 'function' && !window[fn].__gtPullWrapped) {
                    var orig = window[fn];
                    window[fn] = function(){ var r = orig.apply(this, arguments); setTimeout(ensurePullTab, 80); return r; };
                    window[fn].__gtPullWrapped = true;
                    clearInterval(w);
                }
                if (tries > 60) clearInterval(w);
            }, 250);
        });
    })();

    (function(){
        function num(v){ v = parseInt(v,10); return isFinite(v) && v>0 ? v : 0; }
        function safeJSON(k, fb){ try { var v = JSON.parse(localStorage.getItem(k)||'null'); return v==null?fb:v; } catch(_){ return fb; } }

        function countSuratPending(){
            var arr = safeJSON('riwayatSurat', null) || safeJSON('dataSurat', []) || [];
            if (!Array.isArray(arr)) return 0;
            return arr.filter(function(s){
                var st = String(s && (s.status || s.Status) || '').toLowerCase();
                return st.indexOf('menunggu') === 0 || st === 'pending' || st === 'baru' || st === 'antri' || st === 'belum diproses';
            }).length;
        }
        function countAduanPending(){
            var arr = safeJSON('db_aduan', []);
            if (!Array.isArray(arr)) return 0;
            return arr.filter(function(a){
                var st = String(a && (a.status || a.Status) || '').toLowerCase();
                return st === '' || st === 'menunggu' || st === 'baru' || st === 'belum ditanggapi' || st === 'pending';
            }).length;
        }

        function setBadge(selector, n){
            try {
                document.querySelectorAll(selector).forEach(function(btn){
                    btn.setAttribute('data-gt-badge', String(num(n)));
                });
            } catch(_){}
        }

        function refreshBadges(){
            var nSurat = countSuratPending();
            var nAduan = countAduanPending();
            // Admin role
            setBadge('.admin-tab-btn[onclick*="\'surat\'"], .admin-tab-btn[onclick*="loadSuratAdmin"]', nSurat);
            setBadge('.admin-tab-btn[onclick*="admin-aduan"]', nAduan);
            // Warga role: show their own pending submissions
            setBadge('.admin-tab-btn[onclick*="warga-surat"]', nSurat);
            setBadge('.admin-tab-btn[onclick*="warga-aduan"]', nAduan);
        }

        refreshBadges();
        document.addEventListener('DOMContentLoaded', refreshBadges);
        // Re-check periodically and after typical state-change moments
        setInterval(refreshBadges, 4000);
        ['openAdminTab','openWargaTab','syncSemuaData','simpanSurat','tambahAduan','updateStatusSurat','updateStatusAduan'].forEach(function(fn){
            var tries = 0;
            var w = setInterval(function(){
                tries++;
                if (typeof window[fn] === 'function' && !window[fn].__gtBadgeWrapped) {
                    var orig = window[fn];
                    window[fn] = function(){ var r = orig.apply(this, arguments); setTimeout(refreshBadges, 100); return r; };
                    window[fn].__gtBadgeWrapped = true;
                    clearInterval(w);
                }
                if (tries > 60) clearInterval(w);
            }, 250);
        });
        // Storage events (e.g. from another tab) too
        window.addEventListener('storage', function(e){
            if (!e.key || e.key === 'db_aduan' || e.key === 'riwayatSurat' || e.key === 'dataSurat') refreshBadges();
        });
    })();

    /* Hide & Seek pull-tab dipulihkan — IIFE "unhideNav" yang dulu
       menghapus pull-tab di setiap tab change sengaja dinonaktifkan.
       Smoothing transisi via CSS HOTFIX v9 + blok Hide & Seek smoothing. */
    (function(){ /* legacy kill-switch dimatikan total */ })();





    // Penomoran surat undangan kegiatan untuk admin (counter `surat_counter`)
    window.getNextSuratNumber = function() {
        var count = parseInt(localStorage.getItem('surat_counter'), 10);
        if (isNaN(count) || count < 178) count = 178;
        var d = new Date();
        var roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
        return count + '/RT.005/RW.012/' + roman[d.getMonth()] + '/' + d.getFullYear();
    };

    // Stub aman untuk tombol "Batal Edit Darurat" (UI memakai dialog Swal, jadi cukup reset form)
    window.cancelEditDarurat = function() {
        var f = document.getElementById('form-darurat'); if (f) f.reset();
        var c = document.getElementById('btn-cancel-edit-darurat'); if (c) c.style.display = 'none';
        var b = document.getElementById('btn-submit-darurat'); if (b) b.innerHTML = '<i class="fa-solid fa-save"></i> Tambahkan ke Layar Warga';
    };

    // ===== HELPER CETAK VIA IFRAME (preview muncul untuk Notulen, BA Kas, Rekap, dll) =====
    // ============================================================
    // PDF DOWNLOAD HELPER (mengganti seluruh "Cetak" → Download PDF)
    // - Render HTML ke offscreen container, capture pakai html2canvas,
    //   bagi ke multi halaman A4 dengan jsPDF, langsung trigger download.
    // - Selalu mencatat ke db_riwayat_ekspor agar fitur Riwayat Ekspor utuh.
    // ============================================================
    window.downloadPdfFromHtml = async function(htmlBody, title){
        var safeTitle = String(title||'Dokumen').trim() || 'Dokumen';
        var fileName = safeTitle.replace(/[\\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_').slice(0,140) + '.pdf';
        // Catat riwayat ekspor (selalu, bahkan jika user batal — supaya konsisten dgn perilaku lama)
        try {
            var rwk = JSON.parse(localStorage.getItem('db_riwayat_ekspor')) || [];
            rwk.push({
                id: Date.now(), ts: Date.now(),
                tgl: new Date().toLocaleString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),
                judul: safeTitle, format: 'PDF (download)'
            });
            if (rwk.length > 500) rwk = rwk.slice(-500);
            localStorage.setItem('db_riwayat_ekspor', JSON.stringify(rwk));
            localStorage.setItem('ts_riwayat_ekspor', new Date().toISOString());
            if (typeof syncSemuaData === 'function') { try { syncSemuaData(true); } catch(_){} }
        } catch(e){ console.warn('riwayat ekspor gagal disimpan', e); }

        // Rewrite path img/asset relatif → absolute (Lambang_Kota_Semarang.png dll)
        var baseAbs = (location.origin + location.pathname).replace(/[^\/]*$/, '');
        try {
            htmlBody = String(htmlBody||'').replace(/(<img\b[^>]*?\bsrc\s*=\s*["'])(?!https?:|data:|\/\/|\/)([^"']+)(["'])/gi, function(_, p1, p2, p3){ return p1 + baseAbs + p2 + p3; });
        } catch(_){}

        // Buat container offscreen lebar 794px (≈ A4 96dpi)
        var holder = document.createElement('div');
        holder.style.cssText = 'position:fixed; left:-10000px; top:0; width:794px; padding:0; background:white; color:black; font-family:"Times New Roman",Times,serif; z-index:-1;';
        // Reset dark mode agar PDF selalu putih
        var pdfResetCSS = '<style>'+
            ':root, html, body { color-scheme: light !important; background: white !important; color: black !important; }'+
            '*, *::before, *::after { background-color: white !important; color: black !important; border-color: #94a3b8 !important; box-shadow: none !important; }'+
            'table, thead, tbody, tfoot, tr, th, td { background-color: white !important; color: black !important; }'+
            'thead tr th { background-color: #1e293b !important; color: white !important; }'+
            'tbody tr:nth-child(even) td { background-color: #f1f5f9 !important; }'+
            '.masuk, .masuk * { color: #166534 !important; background-color: transparent !important; }'+
            '.keluar, .keluar * { color: #991b1b !important; background-color: transparent !important; }'+
            'img { filter: none !important; }'+
            '.sum { background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; }'+
            '.sb { background-color: transparent !important; }'+
            '.sb .l { color: #334155 !important; }'+
            '.sb .v { background-color: transparent !important; }'+
            '</style>';
        holder.innerHTML = pdfResetCSS + '<div class="gt-pdf-page" style="background:white !important; color:black !important; padding:0;">' + htmlBody + '</div>';
        document.body.appendChild(holder);

        // Loading SwAlert
        Swal.fire({
            title:'Menyiapkan PDF...',
            html:'Sedang merender <b>'+ safeTitle.replace(/</g,'&lt;') +'</b><br><small>Mohon tunggu, dokumen akan otomatis ter-download.</small>',
            allowOutsideClick:false, didOpen: function(){ Swal.showLoading(); }
        });

        try {
            // Tunggu render & gambar termuat
            await new Promise(function(r){ setTimeout(r, 80); });
            var imgs = holder.querySelectorAll('img');
            await Promise.all(Array.prototype.map.call(imgs, function(img){
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise(function(res){
                    var done = false; var t = setTimeout(function(){ if(!done){ done=true; res(); } }, 2500);
                    img.addEventListener('load', function(){ if(!done){ done=true; clearTimeout(t); res(); } });
                    img.addEventListener('error', function(){ if(!done){ done=true; clearTimeout(t); res(); } });
                });
            }));

            if (typeof html2canvas !== 'function') throw new Error('html2canvas belum termuat');
            var canvas = await html2canvas(holder, {
                scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, allowTaint: true
            });

            // Ambil jsPDF dari berbagai exposure
            var jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
            if (!jsPDFCtor) throw new Error('jsPDF belum termuat');
            var pdf = new jsPDFCtor({ orientation:'p', unit:'mm', format:'a4' });

            var pdfW = pdf.internal.pageSize.getWidth();   // 210
            var pdfH = pdf.internal.pageSize.getHeight();  // 297
            var imgW = pdfW;
            var imgH = canvas.height * (pdfW / canvas.width);

            var imgData = canvas.toDataURL('image/jpeg', 0.92);

            if (imgH <= pdfH + 0.5) {
                pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
            } else {
                // Multi-halaman: clone bagian per bagian
                var pageHeightCanvas = Math.floor(canvas.width * (pdfH / pdfW));
                var ctx; var sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvas.width;
                var totalY = 0; var pageNum = 0;
                while (totalY < canvas.height) {
                    var sliceH = Math.min(pageHeightCanvas, canvas.height - totalY);
                    sliceCanvas.height = sliceH;
                    ctx = sliceCanvas.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, sliceCanvas.width, sliceH);
                    ctx.drawImage(canvas, 0, totalY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
                    var sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);
                    var sliceImgH = sliceH * (pdfW / canvas.width);
                    if (pageNum > 0) pdf.addPage();
                    pdf.addImage(sliceData, 'JPEG', 0, 0, imgW, sliceImgH);
                    pageNum++; totalY += sliceH;
                }
            }
            pdf.save(fileName);
            Swal.close();
            try { Toast.fire({ icon:'success', title:'PDF tersimpan: '+ fileName }); } catch(_){}
        } catch(err) {
            console.error('downloadPdfFromHtml error', err);
            Swal.fire({ icon:'error', title:'Gagal Membuat PDF', text: (err && err.message) || 'Terjadi kesalahan saat merender dokumen.' });
        } finally {
            try { document.body.removeChild(holder); } catch(_){}
        }
    };

    window.printViaIframe = function(htmlBody, title) {
        // DELEGASI: seluruh fungsi cetak portal sekarang langsung men-download PDF.
        // Loader, riwayat ekspor, base href untuk asset, dan style A4 sudah ditangani
        // di window.downloadPdfFromHtml. printViaIframe dipertahankan sebagai
        // alias agar semua callsite legacy tetap berjalan tanpa perubahan.
        return window.downloadPdfFromHtml(htmlBody, title);
    };

    // ===== KOPERASI: Cetak BA Rekap Tabungan (per bulan/global) =====
    window.cetakRekapTabungan = function() {
        var sel = document.getElementById('kop-rekap-bulan');
        var bulan = sel ? sel.value : 'Global';
        var dbS = JSON.parse(localStorage.getItem('db_kop_simpan')) || [];
        var settings = JSON.parse(localStorage.getItem('db_settings')) || { namaRT:'Bapak Kasimin', namaRW:'Bapak Mulyono', namaBen:'Bapak Parmin' };
        var data = (bulan && bulan !== 'Global')
            ? dbS.filter(function(x){ return (x.tgl||'').indexOf(bulan) !== -1 || new Date(x.tgl).toLocaleDateString('id-ID',{month:'long'}) === bulan; })
            : dbS.slice();
        if (!data.length) return Swal.fire('Kosong', 'Belum ada data tabungan untuk dicetak.', 'info');
        var totalSetor = 0, totalTarik = 0;
        var rows = data.map(function(x, i){
            var n = Number(x.nominal)||0;
            if ((x.jenis||'').toLowerCase().indexOf('tarik')!==-1) totalTarik += n; else totalSetor += n;
            return '<tr><td style="border:1px solid #000000;padding:8px;text-align:center;">'+(i+1)+'</td>'+
                   '<td style="border:1px solid #000;">'+x.tgl+'</td>'+
                   '<td style="border:1px solid #000;"><b>'+(x.namaWarga||'-')+'</b></td>'+
                   '<td style="border:1px solid #000;">'+(x.jenis||'-')+'</td>'+
                   '<td style="border:1px solid #000; text-align:right;">'+fmt(n)+'</td></tr>';
        }).join('');
        var saldo = totalSetor - totalTarik;
        var tgl = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
        var logoUrl = window.location.origin + '/Lambang_Kota_Semarang.png';
        var noDoc = 'BA-TAB/' + bulan.replace(/\s/g,'-') + '/' + new Date().getFullYear();
        var tglStr = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
        var html =
            '<div style="font-family:Arial,sans-serif;font-size:12px;color:#000000;line-height:1.15;background:#fff;padding:76px;width:794px;box-sizing:border-box;">' +
            '<div style="display:flex;align-items:center;gap:16px;padding-bottom:10px;margin-bottom:20px;border-bottom:3px double #000000;">' +
            '<img src="' + logoUrl + '" style="width:80px;height:80px;object-fit:contain;flex-shrink:0;" crossorigin="anonymous">' +
            '<div style="text-align:center;flex:1;">' +
            '<div style="font-size:16px;font-weight:bold;line-height:1.3;">PEMERINTAH KOTA SEMARANG</div>' +
            '<div style="font-size:16px;font-weight:bold;margin-top:2px;line-height:1.3;">KECAMATAN KOPERASI WARGA</div>' +
            '<div style="font-size:14px;font-weight:bold;margin-top:2px;line-height:1.3;">KELURAHAN TEGALSARI &mdash; RT 005 / RW 012</div>' +
            '<div style="font-size:12px;font-weight:normal;margin-top:2px;line-height:1.3;">Kota Semarang</div>' +
            '</div></div>' +
            '<div style="font-size:14px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:.5px;">BERITA ACARA REKAP TABUNGAN</div>' +
            '<div style="text-align:center;font-size:12px;margin-top:4px;">Periode: ' + bulan + '</div>' +
            '<div style="text-align:center;font-size:10px;color:#555;margin-top:2px;">Nomor: ' + noDoc + '</div>' +
            '<hr style="border:none;border-top:1px solid #000;margin:12px 0;">' +
            '<p style="text-align:justify;line-height:1.7;margin-bottom:14px;">Pada hari ini, ' + tglStr + ', telah dilakukan rekapitulasi transaksi tabungan koperasi warga sebagai berikut:</p>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;">' +
            '<thead><tr>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:6%">No</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:14%">Tanggal</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:left;">Nama Anggota</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;">Jenis</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:right;width:18%">Nominal</th>' +
            '</tr></thead><tbody>' + rows +
            '<tr style="font-weight:bold;background:#f9f9f9;"><td colspan="4" style="border:1px solid #000000;padding:8px;text-align:right;">Total Setoran</td><td style="border:1px solid #000000;padding:8px;text-align:right;">' + fmt(totalSetor) + '</td></tr>' +
            '<tr style="font-weight:bold;background:#f9f9f9;"><td colspan="4" style="border:1px solid #000000;padding:8px;text-align:right;">Total Penarikan</td><td style="border:1px solid #000000;padding:8px;text-align:right;">' + fmt(totalTarik) + '</td></tr>' +
            '<tr style="font-weight:bold;background:#e8f5e9;"><td colspan="4" style="border:1px solid #000000;padding:8px;text-align:right;">SALDO BERSIH</td><td style="border:1px solid #000000;padding:8px;text-align:right;">' + fmt(saldo) + '</td></tr>' +
            '</tbody></table>' +
            '<table style="width:100%;border-collapse:collapse;margin-top:40px;font-size:12px;"><tr>' +
            '<td style="width:50%;border:none;text-align:center;padding:4px 8px;"><div>Mengetahui,<br>Ketua RT 005</div><div style="height:80px;"></div><b style="text-decoration:underline;">' + settings.namaRT + '</b></td>' +
            '<td style="width:50%;border:none;text-align:center;padding:4px 8px;"><div>Semarang, ' + tglStr + '<br>Bendahara RT 005</div><div style="height:80px;"></div><b style="text-decoration:underline;">' + settings.namaBen + '</b></td>' +
            '</tr></table>' +
            '<div style="margin-top:24px;text-align:center;font-size:10px;font-style:italic;color:#666666;border-top:1px solid #cccccc;padding-top:6px;">Diterbitkan resmi oleh RT 005 &bull; ' + noDoc + ' &bull; Dicetak: ' + tglStr + '</div>' +
            '</div>';
        printViaIframe(html, 'BA_Rekap_Tabungan_'+bulan);
    };

    // ===== KOPERASI: Cetak BA Rekap Pinjaman =====
    window.cetakRekapPinjaman = function() {
        var sel = document.getElementById('kop-rekap-pinjam-bulan');
        var bulan = sel ? sel.value : 'Global';
        var dbP = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];
        var settings = JSON.parse(localStorage.getItem('db_settings')) || { namaRT:'Bapak Kasimin', namaBen:'Bapak Parmin' };
        var data = (bulan && bulan !== 'Global')
            ? dbP.filter(function(x){ return (x.tgl||'').indexOf(bulan)!==-1; })
            : dbP.slice();
        if (!data.length) return Swal.fire('Kosong', 'Belum ada data pinjaman untuk dicetak.', 'info');
        var totPlafon=0, totSisa=0;
        var rows = data.map(function(x,i){ totPlafon += Number(x.plafon)||0; totSisa += Number(x.sisa)||0;
            return '<tr><td style="border:1px solid #000000;padding:8px;text-align:center;">'+(i+1)+'</td>'+
                   '<td style="border:1px solid #000;">'+x.tgl+'</td>'+
                   '<td style="border:1px solid #000;"><b>'+(x.namaWarga||'-')+'</b></td>'+
                   '<td style="border:1px solid #000; text-align:right;">'+fmt(x.plafon)+'</td>'+
                   '<td style="border:1px solid #000; text-align:center;">'+(x.bunga||10)+'%</td>'+
                   '<td style="border:1px solid #000; text-align:right;">'+fmt(x.sisa)+'</td>'+
                   '<td style="border:1px solid #000; text-align:center;">'+(x.status||'Aktif')+'</td></tr>';
        }).join('');
        var tgl = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
        var logoUrl = window.location.origin + '/Lambang_Kota_Semarang.png';
        var noDoc = 'BA-PIN/' + bulan.replace(/\s/g,'-') + '/' + new Date().getFullYear();
        var tglStr = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
        var html =
            '<div style="font-family:Arial,sans-serif;font-size:12px;color:#000000;line-height:1.15;background:#fff;padding:76px;width:794px;box-sizing:border-box;">' +
            '<div style="display:flex;align-items:center;gap:16px;padding-bottom:10px;margin-bottom:20px;border-bottom:3px double #000000;">' +
            '<img src="' + logoUrl + '" style="width:80px;height:80px;object-fit:contain;flex-shrink:0;" crossorigin="anonymous">' +
            '<div style="text-align:center;flex:1;">' +
            '<div style="font-size:16px;font-weight:bold;line-height:1.3;">PEMERINTAH KOTA SEMARANG</div>' +
            '<div style="font-size:16px;font-weight:bold;margin-top:2px;line-height:1.3;">KECAMATAN KOPERASI WARGA</div>' +
            '<div style="font-size:14px;font-weight:bold;margin-top:2px;line-height:1.3;">KELURAHAN TEGALSARI &mdash; RT 005 / RW 012</div>' +
            '<div style="font-size:12px;font-weight:normal;margin-top:2px;line-height:1.3;">Kota Semarang</div>' +
            '</div></div>' +
            '<div style="font-size:14px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:.5px;">BERITA ACARA REKAP PINJAMAN</div>' +
            '<div style="text-align:center;font-size:12px;margin-top:4px;">Periode: ' + bulan + '</div>' +
            '<div style="text-align:center;font-size:10px;color:#555;margin-top:2px;">Nomor: ' + noDoc + '</div>' +
            '<hr style="border:none;border-top:1px solid #000;margin:12px 0;">' +
            '<p style="text-align:justify;line-height:1.7;margin-bottom:14px;">Pada hari ini, ' + tglStr + ', telah dilakukan rekapitulasi pinjaman koperasi warga sebagai berikut:</p>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;">' +
            '<thead><tr>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:6%">No</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:14%">Tanggal</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:left;">Peminjam</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:right;width:14%">Plafon</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:right;width:12%">Bunga</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:right;width:14%">Sisa</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:10%">Status</th>' +
            '</tr></thead><tbody>' + rows +
            '<tr style="font-weight:bold;background:#e8f5e9;">' +
            '<td colspan="3" style="border:1px solid #000000;padding:8px;text-align:right;">TOTAL</td>' +
            '<td style="border:1px solid #000000;padding:8px;text-align:right;">' + fmt(totPlafon) + '</td>' +
            '<td style="border:1px solid #000000;padding:8px;"></td>' +
            '<td style="border:1px solid #000000;padding:8px;text-align:right;">' + fmt(totSisa) + '</td>' +
            '<td style="border:1px solid #000000;padding:8px;"></td>' +
            '</tr></tbody></table>' +
            '<table style="width:100%;border-collapse:collapse;margin-top:40px;font-size:12px;"><tr>' +
            '<td style="width:50%;border:none;text-align:center;padding:4px 8px;"><div>Mengetahui,<br>Ketua RT 005</div><div style="height:80px;"></div><b style="text-decoration:underline;">' + settings.namaRT + '</b></td>' +
            '<td style="width:50%;border:none;text-align:center;padding:4px 8px;"><div>Semarang, ' + tglStr + '<br>Bendahara RT 005</div><div style="height:80px;"></div><b style="text-decoration:underline;">' + settings.namaBen + '</b></td>' +
            '</tr></table>' +
            '<div style="margin-top:24px;text-align:center;font-size:10px;font-style:italic;color:#666666;border-top:1px solid #cccccc;padding-top:6px;">Diterbitkan resmi oleh RT 005 &bull; ' + noDoc + ' &bull; Dicetak: ' + tglStr + '</div>' +
            '</div>';
        printViaIframe(html, 'BA_Rekap_Pinjaman_'+bulan);
    };

    // ===== BENDAHARA: Cetak Berita Acara Laporan Kas RT (terintegrasi) =====
    window.loadBenLaporan = function() {
        var db = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var saldoAwal = Number(localStorage.getItem('db_saldo_awal') || 0);
        var bulanEl = document.getElementById('ben-lap-bulan');
        var tahunEl = document.getElementById('ben-lap-tahun');

        // Populate tahun dropdown dari data transaksi
        var tahunSet = new Set();
        var curY = new Date().getFullYear();
        for (var y = curY - 3; y <= curY + 1; y++) tahunSet.add(y);
        db.forEach(function(x){ if(x.tgl) tahunSet.add(new Date(x.tgl).getFullYear()); });
        if (tahunEl && tahunEl.options.length <= 1) {
            tahunEl.innerHTML = '';
            Array.from(tahunSet).sort(function(a,b){return b-a;}).forEach(function(y){
                var o = document.createElement('option');
                o.value = y; o.text = y;
                if (y === curY) o.selected = true;
                tahunEl.appendChild(o);
            });
        }

        var bulanVal = bulanEl ? parseInt(bulanEl.value) || 0 : 0;
        var tahunVal = tahunEl ? parseInt(tahunEl.value) || curY : curY;

        var data = db.filter(function(x){
            if (!x.tgl) return false;
            var d = new Date(x.tgl);
            var okB = !bulanVal || (d.getMonth() + 1) === bulanVal;
            var okT = d.getFullYear() === tahunVal;
            return okB && okT;
        }).sort(function(a,b){ return new Date(a.tgl) - new Date(b.tgl); });

        var fmtR = window.fmt || function(v){ return 'Rp ' + Number(v||0).toLocaleString('id-ID'); };
        var running = saldoAwal;
        var totalM = 0, totalK = 0;
        var rows = data.map(function(x, i){
            var n = Number(x.nominal) || 0;
            var isMasuk = (x.tipe||'').toLowerCase() === 'masuk';
            if (isMasuk) { totalM += n; running += n; } else { totalK += n; running -= n; }
            var saldoWarna = running >= 0 ? '#16a34a' : '#dc2626';
            return '<tr>' +
                '<td style="border:1px solid #cbd5e1;text-align:center;padding:6px;">' + (i+1) + '</td>' +
                '<td style="border:1px solid #cbd5e1;padding:6px;">' + (x.tgl||'-') + '</td>' +
                '<td style="border:1px solid #cbd5e1;padding:6px;">' + (x.uraian||'-') + '</td>' +
                '<td style="border:1px solid #cbd5e1;text-align:right;padding:6px;color:#16a34a;">' + (isMasuk ? fmtR(n) : '') + '</td>' +
                '<td style="border:1px solid #cbd5e1;text-align:right;padding:6px;color:#dc2626;">' + (!isMasuk ? fmtR(n) : '') + '</td>' +
                '<td style="border:1px solid #cbd5e1;text-align:right;padding:6px;font-weight:600;color:'+saldoWarna+';">' + fmtR(running) + '</td>' +
                '</tr>';
        }).join('');

        var tbody = document.getElementById('ben-lap-tbody');
        if (tbody) {
            tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#94a3b8;">Tidak ada transaksi untuk periode ini.</td></tr>';
        }

        var summary = document.getElementById('ben-lap-summary');
        if (summary) {
            var saldoAkhir = saldoAwal + totalM - totalK;
            var warna = saldoAkhir >= 0 ? 'var(--success)' : 'var(--danger)';
            summary.innerHTML =
                '<div class="stat-box" style="flex:1;min-width:160px;border-color:var(--primary-blue);"><h4>Saldo Awal</h4><h2>' + fmtR(saldoAwal) + '</h2></div>' +
                '<div class="stat-box" style="flex:1;min-width:160px;border-color:var(--success);"><h4>Total Pemasukan</h4><h2 style="color:var(--success);">' + fmtR(totalM) + '</h2></div>' +
                '<div class="stat-box" style="flex:1;min-width:160px;border-color:var(--danger);"><h4>Total Pengeluaran</h4><h2 style="color:var(--danger);">' + fmtR(totalK) + '</h2></div>' +
                '<div class="stat-box" style="flex:1;min-width:160px;border-color:' + warna + ';"><h4>Saldo Akhir</h4><h2 style="color:' + warna + ';">' + fmtR(saldoAkhir) + '</h2></div>';
        }
    };

    window.cetakBAKasRT = function() {
        var db = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var saldoAwal = Number(localStorage.getItem('db_saldo_awal') || 0);
        var s = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var bulanEl = document.getElementById('ben-lap-bulan');
        var tahunEl = document.getElementById('ben-lap-tahun');
        var bulanVal = bulanEl ? parseInt(bulanEl.value) || 0 : 0;
        var tahunVal = tahunEl ? parseInt(tahunEl.value) || new Date().getFullYear() : new Date().getFullYear();
        var BULAN_ID = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var periodeLabel = bulanVal ? (BULAN_ID[bulanVal] + ' ' + tahunVal) : ('Tahun ' + tahunVal);

        var data = db.filter(function(x){
            if (!x.tgl) return false;
            var d = new Date(x.tgl);
            var okB = !bulanVal || (d.getMonth()+1) === bulanVal;
            var okT = d.getFullYear() === tahunVal;
            return okB && okT;
        }).sort(function(a,b){ return new Date(a.tgl) - new Date(b.tgl); });

        var fmtR = window.fmt || function(v){ return 'Rp '+Number(v||0).toLocaleString('id-ID'); };
        var escH = window.escapeHtml || function(v){ return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
        var totalM = 0, totalK = 0;

        var rows = data.map(function(x, i){
            var n = Number(x.nominal) || 0;
            var isMasuk = (x.tipe||'').toLowerCase() === 'masuk';
            if (isMasuk) totalM += n; else totalK += n;
            return '<tr>' +
                '<td style="border:1px solid #000000;text-align:center;padding:8px;">'+(i+1)+'</td>' +
                '<td style="border:1px solid #000000;padding:8px;">'+(x.tgl||'-')+'</td>' +
                '<td style="border:1px solid #000000;padding:8px;">'+escH(x.uraian||'-')+'</td>' +
                '<td style="border:1px solid #000000;text-align:right;padding:8px;">'+(isMasuk ? fmtR(n) : '-')+'</td>' +
                '<td style="border:1px solid #000000;text-align:right;padding:8px;">'+(!isMasuk ? fmtR(n) : '-')+'</td>' +
                '</tr>';
        }).join('');
        if (!rows) rows = '<tr><td colspan="5" style="border:1px solid #000;text-align:center;padding:10px;color:#666;">Tidak ada transaksi untuk periode ini</td></tr>';

        var saldoAkhir = saldoAwal + totalM - totalK;
        var now = new Date();
        var HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        var hariNama = HARI[now.getDay()];
        var tglStr = now.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
        var noRT = escH(s.noRT || 'RT 005');
        var namaKetua = escH(s.namaKetua || s.namaRT || '...................');
        var namaBen = escH(s.namaBen || '...................');
        var kelurahan = escH((s.kelurahan || 'Tegalsari').toUpperCase());
        var kecamatan = escH((s.kecamatan || 'Candisari').toUpperCase());
        var alamat = escH(s.alamat || 'Kota Semarang');
        var noDoc = (s.noRT||'RT005').replace(/\s/g,'') + '/BA-KAS/' + (bulanVal||'ALL') + '/' + tahunVal;
        var logoUrl = window.location.origin + '/Lambang_Kota_Semarang.png';

        var html = '<div style="font-family:Arial,sans-serif;font-size:12px;color:#000000;line-height:1.15;background:#fff;padding:76px;width:794px;box-sizing:border-box;position:relative;">' +
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:90px;font-weight:900;color:rgba(0,0,0,0.04);white-space:nowrap;pointer-events:none;user-select:none;">' + noRT + '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;padding-bottom:10px;margin-bottom:20px;border-bottom:3px double #000000;">' +
            '<img src="'+logoUrl+'" style="width:80px;height:80px;object-fit:contain;flex-shrink:0;" crossorigin="anonymous">' +
            '<div style="text-align:center;flex:1;">' +
            '<div style="font-size:16px;font-weight:bold;line-height:1.3;">PEMERINTAH KOTA SEMARANG</div>' +
            '<div style="font-size:16px;font-weight:bold;margin-top:2px;line-height:1.3;">KECAMATAN ' + kecamatan + '</div>' +
            '<div style="font-size:14px;font-weight:bold;margin-top:2px;line-height:1.3;">KELURAHAN ' + kelurahan + ' &mdash; ' + noRT + '</div>' +
            '<div style="font-size:12px;font-weight:normal;margin-top:2px;line-height:1.3;">' + alamat + '</div>' +
            '</div></div>' +
            '<div style="text-align:center;margin-bottom:14px;position:relative;z-index:1;">' +
            '<div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;">BERITA ACARA LAPORAN KAS</div>' +
            '<div style="font-size:13px;font-weight:700;margin-top:2px;">' + noRT + '</div>' +
            '<div style="font-size:12px;margin-top:2px;">Periode: ' + periodeLabel + '</div>' +
            '<div style="font-size:10px;color:#555;margin-top:3px;">Nomor: ' + noDoc + '</div>' +
            '</div>' +
            '<p style="text-align:justify;line-height:1.7;margin-bottom:10px;position:relative;z-index:1;">Pada hari ini, <b>' + hariNama + '</b>, tanggal <b>' + tglStr + '</b>, telah dilakukan pemeriksaan dan pelaporan kas Rukun Tetangga untuk periode <b>' + periodeLabel + '</b>, dengan rincian sebagai berikut:</p>' +
            '<table style="width:100%;margin-bottom:12px;font-size:12px;position:relative;z-index:1;">' +
            '<tr><td style="width:28%">Nama Ketua RT</td><td style="width:3%">:</td><td><b>' + namaKetua + '</b></td></tr>' +
            '<tr><td>Nama Bendahara</td><td>:</td><td><b>' + namaBen + '</b></td></tr>' +
            '</table>' +
            '<div style="font-size:12px;font-weight:bold;text-transform:uppercase;margin-bottom:6px;border-left:3px solid #000;padding-left:6px;position:relative;z-index:1;">I. Ringkasan Saldo Kas</div>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:14px;position:relative;z-index:1;">' +
            '<thead><tr style="background:#f2f2f2;">' +
            '<th style="border:1px solid #000;padding:8px;text-align:center;width:8%">No.</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;">Keterangan</th>' +
            '<th style="border:1px solid #000;padding:8px;width:35%;text-align:center;">Jumlah (Rp)</th>' +
            '</tr></thead><tbody>' +
            '<tr><td style="border:1px solid #000;text-align:center;padding:8px;">1</td><td style="border:1px solid #000;padding:8px;">Saldo Awal Periode</td><td style="border:1px solid #000;text-align:right;padding:8px;">' + fmtR(saldoAwal) + '</td></tr>' +
            '<tr><td style="border:1px solid #000;text-align:center;padding:8px;">2</td><td style="border:1px solid #000;padding:8px;">Total Pemasukan Periode Ini</td><td style="border:1px solid #000;text-align:right;padding:8px;">' + fmtR(totalM) + '</td></tr>' +
            '<tr><td style="border:1px solid #000;text-align:center;padding:8px;">3</td><td style="border:1px solid #000;padding:8px;">Total Pengeluaran Periode Ini</td><td style="border:1px solid #000;text-align:right;padding:8px;">' + fmtR(totalK) + '</td></tr>' +
            '<tr style="background:#e8f5e9;font-weight:bold;"><td style="border:1px solid #000;text-align:center;padding:8px;">4</td><td style="border:1px solid #000;padding:8px;">Saldo Akhir Periode</td><td style="border:1px solid #000;text-align:right;padding:8px;">' + fmtR(saldoAkhir) + '</td></tr>' +
            '</tbody></table>' +
            '<div style="font-size:12px;font-weight:bold;text-transform:uppercase;margin-bottom:6px;border-left:3px solid #000;padding-left:6px;position:relative;z-index:1;">II. Rincian Transaksi</div>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;position:relative;z-index:1;">' +
            '<thead><tr style="background:#f2f2f2;">' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:6%">No.</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:16%">Tanggal</th>' +
            '<th style="border:1px solid #000;padding:8px;">Keterangan</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:17%">Pemasukan</th>' +
            '<th style="border:1px solid #000000;padding:8px;background:#f2f2f2;font-weight:bold;text-align:center;width:17%">Pengeluaran</th>' +
            '</tr></thead><tbody>' + rows +
            '<tr style="font-weight:bold;background:#f9f9f9;">' +
            '<td colspan="3" style="border:1px solid #000;text-align:right;padding:8px;">TOTAL</td>' +
            '<td style="border:1px solid #000;text-align:right;padding:8px;">' + fmtR(totalM) + '</td>' +
            '<td style="border:1px solid #000;text-align:right;padding:8px;">' + fmtR(totalK) + '</td>' +
            '</tr></tbody></table>' +
            '<p style="text-align:justify;line-height:1.7;margin-bottom:20px;position:relative;z-index:1;">Demikian Berita Acara Laporan Kas ini dibuat dengan sebenar-benarnya untuk digunakan sebagaimana mestinya.</p>' +
            '<table style="width:100%;border-collapse:collapse;margin-top:40px;font-size:12px;"><tr>' +
            '<td style="width:50%;border:none;text-align:center;padding:4px 8px;"><div>Pemeriksa,<br>Ketua ' + noRT + '</div><div style="height:80px;"></div><b style="text-decoration:underline;">' + namaKetua + '</b></td>' +
            '<td style="width:50%;border:none;text-align:center;padding:4px 8px;"><div>Semarang, ' + tglStr + '<br>Yang Diperiksa, Bendahara ' + noRT + '</div><div style="height:80px;"></div><b style="text-decoration:underline;">' + namaBen + '</b></td>' +
            '</tr></table>' +
            '<div style="margin-top:24px;text-align:center;font-size:10px;font-style:italic;color:#666666;border-top:1px solid #cccccc;padding-top:6px;">' +
            'Diterbitkan oleh Smart Portal ' + noRT + ' &bull; ' + noDoc + ' &bull; Dicetak: ' + tglStr +
            '</div></div>';

        window.downloadPdfFromHtml(html, 'BA_Kas_' + periodeLabel.replace(/\s/g,'_'));
    };

    // ===== KOPERASI: Hitung & Bagikan SHU (Sisa Hasil Usaha) =====
    window.hitungSHUMassal = function() {
        var dbS = JSON.parse(localStorage.getItem('db_kop_simpan')) || [];
        var dbP = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];
        var totalLaba = dbP.reduce(function(t,p){
            var plafon = Number(p.plafon)||0; var bunga = (Number(p.bunga)||10)/100;
            return t + (plafon * bunga);
        }, 0);
        // Map kontribusi tabungan per warga (setor - tarik)
        var kontribusi = {}; var totalKontribusi = 0;
        dbS.forEach(function(x){
            var key = x.idWarga || x.namaWarga;
            var n = Number(x.nominal)||0;
            var sign = ((x.jenis||'').toLowerCase().indexOf('tarik')!==-1) ? -1 : 1;
            kontribusi[key] = kontribusi[key] || { nama: x.namaWarga, total: 0 };
            kontribusi[key].total += sign * n;
            totalKontribusi += sign * n;
        });
        if (totalKontribusi <= 0) return Swal.fire('Belum Ada SHU', 'Belum ada total tabungan bersih untuk dibagi.', 'info');
        if (totalLaba <= 0) return Swal.fire('Belum Ada Laba', 'Belum ada laba bunga pinjaman untuk dibagikan.', 'info');
        var rows = Object.keys(kontribusi).map(function(k){
            var c = kontribusi[k]; if (c.total <= 0) return '';
            var bagian = (c.total / totalKontribusi) * totalLaba;
            return '<tr><td style="border:1px solid #ccc; padding:6px;"><b>'+c.nama+'</b></td>'+
                   '<td style="border:1px solid #ccc; padding:6px; text-align:right;">'+fmt(c.total)+'</td>'+
                   '<td style="border:1px solid #ccc; padding:6px; text-align:right; color:#10b981;"><b>'+fmt(bagian)+'</b></td></tr>';
        }).join('');
        Swal.fire({
            title: 'Tinjau Pembagian SHU',
            html: '<p>Total laba bunga: <b>'+fmt(totalLaba)+'</b><br>Total tabungan bersih: <b>'+fmt(totalKontribusi)+'</b></p>'+
                  '<div style="max-height:300px; overflow-y:auto; text-align:left;">'+
                  '<table style="width:100%; border-collapse:collapse; font-size:0.9rem;"><thead><tr style="background:#f59e0b; color:white;">'+
                  '<th style="padding:6px;">Nama</th><th style="padding:6px;">Tabungan</th><th style="padding:6px;">Bagian SHU</th></tr></thead>'+
                  '<tbody>'+rows+'</tbody></table></div>',
            width: 700, showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-check"></i> Bagikan & Catat ke Kas',
            confirmButtonColor: '#f59e0b'
        }).then(function(r){
            if (!r.isConfirmed) return;
            var dbKas = JSON.parse(localStorage.getItem('db_kas')) || [];
            var tgl = new Date().toISOString().split('T')[0];
            Object.keys(kontribusi).forEach(function(k){
                var c = kontribusi[k]; if (c.total <= 0) return;
                var bagian = (c.total / totalKontribusi) * totalLaba;
                dbKas.push({ id: Date.now()+Math.random(), tgl: tgl, uraian: 'Bagi SHU Koperasi - '+c.nama, tipe: 'keluar', nominal: Math.round(bagian) });
            });
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Swal.fire('Berhasil', 'SHU sudah dibagikan & dicatat di kas RT.', 'success');
        });
    };

    // ===== KOPERASI: Refresh kartu Kas Liquid & Total Laba =====
    window.loadKopLaporan = function() {
        var dbS = JSON.parse(localStorage.getItem('db_kop_simpan')) || [];
        var dbP = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];
        var totalSetor = dbS.reduce(function(t,x){ var n=Number(x.nominal)||0; return t + (((x.jenis||'').toLowerCase().indexOf('tarik')!==-1)? -n : n); }, 0);
        var totalPiutang = dbP.filter(function(x){ return x.status!=='Lunas'; }).reduce(function(t,x){ return t + (Number(x.sisa)||0); }, 0);
        var totalLaba = dbP.reduce(function(t,x){ return t + ((Number(x.plafon)||0) * ((Number(x.bunga)||10)/100)); }, 0);
        var liquid = totalSetor - totalPiutang;
        var elL = document.getElementById('kop_tot_liquid'); if (elL) elL.innerText = fmt(liquid);
        var elB = document.getElementById('kop_tot_laba');   if (elB) elB.innerText = fmt(totalLaba);
    };

    // Pencarian kontak darurat (dipakai input search-darurat di portal warga)
    window.filterKontakDarurat = function() {
        var q = (document.getElementById('search-darurat') || {value:''}).value.toLowerCase().trim();
        document.querySelectorAll('.darurat-item').forEach(function(el){
            var txt = (el.innerText || el.textContent || '').toLowerCase();
            el.style.display = (!q || txt.indexOf(q) !== -1) ? '' : 'none';
        });
    };

    document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split("/").pop();

    // Sesuai dengan nama file login kamu yang sebenarnya
    const loginPage = 'index.html'; 

    if (isLoggedIn !== 'true') {
        // HANYA pindah ke login jika kita TIDAK sedang di halaman login
        if (currentPage !== loginPage && currentPage !== '') {
            window.location.href = loginPage;
        }
    } else {
        // Jika sudah login, baru jalankan fungsi load data
        if (typeof loadRiwayatPengajuan === "function") {
            loadRiwayatPengajuan();
        }
    }
});
    // Gunakan satu nama variabel yang konsisten
// =========================================================
      // DATA DISIMPAN DI REPLIT SERVER (TANPA GOOGLE SHEETS)
      // Semua data tersimpan di localStorage browser secara lokal
      // Sinkronisasi antar perangkat tidak diperlukan - data per perangkat
      // =========================================================

      window.tarikDataDariCloud = async function() {
          // Versi Replit: data sudah tersedia di localStorage, tidak perlu fetch
          console.log("Data dimuat dari penyimpanan lokal.");
          return true;
      };

          // === 2. LOGIN & AUTENTIKASI ===
    window.toggleUnivPass = function() { let p = document.getElementById('univ-pass'), i = document.getElementById('univ-eye'); if(p.type === 'password') { p.type = 'text'; i.classList.replace('fa-eye-slash','fa-eye'); i.style.color = 'var(--primary-blue)'; } else { p.type = 'password'; i.classList.replace('fa-eye','fa-eye-slash'); i.style.color = '#94a3b8'; } };
    window.lupaPassword = function() { Swal.fire({ icon: 'info', title: 'Lupa Password?', text: 'Hubungi Sekretaris RT untuk mereset password.', confirmButtonColor: '#0ea5e9' }); };
    window.logout = function() {
        loggedInWarga = null;
        document.body.classList.remove('warga-portal-aktif');
        // Flush semua pending writes ke server SEBELUM reload
        // agar data tidak hilang akibat debounce yang belum selesai
        var doReload = function(){ location.reload(); };
        if(typeof window.GT_FLUSH_NOW === 'function'){
            window.GT_FLUSH_NOW().then(doReload).catch(doReload);
            setTimeout(doReload, 2000); // fallback: reload dalam 2 detik jika flush gagal
        } else {
            doReload();
        }
    };
    window.loginSebagaiTamu = function() { loggedInWarga = { id: 'guest_'+Date.now(), nama: "Tamu / Pengunjung", isGuest: true }; window.BukaPortal('warga'); };
    
    window.prosesLoginUniversal = function(e) {
        // Mencegah form tidak sengaja me-refresh layar
        if(e) e.preventDefault(); 

        let id = document.getElementById('univ-id').value.trim().toLowerCase(); 
        let pass = document.getElementById('univ-pass').value;
        let masterWarga = JSON.parse(localStorage.getItem('db_warga')) || []; 
        let dbMandiri = JSON.parse(localStorage.getItem('data_warga_mandiri')) || [];

        let targetPortal = null; // Variabel untuk menyimpan tujuan portal jika login sukses

        // === 1. TAHAP PENGECEKAN PASSWORD ===
        // Baca password dari db_passwords (set oleh admin via Pengaturan Sistem)
        // Fallback ke password default jika belum pernah diubah
        let _pwDb = JSON.parse(localStorage.getItem('db_passwords')) || {};
        let _pwAdmin    = _pwDb.admin      || 'admin005';
        let _pwBendahara = _pwDb.bendahara || 'benda005';
        let _pwKoperasi  = _pwDb.koperasi  || 'koperasi005';
        let _pwWarga     = _pwDb.warga     || 'rt005';
        if(id === 'admin' && pass === _pwAdmin) {
            targetPortal = 'admin';
        } else if(id === 'bendahara' && pass === _pwBendahara) {
            targetPortal = 'bendahara';
        } else if(id === 'koperasi' && pass === _pwKoperasi) {
            targetPortal = 'koperasi';
        } else if(id === 'warga' && pass === _pwWarga) {
            loggedInWarga = { id: "global_"+Date.now(), nama: "Warga RT 005 (Akses Publik)", isGuest: true }; 
            targetPortal = 'warga';
        } else {
            // Pengecekan Khusus Akun Warga Pribadi
            let akunWarga = masterWarga.find(w => w.nama.trim().toLowerCase() === id || (w.nik && String(w.nik).trim() === id));
            if(akunWarga) {
                let akunMandiri = dbMandiri.find(m => String(m.id) === String(akunWarga.id));
                let passAktif = akunMandiri ? (akunMandiri.password || _pwWarga) : _pwWarga;
                if(pass === passAktif) { 
                    loggedInWarga = { id: akunWarga.id, nama: akunWarga.nama, nik: akunWarga.nik, alamat: akunWarga.alamat }; 
                    if(pass === _pwWarga && pass === 'rt005') loggedInWarga.isNew = true; 
                    targetPortal = 'warga'; 
                }
            }
        }

        // === 2. TAHAP EKSEKUSI (SUKSES / GAGAL) ===
        if (targetPortal !== null) {
            // JIKA SUKSES: Munculkan Centang -> Sinkron Data ke Cloud -> Baru Masuk Portal
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil',
                text: 'Membuka Portal...',
                timer: 1500, // Tunggu 1,5 detik agar cantik
                showConfirmButton: false
            }).then(() => {
                // SINKRON DATA AWAN HANYA DILAKUKAN 1X DI SINI
                if(typeof syncSemuaData === 'function') syncSemuaData(); 
                
                window.BukaPortal(targetPortal); // Buka pintunya
            });
        } else {
            // JIKA GAGAL: Stop di sini! Tolak keras dan jangan buka portal
            Swal.fire({
                icon: 'error', 
                title: 'Akses Ditolak', 
                text: 'ID / NIK atau Password salah!'
            });
        }
    };

    window.BukaPortal = function(role) {
        document.getElementById('login-screen').style.display = 'none'; document.getElementById('main-app').style.display = 'block';
        ['warga', 'bendahara', 'koperasi', 'admin'].forEach(r => { let v = document.getElementById('view-' + r); if(v) { v.style.display = 'none'; v.classList.remove('active-grid'); } });
        document.body.classList.remove('warga-portal-aktif');
        
        if(role === 'warga' && loggedInWarga) {
            document.getElementById('user-name').innerText = loggedInWarga.nama; document.getElementById('user-role').innerText = loggedInWarga.isGuest ? "Akses Publik Terbatas" : "Anggota Warga RT 005";
            document.getElementById('user-avatar').style.background = loggedInWarga.isGuest ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #2563eb)"; document.getElementById('user-avatar').innerHTML = loggedInWarga.isGuest ? "<i class='fa-solid fa-eye'></i>" : "<i class='fa-solid fa-user'></i>";
            document.body.classList.add('warga-portal-aktif');
            let v = document.getElementById('view-warga'); v.style.display = ''; v.classList.add('active-grid'); let navTabs = document.querySelector('#view-warga .admin-nav-tabs');
            
            if(loggedInWarga.isGuest) {
                if(navTabs) navTabs.style.display = ''; 
                document.querySelectorAll('#view-warga .admin-tab-btn').forEach(btn => { let oc = btn.getAttribute('onclick') || ''; if(oc.includes('warga-dashboard') || oc.includes('warga-struktur') || oc.includes('warga-darurat')) { btn.style.display = 'flex'; } else { btn.style.display = 'none'; } });
                let pwGroup = document.getElementById('wajib-pass-group'); if(pwGroup) pwGroup.style.display = 'none'; openWargaTab('warga-dashboard');
            } else if(loggedInWarga.isNew) {
                if(navTabs) navTabs.style.display = 'none'; openWargaTab('warga-profil'); tampilFormKeluarga(true);
                let pwGroup = document.getElementById('wajib-pass-group'); if(pwGroup) pwGroup.style.display = 'block';
                let btnBatal = document.querySelector('#warga-form-data .btn-action[onclick="tampilFormKeluarga(false)"]'); if(btnBatal) btnBatal.style.display = 'none';
                Swal.fire({icon: 'warning', title: 'Peringatan Keamanan!', text: 'Anda WAJIB melengkapi data & ganti password untuk mengakses portal.', confirmButtonColor: '#ef4444'});
            } else {
                if(navTabs) navTabs.style.display = ''; document.querySelectorAll('#view-warga .admin-tab-btn').forEach(btn => btn.style.display = 'flex');
                let pwGroup = document.getElementById('wajib-pass-group'); if(pwGroup) pwGroup.style.display = 'none';
                let btnBatal = document.querySelector('#warga-form-data .btn-action[onclick="tampilFormKeluarga(false)"]'); if(btnBatal) btnBatal.style.display = 'inline-flex';
                openWargaTab('warga-dashboard');
                if (typeof window.__showGtChatFab === 'function') window.__showGtChatFab();
            }
        } 
        else if(role === 'bendahara') { window.location.href = 'bendahara.html'; return; } 
        else if(role === 'koperasi') { document.getElementById('user-name').innerText = "Pengurus Koperasi"; document.getElementById('user-role').innerText = "Simpan Pinjam RT 005"; document.getElementById('user-avatar').style.background = "linear-gradient(135deg, #8b5cf6, #6d28d9)"; document.getElementById('user-avatar').innerHTML = "<i class='fa-solid fa-handshake-angle'></i>"; let v = document.getElementById('view-koperasi'); v.style.display = ''; v.classList.add('active-grid'); openKopTab('kop-simpanan'); } 
        else if(role === 'admin') { document.getElementById('user-name').innerText = "Christian Eka"; document.getElementById('user-role').innerText = "Otoritas Sekretaris RT 005"; document.getElementById('user-avatar').style.background = "linear-gradient(135deg, #f59e0b, #b45309)"; document.getElementById('user-avatar').innerHTML = "<i class='fa-solid fa-user-tie'></i>"; let v = document.getElementById('view-admin'); v.style.display = ''; v.classList.add('active-grid'); openAdminTab('admin-datakk'); let _pno = document.getElementById('p_no'); if(_pno) _pno.value = getNextSuratNumber(); let _ptgl = document.getElementById('p_tgl_manual'); if(_ptgl) _ptgl.innerText = new Date().toLocaleDateString('id-ID'); }
        syncSemuaData();
    };
    // === FUNGSI SUB-TAB PUBLIKASI ===
    window.openSubPublikasi = function(targetId) {
        // Sembunyikan semua sub-konten
        document.querySelectorAll('.sub-pub-content').forEach(el => el.style.display = 'none');
        // Tampilkan yang diklik
        document.getElementById(targetId).style.display = 'block';
    };

    // === MENGISI FORM ARISAN OTOMATIS SAAT DIBUKA ===
    window.loadFormArisan = function() {
        let ar = JSON.parse(localStorage.getItem('db_info_arisan'));
        if(ar) {
            if(document.getElementById('inp_arisan_nama')) document.getElementById('inp_arisan_nama').value = ar.arisanNama || '';
            if(document.getElementById('inp_arisan_tgl')) document.getElementById('inp_arisan_tgl').value = ar.arisanTgl || '';
            if(document.getElementById('inp_host_nama')) document.getElementById('inp_host_nama').value = ar.hostNama || '';
            if(document.getElementById('inp_host_tgl')) document.getElementById('inp_host_tgl').value = ar.hostTgl || '';
        }
    };
    // === 3. NAVIGASI TABS ===
    window.openWargaTab = function(t) {
    document.querySelectorAll(".warga-tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#view-warga .admin-tab-btn").forEach(el => {
        el.classList.remove("active");
        if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(t)) el.classList.add("active");
    });
    if(document.getElementById(t)) document.getElementById(t).classList.add("active");
    window.scrollTo({top: 0, behavior: 'smooth'});
    const wLoaders = {
        'warga-dashboard':  function(){ if(typeof loadDashboardWarga==='function') loadDashboardWarga(); if(typeof loadBeritaWarga==='function') loadBeritaWarga(); if(typeof loadKegiatan==='function') loadKegiatan(); },
        'warga-profil':     function(){ if(typeof loadProfilPribadiWarga==='function') loadProfilPribadiWarga(); },
        'warga-keuangan':   function(){ if(typeof loadIuranPribadiWarga==='function') loadIuranPribadiWarga(); },
        'warga-surat':      function(){ if(typeof loadSuratWarga==='function') loadSuratWarga(); },
        'warga-aduan':      function(){ if(typeof loadAduanWarga==='function') loadAduanWarga(); },
        'warga-koperasi':   function(){ if(typeof loadKoperasiData==='function') loadKoperasiData(); },
        'warga-struktur':   function(){ if(typeof loadPengurus==='function') loadPengurus(); },
        'warga-darurat':    function(){ if(typeof loadDaruratWarga==='function') loadDaruratWarga(); },
        'warga-berita-portal': function(){ if(typeof window.gtNewsInit==='function') window.gtNewsInit(); },
    };
    if(wLoaders[t]) wLoaders[t]();
};
    window.openKopTab = function(t) {
    document.querySelectorAll(".kop-tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#view-koperasi .admin-tab-btn").forEach(el => {
        el.classList.remove("active");
        if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(t)) el.classList.add("active");
    });
    if(document.getElementById(t)) document.getElementById(t).classList.add("active");
    window.scrollTo({top: 0, behavior: 'smooth'});
    const kLoaders = {
        'kop-simpanan':  function(){ if(typeof loadKoperasiData==='function') loadKoperasiData(); if(typeof populateDropdownWarga==='function') populateDropdownWarga(); },
        'kop-pinjaman':  function(){ if(typeof loadKoperasiData==='function') loadKoperasiData(); if(typeof populateDropdownWarga==='function') populateDropdownWarga(); },
        'kop-laporan':   function(){ if(typeof loadKoperasiData==='function') loadKoperasiData(); if(typeof loadKopLaporan==='function') loadKopLaporan(); },
    };
    if(kLoaders[t]) kLoaders[t]();
};
    window.openAdminTab = function(t) {
    document.querySelectorAll(".admin-tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#view-admin .admin-tab-btn").forEach(el => {
        el.classList.remove("active");
        if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(t)) el.classList.add("active");
    });
    if(document.getElementById(t)) document.getElementById(t).classList.add("active");
    try { if(document.getElementById('p_no')) document.getElementById('p_no').value = getNextSuratNumber(); } catch(e){}
    window.scrollTo({top: 0, behavior: 'smooth'});
    const aLoaders = {
        'admin-datakk':     function(){ if(typeof loadTabelKKAdmin==='function') loadTabelKKAdmin(); if(typeof populateDropdownWarga==='function') populateDropdownWarga(); },
        'mutasi':           function(){ if(typeof loadMutasi==='function') loadMutasi(); if(typeof populateDropdownWarga==='function') populateDropdownWarga(); },
        'surat':            function(){ if(typeof loadSuratAdmin==='function') loadSuratAdmin(); },
        'admin-aduan':      function(){ if(typeof loadAduanAdmin==='function') loadAduanAdmin(); },
        'admin-publikasi':  function(){ if(typeof loadBeritaAdmin==='function') loadBeritaAdmin(); if(typeof loadKegiatan==='function') loadKegiatan(); },
        'admin-struktur':   function(){ if(typeof loadPengurus==='function') loadPengurus(); },
        'notulen':          function(){ if(typeof loadNotulenAdmin==='function') loadNotulenAdmin(); },
        'darurat':          function(){ if(typeof loadDaruratAdmin==='function') loadDaruratAdmin(); },
        'pengaturan':       function(){ if(typeof loadPengaturan==='function') loadPengaturan(); },
        'bantuan-sosial':   function(){ if(typeof window.loadBantuanSosial==='function') window.loadBantuanSosial(); },
    };
    if(aLoaders[t]) aLoaders[t]();
};
    window.openBenTab = function(t) {
    document.querySelectorAll(".ben-tab-content").forEach(function(el){ el.classList.remove("active"); });
    document.querySelectorAll("#view-bendahara .admin-tab-btn").forEach(function(el){
        el.classList.remove("active");
        if (el.getAttribute("onclick") && el.getAttribute("onclick").indexOf(t) !== -1) el.classList.add("active");
    });
    if (document.getElementById(t)) document.getElementById(t).classList.add("active");
    window.scrollTo({top: 0, behavior: 'smooth'});
    var bLoaders = {
        'ben-input':   function(){ if(typeof loadBenInput==='function') loadBenInput(); },
        'ben-laporan': function(){ if(typeof loadBenLaporan==='function') loadBenLaporan(); },
    };
    if (bLoaders[t]) bLoaders[t]();
};

    // === 4. DROPDOWN SEARCH (SELECT2) ===
    window.populateDropdownWarga = function() {
        let db = JSON.parse(localStorage.getItem('db_warga')) || [];
        let opt = '<option value="">-- Ketik/Pilih Data Warga --</option>';
        db.sort((a,b) => a.nama.localeCompare(b.nama)).forEach(w => { opt += `<option value="${w.id}">${w.nama} (NIK: ${w.nik || '-'})</option>`; });
        
        ['m_nama', 'ben-warga', 'k_simpan_warga', 'k_pinjam_warga'].forEach(id => {
            let el = document.getElementById(id);
            if(el) { 
                if(typeof jQuery !== 'undefined' && $(el).hasClass("select2-hidden-accessible")) { $(el).select2('destroy'); }
                el.innerHTML = opt; 
                if(typeof jQuery !== 'undefined') { $(el).select2({ width: '100%', language: { noResults: function() { return "Nama tidak ditemukan"; } } }); }
            }
        });
    };

    // === 5. WARGA & ADMIN KK ===
    window.tampilFormKeluarga = function(show) { if(document.getElementById('warga-view-data')) document.getElementById('warga-view-data').style.display = show ? 'none' : 'block'; if(document.getElementById('warga-form-data')) document.getElementById('warga-form-data').style.display = show ? 'block' : 'none'; };
    window.tambahKolomAnak = function() { let d = document.createElement('div'); d.innerHTML = `<input type="text" class="kk_anak" placeholder="Nama Lengkap Anak" style="margin-top:10px; width:100%; padding:14px 18px; border:2px solid #e2e8f0; border-radius:12px;">`; let c = document.getElementById('container-anak'); if(c) c.appendChild(d); };
    window.simpanProfilWargaBaru = function() {
        if(!loggedInWarga) return; let passBaru = document.getElementById('kk-pass-baru') ? document.getElementById('kk-pass-baru').value.trim() : '';
        if(loggedInWarga.isNew && passBaru === '') return Swal.fire('Gagal', 'Anda WAJIB mengisi password baru!', 'error');
        let db = JSON.parse(localStorage.getItem('db_warga')) || []; let anak = []; document.querySelectorAll('.kk_anak').forEach(i => { if(i.value.trim() !== '') anak.push(i.value.trim()); });
        let data = { nama: document.getElementById('kk-nama').value, kk: document.getElementById('kk-nokk').value, nik: document.getElementById('kk-nik').value, pekerjaan: (document.getElementById('kk-pekerjaan')||{}).value||'', pendapatan: (document.getElementById('kk-pendapatan')||{}).value||'', telp: (document.getElementById('kk-telp')||{}).value||'', bpjs: document.getElementById('kk-bpjs').value, email: (document.getElementById('kk-email')||{}).value || '', istri: document.getElementById('kk-istri').value, alamat: document.getElementById('kk-alamat').value, anak: anak };
        let idx = db.findIndex(x => String(x.id) === String(loggedInWarga.id)); if(idx !== -1) { db[idx] = { ...db[idx], ...data }; } else { db.push({ id: loggedInWarga.id, ...data }); }
        localStorage.setItem('db_warga', JSON.stringify(db)); localStorage.setItem('ts_warga', new Date().toISOString());
        if(loggedInWarga.isNew && passBaru !== '') {
            let dbMandiri = JSON.parse(localStorage.getItem('data_warga_mandiri')) || []; let mIdx = dbMandiri.findIndex(x => String(x.id) === String(loggedInWarga.id));
            if(mIdx !== -1) { dbMandiri[mIdx].password = passBaru; } else { dbMandiri.push({ id: loggedInWarga.id, nama: data.nama, password: passBaru }); }
            localStorage.setItem('data_warga_mandiri', JSON.stringify(dbMandiri));
            Swal.fire({icon:'success', title:'Aktivasi Selesai!', text:'Silakan login kembali dengan sandi baru.', confirmButtonColor: '#10b981'}).then(async function(){
                try { if (typeof window.tawarkanAktivasiBiometrik === 'function') { await window.tawarkanAktivasiBiometrik(window.loggedInWarga); } } catch(_){}
                if(typeof window.GT_FLUSH_NOW === 'function'){
                    window.GT_FLUSH_NOW().finally(function(){ location.reload(); });
                    setTimeout(function(){ location.reload(); }, 2000);
                } else { location.reload(); }
            });
            return;
        }
        loggedInWarga.nama = data.nama; loggedInWarga.nik = data.nik; loggedInWarga.alamat = data.alamat; tampilFormKeluarga(false); syncSemuaData(); Toast.fire({icon:'success', title:'Diperbarui!'});
        // Tawarkan aktivasi biometrik (hanya sekali per warga & per perangkat)
        try {
            if (typeof window.tawarkanAktivasiBiometrik === 'function') {
                setTimeout(function(){ window.tawarkanAktivasiBiometrik(window.loggedInWarga); }, 500);
            }
        } catch(_){}
    };
    window.loadProfilPribadiWarga = function() {
        if(!loggedInWarga) return;
        var db = JSON.parse(localStorage.getItem('db_warga')) || [];
        var myData = db.find(function(x){ return String(x.id) === String(loggedInWarga.id); });
        var tb = document.getElementById('tbody-profil-saya');
        if(!tb) return;
        tb.innerHTML = '';
        if(myData) {
            var ss = myData.statusSosial || 'Umum';
            var aktif = myData.aktif !== false;
            var isPrioritas = ss !== 'Umum' && (ss.includes('Janda') || ss.includes('Duda') || ss.includes('Lansia'));
            var badgeAktif = aktif
                ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:700;background:#dcfce7;color:#166534;border:1px solid #86efac;vertical-align:middle;"><i class="fa-solid fa-circle" style="font-size:0.4rem;"></i> Aktif</span>'
                : '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:700;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;vertical-align:middle;"><i class="fa-solid fa-circle" style="font-size:0.4rem;"></i> Tidak Aktif</span>';
            var badgeSS = (ss && ss !== 'Umum') ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:700;background:#fdf4ff;color:#7e22ce;border:1px solid #d8b4fe;vertical-align:middle;margin-left:4px;"><i class="fa-solid fa-id-badge"></i> ' + ss + '</span>' : '';
            var badgePrioritas = isPrioritas ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;vertical-align:middle;margin-left:4px;"><i class="fa-solid fa-hand-holding-heart"></i> Prioritas Bantuan</span>' : '';
            var telpTampil = myData.telp ? '<br><small><i class="fa-solid fa-phone" style="color:#059669;"></i> ' + myData.telp + '</small>' : '';
            var pkrTampil = myData.pekerjaan ? '<br><small><i class="fa-solid fa-briefcase" style="color:#7c3aed;"></i> ' + myData.pekerjaan + (myData.pendapatan ? ' · ' + myData.pendapatan : '') + '</small>' : '';
            tb.innerHTML = '<tr>' +
                '<td><b style="color:var(--primary-dark);font-size:1.05rem;">' + myData.nama + '</b> ' + badgeAktif + badgeSS + badgePrioritas + '<br><small>NIK: ' + (myData.nik||'-') + '</small>' + telpTampil + pkrTampil + '</td>' +
                '<td><b>' + myData.alamat + '</b></td>' +
                '<td style="white-space:nowrap;">' +
                  '<button class="btn-action bg-blue" style="margin-bottom:4px;" onclick="window.lihatProfilWarga()"><i class="fa-solid fa-eye"></i> Lihat</button><br>' +
                  '<button class="btn-action bg-gold" onclick="siapkanEditProfilSaya()"><i class="fa-solid fa-pen"></i> Edit</button>' +
                '</td></tr>';
        } else {
            tb.innerHTML = '<tr><td colspan="3" style="text-align:center;">Anda belum melengkapi data.</td></tr>';
        }
    };
    window.siapkanEditProfilSaya = function() {
        let db = JSON.parse(localStorage.getItem('db_warga')) || []; let myData = db.find(x => String(x.id) === String(loggedInWarga.id));
        if(myData) { document.getElementById('kk-nama').value = myData.nama||''; document.getElementById('kk-nokk').value = myData.kk||''; document.getElementById('kk-nik').value = myData.nik||''; if(document.getElementById('kk-pekerjaan')) document.getElementById('kk-pekerjaan').value = myData.pekerjaan||''; if(document.getElementById('kk-pendapatan')) { document.getElementById('kk-pendapatan').value = myData.pendapatan||''; var wpg = document.getElementById('warga-pendapatan-group'); if(wpg) wpg.style.display = (myData.pekerjaan && myData.pekerjaan !== '') ? 'block' : 'none'; } if(document.getElementById('kk-telp')) document.getElementById('kk-telp').value = myData.telp||''; document.getElementById('kk-bpjs').value = myData.bpjs||''; document.getElementById('kk-istri').value = myData.istri||''; document.getElementById('kk-alamat').value = myData.alamat||'';
            document.getElementById('container-anak').innerHTML = ''; if(myData.anak) { myData.anak.forEach(a => { let d = document.createElement('div'); d.innerHTML = `<input type="text" class="kk_anak" value="${a}" style="margin-top:10px; width:100%; padding:14px 18px; border:2px solid #e2e8f0; border-radius:12px;">`; document.getElementById('container-anak').appendChild(d); }); } tampilFormKeluarga(true);
        }
    };
    window.ubahPasswordWarga = function() {
        if(loggedInWarga.nama === "Warga RT 005 (Global)") return Swal.fire('Ditolak', 'Akun Global tidak bisa diubah sandinya.', 'error');
        let lama = document.getElementById('pw-lama').value, baru = document.getElementById('pw-baru').value; if(!lama || !baru) return Swal.fire('Gagal', 'Isi sandi.', 'error');
        let dbMandiri = JSON.parse(localStorage.getItem('data_warga_mandiri')) || []; let idx = dbMandiri.findIndex(x => String(x.id) === String(loggedInWarga.id)); 
        if(lama !== (idx !== -1 ? dbMandiri[idx].password : 'rt005')) return Swal.fire('Ditolak', 'Sandi lama salah!', 'error');
        if(idx !== -1) dbMandiri[idx].password = baru; else dbMandiri.push({ id: loggedInWarga.id, nama: loggedInWarga.nama, password: baru });
        localStorage.setItem('data_warga_mandiri', JSON.stringify(dbMandiri)); document.getElementById('pw-lama').value = ''; document.getElementById('pw-baru').value = ''; Swal.fire('Berhasil', 'Password diperbarui.', 'success');
    };

    window.tampilFormKKAdmin = function(show) { document.getElementById('admin-view-kk').style.display = show ? 'none' : 'block'; document.getElementById('admin-form-kk').style.display = show ? 'block' : 'none'; if(!show) { document.getElementById('form-kk-admin').reset(); document.getElementById('adm-kk-id').value = ''; document.getElementById('adm-container-anak').innerHTML=''; } };
    window.tambahKolomAnakAdmin = function() { let d = document.createElement('div'); d.innerHTML = `<input type="text" class="adm_anak" placeholder="Nama Lengkap Anak" style="margin-top:10px; width:100%; padding:14px 18px; border:2px solid #e2e8f0; border-radius:12px;">`; document.getElementById('adm-container-anak').appendChild(d); };
    window.simpanKKAdmin = function() { let db = JSON.parse(localStorage.getItem('db_warga')) || []; let anak = []; document.querySelectorAll('.adm_anak').forEach(i => { if(i.value.trim() !== '') anak.push(i.value.trim()); }); let id = document.getElementById('adm-kk-id').value; let __aktifEl = document.getElementById('adm-kk-aktif'); let __aktif = __aktifEl ? !!__aktifEl.checked : true; let __ssEl = document.getElementById('adm-kk-status-sosial'); let data = { nama: document.getElementById('adm-kk-nama').value, kk: document.getElementById('adm-kk-nokk').value, nik: document.getElementById('adm-kk-nik').value, pekerjaan: (document.getElementById('adm-kk-pekerjaan')||{}).value||'', pendapatan: (document.getElementById('adm-kk-pendapatan')||{}).value||'', telp: document.getElementById('adm-kk-telp').value, istri: document.getElementById('adm-kk-istri').value, alamat: document.getElementById('adm-kk-alamat').value, anak: anak, aktif: __aktif, statusSosial: __ssEl ? __ssEl.value : 'Umum' }; if(id) { let idx = db.findIndex(x => String(x.id) === String(id)); if(idx !== -1) db[idx] = { id: parseInt(id), ...data }; } else { db.push({ id: Date.now(), ...data }); } localStorage.setItem('db_warga', JSON.stringify(db)); localStorage.setItem('ts_warga', new Date().toISOString()); tampilFormKKAdmin(false); loadTabelKKAdmin(); if (typeof syncSemuaData === 'function') syncSemuaData(true); Toast.fire({icon:'success', title:'Disimpan!'}); };
    window.prosesImportExcelWarga = function(e) { let file = e.target.files[0]; if(!file) return; let reader = new FileReader(); reader.onload = function(evt) { let data = new Uint8Array(evt.target.result); let wb = XLSX.read(data, {type: 'array'}); let rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1}); let db = JSON.parse(localStorage.getItem('db_warga')) || []; let added = 0; for(let i=1; i<rows.length; i++) { let r=rows[i]; if(r&&r[0]){ db.push({ id: Date.now()+Math.random(), nama: String(r[0]).trim(), kk: r[1]||'', nik: r[2]||'', alamat: r[3]||'', istri: '', anak: [] }); added++; } } localStorage.setItem('db_warga', JSON.stringify(db)); loadTabelKKAdmin(); if(typeof syncSemuaData==='function') syncSemuaData(true); Swal.fire('Selesai', `${added} KK terupload.`, 'success'); }; reader.readAsArrayBuffer(file); e.target.value = ''; };
    window.closeModalProfil = function() { document.getElementById('modal-profil').classList.remove('show'); };

    window.lihatProfilWarga = function(id) {
        var db = JSON.parse(localStorage.getItem('db_warga')) || [];
        var w = id ? db.find(function(x){ return String(x.id) === String(id); }) : (loggedInWarga ? db.find(function(x){ return String(x.id) === String(loggedInWarga.id); }) : null);
        if (!w) return;
        var nama = w.nama || '-';
        var initial = nama.trim().charAt(0).toUpperCase();
        var aktif = w.aktif !== false;
        var ss = w.statusSosial || 'Umum';
        var isPrioritas = ss !== 'Umum' && (ss.includes('Janda') || ss.includes('Duda') || ss.includes('Lansia'));
        var listAnak = Array.isArray(w.anak) && w.anak.length ? w.anak.join(', ') : '-';

        var avatarEl = document.getElementById('prof-avatar');
        if (avatarEl) { avatarEl.textContent = initial; avatarEl.style.background = aktif ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'linear-gradient(135deg,#dc2626,#ef4444)'; }
        document.getElementById('prof-nama').textContent = nama;
        document.getElementById('prof-pekerjaan').textContent = w.pekerjaan || 'Warga RT 005';
        document.getElementById('prof-nik').textContent = w.nik || '-';
        document.getElementById('prof-kk').textContent = w.kk || '-';
        document.getElementById('prof-alamat').textContent = w.alamat || '-';
        document.getElementById('prof-telp').textContent = w.telp || '-';
        document.getElementById('prof-istri').textContent = w.istri || '-';
        document.getElementById('prof-anak').textContent = listAnak;
        var bpjsEl = document.getElementById('prof-bpjs');
        if (bpjsEl) bpjsEl.textContent = w.bpjs || '-';
        var bpjsRow = document.getElementById('prof-bpjs-row');
        if (bpjsRow) bpjsRow.style.display = w.bpjs ? '' : 'none';

        var badgeAktif = document.getElementById('prof-status-aktif');
        if (badgeAktif) {
            badgeAktif.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:0.72rem;font-weight:700;' +
                (aktif ? 'background:#dcfce7;color:#166534;border:1px solid #86efac;' : 'background:#fee2e2;color:#991b1b;border:1px solid #fecaca;');
            badgeAktif.innerHTML = '<i class="fa-solid fa-circle" style="font-size:0.45rem;"></i> ' + (aktif ? 'Aktif di Wilayah RT' : 'Tidak Aktif');
        }
        var badgeSosial = document.getElementById('prof-status-sosial');
        if (badgeSosial) {
            if (ss && ss !== 'Umum') {
                var ssCfg = {Janda:{bg:'#fdf4ff',c:'#7e22ce'},Duda:{bg:'#fff7ed',c:'#c2410c'},Lansia:{bg:'#f0fdf4',c:'#15803d'}};
                var sKey = Object.keys(ssCfg).find(function(k){ return ss.includes(k); });
                var sStyle = sKey ? ssCfg[sKey] : {bg:'#f1f5f9',c:'#475569'};
                badgeSosial.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:0.72rem;font-weight:700;background:'+sStyle.bg+';color:'+sStyle.c+';border:1px solid '+sStyle.c+'44;';
                badgeSosial.innerHTML = '<i class="fa-solid fa-id-badge"></i> ' + ss;
            } else {
                badgeSosial.style.display = 'none';
            }
        }
        var badgePrioritas = document.getElementById('prof-prioritas-bantuan');
        if (badgePrioritas) {
            badgePrioritas.style.cssText = isPrioritas ? 'display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:0.72rem;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;' : 'display:none;';
            if (isPrioritas) badgePrioritas.innerHTML = '<i class="fa-solid fa-hand-holding-heart"></i> Prioritas Bantuan';
        }
        document.getElementById('modal-profil').classList.add('show');
    };
    window.loadTabelKKAdmin = function() { 
        let db = JSON.parse(localStorage.getItem('db_warga')) || []; 
        let tb = document.getElementById('body-tabel-kk-admin'); 
        if(!tb) return; tb.innerHTML = ''; 
        let showSensitive = !!window._GT_SHOW_SENSITIVE;
        function maskData(val, last) { if(!val) return '-'; let s=String(val); if(showSensitive) return s; return '•'.repeat(Math.max(0,s.length-last))+s.slice(-last); }
        if(db.length === 0) { tb.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada KK.</td></tr>`; return; } 
        db.forEach((w, idx) => { 
            let listAnak = w.anak && w.anak.length > 0 ? w.anak.join(', ') : '-'; 
            tb.innerHTML += `<tr>
                <td>${idx+1}</td>
                <td>
                    <div style="min-width: 120px; white-space: normal; word-break: break-word; line-height: 1.4;">
                        <b style="color:var(--primary-dark);">${w.nama}</b> <span title="${w.aktif===false?'Tidak aktif di wilayah':'Aktif di wilayah RT 005'}" style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:999px; font-size:0.7rem; font-weight:700; vertical-align:middle; ${w.aktif===false ? 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;' : 'background:#dcfce7; color:#166534; border:1px solid #86efac;'}"><i class="fa-solid fa-circle" style="font-size:0.55rem;"></i> ${w.aktif===false?'Tidak Aktif':'Aktif'}</span>${(function(ss){ if(!ss||ss==='Umum') return ''; let cfg={Janda:{bg:'#fdf4ff',c:'#7e22ce',ic:'fa-user-slash'},Duda:{bg:'#fff7ed',c:'#c2410c',ic:'fa-user-slash'},Lansia:{bg:'#f0fdf4',c:'#15803d',ic:'fa-person-cane'},'Janda + Lansia':{bg:'#fdf4ff',c:'#7e22ce',ic:'fa-person-cane'},'Duda + Lansia':{bg:'#fff7ed',c:'#c2410c',ic:'fa-person-cane'}}; let s=cfg[ss]||{bg:'#f1f5f9',c:'#475569',ic:'fa-circle-info'}; return ' <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:0.7rem;font-weight:700;background:'+s.bg+';color:'+s.c+';border:1px solid '+s.c+'33;"><i class=\"fa-solid '+s.ic+'\"></i> '+ss+'</span>'; })(w.statusSosial)}<br><small>NIK: ${maskData(w.nik,4)} | KK: ${maskData(w.kk,4)}</small><br><small style='color:#059669;'>${w.telp ? '<i class="fa-solid fa-phone"></i> '+maskData(w.telp,4) : ''}</small><small style='color:#7c3aed;'>${w.pekerjaan ? ' | '+w.pekerjaan+(w.pendapatan?' &bull; '+w.pendapatan:'') : ''}</small>
                    </div>
                </td>
                <td>
                    <div style="min-width: 150px; white-space: normal; word-break: break-word; line-height: 1.4;">
                        <b>${w.alamat}</b>
                    </div>
                </td>
                <td>
                    <div style="min-width: 150px; white-space: normal; word-break: break-word; line-height: 1.4;">
                        Istri: <b>${w.istri||'-'}</b><br>Anak: <small>${listAnak}</small>
                    </div>
                </td>
                <td style="white-space:nowrap; min-width: 130px;">
                    <button class="btn-table btn-tbl-view" onclick="lihatDetailKK('${w.id}')"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-table btn-tbl-edit" onclick="editKKAdmin('${w.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-table btn-tbl-del" onclick="hapusKKAdmin('${w.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`; 
        }); 
    };

    window.editKKAdmin = function(id) { 
        let db = JSON.parse(localStorage.getItem('db_warga')) || []; 
        let w = db.find(x => String(x.id) === String(id)); 
        if(w) { 
            document.getElementById('adm-kk-id').value = w.id; document.getElementById('adm-kk-nama').value = w.nama||''; document.getElementById('adm-kk-nokk').value = w.kk||''; document.getElementById('adm-kk-nik').value = w.nik||''; if(document.getElementById('adm-kk-pekerjaan')) document.getElementById('adm-kk-pekerjaan').value = w.pekerjaan||''; if(document.getElementById('adm-kk-pendapatan')) { document.getElementById('adm-kk-pendapatan').value = w.pendapatan||''; var pg = document.getElementById('adm-pendapatan-group'); if(pg) pg.style.display = (w.pekerjaan && w.pekerjaan !== '') ? 'block' : 'none'; } document.getElementById('adm-kk-telp').value = w.telp||''; document.getElementById('adm-kk-istri').value = w.istri||''; document.getElementById('adm-kk-alamat').value = w.alamat||''; document.getElementById('adm-container-anak').innerHTML = ''; if(document.getElementById('adm-kk-aktif')) document.getElementById('adm-kk-aktif').checked = (w.aktif !== false); if(document.getElementById('adm-kk-status-sosial')) document.getElementById('adm-kk-status-sosial').value = w.statusSosial||'Umum'; 
            if(w.anak) { w.anak.forEach(a => { let d = document.createElement('div'); d.innerHTML = `<input type="text" class="adm_anak" value="${a}" style="margin-top:10px; width:100%; padding:14px 18px; border:2px solid #e2e8f0; border-radius:12px;">`; document.getElementById('adm-container-anak').appendChild(d); }); } 
            tampilFormKKAdmin(true); window.scrollTo({top: 0}); 
        } 
    };

    window.hapusKKAdmin = function(id) { 
        Swal.fire({title:'Hapus Data?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ef4444'}).then(r => { 
            if(r.isConfirmed) { 
                let db = JSON.parse(localStorage.getItem('db_warga')) || []; 
                db = db.filter(x => String(x.id) !== String(id)); 
                localStorage.setItem('db_warga', JSON.stringify(db)); 
                loadTabelKKAdmin(); 
                if(typeof syncSemuaData==='function') syncSemuaData(true);
                Toast.fire({icon:'success',title:'Terhapus'}); 
            } 
        }); 
    };

    window.lihatDetailKK = function(id) {
        if (typeof window.lihatProfilWarga === 'function') {
            window.lihatProfilWarga(id);
        }
    };
    // === 6. PENGURUS RT ===
    let editPengurusId = null;
    // === Fungsi Penangkap Form & Foto Pengurus ===
    window.simpanPengurus = function(e) {
        e.preventDefault(); // INI MANTRA ANTI-REFRESH (FORCE CLOSE)
        
        let f = document.getElementById('org-foto').files[0];
        if(f) {
            let r = new FileReader();
            r.onload = function(evt) {
                prosesSimpanPengurus(evt.target.result); // Lanjut simpan dengan foto
            };
            r.readAsDataURL(f);
        } else {
            prosesSimpanPengurus(''); // Lanjut simpan tanpa foto
        }
    };
    window.simpanDeskripsiPengurus = function() { localStorage.setItem('db_pengurus_desc', document.getElementById('org-deskripsi-input').value); syncSemuaData(); Toast.fire({icon: 'success', title: 'Disimpan!'}); };
    
    window.prosesSimpanPengurus = function(foto) { 
        let db = JSON.parse(localStorage.getItem('db_pengurus')) || []; 
        let j = document.getElementById('org-jabatan').value, 
            n = document.getElementById('org-nama').value, 
            k = document.getElementById('org-kategori').value; 
        
        if(editPengurusId) { 
            let idx = db.findIndex(x => x.id === editPengurusId); 
            if(idx !== -1) { db[idx].jabatan = j; db[idx].nama = n; db[idx].kategori = k; db[idx].foto = foto; } 
        } else { 
            db.push({id: Date.now(), jabatan: j, nama: n, kategori: k, foto: foto}); 
        } 
        
        // 1. Simpan Lokal
        localStorage.setItem('db_pengurus', JSON.stringify(db)); 
        batalEditPengurus(); 
        
        // 2. Langsung Refresh Tampilan (Bagan langsung terbentuk!)
        if(typeof loadPengurus === 'function') loadPengurus();
        if(typeof syncSemuaData === 'function') syncSemuaData(true);
        Toast.fire({icon: 'success', title: 'Tersimpan Lokal!'});
    };
    window.batalEditPengurus = function() { editPengurusId = null; document.getElementById('form-struktur').reset(); document.getElementById('btn-cancel-org').style.display = 'none'; document.getElementById('btn-submit-org').innerHTML = '<i class="fa-solid fa-save"></i> Simpan'; };
    window.editPengurus = function(id) { let db = JSON.parse(localStorage.getItem('db_pengurus')) || []; let p = db.find(x => x.id === id); if(p){ document.getElementById('org-jabatan').value=p.jabatan; document.getElementById('org-nama').value=p.nama; document.getElementById('org-kategori').value=p.kategori||'Staf'; editPengurusId=id; document.getElementById('btn-cancel-org').style.display='block'; document.getElementById('btn-submit-org').innerHTML='<i class="fa-solid fa-save"></i> Update'; window.scrollTo({top:0}); } };
    window.hapusPengurus = function(id) { Swal.fire({ title: 'Hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }).then(r => { if(r.isConfirmed) { let db = JSON.parse(localStorage.getItem('db_pengurus')) || []; db = db.filter(x => x.id !== id); localStorage.setItem('db_pengurus', JSON.stringify(db)); syncSemuaData(); } }); };
    window.loadPengurus = function() {
    let db = JSON.parse(localStorage.getItem('db_pengurus')) || [];
    let desc = localStorage.getItem('db_pengurus_desc') || '';
    
    // Sinkronisasi Deskripsi
    if(document.getElementById('org-deskripsi-input')) document.getElementById('org-deskripsi-input').value = desc;
    if(document.getElementById('teks-deskripsi-struktur')) document.getElementById('teks-deskripsi-struktur').innerText = desc || 'Belum ada SK.';

    // 1. RENDER TABEL ADMIN
    let tb = document.getElementById('tbody-struktur-admin');
    if (tb) {
        tb.innerHTML = '';
        db.forEach((p, idx) => {
            let img = p.foto ? `<img src="${p.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : `<div style="width:40px;height:40px;border-radius:50%;background:#0369a1;color:white;display:flex;align-items:center;justify-content:center;">${p.nama.charAt(0)}</div>`;
            tb.innerHTML += `<tr><td>${idx+1}</td><td>${img}</td><td><b>${p.jabatan}</b><br><small>${p.kategori||'-'}</small></td><td>${p.nama}</td><td><button class="btn-table btn-tbl-edit" onclick="editPengurus(${p.id})"><i class="fa-solid fa-pen"></i></button><button class="btn-table btn-tbl-del" onclick="hapusPengurus(${p.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        });
    }

    // 2. RENDER STRUKTUR DI PORTAL WARGA
    let gw = document.getElementById('grid-struktur-warga');
    if(gw && db.length > 0){
        const rA = (p) => p.foto ? `<img src="${p.foto}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:4px solid #fff;">` : `<div class="premium-avatar">${p.nama==='-'?'?':p.nama.charAt(0)}</div>`;
        
        // Cari Pengurus Inti
        let k = db.find(p => p.kategori === 'Ketua') || {jabatan:'Ketua', nama:'-', kategori:'Ketua'};
        let s = db.find(p => p.kategori === 'Sekretaris') || {jabatan:'Sekretaris', nama:'-', kategori:'Sekretaris'};
        let b = db.find(p => p.kategori === 'Bendahara') || {jabatan:'Bendahara', nama:'-', kategori:'Bendahara'};
        
        // --- PERBAIKAN DI SINI ---
        // Kita ambil SEMUA yang bukan Ketua, Sekretaris, atau Bendahara agar Div. Sosial muncul
        let st = db.filter(p => !['Ketua', 'Sekretaris', 'Bendahara'].includes(p.kategori));
        // -------------------------

        let stH = '';
        if(st.length > 0){
            stH = `<div class="premium-children">`;
            st.forEach(x => {
                stH += `<div class="premium-node"><div class="premium-org-card">${rA(x)}<p class="premium-name">${x.nama}</p><p class="premium-role">${x.jabatan}</p></div></div>`;
            });
            stH += `</div>`;
        }

        // Tampilkan ke layar
        gw.innerHTML = `
            <div class="premium-level-row">
                <div class="premium-org-card">${rA(k)}<p class="premium-name">${k.nama}</p><p class="premium-role">${k.jabatan}</p></div>
            </div>
            <div class="premium-level-row last-level">
                <div class="premium-children">
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div class="premium-node"><div class="premium-org-card">${rA(s)}<p class="premium-name">${s.nama}</p><p class="premium-role">${s.jabatan}</p></div></div>
                        ${stH} </div>
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div class="premium-node"><div class="premium-org-card">${rA(b)}<p class="premium-name">${b.nama}</p><p class="premium-role">${b.jabatan}</p></div></div>
                    </div>
                </div>
            </div>`;
    }
    // Render area PDF (admin info + warga viewer)
    try { if (typeof renderPengurusPdfAdmin === 'function') renderPengurusPdfAdmin(); } catch(_){}
    try { if (typeof renderPengurusPdfWarga === 'function') renderPengurusPdfWarga(); } catch(_){}
};

    // === 7. MUTASI, BERITA, AGENDA ===
    window.saveMutasi = function(e) { e.preventDefault(); let db = JSON.parse(localStorage.getItem('mutasi')) || []; let w = document.getElementById('m_nama'); if(!w.value) return Swal.fire('Gagal','Pilih nama warga!','warning'); let namaW = w.options[w.selectedIndex].text; db.push({ id: Date.now(), nama: namaW, status: document.getElementById('m_status').value, ket: document.getElementById('m_keterangan').value, tgl: document.getElementById('m_tanggal').value }); localStorage.setItem('mutasi', JSON.stringify(db)); e.target.reset(); if(typeof jQuery !== 'undefined') $(w).val('').trigger('change'); syncSemuaData(); Toast.fire({icon:'success',title:'Disimpan'}); };
    window.loadMutasi = function() { let db = JSON.parse(localStorage.getItem('mutasi')) || []; let tb = document.getElementById('tabel-mutasi'); if(!tb) return; tb.innerHTML = ''; db.forEach(m => { let badge = m.status === 'Datang' ? 'badge-masuk' : 'badge-keluar'; tb.innerHTML += `<tr><td><b>${m.nama}</b></td><td><span class="badge ${badge}">${m.status}</span></td><td>${m.ket}</td><td>${m.tgl}</td><td><button class="btn-table btn-tbl-del" onclick="hapusMutasi(${m.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`; }); };
    window.hapusMutasi = function(id) { Swal.fire({title:'Hapus data mutasi?',text:'Tindakan ini tidak dapat dibatalkan.',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Ya, Hapus',cancelButtonText:'Batal'}).then(r=>{ if(r.isConfirmed){ let db = JSON.parse(localStorage.getItem('mutasi')) || []; localStorage.setItem('mutasi', JSON.stringify(db.filter(x => x.id !== id))); syncSemuaData(); Toast.fire({icon:'success',title:'Data dihapus'}); } }); };

    window.saveBeritaAdmin = function(e) { e.preventDefault(); let f = document.getElementById('b_gambar').files[0]; if(f) { let r = new FileReader(); r.onload = function(evt) { prosesSimpanBerita(evt.target.result); }; r.readAsDataURL(f); } else { prosesSimpanBerita(''); } };
    window.prosesSimpanBerita = function(b64) { let db = JSON.parse(localStorage.getItem('db_berita')) || []; db.push({ id: Date.now(), kategori: document.getElementById('b_kategori').value, judul: document.getElementById('b_judul').value, isi: document.getElementById('b_isi').value, foto: b64, tgl: new Date().toLocaleDateString('id-ID') }); localStorage.setItem('db_berita', JSON.stringify(db)); document.getElementById('form-berita').reset(); if (typeof syncSemuaData === 'function') syncSemuaData(true); Swal.fire('Siap', 'Kabar disiarkan.', 'success'); };
    window.loadBeritaAdmin = function() { let db = JSON.parse(localStorage.getItem('db_berita')) || []; let tb = document.getElementById('tbody-admin-berita'); if(tb) { tb.innerHTML = ''; db.forEach(b => { tb.innerHTML += `<tr><td><span class="news-badge">${b.kategori}</span></td><td>${b.tgl}</td><td><b>${b.judul}</b></td><td><button class="btn-table btn-tbl-del" onclick="hapusBerita(${b.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`; }); } };
    // === 1. FUNGSI RENDER BERITA WARGA (RUNNING TEXT / MARQUEE) ===

    // === 1. FUNGSI RENDER BERITA WARGA (RUNNING TEXT / MARQUEE) ===
    window.loadBeritaWarga = function() {
        let db = JSON.parse(localStorage.getItem('db_berita')) || [];
        let c = document.getElementById('warga-berita-list');
        if(c) {
            c.innerHTML = '';
            if(db.length === 0) { 
                c.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">Belum ada berita/informasi.</p>'; 
                return; 
            }

            // Injeksi CSS Running Text Berita (Hanya ditambahkan 1 kali)
            if(!document.getElementById('css-running-berita')) {
                let style = document.createElement('style');
                style.id = 'css-running-berita';
                style.innerHTML = `
                    .berita-marquee-container { height: 380px; overflow: hidden; position: relative; }
                    .berita-marquee-content { display: flex; flex-direction: column; animation: scrollVertikalBerita 20s linear infinite; }
                    .berita-marquee-container:hover .berita-marquee-content { animation-play-state: paused; }
                    @keyframes scrollVertikalBerita { 0% { transform: translateY(100%); } 100% { transform: translateY(-150%); } }
                `;
                document.head.appendChild(style);
            }

            let htmlBerita = `<div class="berita-marquee-container"><div class="berita-marquee-content">`;
            
            // Urutkan dari berita terbaru
            db.slice().reverse().forEach(b => {
                // Potong teks jika terlalu panjang untuk tampilan depan
                let isiSingkat = b.isi.length > 90 ? b.isi.substring(0, 90) + '...' : b.isi;
                let img = b.foto ? `<img src="${b.foto}" style="width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom:12px; border: 1px solid #e2e8f0;">` : '';
                
                // Tambahkan aksi 'onclick' agar bisa ditekan
                htmlBerita += `
                <div class="news-item" onclick="bukaDetailBerita(${b.id})" style="cursor:pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    ${img}
                    <span class="news-badge">${b.kategori}</span>
                    <h3 style="margin: 10px 0 5px 0; color:var(--text-dark); font-size:1.1rem;">${b.judul}</h3>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 10px 0;"><i class="fa-regular fa-clock"></i> ${b.tgl}</p>
                    <p style="font-size:0.9rem; margin:0; color:var(--text-dark);">${isiSingkat} <br><b style="color:var(--primary-blue); font-size:0.85rem;">Baca selengkapnya & Berkomentar &raquo;</b></p>
                </div>`;
            });
            
            htmlBerita += `</div></div>`;
            c.innerHTML = htmlBerita;
        }
    };

    // === 2. FUNGSI BUKA DETAIL BERITA (POP-UP MODAL + TOMBOL WA) ===
    window.bukaDetailBerita = function(id) {
        let db = JSON.parse(localStorage.getItem('db_berita')) || [];
        let b = db.find(x => x.id === id);
        if(!b) return;

        let imgHTML = b.foto ? `<img src="${b.foto}" style="width:100%; max-height:300px; object-fit:contain; border-radius:12px; margin-bottom:15px; background:#f8fafc; border:1px solid #cbd5e1;">` : '';
        
        let modalHTML = `
        <div style="text-align:left; color:var(--text-dark);">
            ${imgHTML}
            <span class="news-badge">${b.kategori}</span>
            <h2 style="margin: 10px 0; font-size:1.5rem; color:var(--primary-dark);">${b.judul}</h2>
            
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px dashed #cbd5e1; padding-bottom:15px; margin-bottom:20px;">
                <p style="font-size:0.85rem; color:var(--text-muted); margin:0;"><i class="fa-regular fa-clock"></i> Dipublikasikan: ${b.tgl}</p>
                <button class="btn-action bg-green" onclick="shareWABerita('${b.judul.replace(/'/g, "\\'")}', '${b.tgl}', '${b.isi.replace(/'/g, "\\'").replace(/\n/g, " ").substring(0,100)}...')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-brands fa-whatsapp"></i> Bagikan WA
                </button>
            </div>
            
            <div style="line-height:1.7; font-size:1rem; margin-bottom:25px; padding-bottom: 25px; border-bottom: 2px solid #e2e8f0; text-align:justify;">
                ${b.isi.replace(/\n/g, '<br>')}
            </div>
            
            <h3 style="font-size:1.1rem; margin-bottom:15px;"><i class="fa-regular fa-comments" style="color:var(--primary-blue);"></i> Kolom Diskusi Warga</h3>
            
            <div id="komentar-container-${b.id}" style="max-height: 250px; overflow-y: auto; background: #f1f5f9; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
            </div>
            
            <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="input-komen-${b.id}" placeholder="Tulis komentar/tanggapan Anda..." style="flex:1; padding:12px 15px; border:2px solid #cbd5e1; border-radius:10px; outline:none; font-family:inherit;">
                <button onclick="kirimKomentar(${b.id})" style="background:var(--primary-blue); color:white; border:none; height:45px; width:50px; border-radius:10px; cursor:pointer; font-size:1.1rem; transition:0.3s;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>`;

        Swal.fire({
            html: modalHTML,
            width: 650,
            showConfirmButton: false,
            showCloseButton: true,
            didOpen: () => { 
                // Begitu pop-up terbuka, langsung panggil / muat komentar
                loadKomentarBerita(b.id); 
            }
        });
    };

    // === 3. MESIN LOAD & KIRIM KOMENTAR ===
    window.loadKomentarBerita = function(idBerita) {
        let dbKomen = JSON.parse(localStorage.getItem('db_komentar_berita')) || [];
        let komenBerita = dbKomen.filter(k => k.idBerita === idBerita);
        let c = document.getElementById(`komentar-container-${idBerita}`);
        if(!c) return;
        
        c.innerHTML = '';
        if(komenBerita.length === 0) {
            c.innerHTML = '<p style="text-align:center; color:#94a3b8; font-size:0.9rem; margin:10px 0;">Belum ada tanggapan. Jadilah yang pertama berkomentar!</p>';
            return;
        }
        
        komenBerita.forEach(k => {
            // Tampilan chat / komentar
            c.innerHTML += `
            <div style="background: white; padding: 12px 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; font-size:0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; align-items:center;">
                    <b style="color:var(--primary-dark); font-size:0.9rem;"><i class="fa-solid fa-circle-user"></i> ${k.nama}</b>
                    <small style="color:var(--text-muted); font-size:0.75rem;">${k.waktu}</small>
                </div>
                <div style="color:var(--text-dark); line-height:1.4;">${k.isi}</div>
            </div>`;
        });
        // Auto scroll ke paling bawah (komentar terbaru)
        c.scrollTop = c.scrollHeight; 
    };

    window.kirimKomentar = function(idBerita) {
        let input = document.getElementById(`input-komen-${idBerita}`);
        let isi = input.value.trim();
        if(!isi) return; // Cegah komentar kosong
        
        // Identifikasi Nama Pengirim
        let namaKomen = "Anonim";
        if (loggedInWarga && loggedInWarga.nama) {
            namaKomen = loggedInWarga.nama; // Nama warga yang login
        } else if (document.getElementById('user-name')) {
            namaKomen = document.getElementById('user-name').innerText; // Nama admin/tamu
        }

        let dbKomen = JSON.parse(localStorage.getItem('db_komentar_berita')) || [];
        let w = new Date();
        let waktuFormat = `${w.toLocaleDateString('id-ID')} - ${w.getHours().toString().padStart(2,'0')}:${w.getMinutes().toString().padStart(2,'0')}`;

        dbKomen.push({
            id: Date.now(),
            idBerita: idBerita,
            nama: namaKomen,
            isi: isi,
            waktu: waktuFormat
        });
        
        localStorage.setItem('db_komentar_berita', JSON.stringify(dbKomen));
        
        input.value = ''; // Kosongkan input
        loadKomentarBerita(idBerita); // Muat ulang daftar komentar
    };

    // === 4. FUNGSI LEMPAR BERITA KE WHATSAPP ===
    window.shareWABerita = function(judul, tgl, ringkasan) {
        let text = `*KABAR RT 005 TEGALSARI*\n\n*${judul}*\nDipublikasikan: ${tgl}\n\n"${ringkasan}"\n\nUntuk membaca selengkapnya dan ikut berdiskusi, silakan buka *Smart Portal RT 005*.`;
        let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };
    window.hapusBerita = function(id) { Swal.fire({title:'Hapus berita ini?',text:'Berita akan dihapus permanen.',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Ya, Hapus',cancelButtonText:'Batal'}).then(r=>{ if(r.isConfirmed){ let db = JSON.parse(localStorage.getItem('db_berita')) || []; localStorage.setItem('db_berita', JSON.stringify(db.filter(x => x.id !== id))); syncSemuaData(); Toast.fire({icon:'success',title:'Berita dihapus'}); } }); };
    // === MODUL AGENDA & KEGIATAN RT (UPDATE: EDIT, PREVIEW, RUNNING TEXT, WA, PDF) ===
    let editKegiatanId = null;

    window.saveKegiatan = function(e) {
        e.preventDefault();
        let db = JSON.parse(localStorage.getItem('kegiatan')) || [];
        let data = {
            no: document.getElementById('k_no').value,
            tglSurat: document.getElementById('k_tgl_surat').value,
            perihal: document.getElementById('k_perihal').value,
            tglAcara: document.getElementById('k_tgl_acara').value,
            waktu: document.getElementById('k_waktu').value,
            tempat: document.getElementById('k_tempat').value,
            uraian: document.getElementById('k_uraian').value
        };

        if(editKegiatanId) {
            // Proses Update / Revisi
            let idx = db.findIndex(x => x.id === editKegiatanId);
            if(idx !== -1) db[idx] = { id: editKegiatanId, ...data };
            editKegiatanId = null;
            Swal.fire('Berhasil', 'Agenda telah direvisi!', 'success');
        } else {
            // Proses Simpan Baru
            db.push({ id: Date.now(), ...data });
            Swal.fire('Berhasil', 'Agenda baru ditambahkan!', 'success');
        }
        
        localStorage.setItem('kegiatan', JSON.stringify(db));
        e.target.reset();
        syncSemuaData();
    };

    // Fitur Edit (Menarik data ke form)
    window.editKegiatan = function(id) {
        let db = JSON.parse(localStorage.getItem('kegiatan')) || [];
        let k = db.find(x => x.id === id);
        if(k) {
            document.getElementById('k_no').value = k.no || '';
            document.getElementById('k_tgl_surat').value = k.tglSurat || '';
            document.getElementById('k_perihal').value = k.perihal || '';
            document.getElementById('k_tgl_acara').value = k.tglAcara || '';
            document.getElementById('k_waktu').value = k.waktu || '';
            document.getElementById('k_tempat').value = k.tempat || '';
            document.getElementById('k_uraian').value = k.uraian || '';
            editKegiatanId = id;
            Swal.fire('Mode Edit Aktif', 'Silakan ubah data di form isian lalu klik Simpan.', 'info');
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    window.hapusKegiatan = function(id) {
        let db = JSON.parse(localStorage.getItem('kegiatan')) || [];
        localStorage.setItem('kegiatan', JSON.stringify(db.filter(x => x.id !== id)));
        syncSemuaData();
    };

    // Fungsi Render Admin & Warga
    window.loadKegiatan = function() {
        let db = JSON.parse(localStorage.getItem('kegiatan')) || [];
        
        // 1. Render Tabel Admin (Tambah Preview & Edit)
        let tb = document.getElementById('tabel-riwayat-kegiatan');
        if(tb) {
            tb.innerHTML = '';
            db.forEach(k => {
                tb.innerHTML += `<tr>
                    <td>${k.no}</td>
                    <td><b>${k.perihal}</b><br><small>${k.tglAcara}</small></td>
                    <td style="white-space:nowrap;">
                        <button class="btn-table btn-tbl-view" onclick="bukaDetailAgenda(${k.id})" title="Preview Undangan"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn-table btn-tbl-edit" onclick="editKegiatan(${k.id})" title="Revisi/Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-table btn-tbl-del" onclick="hapusKegiatan(${k.id})" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        }
        
        // 2. Render List Warga (Running Text Vertikal + Klik)
        let cw = document.getElementById('warga-agenda-list');
        if(cw) {
            cw.innerHTML = '';
            if(db.length === 0) { cw.innerHTML = '<p style="text-align:center; color:gray;">Belum ada agenda.</p>'; return; }
            
            // Injeksi CSS Running Text Otomatis
            if(!document.getElementById('css-running-agenda')) {
                let style = document.createElement('style');
                style.id = 'css-running-agenda';
                style.innerHTML = `
                    .agenda-marquee-container { height: 320px; overflow: hidden; position: relative; }
                    .agenda-marquee-content { display: flex; flex-direction: column; animation: scrollVertikal 15s linear infinite; }
                    .agenda-marquee-container:hover .agenda-marquee-content { animation-play-state: paused; }
                    @keyframes scrollVertikal { 0% { transform: translateY(100%); } 100% { transform: translateY(-100%); } }
                `;
                document.head.appendChild(style);
            }

            let htmlAgenda = `<div class="agenda-marquee-container"><div class="agenda-marquee-content">`;
            db.slice().reverse().forEach(k => {
                htmlAgenda += `
                <div class="agenda-item" onclick="bukaDetailAgenda(${k.id})" style="cursor:pointer; border-left: 4px solid var(--accent-gold); background: white;">
                    <div class="agenda-icon" style="background:#fef3c7; color:var(--accent-gold);"><i class="fa-solid fa-calendar-check"></i></div>
                    <div>
                        <h4 style="margin:0; font-size:1.05rem; color:var(--text-dark);">${k.perihal}</h4>
                        <p style="margin:5px 0 0 0; font-size:0.85rem; color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${k.tglAcara} | <i class="fa-regular fa-clock"></i> ${k.waktu}</p>
                    </div>
                </div>`;
            });
            htmlAgenda += `</div></div>`;
            cw.innerHTML = htmlAgenda;
        }
    };

    // Modal Detail (Muncul saat diklik oleh Admin / Warga)
    window.bukaDetailAgenda = function(id) {
        let db = JSON.parse(localStorage.getItem('kegiatan')) || [];
        let k = db.find(x => x.id === id);
        if(!k) return;

        let modalHTML = `
        <div style="text-align:left; font-size:0.95rem; line-height:1.6; color:#333;">
            <table style="width:100%; border:none; margin-bottom:15px;">
                <tr><td style="width:100px; padding:4px 0; border:none; font-weight:bold;">Tanggal</td><td style="border:none;">: ${k.tglAcara}</td></tr>
                <tr><td style="padding:4px 0; border:none; font-weight:bold;">Waktu</td><td style="border:none;">: ${k.waktu}</td></tr>
                <tr><td style="padding:4px 0; border:none; font-weight:bold;">Tempat</td><td style="border:none;">: ${k.tempat}</td></tr>
            </table>
            <div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                <b>Uraian Kegiatan:</b><br>${k.uraian ? k.uraian.replace(/\n/g, '<br>') : '-'}
            </div>
            <div style="margin-top:25px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="btn-action bg-blue" onclick="cetakUndanganResmi(${k.id})"><i class="fa-solid fa-file-pdf"></i> Cetak Undangan Resmi</button>
                <button class="btn-action bg-green" onclick="shareWAAgenda('${k.perihal.replace(/'/g, "\\'")}', '${k.tglAcara}', '${k.waktu}', '${k.tempat}')"><i class="fa-brands fa-whatsapp"></i> Bagikan WA</button>
            </div>
        </div>`;

        Swal.fire({ title: k.perihal, html: modalHTML, width: 600, showConfirmButton: false, showCloseButton: true });
    };

    // Fitur Lempar Teks ke WhatsApp
    window.shareWAAgenda = function(perihal, tgl, waktu, tempat) {
        let text = `*UNDANGAN RESMI RT 005/RW 012*\n\nPerihal: *${perihal}*\nTanggal: ${tgl}\nWaktu: ${waktu}\nTempat: ${tempat}\n\nUntuk mengunduh surat undangan resmi dengan Kop Surat, Bapak/Ibu bisa melihatnya di Portal Smart RT.\n\nMohon kehadiran Bapak/Ibu tepat waktu. Terima kasih.`;
        let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Mesin PDF Undangan Kop Surat Resmi
    window.cetakUndanganResmi = function(id) {
        let db = JSON.parse(localStorage.getItem('kegiatan')) || [];
        let k = db.find(x => x.id === id);
        if(!k) return;

        let s = JSON.parse(localStorage.getItem('db_settings')) || {};
        let namaRT = s.namaRT || "Bapak Kasimin";
        let namaRW = s.namaRW || "Bapak Mulyono";

        let htmlCetak = `
        <div style="width: 210mm; min-height: 297mm; padding: 20mm; box-sizing: border-box; background: white; color: black; font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 0 auto; position:relative;">
            <div style="display: flex; align-items: center; border-bottom: 4px double black; padding-bottom: 10px; margin-bottom: 20px;">
                <img src="/Lambang_Kota_Semarang.png" style="width: 80px; height: auto; filter: grayscale(100%); margin-right:20px;" onerror="this.src='/Lambang_Kota_Semarang.png'">
                <div style="flex: 1; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">KOTA SEMARANG</h2>
                    <h3 style="margin: 2px 0; font-size: 20px; font-weight:normal;">KECAMATAN CANDISARI</h3>
                    <h3 style="margin: 2px 0; font-size: 20px; font-weight:normal;">KELURAHAN TEGALSARI</h3>
                    <h3 style="margin: 2px 0; font-size: 20px; font-weight:normal;">RT. 005 / RW. 012</h3>
                </div>
                <div style="width:100px;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:25px; font-size:18px;">
                <div style="width:60%;">
                    <div>Nomor : <b>${k.no || '-'}</b></div>
                    <div>Lampiran : -</div>
                    <div style="font-weight:bold; text-decoration:underline; margin-top:5px;">Hal : Undangan Kegiatan</div>
                </div>
                <div style="text-align:right;">
                    <div>Semarang, <b>${k.tglSurat || new Date().toLocaleDateString('id-ID')}</b></div>
                    <div style="margin-top:15px;">Kepada Yth.<br><b>Seluruh Warga RT. 005</b><br>di -<br>&nbsp;&nbsp;&nbsp;&nbsp;<b style="text-decoration:underline;">Tempat</b></div>
                </div>
            </div>

            <p style="font-size:18px; margin-bottom:15px;">Dengan hormat,</p>
            <p style="font-size:18px; margin-bottom:15px; text-align:justify;">Bersama ini kami mengundang Bapak/Ibu/Saudara/i warga RT 005 untuk hadir dalam kegiatan <b>${k.perihal}</b>, yang insya Allah akan diselenggarakan pada:</p>
            
            <table style="width:90%; font-size:18px; border-collapse: collapse; margin-left:20px; margin-bottom:15px; border:none;">
                <tr><td style="width:150px; padding:6px 0; border:none;">Hari, Tanggal</td><td style="width:15px; border:none;">:</td><td style="border:none; font-weight:bold;">${k.tglAcara}</td></tr>
                <tr><td style="padding:6px 0; border:none;">Waktu</td><td style="border:none;">:</td><td style="border:none;">${k.waktu}</td></tr>
                <tr><td style="padding:6px 0; border:none;">Tempat</td><td style="border:none;">:</td><td style="border:none;">${k.tempat}</td></tr>
                <tr><td style="padding:6px 0; border:none; vertical-align:top;">Acara / Uraian</td><td style="border:none; vertical-align:top;">:</td><td style="border:none; vertical-align:top;">${k.uraian ? k.uraian.replace(/\n/g, '<br>') : '-'}</td></tr>
            </table>

            <p style="margin-top:20px; font-size:18px; text-align:justify;">Mengingat pentingnya acara tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu/Saudara/i tepat pada waktunya. Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.</p>

            <table style="width: 100%; text-align:center; font-size:18px; margin-top:50px; border:none;">
                <tr>
                    <td style="width:50%; vertical-align:top; border:none;">Mengetahui,<br>Ketua RW 012</td>
                    <td style="width:50%; vertical-align:top; border:none;">Hormat Kami,<br>Ketua RT. 005 / RW. 012</td>
                </tr>
                <tr><td style="height: 80px; border:none;"></td><td style="height: 80px; border:none;"></td></tr>
                <tr>
                    <td style="border:none;"><b style="text-decoration:underline;">${namaRW}</b></td>
                    <td style="border:none;"><b style="text-decoration:underline;">${namaRT}</b></td>
                </tr>
            </table>
        </div>`;

        let iframe = document.createElement('iframe');
        iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none';
        document.body.appendChild(iframe);
        let doc = iframe.contentWindow.document;
        let style = doc.createElement('style');
        style.innerHTML = "@page { size: A4; margin: 0; } body { margin: 0; background:white; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }";
        doc.head.appendChild(style);
        doc.title = 'Undangan_' + k.perihal.replace(/\s/g,'_');
        doc.body.innerHTML = htmlCetak;

        Swal.fire({ title: 'Mencetak Undangan...', text: 'Pastikan Destination diset ke "Save as PDF".', timer: 1200, showConfirmButton: false, didOpen: () => { Swal.showLoading(); } }).then(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => { document.body.removeChild(iframe); }, 2000);
        });
    };
    window.previewUndangan = function(id) { let db = JSON.parse(localStorage.getItem('kegiatan')) || []; let k = db.find(x => x.id === id); if(!k) return; document.getElementById('cetak_k_no').innerText = k.no; document.getElementById('cetak_k_perihal').innerText = k.perihal; document.getElementById('cetak_k_uraian').innerText = k.uraian; document.getElementById('cetak_k_tgl_acara').innerText = k.tglAcara; document.getElementById('cetak_k_waktu').innerText = k.waktu; document.getElementById('cetak_k_tempat').innerText = k.tempat; document.getElementById('area-cetak-kegiatan').style.display = 'block'; window.scrollTo({top: document.getElementById('area-cetak-kegiatan').offsetTop}); };
    window.downloadSuratJPEG = function() { html2canvas(document.querySelector("#surat-kegiatan-paper"), {scale:2}).then(c => { let l = document.createElement('a'); l.download = 'Undangan.jpg'; l.href = c.toDataURL('image/jpeg'); l.click(); }); };
    // === 8. SURAT & ADUAN
    // === LOGIC BARU: PENGAJUAN SURAT DENGAN PROGRESS BAR ===
    window.prosesAjukanSuratStep = function(e) {
        e.preventDefault();
        
        // 1. Ambil Data
        let data = {
            id: Date.now(),
            idWarga: loggedInWarga.id,
            namaWarga: loggedInWarga.nama,
            keperluan: document.getElementById('req_keperluan_lengkap').value,
            status: 'Menunggu',
            tgl: new Date().toLocaleDateString('id-ID')
        };

        // 2. Simpan ke database (localstorage)
        let db = JSON.parse(localStorage.getItem('db_req_surat')) || [];
        db.push(data);
        localStorage.setItem('db_req_surat', JSON.stringify(db));

        // 3. Animasi: Hilangkan Form, Munculkan Progress
        document.getElementById('form-pengajuan-surat').style.display = 'none';
        document.getElementById('tracking-surat-section').style.display = 'block';

        // 4. Jalankan Simulasi Progress (Visual saja untuk kepuasan warga)
        updateProgressBar(25); // Step 1 selesai
        
        Toast.fire({ icon: 'success', title: 'Data dikirim ke Pak RT!' });
    };

    function updateProgressTracker(status) {
    const step1 = document.getElementById('step-terkirim'); // Sesuaikan ID elemenmu
    const step2 = document.getElementById('step-proses');
    const step3 = document.getElementById('step-selesai');

    // Reset semua class active/completed dulu
    [step1, step2, step3].forEach(el => el.classList.remove('active', 'completed'));

    if (status === 'Selesai') {
        // Jika selesai, nyalakan semua sampai ujung
        step1.classList.add('completed');
        step2.classList.add('completed');
        step3.classList.add('completed', 'active');
        
        // Garis penghubung juga harus penuh warnanya
        document.querySelector('.progress-line').style.width = '100%'; 
    } else if (status === 'Proses RT') {
        step1.classList.add('completed');
        step2.classList.add('active');
        document.querySelector('.progress-line').style.width = '50%';
    } else {
        step1.classList.add('active');
        document.querySelector('.progress-line').style.width = '0%';
    }
}


    window.resetLayarSurat = function() {
        document.getElementById('form-pengajuan-surat').style.display = 'block';
        document.getElementById('tracking-surat-section').style.display = 'none';
        document.getElementById('req_keperluan_lengkap').value = '';
    };

    // Tambahkan pengisian form otomatis (dipanggil ulang oleh loadSuratWarga)
    // Guard supaya tidak crash saat skrip dimuat sebelum login.
    setTimeout(() => {
        if(!loggedInWarga) return;
        if(document.getElementById('req_nama')) document.getElementById('req_nama').value = loggedInWarga.nama || '';
        if(document.getElementById('req_nik')) document.getElementById('req_nik').value = loggedInWarga.nik || '-';
        if(document.getElementById('req_alamat')) document.getElementById('req_alamat').value = loggedInWarga.alamat || '-';
    }, 500);
    window.batalEditReqSurat = function() { document.getElementById('req_keperluan').value = ''; document.getElementById('btn-batal-req').style.display='none'; };
    window.accSurat = function(id) { let db = JSON.parse(localStorage.getItem('db_req_surat')) || []; let idx = db.findIndex(x=>x.id===id); if(idx!==-1){ db[idx].status='Selesai'; localStorage.setItem('db_req_surat',JSON.stringify(db)); syncSemuaData(); Toast.fire({icon:'success',title:'Di-Acc!'}); } };
    window.hapusSurat = function(id) { Swal.fire({title:'Hapus surat ini?',text:'Data surat akan dihapus permanen.',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Ya, Hapus',cancelButtonText:'Batal'}).then(r=>{ if(r.isConfirmed){ let db = JSON.parse(localStorage.getItem('db_req_surat')) || []; localStorage.setItem('db_req_surat', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); Toast.fire({icon:'success',title:'Surat dihapus'}); } }); };
    

    window.kirimAduanWarga = function(e) { e.preventDefault(); let f = document.getElementById('aduan-bukti').files[0]; if(f) { let r = new FileReader(); r.onload = function(evt) { prosesSimpanAduan(evt.target.result); }; r.readAsDataURL(f); } else { Swal.fire('Gagal', 'Wajib upload foto!', 'warning'); } };
    window.prosesSimpanAduan = function(b64) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let d = new Date(); let tFormat = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`; db.push({ id: Date.now(), tglAsli: tFormat, tglTampil: d.toLocaleDateString('id-ID'), idPelapor: loggedInWarga.id, namaPelapor: loggedInWarga.nama, kategori: document.getElementById('aduan-kategori').value, judul: document.getElementById('aduan-judul').value, isi: document.getElementById('aduan-isi').value, foto: b64, status: 'Menunggu' }); localStorage.setItem('db_aduan', JSON.stringify(db)); document.getElementById('aduan-judul').value=''; document.getElementById('aduan-isi').value=''; if (typeof syncSemuaData === 'function') syncSemuaData(true); Swal.fire('Terkirim!', 'Aduan masuk ke meja RT.', 'success'); if(typeof window.loadAduanWarga==='function') window.loadAduanWarga(); };
    window.lihatBuktiAduan = function(id) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let a = db.find(x=>x.id===id); if(a && a.foto) Swal.fire({ imageUrl: a.foto, width: 600 }); };
    window.updateStatusAduan = function(id, val) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let idx = db.findIndex(x=>x.id===id); if(idx!==-1) { db[idx].status=val; localStorage.setItem('db_aduan',JSON.stringify(db)); syncSemuaData(); Toast.fire({icon:'success',title:'Status Update!'}); } };
    window.hapusAduan = function(id) { Swal.fire({title:'Hapus aduan ini?',text:'Data aduan akan dihapus permanen.',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Ya, Hapus',cancelButtonText:'Batal'}).then(r=>{ if(r.isConfirmed){ let db = JSON.parse(localStorage.getItem('db_aduan')) || []; localStorage.setItem('db_aduan', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); Toast.fire({icon:'success',title:'Aduan dihapus'}); } }); };
    window.loadAduanWarga = function() { if(!loggedInWarga) return; let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let my = db.filter(x => String(x.idPelapor)===String(loggedInWarga.id)); let tb = document.getElementById('tbody-aduan-warga'); if(tb) { tb.innerHTML=''; my.forEach(a => { let bd = a.status==='Selesai'?'badge-selesai':(a.status==='Diproses'?'badge-proses':'badge-menunggu'); tb.innerHTML+=`<tr><td>${a.tglTampil}</td><td>${a.kategori}</td><td><b>${a.judul}</b></td><td><button class="btn-action bg-blue" onclick="lihatBuktiAduan(${a.id})"><i class="fa-solid fa-image"></i></button></td><td><span class="badge ${bd}">${a.status}</span></td></tr>`; }); } };
    window.loadAduanAdmin = function() { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let fb = document.getElementById('filter-bulan-aduan').value; let tb = document.getElementById('tbody-aduan-admin'); if(tb) { tb.innerHTML=''; if(fb!=='Semua') db=db.filter(x=>x.tglAsli.split('-')[1]===fb); db.forEach(a => { let s = `<select style="padding:6px;font-size:0.8rem;" onchange="updateStatusAduan(${a.id}, this.value)"><option value="Menunggu" ${a.status==='Menunggu'?'selected':''}>Menunggu</option><option value="Diproses" ${a.status==='Diproses'?'selected':''}>Diproses</option><option value="Selesai" ${a.status==='Selesai'?'selected':''}>Selesai</option></select>`; tb.innerHTML+=`<tr><td><b>${a.tglTampil}</b><br><small>${a.namaPelapor}</small></td><td>${a.kategori}</td><td><b>${a.judul}</b><br><small>${a.isi}</small></td><td><button class="btn-action bg-blue" onclick="lihatBuktiAduan(${a.id})"><i class="fa-solid fa-image"></i></button> <button class="btn-table btn-tbl-del" onclick="hapusAduan(${a.id})"><i class="fa-solid fa-trash"></i></button></td><td>${s}</td></tr>`; }); } };
    window.cetakRekapAduan = function() {
        let db = JSON.parse(localStorage.getItem('db_aduan')) || [];
        let fb = (document.getElementById('filter-bulan-aduan')||{}).value || 'Semua';
        if (fb !== 'Semua') db = db.filter(x => (x.tglAsli||'').split('-')[1] === fb);
        if (!db.length) return Swal.fire('Kosong','Belum ada aduan untuk periode ini.','info');
        let settings = JSON.parse(localStorage.getItem('db_settings')) || { namaRT:'Bapak Kasimin' };
        let tgl = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
        let rows = db.map((a,i) => '<tr><td style="border:1px solid #000000;padding:8px;text-align:center;">'+(i+1)+'</td>'+
            '<td style="border:1px solid #000;">'+(a.tglTampil||'-')+'</td>'+
            '<td style="border:1px solid #000;"><b>'+(a.namaPelapor||'-')+'</b></td>'+
            '<td style="border:1px solid #000;">'+(a.kategori||'-')+'</td>'+
            '<td style="border:1px solid #000;"><b>'+(a.judul||'-')+'</b><br><small>'+(a.isi||'')+'</small></td>'+
            '<td style="border:1px solid #000; text-align:center;">'+(a.status||'-')+'</td></tr>').join('');
        let html = '<div class="letter-paper" style="padding:0;">'+
            '<div class="kop-surat-resmi"><img src="/Lambang_Kota_Semarang.png" style="width:70px; filter:grayscale(100%);">'+
            '<div style="flex:1; text-align:center;"><h2 style="margin:0; font-size:1.3rem; font-weight:bold; text-transform:uppercase;">PENGURUS RT 005 / RW 012</h2>'+
            '<h3 style="margin:2px 0; font-size:1rem; font-weight:normal;">KELURAHAN TEGALSARI &bull; CANDISARI &bull; SEMARANG</h3></div></div>'+
            '<hr style="border:0; border-top:3px solid black;"><h3 style="text-align:center; text-decoration:underline;">REKAPITULASI ADUAN WARGA ('+fb+')</h3>'+
            '<p>Berikut rekap aduan warga periode '+fb+', dicetak '+tgl+':</p>'+
            '<table style="width:100%; border-collapse:collapse; font-size:0.85rem;"><thead><tr style="background:#eee;">'+
            '<th style="border:1px solid #000;">No</th><th style="border:1px solid #000;">Tanggal</th><th style="border:1px solid #000;">Pelapor</th>'+
            '<th style="border:1px solid #000;">Kategori</th><th style="border:1px solid #000;">Aduan</th><th style="border:1px solid #000;">Status</th>'+
            '</tr></thead><tbody>'+rows+'</tbody></table>'+
            '<div style="margin-top:40px; text-align:right;">Semarang, '+tgl+'<br>Ketua RT. 005<br><br><br><br><b style="text-decoration:underline;">'+settings.namaRT+'</b></div>'+
            '</div>';
        printViaIframe(html, 'Rekap_Aduan_'+fb);
    };

    // === 9. KEUANGAN (BENDAHARA & KOPERASI) ===
    window.simpanSaldoAwal = function() { localStorage.setItem('db_saldo_awal', document.getElementById('ben-saldo-awal-input').value); syncSemuaData(); Toast.fire({icon:'success',title:'Dikunci'}); };
    window.simpanKas = function(e) { e.preventDefault(); let db = JSON.parse(localStorage.getItem('db_kas')) || []; db.push({ id: Date.now(), tgl: document.getElementById('ben-tgl').value, uraian: document.getElementById('ben-desc').value, tipe: document.getElementById('ben-tipe').value, nominal: parseInt(document.getElementById('ben-amt').value) }); localStorage.setItem('db_kas', JSON.stringify(db)); localStorage.setItem('ts_kas', new Date().toISOString()); e.target.reset(); if (typeof syncSemuaData === 'function') syncSemuaData(true); Toast.fire({icon:'success',title:'Disimpan'}); };
    // Helper nominal berdasarkan periode historis
    window.getNominalByBulan = function(bulan) {
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                     'Juli','Agustus','September','Oktober','November','Desember'];
        // Periode lama: Sep 2025 - Mei 2026 = 20.000
        var periodeLama = [
            'September 2025','Oktober 2025','November 2025','Desember 2025',
            'Januari 2026','Februari 2026','Maret 2026','April 2026','Mei 2026'
        ];
        if (periodeLama.indexOf(bulan) !== -1) return 20000;
        // Selain itu pakai nominal dari settings (dinamis)
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        return Number(dbSettings.nominalIuran) || 25000;
    };



    window.lihatKartuWarga = function(idWarga) {
        try {
            let dbIuran = JSON.parse(localStorage.getItem('db_iuran')) || [];
            let dbWarga = JSON.parse(localStorage.getItem('db_warga')) || [];
            
            // Cari data warga dengan sistem toleransi (kebal tipe data ID)
            let warga = dbWarga.find(x => String(x.id) === String(idWarga));
            
            if(!warga) {
                return Swal.fire('Data Tidak Ditemukan', 'Mohon maaf, data warga ini kosong atau telah terhapus.', 'error');
            }

            // Ambil riwayat iuran khusus warga ini
            let myIuran = dbIuran.filter(x => String(x.idWarga) === String(idWarga));
            
            // Mesin format Rupiah internal yang kebal error
            const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

            let htmlContent = `<div style="text-align:left; font-size:0.95rem;">`;
            
            if(myIuran.length === 0) {
                htmlContent += `<div style="padding:20px; text-align:center; background:#f1f5f9; border-radius:10px; color:#64748b; margin-top:10px;">
                    <i class="fa-solid fa-folder-open" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i><br>
                    Warga ini belum memiliki riwayat pembayaran iuran.
                </div>`;
            } else {
                htmlContent += `<table style="width:100%; border-collapse:collapse; margin-top:10px;">
                    <tr style="border-bottom:2px solid #cbd5e1;">
                        <th style="padding:8px 0; text-align:left; background:transparent;">Bulan & Status</th>
                        <th style="padding:8px 0; text-align:left; background:transparent;">Tgl Bayar</th>
                        <th style="padding:8px 0; text-align:right; background:transparent;">Nominal</th>
                    </tr>`;
                
                let total = 0;
                
                // Urutkan riwayat dari yang paling baru
                myIuran.sort((a,b) => b.id - a.id).forEach(i => {
                    let nom = Number(i.nominal) || 0;
                    total += nom;
                    
                    // Label Status Keren
                    let statusBadge = i.posted 
                        ? '<span style="background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:bold;"><i class="fa-solid fa-check-double"></i> MASUK KAS</span>' 
                        : '<span style="background:#fef08a; color:#854d0e; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:bold;"><i class="fa-solid fa-clock"></i> BENDAHARA</span>';
                    
                    htmlContent += `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:10px 0; border:none;"><b>${i.bulan}</b> <br> ${statusBadge}</td>
                        <td style="padding:10px 0; border:none; font-size:0.85rem; color:var(--text-muted);">${i.tglBayar || '-'}</td>
                        <td style="padding:10px 0; border:none; text-align:right; font-weight:bold; color:var(--primary-dark);">${formatRp(nom)}</td>
                    </tr>`;
                });
                
                htmlContent += `
                    <tr style="border-top:2px solid #cbd5e1; background:#f8fafc;">
                        <td colspan="2" style="padding:15px 10px; border:none; font-weight:900; text-align:right;">TOTAL LUNAS: </td>
                        <td style="padding:15px 0; border:none; font-weight:900; text-align:right; color:var(--success); font-size:1.1rem;">${formatRp(total)}</td>
                    </tr>
                </table>`;
            }
            htmlContent += `</div>`;
            
            // Luncurkan Pop-Up Kartu
            Swal.fire({ 
                title: `<div style="border-bottom:2px solid #0ea5e9; padding-bottom:10px; display:inline-block;"><i class="fa-solid fa-id-card" style="color:#0ea5e9;"></i> Kartu Digital</div><br><span style="font-size:1.2rem; font-weight:900;">${warga.nama}</span><br><span style="display:inline-flex; align-items:center; gap:6px; margin-top:6px; padding:3px 10px; border-radius:999px; font-size:0.75rem; font-weight:700; ${warga.aktif===false ? 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;' : 'background:#dcfce7; color:#166534; border:1px solid #86efac;'}"><span style="width:8px; height:8px; border-radius:50%; ${warga.aktif===false ? 'background:#dc2626;' : 'background:#16a34a;'}"></span>${warga.aktif===false ? 'Tidak Aktif di Wilayah' : 'Aktif di Wilayah'}</span>`, 
                html: htmlContent, 
                width: 500, 
                confirmButtonColor: '#0ea5e9', 
                confirmButtonText: '<i class="fa-solid fa-check"></i> Tutup Kartu' 
            });
            
        } catch (error) {
            console.error("Mesin Kartu Error:", error);
            Swal.fire('Terjadi Kesalahan', 'Sistem gagal membaca kartu warga. Mohon refresh halaman.', 'error');
        }
    };
    // === MESIN POSTING IURAN KE KAS UTAMA (ANTI-MACET) ===
    window.postingIuranKeKas = function() { 
        try {
            let dbIuran = JSON.parse(localStorage.getItem('db_iuran')) || []; 
            let unposted = dbIuran.filter(x => !x.posted); 
            
            if(unposted.length === 0) {
                return Swal.fire('Info', 'Belum ada iuran baru yang tertahan. Semua iuran sudah diposting ke Kas Utama!', 'info'); 
            }
            
            // Hitung total uang yang masih ditahan Bendahara
            let total = unposted.reduce((s, i) => s + (Number(i.nominal) || 0), 0); 
            
            // Baca komponen iuran dari db_jenis_iuran (dynamic)
            let jiPosting = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
            if (!jiPosting.length) jiPosting = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
            let totalPerBulan = jiPosting.reduce(function(s,x){ return s+(x.nominal||0); }, 0) || 20000;

            // Format Rupiah yang aman
            const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

            // Build detail HTML per komponen dynamic
            let detailHtmlPosting = jiPosting.map(function(ji, idx) {
                let jml = Math.round((ji.nominal / totalPerBulan) * total);
                return '<div style="margin-bottom:8px;"><b>' + ji.nama + ':</b>' +
                       '<span style="color:var(--primary-blue);font-weight:900;float:right;">' + formatRp(jml) + '</span></div>';
            }).join('');
            Swal.fire({
                title: 'Posting ' + formatRp(total) + ' ke Kas?',
                html: '<div style="text-align:left;background:#f8fafc;padding:15px;border-radius:10px;border:1px solid #cbd5e1;margin-top:10px;">' +
                      '<p style="margin-top:0;font-size:0.9rem;font-weight:bold;">Sistem akan memecah otomatis ke Buku Kas:</p>' +
                      detailHtmlPosting + '</div>',
                showCancelButton: true, 
                confirmButtonColor: '#10b981', 
                cancelButtonText: 'Batal',
                confirmButtonText: '<i class="fa-solid fa-share-nodes"></i> Ya, Pecah & Posting!'
            }).then(r => { 
                if(r.isConfirmed) { 
                    let dbKas = JSON.parse(localStorage.getItem('db_kas')) || []; 
                    let tglSkrg = new Date().toISOString().split('T')[0]; 
                    
                    // Suntikkan per komponen ke Buku Kas
                    jiPosting.forEach(function(ji, idx) {
                        let jml = Math.round((ji.nominal / totalPerBulan) * total);
                        if (jml > 0) dbKas.push({ id: Date.now()+idx, tgl: tglSkrg, uraian: 'Setoran Iuran ('+ji.nama+')', tipe: 'masuk', nominal: jml });
                    }); 
                    
                    localStorage.setItem('db_kas', JSON.stringify(dbKas)); 
                    
                    // Tandai semua iuran menjadi SUDAH diposting (Masuk Kas)
                    unposted.forEach(x => x.posted = true); 
                    localStorage.setItem('db_iuran', JSON.stringify(dbIuran)); 
                    
                    // Segarkan seluruh tampilan
                    if(typeof syncSemuaData === 'function') syncSemuaData(); 
                    
                    Swal.fire('Berhasil!', 'Uang Kas berhasil dipecah otomatis dan masuk ke Buku Kas Utama!', 'success'); 
                } 
            }); 
        } catch(err) {
            console.error("Error Posting Kas:", err);
            Swal.fire('Error', 'Terjadi kesalahan sistem saat memproses data. Mohon refresh halaman.', 'error');
        }
    };
    // === MESIN CATATAN IURAN PRIBADI WARGA (FITUR HIDE & SEEK KLIK) ===
    window.loadIuranPribadiWarga = function() {
        if(!loggedInWarga) return;
        
        // === Banner bebas iuran untuk warga Janda/Duda ===
        var dbWarga = JSON.parse(localStorage.getItem('db_warga')) || [];
        var wData = dbWarga.find(function(w){ return String(w.id) === String(loggedInWarga.id); });
        var statusSosial = wData ? (wData.statusSosial || 'Umum') : 'Umum';
        var bebasIuran = statusSosial !== 'Umum' && (statusSosial.includes('Janda') || statusSosial.includes('Duda'));
        var bannerEl = document.getElementById('banner-bebas-iuran');
        if(bannerEl) bannerEl.style.display = bebasIuran ? 'flex' : 'none';
        
        let dbIuran = JSON.parse(localStorage.getItem('db_iuran')) || [];
        let myIuran = dbIuran.filter(x => String(x.idWarga) === String(loggedInWarga.id));
        
        let tb = document.getElementById('tbody-iuran-pribadi');
        let tTotal = document.getElementById('w_prof_total_iuran');
        
        if(tb) {
            tb.innerHTML = '';
            let total = 0;
            
            if(myIuran.length === 0) {
                tb.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada riwayat pembayaran iuran bulan ini.</td></tr>';
                if(tTotal) tTotal.innerText = 'Rp 0';
                return;
            }
            
            myIuran.sort((a,b) => b.id - a.id).forEach((i, index) => {
                let nom = Number(i.nominal) || 0;
                total += nom;
                
                let p1 = (10000 / 20000) * nom;
                let p2 = (5000 / 20000) * nom;
                let p3 = (5000 / 20000) * nom;
                
                let badgeStatus = i.posted 
                    ? `<span class="badge badge-masuk"><i class="fa-solid fa-check-double"></i> Valid</span>`
                    : `<span class="badge badge-menunggu"><i class="fa-solid fa-clock"></i> Proses</span>`;
                
                // ID unik untuk fitur hide and seek
                let detailRowId = `rincian-iuran-${index}`;
                let iconId = `icon-iuran-${index}`;
                    
                tb.innerHTML += `
                <tr style="cursor:pointer; transition:0.3s;" onclick="toggleHideSeekIuran('${detailRowId}', '${iconId}')" onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='transparent'">
                    <td><b style="color:var(--text-dark); font-size:1.05rem;">${i.bulan}</b> <i id="${iconId}" class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--primary-blue); margin-left:8px; transition:0.3s;"></i></td>
                    <td style="color:var(--text-muted); font-size:0.9rem;">${i.tglBayar}</td>
                    <td><b style="color:var(--primary-dark); font-size:1.1rem;">${fmt(nom)}</b></td>
                    <td>${badgeStatus}</td>
                </tr>
                
                <tr id="${detailRowId}" style="display:none; background:#f8fafc;">
                    <td colspan="4" style="padding:15px 25px; border-left:4px solid var(--primary-blue); border-bottom:1px solid #cbd5e1;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="font-size:0.9rem; color:var(--text-dark); width: 300px;">
                                <div style="margin-bottom:8px; display:flex; justify-content:space-between;"><span><i class="fa-solid fa-screwdriver-wrench" style="color:var(--success); width:20px;"></i> Pembangunan</span> <b>${fmt(p1)}</b></div>
                                <div style="margin-bottom:8px; display:flex; justify-content:space-between;"><span><i class="fa-solid fa-chair" style="color:var(--accent-gold); width:20px;"></i> Uang Meja</span> <b>${fmt(p2)}</b></div>
                                <div style="display:flex; justify-content:space-between;"><span><i class="fa-solid fa-flag" style="color:var(--danger); width:20px;"></i> 17 Agustus</span> <b>${fmt(p3)}</b></div>
                            </div>
                            <div style="text-align:right; font-size:0.8rem; color:var(--text-muted);">
                                <i class="fa-solid fa-hand-pointer"></i> Klik baris lagi untuk menutup
                            </div>
                        </div>
                    </td>
                </tr>`;
            });
            
            if(tTotal) tTotal.innerText = fmt(total);
        }
    };

    // Fungsi Penggerak Animasi Buka-Tutup (Hide and Seek)
    window.toggleHideSeekIuran = function(detailId, iconId) {
        let barisDetail = document.getElementById(detailId);
        let ikonPanah = document.getElementById(iconId);
        
        if (barisDetail.style.display === 'none') {
            barisDetail.style.display = 'table-row';       // Buka Rincian
            ikonPanah.style.transform = 'rotate(180deg)';  // Putar Panah ke Atas
        } else {
            barisDetail.style.display = 'none';            // Tutup Rincian
            ikonPanah.style.transform = 'rotate(0deg)';    // Putar Panah ke Bawah
        }
    };
    // === FUNGSI RENDER TABEL ADMIN (SUDAH 4 KOLOM PAS) ===
    window.loadDaruratAdmin = function() {
        let db = JSON.parse(localStorage.getItem('db_darurat')) || [];
        let ca = document.getElementById('tbody-admin-darurat');
        if(ca) {
            ca.innerHTML = '';
            if(db.length === 0) { 
                ca.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada kontak darurat.</td></tr>'; 
                return; 
            }
            db.forEach(d => {
                // Membuat Ikon WA dan Maps (Nyala Hijau/Biru jika ada isinya, Abu-abu jika kosong)
                let linkWA = d.wa ? `<a href="https://wa.me/${d.wa}" target="_blank" style="color:#10b981; margin-right:15px; font-size:1.2rem;" title="WhatsApp Aktif"><i class="fa-brands fa-whatsapp"></i></a>` : `<span style="color:#cbd5e1; margin-right:15px; font-size:1.2rem;" title="Tidak ada WA"><i class="fa-brands fa-whatsapp"></i></span>`;
                let linkMaps = d.maps ? `<a href="${d.maps}" target="_blank" style="color:#3b82f6; font-size:1.2rem;" title="Google Maps Aktif"><i class="fa-solid fa-map-location-dot"></i></a>` : `<span style="color:#cbd5e1; font-size:1.2rem;" title="Tidak ada Maps"><i class="fa-solid fa-map-location-dot"></i></span>`;

                ca.innerHTML += `
                <tr>
                    <td><b style="color:var(--text-dark);"><i class="fa-solid ${d.icon}" style="color:${d.color}; width:30px;"></i> ${d.nama}</b></td>
                    <td><b style="color:var(--primary-dark); font-size:1.1rem;">${d.telp}</b></td>
                    
                    <td>${linkWA} ${linkMaps}</td>
                    
                    <td style="white-space: nowrap;">
                        <button class="btn-table btn-tbl-edit" onclick="editDarurat(${d.id})" title="Edit Kontak"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-table btn-tbl-del" onclick="hapusDarurat(${d.id})" title="Hapus Kontak"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        }
    };

    // === FUNGSI POP-UP EDIT KONTAK ===
    window.editDarurat = function(id) {
        let db = JSON.parse(localStorage.getItem('db_darurat')) || [];
        let d = db.find(x => x.id === id);
        if(!d) return;

        Swal.fire({
            title: 'Edit Kontak Darurat',
            html: `
                <input id="swal-nama-edit" class="swal2-input" value="${d.nama}" placeholder="Nama Instansi" style="width: 80%; margin-bottom: 10px;">
                <input id="swal-telp-edit" class="swal2-input" value="${d.telp}" placeholder="Nomor Telepon" style="width: 80%; margin-bottom: 10px;">
                <input id="swal-wa-edit" class="swal2-input" value="${d.wa || ''}" placeholder="Nomor WhatsApp (Opsional)" style="width: 80%; margin-bottom: 10px;">
                <input id="swal-maps-edit" class="swal2-input" value="${d.maps || ''}" placeholder="Link Maps (Opsional)" style="width: 80%;">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-save"></i> Update Data',
            confirmButtonColor: '#f59e0b', // Warna Emas untuk Edit
            cancelButtonText: 'Batal',
            preConfirm: () => {
                let n = document.getElementById('swal-nama-edit').value;
                let t = document.getElementById('swal-telp-edit').value;
                let w = document.getElementById('swal-wa-edit').value;
                let m = document.getElementById('swal-maps-edit').value;
                if(!n || !t) { Swal.showValidationMessage('Nama dan Nomor Telepon wajib diisi!'); return false; }
                return { nama: n, telp: t, wa: w, maps: m };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let idx = db.findIndex(x => x.id === id);
                if(idx !== -1) {
                    db[idx].nama = result.value.nama;
                    db[idx].telp = result.value.telp;
                    db[idx].wa = result.value.wa;
                    db[idx].maps = result.value.maps;
                    localStorage.setItem('db_darurat', JSON.stringify(db));
                    if(typeof syncSemuaData === 'function') syncSemuaData();
                    Toast.fire({icon: 'success', title: 'Kontak Diperbarui'});
                }
            }
        });
    };
        // === FUNGSI SINKRONISASI (MODE LOKAL - TANPA GOOGLE SHEETS) ===
      window.syncSemuaData = async function(isAuto = false) {
          let dot = document.getElementById('sync-dot');
          let txt = document.getElementById('sync-text');
          let roots = [
              'main-app', 'login-screen', 'content-area', 'dashboard-warga', 'dashboard-admin',
              'form-warga', 'form-admin', 'form-kas', 'form-berita', 'form-surat', 'form-aduan',
              'form-mutasi', 'form-arisan', 'form-notulen', 'form-pengaturan', 'modal-container'
          ];
          let loaded = false;

          if(dot) { dot.style.background = 'var(--accent-gold)'; dot.style.color = 'var(--accent-gold)'; dot.style.boxShadow = '0 0 10px var(--accent-gold)'; dot.classList.remove('sync-success'); dot.classList.add('sync-syncing'); }
          if(txt) { txt.innerText = 'Menyinkron...'; txt.style.color = 'var(--accent-gold)'; }

          if(typeof populateDropdownWarga === 'function') { populateDropdownWarga(); loaded = true; }
          if(typeof loadTabelKKAdmin === 'function') { loadTabelKKAdmin(); loaded = true; }
          if(typeof loadPengurus === 'function') { loadPengurus(); loaded = true; }
          if(typeof loadDaruratAdmin === 'function') { loadDaruratAdmin(); loaded = true; }
          if(typeof loadDaruratWarga === 'function') { loadDaruratWarga(); loaded = true; }
          
          
          if(typeof loadKoperasiData === 'function') { loadKoperasiData(); loaded = true; }
          if(typeof loadBenLaporan === 'function') { loadBenLaporan(); loaded = true; }
          if(typeof loadAdminDashboard === 'function') { loadAdminDashboard(); loaded = true; }
          if(typeof loadDashboardWarga === 'function') { loadDashboardWarga(); loaded = true; }
          if(typeof loadAduanWarga === 'function') { loadAduanWarga(); loaded = true; }
          if(typeof loadAduanAdmin === 'function') { loadAduanAdmin(); loaded = true; }
          if(typeof loadSuratAdmin === 'function') { loadSuratAdmin(); loaded = true; }
          if(typeof loadSuratWarga === 'function') { loadSuratWarga(); loaded = true; }
          if(typeof loadMutasi === 'function') { loadMutasi(); loaded = true; }
          if(typeof loadBeritaAdmin === 'function') { loadBeritaAdmin(); loaded = true; }
          if(typeof loadBeritaWarga === 'function') { loadBeritaWarga(); loaded = true; }
          if(typeof loadKegiatan === 'function') { loadKegiatan(); loaded = true; }
          if(typeof loadProfilPribadiWarga === 'function') { loadProfilPribadiWarga(); loaded = true; }
          if(typeof loadFormArisan === 'function') { loadFormArisan(); loaded = true; }
          if(typeof loadNotulenAdmin === 'function') { loadNotulenAdmin(); loaded = true; }
          if(typeof loadPengaturan === 'function') { loadPengaturan(); loaded = true; }
          if(typeof loadIuranPribadiWarga === 'function') { loadIuranPribadiWarga(); loaded = true; }
          
          

          roots.forEach(id => {
              const el = document.getElementById(id);
              if (el && el.offsetParent !== null) {
                  el.dispatchEvent(new Event('refresh-data', { bubbles: true }));
              }
          });

          let nowSyncStr = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
          localStorage.setItem('ts_last_sync', new Date().toISOString());
          if(dot) { dot.style.background = 'var(--success)'; dot.style.color = 'var(--success)'; dot.style.boxShadow = '0 0 14px var(--success)'; dot.classList.remove('sync-syncing'); dot.classList.add('sync-success'); }
          if(txt) { txt.innerText = '✓ ' + nowSyncStr + ' WIB'; txt.style.color = 'var(--success)'; }
          setTimeout(function() {
              if(dot) { dot.style.background = '#3b82f6'; dot.style.boxShadow = '0 0 8px #3b82f6'; dot.classList.remove('sync-syncing','sync-success'); }
              if(txt) { txt.innerText = 'Siap'; txt.style.color = '#3b82f6'; }
          }, 4000);

          if(!isAuto && typeof Toast !== 'undefined') {
              Toast.fire({ icon: 'success', title: 'Data Diperbarui!' });
          }
          return true;
      };

      // Auto-refresh setiap 30 detik (ringan - hanya memperbarui tampilan)
      setInterval(() => { if(typeof syncSemuaData === 'function') syncSemuaData(true); }, 30000);
                // === 8. SISTEM SURAT PENGANTAR (AUTO-NOMOR & PDF A4) ===
    window.getAutoNomorSurat = function() {
        let count = parseInt(localStorage.getItem('surat_counter'));
        if (isNaN(count) || count < 178) count = 178; 
        let tglSkg = new Date();
        const roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
        return `${count}/RT.005/RW.012/${roman[tglSkg.getMonth()]}/${tglSkg.getFullYear()}`;
    };

    // Warga Mengirim Form & Menampilkan Progress Line
    window.submitSuratWarga = function(e) {
        e.preventDefault();
        let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
        db.push({
            id: Date.now(),
            idWarga: loggedInWarga.id,
            nama: document.getElementById('req_nama').value,
            nik: document.getElementById('req_nik').value,
            ttl: document.getElementById('req_ttl').value,
            agama: document.getElementById('req_agama').value,
            statusKawin: document.getElementById('req_status_kawin').value,
            pendidikan: document.getElementById('req_pendidikan').value,
            pekerjaan: document.getElementById('req_pekerjaan').value,
            alamat: document.getElementById('req_alamat').value,
            keperluan: document.getElementById('req_keperluan').value,
            status: 'Menunggu Acc',
            tglPengajuan: new Date().toLocaleDateString('id-ID'),
            noSurat: '-'
        });
        localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);
        
        // ANIMASI PROGRESS: Hilangkan form, munculkan progress
        document.getElementById('form-pengajuan-surat').style.display = 'none';
        document.getElementById('tracking-surat-section').style.display = 'block';
        
        // Reset Style Animasi
        document.getElementById('progress-line-fill').style.width = '0%';
        document.getElementById('step-2-icon').style.background = 'white'; document.getElementById('step-2-icon').style.color = '#cbd5e1'; document.getElementById('step-2-icon').style.boxShadow = '0 0 0 3px #cbd5e1';
        document.getElementById('step-2-text').style.color = 'var(--text-muted)';

        // Jalankan Garis Biru
        setTimeout(() => {
            document.getElementById('progress-line-fill').style.width = '50%';
            setTimeout(() => {
                document.getElementById('step-2-icon').style.background = 'var(--primary-blue)';
                document.getElementById('step-2-icon').style.color = 'white';
                document.getElementById('step-2-icon').style.boxShadow = '0 0 0 3px var(--primary-blue)';
                document.getElementById('step-2-text').style.color = 'var(--primary-dark)';
            }, 800);
        }, 200);

        e.target.reset();
        if(typeof loadSuratWarga === 'function') loadSuratWarga();
        
    };
    // Tombol untuk mengembalikan form ke awal
    window.resetFormSuratWarga = function() {
        document.getElementById('tracking-surat-section').style.display = 'none';
        document.getElementById('form-pengajuan-surat').style.display = 'block';
    };

    window.loadSuratWarga = function() {
        if(!loggedInWarga) return;
        setTimeout(() => {
            if(document.getElementById('req_nama') && !document.getElementById('req_nama').value) document.getElementById('req_nama').value = loggedInWarga.nama || '';
            if(document.getElementById('req_nik') && !document.getElementById('req_nik').value) document.getElementById('req_nik').value = loggedInWarga.nik || '';
            if(document.getElementById('req_alamat') && !document.getElementById('req_alamat').value) document.getElementById('req_alamat').value = loggedInWarga.alamat || '';
        }, 300);

        let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
        let my = db.filter(x => String(x.idWarga) === String(loggedInWarga.id));
        let tb = document.getElementById('tbody-riwayat-warga-baru');
        if(tb) {
            tb.innerHTML='';
            if(my.length === 0) { tb.innerHTML='<tr><td colspan="5" style="text-align:center;">Belum ada pengajuan.</td></tr>'; return; }
            my.reverse().forEach(s => {
                let badge = s.status === 'Selesai' ? 'badge-selesai' : 'badge-menunggu';
                let btnAction = s.status === 'Selesai' 
                    ? `<button class="btn-action bg-red" onclick="cetakPDFSurat(${s.id}, false)"><i class="fa-solid fa-file-pdf"></i> Download Asli</button>` 
                    : `<span style="color:#94a3b8;"><i class="fa-solid fa-hourglass-half"></i> Sedang Diproses</span>`;
                tb.innerHTML += `<tr><td>${s.tglPengajuan}</td><td><b style="color:var(--primary-dark);">${(s.keperluan||'').length>25?(s.keperluan||'').substring(0,25)+'...':s.keperluan||''}</b></td><td>${s.noSurat}</td><td><span class="badge ${badge}">${s.status}</span></td><td>${btnAction}</td></tr>`;
            });
        }
    };

    window.loadSuratAdmin = function() {
        let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
        let tb = document.getElementById('tbody-admin-surat-baru');
        if(tb) {
            tb.innerHTML='';
            if(db.length === 0) { tb.innerHTML='<tr><td colspan="5" style="text-align:center;">Belum ada antrean surat.</td></tr>'; return; }
            db.slice().reverse().forEach(s => {
                let badge = s.status === 'Selesai' ? 'badge-selesai' : 'badge-menunggu';
                let btnAction = '';
                if(s.status !== 'Selesai') {
                    btnAction = `<button class="btn-action bg-green" onclick="eksekusiSurat(${s.id})"><i class="fa-solid fa-check"></i> Acc & Buat Nomor</button> <button class="btn-table btn-tbl-del" onclick="hapusSuratPengajuan(${s.id})"><i class="fa-solid fa-trash"></i></button>`;
                } else {
                    btnAction = `<button class="btn-action bg-gold" onclick="cetakPDFSurat(${s.id}, true)"><i class="fa-solid fa-copy"></i> Download Salinan</button> <button class="btn-table btn-tbl-del" onclick="hapusSuratPengajuan(${s.id})"><i class="fa-solid fa-trash"></i></button>`;
                }
                tb.innerHTML += `<tr><td>${s.tglPengajuan}</td><td><b style="color:var(--primary-dark);">${s.nama}</b><br><small>NIK: ${s.nik}</small></td><td>${(s.keperluan||'').substring(0,30)}...</td><td><span class="badge ${badge}">${s.status}</span><br><b style="font-size:0.85rem; margin-top:5px; display:inline-block;">${s.noSurat}</b></td><td>${btnAction}</td></tr>`;
            });
        }
    };

    window.eksekusiSurat = function(id) {
        Swal.fire({ title: 'Setujui Pengajuan?', text: 'Sistem akan meng-generate nomor surat otomatis.', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Acc Sekarang!' }).then((result) => {
            if (result.isConfirmed) {
                let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
                let idx = db.findIndex(x => x.id === id);
                if(idx !== -1) {
                    db[idx].status = 'Selesai';
                    db[idx].noSurat = getAutoNomorSurat();
                    let count = parseInt(localStorage.getItem('surat_counter'));
                    if (isNaN(count) || count < 178) count = 178;
                    localStorage.setItem('surat_counter', count + 1);
                    localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
                    if(typeof syncSemuaData==='function') syncSemuaData(true);
                    if(typeof loadSuratAdmin === 'function') loadSuratAdmin();
                    Toast.fire({ icon: 'success', title: 'Surat Di-Acc!' });
                }
            }
        });
    };

    window.hapusSuratPengajuan = function(id) {
        Swal.fire({title:'Hapus pengajuan surat?',text:'Data surat akan dihapus permanen.',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Ya, Hapus',cancelButtonText:'Batal'}).then(r=>{
            if(r.isConfirmed){
                let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
                localStorage.setItem('db_req_surat_v2', JSON.stringify(db.filter(x => x.id !== id)));
                if(typeof syncSemuaData==='function') syncSemuaData(true);
                if(typeof loadSuratAdmin === 'function') loadSuratAdmin();
                Toast.fire({icon:'success',title:'Surat dihapus'});
            }
        });
    };

    // === MESIN CETAK PDF A4 ANTI BOCOR (VERSI OPTIMAL 1 HALAMAN) ===
window.cetakPDFSurat = function(id, isSalinan) {
    let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
    let dt = db.find(x => x.id === id);
    if(!dt) return Swal.fire('Error', 'Dokumen tidak ditemukan', 'error');

    let s = JSON.parse(localStorage.getItem('db_settings')) || {};
    let namaRT = s.namaRT || "Bapak Kasimin";
    let namaRW = s.namaRW || "Bapak Mulyono";
    
    // Watermark lebih soft agar tidak mengganggu keterbacaan
    let watermarkHTML = isSalinan ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(-35deg); font-size:120px; font-weight:900; color:rgba(0,0,0,0.07); z-index:0; pointer-events:none; white-space:nowrap; font-family:sans-serif;">SALINAN ARSIP</div>` : '';

    let htmlCetak = `
    <div style="width: 210mm; min-height: 297mm; padding: 15mm 20mm; box-sizing: border-box; background: white; color: black; font-family: 'Times New Roman', Times, serif; line-height: 1.3; margin: 0 auto; position:relative;">
        ${watermarkHTML}
        
        <div style="display: flex; align-items: center; border-bottom: 4px double black; padding-bottom: 8px; margin-bottom: 15px; z-index:2; position:relative;">
            <img src="/Lambang_Kota_Semarang.png" style="width: 75px; height: auto; filter: grayscale(100%); margin-right:20px;" onerror="this.src='/Lambang_Kota_Semarang.png'">
            <div style="flex: 1; text-align: center;">
                <h2 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">PEMERINTAH KOTA SEMARANG</h2>
                <h3 style="margin: 1px 0; font-size: 19px; font-weight:normal;">KECAMATAN CANDISARI</h3>
                <h3 style="margin: 1px 0; font-size: 19px; font-weight:normal;">KELURAHAN TEGALSARI</h3>
                <h3 style="margin: 1px 0; font-size: 19px; font-weight:bold;">RUKUN TETANGGA 005 / RUKUN WARGA 012</h3>
            </div>
            <div style="width:80px;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:17px; z-index:2; position:relative;">
            <div style="width:55%;">
                <div>Nomor : <b>${dt.noSurat}</b></div>
                <div>Lampiran : -</div>
                <div style="font-weight:bold; text-decoration:underline; margin-top:2px;">Hal : Surat Pengantar</div>
            </div>
            <div style="text-align:right;">
                <div>Semarang, <b>${dt.tglPengajuan}</b></div>
                <div style="margin-top:10px;">Kepada Yth.<br><b>Kepala Kelurahan Tegalsari</b><br>di -<br>&nbsp;&nbsp;&nbsp;&nbsp;<b style="text-decoration:underline;">SEMARANG</b></div>
            </div>
        </div>

        <p style="font-size:17px; margin-bottom:10px; z-index:2; position:relative;">Bersama ini menerangkan bahwa :</p>
        
        <table style="width:100%; font-size:17px; border-collapse: collapse; z-index:2; position:relative; margin-left: 10px;">
            <tr><td style="width:200px; padding:4px 0; vertical-align:top; border:none;">1. Nama</td><td style="width:15px; vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; font-weight:bold; vertical-align:top;">${dt.nama}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">2. Tempat / Tgl Lahir</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; vertical-align:top;">${dt.ttl}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">3. Kewarganegaraan/Agama</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; vertical-align:top;">${dt.agama}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">4. Status Perkawinan</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; vertical-align:top;">${dt.statusKawin}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">5. Pendidikan terakhir</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; vertical-align:top;">${dt.pendidikan}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">6. Pekerjaan</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; vertical-align:top;">${dt.pekerjaan}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">7. Alamat</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; vertical-align:top;">${dt.alamat}</td></tr>
            <tr><td style="padding:4px 0; vertical-align:top; border:none;">8. No. NIK</td><td style="vertical-align:top; border:none;">:</td><td style="border:none; border-bottom: 1px dotted #ccc; font-weight:bold; vertical-align:top;">${dt.nik}</td></tr>
            <tr>
                <td style="padding:6px 0; font-weight:bold; vertical-align:top; border:none;">9. Keperluan</td>
                <td style="vertical-align:top; font-weight:bold; border:none;">:</td>
                <td style="border:none; border-bottom: 1px dotted #ccc; text-transform:uppercase; font-weight:bold; vertical-align:top; word-wrap:break-word; line-height:1.4; padding-top:4px;">
                    ${(dt.keperluan||'').replace(/\n/g, '<br>')}
                </td>
            </tr>
        </table>

        <p style="margin-top:20px; font-size:17px; z-index:2; position:relative;">Demikian untuk menjadikan periksa dan guna seperlunya.</p>

        <table style="width: 100%; text-align:center; font-size:17px; margin-top:25px; z-index:2; border:none; page-break-inside: avoid;">
            <tr>
                <td style="width:50%; vertical-align:top; border:none;">Mengetahui,<br>Ketua RW 012</td>
                <td style="width:50%; vertical-align:top; border:none;">Semarang, ${dt.tglPengajuan}<br>Ketua RT. 005 / RW. 012</td>
            </tr>
            <tr><td style="height: 65px; border:none;"></td><td style="height: 65px; border:none;"></td></tr>
            <tr>
                <td style="border:none;"><b style="text-decoration:underline; text-transform:uppercase;">${namaRW}</b></td>
                <td style="border:none;"><b style="text-decoration:underline; text-transform:uppercase;">${namaRT}</b></td>
            </tr>
        </table>
    </div>`;

    // Download langsung sebagai PDF (bukan dialog Print) — Riwayat Ekspor tetap tercatat.
    var __title = (isSalinan ? 'Salinan_Surat_' : 'Surat_Pengantar_') + String(dt.nama||'').replace(/\s/g,'_') + '_' + String(dt.noSurat||'').replace(/[^A-Za-z0-9]+/g,'-');
    return window.downloadPdfFromHtml(htmlCetak, __title);
};
    // === FUNGSI PENGGERAK HIDE & SEEK SIDEBAR ===
    

    // === FUNGSI HIDE & SHOW PANEL KANAN (widget info warga) ===
    window.toggleRightPanel = function() {
        var view = document.getElementById('view-warga');
        if (!view) return;
        var isCollapsed = view.classList.toggle('right-panel-collapsed');
        // Simpan preferensi
        try { localStorage.setItem('right_panel_state', isCollapsed ? 'hidden' : 'visible'); } catch(_){}
        // Update ikon tombol di header
        var btn = document.getElementById('btn-toggle-right-panel');
        if (btn) {
            var ic = btn.querySelector('i');
            if (ic) {
                ic.className = isCollapsed ? 'fa-solid fa-sidebar-flip' : 'fa-solid fa-table-columns';
                // fallback jika icon tidak ada
                ic.className = isCollapsed ? 'fa-solid fa-chevron-left' : 'fa-solid fa-table-columns';
            }
            btn.title = isCollapsed ? 'Tampilkan Panel Info Kanan' : 'Sembunyikan Panel Info Kanan';
        }
    };

    // Restore preferensi panel kanan saat load
    window.addEventListener('DOMContentLoaded', function() {
        try {
            if (localStorage.getItem('right_panel_state') === 'hidden') {
                var view = document.getElementById('view-warga');
                if (view) view.classList.add('right-panel-collapsed');
                var btn = document.getElementById('btn-toggle-right-panel');
                if (btn) {
                    var ic = btn.querySelector('i');
                    if (ic) ic.className = 'fa-solid fa-chevron-left';
                    btn.title = 'Tampilkan Panel Info Kanan';
                }
            }
        } catch(_) {}
    });

    // Jalankan pengecekan status saat aplikasi dimuat
    window.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('sidebar_state') === 'hidden') {
            document.body.classList.add('sidebar-collapsed');
        }
        // Tampilkan tombol biometric jika ada pendaftaran
        try { if (typeof tampilkanTombolBiometrikLogin === 'function') tampilkanTombolBiometrikLogin(); } catch(_){}
        // Restore sesi (refresh tetap di portal terakhir, bukan splash)
        try {
            // Tunggu sync layer selesai boot baru restore
            var tries = 0;
            (function tryRestore(){
                tries++;
                if (window.__GT_SYNC_BOOTED__ || tries > 50) {
                    setTimeout(function(){
                        try {
                            // Hanya restore jika portal belum aktif (user belum login manual)
                            if (!window.__GT_PORTAL_ACTIVE__ && typeof gtRestoreSession === 'function') {
                                gtRestoreSession();
                            }
                            if (typeof renderPengurusPdfAdmin === 'function') renderPengurusPdfAdmin();
                            if (typeof renderPengurusPdfWarga === 'function') renderPengurusPdfWarga();
                        } catch(_){}
                    }, 50);
                } else {
                    setTimeout(tryRestore, 100);
                }
            })();
        } catch(_){}
    });
    // Tarik data saat aplikasi pertama kali dibuka
    syncSemuaData();
    // === FUNGSI STUB (Tidak terhubung ke Google Sheets) ===
      // Data disimpan 100% di localStorage browser
      let _syncTimer;
      function autoSync() { return Promise.resolve(true); }
      async function saveToCloud(isSilent) { return true; }
      async function loadFromCloud() { return true; }
// === FITUR HIDE & SEEK FOOTER GAYA MY BCA ===
    setTimeout(() => {
        const footers = document.querySelectorAll('.admin-nav-tabs, .nav-tabs');
        footers.forEach(footer => {
            // Cegah pembuatan tombol ganda
            if(footer.querySelector('.pull-tab-bca')) return; 
            
            // Membuat Tuas Panah Emas
            const pullTab = document.createElement('div');
            pullTab.className = 'pull-tab-bca';
            pullTab.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
            pullTab.style.cssText = `
                position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                width: 60px; height: 30px; background: var(--navy-dark);
                border: 3px solid var(--gold-luxury); border-bottom: none;
                border-radius: 20px 20px 0 0; display: flex; align-items: center;
                justify-content: center; color: var(--gold-luxury); font-size: 1.2rem; cursor: pointer;
            `;

            // Logika Klik (Sembunyi / Muncul)
            pullTab.addEventListener('click', () => {
                footer.classList.toggle('hidden-footer');
                const icon = pullTab.querySelector('i');
                if (footer.classList.contains('hidden-footer')) {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); // Panah ke atas
                } else {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); // Panah ke bawah
                }
            });
            
            footer.appendChild(pullTab);
        });
    }, 500);
    // ============================================================
    // PENGURUS PDF (admin upload + warga viewer)
    // ============================================================
    window.uploadPengurusPdf = function(){
        var inp = document.getElementById('pengurus-pdf-input');
        if(!inp || !inp.files || !inp.files[0]) return Swal.fire('Pilih File','Silakan pilih file PDF dahulu.','warning');
        var f = inp.files[0];
        if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) return Swal.fire('Format Salah','Hanya file PDF yang diperbolehkan.','error');
        var maxBytes = 5 * 1024 * 1024;
        if (f.size > maxBytes) return Swal.fire('File Terlalu Besar','Maksimum 5 MB. File Anda: '+ (f.size/1024/1024).toFixed(2) +' MB.','error');
        Swal.fire({ title:'Mengupload...', html:'Memproses '+ f.name +'<br><small>Mohon tunggu.</small>', allowOutsideClick:false, didOpen:function(){ Swal.showLoading(); }});
        var fr = new FileReader();
        fr.onload = function(e){
            try {
                var dataUrl = e.target.result; // data:application/pdf;base64,...
                var record = {
                    name: f.name,
                    size: f.size,
                    type: 'application/pdf',
                    data: dataUrl,
                    uploadedAt: new Date().toISOString(),
                    uploadedAtId: new Date().toLocaleString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
                };
                localStorage.setItem('db_pengurus_pdf', JSON.stringify(record));
                localStorage.setItem('ts_pengurus_pdf', new Date().toISOString());
                if (typeof syncSemuaData === 'function') syncSemuaData(true);
                Swal.fire({ icon:'success', title:'Upload Berhasil', text: f.name +' siap dilihat warga.' });
                renderPengurusPdfAdmin();
                renderPengurusPdfWarga();
                inp.value = '';
            } catch(err){
                console.error(err);
                Swal.fire('Gagal Menyimpan', (err && err.message) || 'Tidak dapat menyimpan PDF.', 'error');
            }
        };
        fr.onerror = function(){ Swal.fire('Gagal Membaca','Tidak dapat membaca file.','error'); };
        fr.readAsDataURL(f);
    };
    window.lihatPengurusPdf = function(){
        var rec = JSON.parse(localStorage.getItem('db_pengurus_pdf') || 'null');
        if(!rec || !rec.data) return Swal.fire('Tidak Ada','Belum ada PDF yang ter-upload.','info');
        var w = window.open('about:blank');
        if (w) { w.document.title = rec.name; w.document.body.style.margin='0'; var f = w.document.createElement('iframe'); f.style.cssText='width:100vw; height:100vh; border:0;'; f.src = rec.data; w.document.body.appendChild(f); }
        else Swal.fire('Pop-up Diblokir','Mohon izinkan pop-up untuk pratinjau.','warning');
    };
    window.hapusPengurusPdf = function(){
        Swal.fire({title:'Hapus Dokumen?', text:'PDF struktur pengurus akan dihapus dari portal.', icon:'warning', showCancelButton:true, confirmButtonColor:'#ef4444', confirmButtonText:'Hapus'})
            .then(function(r){ if(!r.isConfirmed) return;
                localStorage.removeItem('db_pengurus_pdf');
                localStorage.setItem('ts_pengurus_pdf', new Date().toISOString());
                if (typeof syncSemuaData === 'function') syncSemuaData(true);
                renderPengurusPdfAdmin();
                renderPengurusPdfWarga();
                Toast.fire({icon:'success', title:'Dokumen dihapus.'});
            });
    };
    window.renderPengurusPdfAdmin = function(){
        var rec = JSON.parse(localStorage.getItem('db_pengurus_pdf') || 'null');
        var info = document.getElementById('pengurus-pdf-info');
        var btnV = document.getElementById('btn-view-pengurus-pdf');
        var btnD = document.getElementById('btn-del-pengurus-pdf');
        if (!info) return;
        if (rec && rec.data) {
            info.innerHTML = '<i class="fa-solid fa-file-pdf" style="color:#dc2626;"></i> <b>'+ (rec.name||'dokumen.pdf') +'</b> &nbsp; <span style="color:#94a3b8;">('+ ((rec.size||0)/1024).toFixed(1) +' KB &middot; '+ (rec.uploadedAtId||'') +')</span>';
            if (btnV) btnV.style.display = 'inline-flex';
            if (btnD) btnD.style.display = 'inline-flex';
        } else {
            info.innerText = 'Belum ada dokumen ter-upload.';
            if (btnV) btnV.style.display = 'none';
            if (btnD) btnD.style.display = 'none';
        }
    };
    window.renderPengurusPdfWarga = function(){
        var card = document.getElementById('warga-pengurus-pdf-card');
        if (!card) return;
        var rec = JSON.parse(localStorage.getItem('db_pengurus_pdf') || 'null');
        if (!rec || !rec.data) { card.style.display = 'none'; return; }
        card.style.display = 'block';
        var meta = document.getElementById('warga-pengurus-pdf-meta');
        if (meta) meta.innerHTML = '<i class="fa-solid fa-file-pdf" style="color:#dc2626;"></i> <b>'+ (rec.name||'dokumen.pdf') +'</b> &middot; '+ ((rec.size||0)/1024).toFixed(1) +' KB &middot; diupload '+ (rec.uploadedAtId||'-');
        var frame = document.getElementById('warga-pengurus-pdf-frame');
        var dl = document.getElementById('warga-pengurus-pdf-download');
        if (dl) { dl.href = rec.data; dl.setAttribute('download', rec.name||'Struktur_Pengurus.pdf'); }
        if (frame) {
            try { frame.src = rec.data + '#toolbar=1&navpanes=0&zoom=page-fit'; }
            catch(_) { frame.src = rec.data; }
            // Fallback hint kalau iframe blank di Safari iOS lama
            setTimeout(function(){
                try {
                    var doc = frame.contentDocument;
                    if (doc && doc.body && doc.body.innerHTML === '') {
                        var fb = document.getElementById('warga-pengurus-pdf-fallback');
                        if (fb) fb.style.display = 'block';
                    }
                } catch(_){}
            }, 1500);
        }
    };
    window.bukaPdfFullscreen = function(frameId){
        var rec = JSON.parse(localStorage.getItem('db_pengurus_pdf') || 'null');
        if (!rec || !rec.data) return;
        var w = window.open('about:blank');
        if (w) { w.document.title = rec.name; w.document.body.style.margin='0'; var f = w.document.createElement('iframe'); f.style.cssText='width:100vw; height:100vh; border:0;'; f.src = rec.data; w.document.body.appendChild(f); }
        else Swal.fire('Pop-up Diblokir','Mohon izinkan pop-up.','warning');
    };

    // ============================================================
    // BIOMETRIC LOGIN (WebAuthn — sidik jari / Face ID)
    // ============================================================
    window.gtBio = (function(){
        var KEY_LOCAL_HINT = 'gt_local_biometric_hint'; // perangkat ini terakhir kali login dgn warga ini
        var KEY_REGISTRY = 'db_warga_biometric';        // {wargaId: { credentialId, displayName, registeredAt }}

        function b64ToBuf(b64){
            b64 = b64.replace(/-/g,'+').replace(/_/g,'/');
            while (b64.length % 4) b64 += '=';
            var bin = atob(b64);
            var buf = new Uint8Array(bin.length);
            for (var i=0; i<bin.length; i++) buf[i] = bin.charCodeAt(i);
            return buf.buffer;
        }
        function bufToB64(buf){
            var bytes = new Uint8Array(buf);
            var s = '';
            for (var i=0; i<bytes.length; i++) s += String.fromCharCode(bytes[i]);
            return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
        }
        function getRegistry(){ try { return JSON.parse(localStorage.getItem(KEY_REGISTRY)) || {}; } catch(_) { return {}; } }
        function saveRegistry(r){ localStorage.setItem(KEY_REGISTRY, JSON.stringify(r)); localStorage.setItem('ts_warga_biometric', new Date().toISOString()); if (typeof syncSemuaData==='function') { try { syncSemuaData(true); } catch(_){} } }

        async function isSupported(){
            if (!window.PublicKeyCredential) return false;
            if (!navigator.credentials || !navigator.credentials.create) return false;
            try {
                if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
                    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                }
            } catch(_){}
            return true;
        }

        async function register(warga){
            if (!warga || !warga.id) throw new Error('Data warga tidak lengkap');
            if (!(await isSupported())) throw new Error('Perangkat tidak mendukung biometrik');
            var challenge = new Uint8Array(32); crypto.getRandomValues(challenge);
            var userIdStr = String(warga.id);
            var userIdBuf = new TextEncoder().encode(userIdStr);
            var pubKey = {
                challenge: challenge,
                rp: { name: 'Smart Portal RT 005' },
                user: { id: userIdBuf, name: (warga.nik||userIdStr), displayName: (warga.nama||'Warga') },
                pubKeyCredParams: [
                    { type:'public-key', alg:-7 }, // ES256
                    { type:'public-key', alg:-257 } // RS256
                ],
                authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
                timeout: 60000,
                attestation: 'none'
            };
            var cred = await navigator.credentials.create({ publicKey: pubKey });
            if (!cred) throw new Error('Pendaftaran biometrik dibatalkan.');
            var registry = getRegistry();
            registry[String(warga.id)] = {
                credentialId: bufToB64(cred.rawId),
                displayName: warga.nama || ('Warga #'+warga.id),
                nik: warga.nik || '',
                registeredAt: new Date().toISOString()
            };
            saveRegistry(registry);
            try { localStorage.setItem(KEY_LOCAL_HINT, String(warga.id)); } catch(_){}
            return true;
        }

        async function authenticate(wargaIdHint){
            if (!(await isSupported())) throw new Error('Biometrik tidak tersedia di perangkat ini.');
            var registry = getRegistry();
            var entries = Object.keys(registry).map(function(k){ return Object.assign({ wargaId: k }, registry[k]); });
            if (wargaIdHint && registry[String(wargaIdHint)]) entries = [Object.assign({ wargaId: String(wargaIdHint) }, registry[String(wargaIdHint)])];
            if (entries.length === 0) throw new Error('Belum ada warga yang mengaktifkan biometrik di portal ini.');
            var challenge = new Uint8Array(32); crypto.getRandomValues(challenge);
            var allow = entries.map(function(e){ return { type:'public-key', id: b64ToBuf(e.credentialId), transports: ['internal'] }; });
            var assertion = await navigator.credentials.get({ publicKey: { challenge: challenge, allowCredentials: allow, userVerification: 'required', timeout: 60000 } });
            if (!assertion) throw new Error('Otentikasi dibatalkan.');
            var matchId = bufToB64(assertion.rawId);
            var hit = entries.find(function(e){ return e.credentialId === matchId; });
            if (!hit) throw new Error('Kredensial tidak dikenali.');
            try { localStorage.setItem(KEY_LOCAL_HINT, hit.wargaId); } catch(_){}
            return hit.wargaId;
        }

        function isRegistered(wargaId){
            var r = getRegistry();
            return !!(wargaId && r[String(wargaId)]);
        }
        function unregister(wargaId){
            var r = getRegistry(); delete r[String(wargaId)]; saveRegistry(r);
        }
        function lastHint(){ return localStorage.getItem(KEY_LOCAL_HINT) || ''; }

        return {
            isSupported: isSupported,
            register: register,
            authenticate: authenticate,
            isRegistered: isRegistered,
            unregister: unregister,
            lastHint: lastHint
        };
    })();

    window.tampilkanTombolBiometrikLogin = async function(){
        try {
            var ok = await window.gtBio.isSupported();
            var btn = document.getElementById('btn-login-biometrik');
            if (!btn) return;
            var registry = (function(){ try { return JSON.parse(localStorage.getItem('db_warga_biometric'))||{}; } catch(_) { return {}; } })();
            var hasAny = Object.keys(registry).length > 0;
            btn.style.display = (ok && hasAny) ? 'flex' : 'none';
        } catch(_){}
    };

    window.loginBiometrik = async function(){
        try {
            var hint = window.gtBio.lastHint();
            var wargaId = await window.gtBio.authenticate(hint);
            // Cari warga di db
            var db = JSON.parse(localStorage.getItem('db_warga')) || [];
            var w = db.find(function(x){ return String(x.id) === String(wargaId); });
            if (!w) { Swal.fire('Data Hilang','Akun warga sudah tidak terdaftar di sistem.','error'); window.gtBio.unregister(wargaId); return; }
            window.loggedInWarga = { id: w.id, nama: w.nama, nik: w.nik||'', alamat: w.alamat||'' };
            try { sessionStorage.setItem('gt_session_warga', JSON.stringify(window.loggedInWarga)); } catch(_){}
            try { localStorage.setItem('gt_local_session', JSON.stringify({ role:'warga', warga: window.loggedInWarga, at: Date.now() })); } catch(_){}
            window.BukaPortal('warga');
            Toast.fire({icon:'success', title:'Login biometrik berhasil — selamat datang '+ w.nama});
        } catch(err){
            console.warn('biometrik gagal', err);
            Swal.fire({icon:'error', title:'Login Biometrik Gagal', text: (err && err.message) || 'Coba lagi.'});
        }
    };

    window.tawarkanAktivasiBiometrik = async function(warga){
        try {
            if (!warga || !warga.id) return;
            if (!(await window.gtBio.isSupported())) return;
            if (window.gtBio.isRegistered(warga.id)) return;
            var ans = await Swal.fire({
                icon:'question',
                title:'Aktifkan Login Biometrik?',
                html:'Login berikutnya cukup pakai <b>sidik jari / Face ID</b> tanpa mengetik password.<br><small>Anda bisa mematikannya kapan saja di pengaturan profil.</small>',
                showCancelButton:true,
                confirmButtonText:'<i class="fa-solid fa-fingerprint"></i> Aktifkan',
                cancelButtonText:'Lain Kali',
                confirmButtonColor:'#2563eb'
            });
            if (!ans.isConfirmed) return;
            await window.gtBio.register(warga);
            Swal.fire({icon:'success', title:'Biometrik Aktif', text:'Login berikutnya bisa pakai sidik jari / Face ID.'});
        } catch(err){
            console.warn('biometric register failed', err);
            Swal.fire({icon:'warning', title:'Tidak Bisa Mengaktifkan', text:(err && err.message)||'Perangkat tidak mendukung atau dibatalkan.'});
        }
    };

    // ============================================================
    // SESSION RESTORE — refresh tetap di halaman terakhir, bukan splash
    // ============================================================
    window.gtSaveLastView = function(role, tab){
        try {
            var cur = JSON.parse(localStorage.getItem('gt_local_lastView') || '{}');
            // Jika role berbeda dari yang tersimpan, hapus tab lama
            // agar tab dari sesi warga tidak merembes ke sesi admin (dan sebaliknya).
            if (role && cur.role && cur.role !== role) {
                cur.tab = null;
            }
            cur.role = role || cur.role;
            if (tab) cur.tab = tab;
            cur.at = Date.now();
            localStorage.setItem('gt_local_lastView', JSON.stringify(cur));
        } catch(_){}
    };
    // Wrap tab openers untuk mencatat tab terakhir per role
    (function(){
        function wrap(name, role){
            var orig = window[name];
            if (!orig || orig.__gtLastViewWrapped) return;
            window[name] = function(t){ try { window.gtSaveLastView(role, t); } catch(_){} return orig.apply(this, arguments); };
            window[name].__gtLastViewWrapped = true;
        }
        wrap('openWargaTab','warga');
        wrap('openAdminTab','admin');
        wrap('openKopTab','koperasi');
        if (typeof window.openBenTab === 'function') wrap('openBenTab','bendahara');
    })();
    // Wrap BukaPortal untuk simpan session login + tahu role aktif
    (function(){
        var orig = window.BukaPortal;
        if (!orig || orig.__gtSessionWrapped) return;
        window.BukaPortal = function(role){
            try {
                var sess = { role: role, warga: (role==='warga' ? window.loggedInWarga : null), at: Date.now() };
                localStorage.setItem('gt_local_session', JSON.stringify(sess));
                window.gtSaveLastView(role, null);
            } catch(_){}
            // Tandai portal sudah aktif agar gtRestoreSession tidak menimpa sesi ini
            window.__GT_PORTAL_ACTIVE__ = true;
            var r = orig.apply(this, arguments);
            return r;
        };
        window.BukaPortal.__gtSessionWrapped = true;
    })();
    // Wrap logout — bersihkan session lokal
    (function(){
        var orig = window.logout;
        if (!orig || orig.__gtSessionWrapped) return;
        window.logout = function(){
            try { localStorage.removeItem('gt_local_session'); } catch(_){}
            try { localStorage.removeItem('gt_local_lastView'); } catch(_){}
            window.__GT_PORTAL_ACTIVE__ = false; // reset agar gtRestoreSession bisa jalan lagi setelah login baru
            return orig.apply(this, arguments);
        };
        window.logout.__gtSessionWrapped = true;
    })();
    // Auto-restore saat halaman dimuat
    window.gtRestoreSession = function(){
        try {
            // GUARD: jika user sudah login manual (BukaPortal sudah dipanggil
            // sebelum fungsi ini, mis. user klik splash lebih cepat dari sync boot),
            // hentikan restore agar sesi manual tidak ditimpa sesi lama.
            if (window.__GT_PORTAL_ACTIVE__) {
                console.info('[gtRestoreSession] portal sudah aktif — skip restore');
                return false;
            }
            // GUARD: cek DOM — jika main-app terlihat, seseorang sudah login
            var mainApp = document.getElementById('main-app');
            if (mainApp && mainApp.style.display !== 'none') {
                console.info('[gtRestoreSession] main-app sudah terlihat — skip restore');
                return false;
            }

            var raw = localStorage.getItem('gt_local_session');
            if (!raw) return false;
            var sess = JSON.parse(raw);
            if (!sess || !sess.role) return false;
            // Sesi kadaluwarsa setelah 12 jam tanpa aktivitas
            if (sess.at && (Date.now() - sess.at) > 12*60*60*1000) {
                localStorage.removeItem('gt_local_session');
                localStorage.removeItem('gt_local_lastView');
                return false;
            }
            // Sembunyikan splash + login form
            var splash = document.getElementById('splash-view');
            var loginForm = document.getElementById('login-form-view');
            if (splash) splash.style.display = 'none';
            if (loginForm) loginForm.style.display = 'none';
            if (sess.role === 'warga' && sess.warga) {
                window.loggedInWarga = sess.warga;
            }
            if (typeof window.BukaPortal !== 'function') return false;
            window.BukaPortal(sess.role);
            // Restore tab terakhir — dilakukan di SINI (page-restore only),
            // bukan di dalam BukaPortal wrapper (yang berjalan setiap login manual).
            try {
                var lv = JSON.parse(localStorage.getItem('gt_local_lastView') || '{}');
                if (lv && lv.role === sess.role && lv.tab) {
                    setTimeout(function(){
                        try {
                            if (sess.role === 'warga' && typeof window.openWargaTab === 'function') window.openWargaTab(lv.tab);
                            else if (sess.role === 'admin' && typeof window.openAdminTab === 'function') window.openAdminTab(lv.tab);
                            else if (sess.role === 'koperasi' && typeof window.openKopTab === 'function') window.openKopTab(lv.tab);
                            else if (sess.role === 'bendahara' && typeof window.openBenTab === 'function') window.openBenTab(lv.tab);
                        } catch(_){}
                    }, 80);
                }
            } catch(_){}
            return true;
        } catch(err){ console.warn('gtRestoreSession failed', err); return false; }
    };
    // Render PDF struktur otomatis setelah data sync masuk
    window.addEventListener('storage', function(e){
        if (!e || !e.key) return;
        if (e.key === 'db_pengurus_pdf') {
            try { renderPengurusPdfAdmin(); } catch(_){}
            try { renderPengurusPdfWarga(); } catch(_){}
        }
        if (e.key === 'db_warga_biometric') {
            try { tampilkanTombolBiometrikLogin(); } catch(_){}
        }
    });

    // === FUNGSI TRANSISI GAYA SIPADA ===
    window.bukaFormLogin = function() {
        const splash = document.getElementById('splash-view');
        const loginForm = document.getElementById('login-form-view');
        
        // Animasi keluar untuk splash
        splash.style.transition = '0.5s';
        splash.style.opacity = '0';
        splash.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            splash.style.display = 'none';
            loginForm.style.display = 'block';
            // Beri fokus ke input pertama
            document.getElementById('univ-id').focus();
        }, 500);
    };
    // ?? FUNGSI FILTER & SEARCH WARGA ADMIN ??
    window.filterTabelKKAdmin = function(keyword) {
        var q = (keyword || '').toLowerCase().trim();
        var status = (document.getElementById('admin-filter-status-warga') || {}).value || 'semua';
        var blok = (document.getElementById('admin-filter-blok-warga') || {}).value || 'semua';
        var rows = document.querySelectorAll('#body-tabel-kk-admin tr');
        var count = 0;
        rows.forEach(function(row) {
            var text = row.innerText.toLowerCase();
            var matchQ = !q || text.includes(q);
            var matchStatus = status === 'semua' || (status === 'aktif' && text.includes('aktif') && !text.includes('tidak aktif')) || (status === 'nonaktif' && (text.includes('tidak aktif') || text.includes('pindah'))) || (status === 'janda' && text.includes('janda')) || (status === 'duda' && text.includes('duda')) || (status === 'lansia' && text.includes('lansia')) || (status === 'prioritas' && (text.includes('janda') || text.includes('duda') || text.includes('lansia')));
            var matchBlok = blok === 'semua' || text.includes('blok ' + blok.toLowerCase());
            if (matchQ && matchStatus && matchBlok) {
                row.style.display = '';
                count++;
            } else {
                row.style.display = 'none';
            }
        });
    };
    window.resetFilterWarga = function() {
        var s = document.getElementById('admin-search-warga');
        var fs = document.getElementById('admin-filter-status-warga');
        var fb = document.getElementById('admin-filter-blok-warga');
        if (s) s.value = '';
        if (fs) fs.value = 'semua';
        if (fb) fb.value = 'semua';
        window.filterTabelKKAdmin('');
    };
function updateSemuaWaktu() {
    console.log("Mengupdate tampilan waktu dashboard..."); // Untuk cek di console
    const sekarang = new Date();
    const jam = String(sekarang.getHours()).padStart(2, '0');
    const menit = String(sekarang.getMinutes()).padStart(2, '0');
    const waktuString = `${jam}:${menit} WIB`;

    const ids = ['upd-kas', 'upd-arisan', 'upd-host', 'upd-warga'];
    
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<i class="fa-solid fa-rotate"></i> Update: ${waktuString}`;
        }
    });
}


    /* === Smart Portal Surat Workflow v3 (added) ===
       - Hard-restrict isNew warga ke tab profil
       - WA notifikasi otomatis saat ajukan surat
       - Admin preview detail + ACC / Tolak (dengan alasan)
       - Token download 6-digit dikirim via WA / email
    */
    (function smartPortalSuratV3() {
      if (window.__SP_SURAT_V3) return;
      window.__SP_SURAT_V3 = true;
      var ADMIN_WA = '6282213002006';

      function todayCode() {
        var d = new Date();
        return d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
      }
      function genKodePengajuan() {
        var n = parseInt(localStorage.getItem('sp_kode_pjg_counter') || '0', 10) + 1;
        localStorage.setItem('sp_kode_pjg_counter', String(n));
        return 'PJG-' + todayCode() + '-' + String(n).padStart(4, '0');
      }
      function genToken6() { return String(Math.floor(100000 + Math.random()*900000)); }
      function wargaByRecord(rec) {
        var db = JSON.parse(localStorage.getItem('db_warga') || '[]');
        return db.find(function(x){ return String(x.id) === String(rec.idWarga); }) || {};
      }
      function normalizePhone(p) {
        var n = String(p||'').replace(/[^0-9]/g,'');
        if (n.indexOf('0') === 0) n = '62' + n.slice(1);
        else if (n.indexOf('62') !== 0 && n.length > 0) n = '62' + n;
        return n;
      }

      // ---- GUARD: blokir tab lain saat user pakai password default ----
      var attA = 0;
      var ivA = setInterval(function(){
        attA++;
        if (typeof window.openWargaTab === 'function' && !window.openWargaTab.__spIsNewWrapped) {
          var orig = window.openWargaTab;
          window.openWargaTab = function(tabId) {
            if (window.loggedInWarga && window.loggedInWarga.isNew && tabId !== 'warga-profil') {
              if (typeof Swal !== 'undefined') Swal.fire({
                icon: 'warning',
                title: 'Akses Dibatasi',
                html: 'Anda harus <b>melengkapi data keluarga</b> dan <b>mengganti password default</b> terlebih dahulu untuk membuka layanan lain.',
                confirmButtonColor: '#ef4444'
              });
              return orig.call(this, 'warga-profil');
            }
            return orig.apply(this, arguments);
          };
          window.openWargaTab.__spIsNewWrapped = true;
          clearInterval(ivA);
        }
        if (attA > 80) clearInterval(ivA);
      }, 200);

      // ---- WRAP submitSuratWarga: tambah kodePengajuan + WA otomatis ----
      var attB = 0;
      var ivB = setInterval(function(){
        attB++;
        if (typeof window.submitSuratWarga === 'function' && !window.submitSuratWarga.__spV3) {
          var origSubmit = window.submitSuratWarga;
          window.submitSuratWarga = function(e) {
            var ret = origSubmit.apply(this, arguments);
            try {
              var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
              if (db.length > 0) {
                var rec = db[db.length - 1];
                if (!rec.kodePengajuan) {
                  rec.kodePengajuan = genKodePengajuan();
                  db[db.length - 1] = rec;
                  localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
                }
                var msg = 'Bapak sekretaris saya telah mengajukan surat layanan pengantar dengan No ' + rec.kodePengajuan
                  + '\nAtas nama: ' + (rec.nama||'-')
                  + '\nKeperluan: ' + String(rec.keperluan||'-').substring(0,120)
                  + '\nMohon untuk diproses. Terima kasih.';
                var url = 'https://wa.me/' + ADMIN_WA + '?text=' + encodeURIComponent(msg);
                setTimeout(function(){
                  Swal.fire({
                    icon: 'success',
                    title: 'Pengajuan Terkirim',
                    html: 'Kode Pengajuan: <b style="color:#2563eb;">' + rec.kodePengajuan + '</b><br><br>Klik tombol di bawah untuk membuka WhatsApp dan mengirim notifikasi otomatis ke sekretaris.',
                    showCancelButton: true,
                    cancelButtonText: 'Nanti saja',
                    confirmButtonText: '<i class="fa-brands fa-whatsapp"></i> Kirim Notifikasi WA',
                    confirmButtonColor: '#25D366'
                  }).then(function(r){
                    if (r.isConfirmed) window.open(url, '_blank', 'noopener');
                  });
                }, 350);
              }
            } catch (err) { console.warn('[surat v3 submit]', err); }
            return ret;
          };
          window.submitSuratWarga.__spV3 = true;
          clearInterval(ivB);
        }
        if (attB > 80) clearInterval(ivB);
      }, 200);

      // ---- WRAP loadSuratAdmin: ganti tombol Acc dgn Detail + Token + Penolakan ----
      var attC = 0;
      var ivC = setInterval(function(){
        attC++;
        if (typeof window.loadSuratAdmin === 'function' && !window.loadSuratAdmin.__spV3) {
          var orig = window.loadSuratAdmin;
          window.loadSuratAdmin = function() {
            orig.apply(this, arguments);
            try {
              var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
              var tb = document.getElementById('tbody-admin-surat-baru');
              if (!tb) return;
              var rows = tb.querySelectorAll('tr');
              var sortedDb = db.slice().reverse();
              rows.forEach(function(tr, i) {
                var rec = sortedDb[i];
                if (!rec || !tr.cells || tr.cells.length < 5) return;
                var lastCell = tr.cells[tr.cells.length - 1];
                if (rec.status !== 'Selesai' && rec.status !== 'Ditolak') {
                  lastCell.innerHTML = '<button class="btn-action bg-blue" onclick="window.lihatDetailSurat(' + rec.id + ')"><i class="fa-solid fa-eye"></i> Detail & Aksi</button> '
                    + '<button class="btn-table btn-tbl-del" onclick="hapusSuratPengajuan(' + rec.id + ')" title="Hapus"><i class="fa-solid fa-trash"></i></button>';
                } else if (rec.status === 'Ditolak') {
                  lastCell.innerHTML = '<button class="btn-action" style="color:#991b1b; border-color:#ef4444;" onclick="window.lihatDetailSurat(' + rec.id + ')"><i class="fa-solid fa-circle-xmark"></i> Lihat Penolakan</button> '
                    + '<button class="btn-table btn-tbl-del" onclick="hapusSuratPengajuan(' + rec.id + ')"><i class="fa-solid fa-trash"></i></button>';
                  var sCell = tr.cells[3];
                  if (sCell) sCell.innerHTML = '<span class="badge" style="background:#fee2e2; color:#991b1b;">Ditolak</span><br><b style="font-size:0.85rem; margin-top:5px; display:inline-block; color:#991b1b;">' + (rec.kodePengajuan || '-') + '</b>';
                } else if (rec.status === 'Selesai') {
                  lastCell.innerHTML += ' <button class="btn-action bg-blue" onclick="window.kirimTokenSurat(' + rec.id + ')"><i class="fa-solid fa-key"></i> Token</button>';
                }
                if (rec.kodePengajuan) {
                  var nikCell = tr.cells[1];
                  if (nikCell && nikCell.innerHTML.indexOf(rec.kodePengajuan) === -1) {
                    nikCell.innerHTML += '<br><small style="color:#2563eb;"><b>' + rec.kodePengajuan + '</b></small>';
                  }
                }
              });
            } catch(err) { console.warn('[surat v3 admin]', err); }
          };
          window.loadSuratAdmin.__spV3 = true;
          clearInterval(ivC);
        }
        if (attC > 80) clearInterval(ivC);
      }, 200);

      // ---- WRAP loadSuratWarga: tombol download minta token, ditolak punya tombol khusus ----
      var attD = 0;
      var ivD = setInterval(function(){
        attD++;
        if (typeof window.loadSuratWarga === 'function' && !window.loadSuratWarga.__spV3) {
          var orig = window.loadSuratWarga;
          window.loadSuratWarga = function() {
            orig.apply(this, arguments);
            try {
              if (!window.loggedInWarga) return;
              var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
              var my = db.filter(function(x){ return String(x.idWarga) === String(window.loggedInWarga.id); });
              var tb = document.getElementById('tbody-riwayat-warga-baru');
              if (!tb) return;
              var rows = tb.querySelectorAll('tr');
              var sortedDb = my.slice().reverse();
              rows.forEach(function(tr, i) {
                var rec = sortedDb[i];
                if (!rec || !tr.cells || tr.cells.length < 5) return;
                var lastCell = tr.cells[tr.cells.length - 1];
                if (rec.status === 'Selesai') {
                  lastCell.innerHTML = '<button class="btn-action bg-red" onclick="window.downloadSuratDenganToken(' + rec.id + ')"><i class="fa-solid fa-lock"></i> Download (perlu Token)</button>';
                } else if (rec.status === 'Ditolak') {
                  lastCell.innerHTML = '<button class="btn-action" style="color:#991b1b; border-color:#ef4444;" onclick="window.lihatPenolakanWarga(' + rec.id + ')"><i class="fa-solid fa-circle-info"></i> Lihat Alasan</button>';
                  var sCell = tr.cells[3];
                  if (sCell) sCell.innerHTML = '<span class="badge" style="background:#fee2e2; color:#991b1b;">Ditolak</span>';
                }
                var noCell = tr.cells[2];
                if (noCell && rec.kodePengajuan && (!rec.noSurat || rec.noSurat === '-')) {
                  noCell.innerHTML = '<small style="color:#2563eb;"><b>' + rec.kodePengajuan + '</b></small>';
                }
              });
            } catch(err){ console.warn('[surat v3 warga]', err); }
          };
          window.loadSuratWarga.__spV3 = true;
          clearInterval(ivD);
        }
        if (attD > 80) clearInterval(ivD);
      }, 200);

      // ---- Modal preview detail untuk admin ----
      window.lihatDetailSurat = function(id) {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var rec = db.find(function(x){ return x.id === id; });
        if (!rec) return Swal.fire('Error', 'Pengajuan tidak ditemukan.', 'error');
        var w = wargaByRecord(rec);
        function row(label, val) {
          return '<tr><td style="padding:4px 8px; color:#64748b; vertical-align:top;">' + label + '</td><td style="padding:4px 8px;">' + (val||'-') + '</td></tr>';
        }
        var html = '<div style="text-align:left; font-size:0.92rem; line-height:1.5;">'
          + '<div style="background:#f1f5f9; padding:10px 14px; border-radius:10px; margin-bottom:12px;"><b>Kode Pengajuan:</b> <span style="color:#2563eb; font-weight:700;">' + (rec.kodePengajuan||'-') + '</span><br><b>Tgl:</b> ' + (rec.tglPengajuan||'-') + '</div>'
          + '<table style="width:100%; border-collapse:collapse;">'
          + row('Nama', '<b>'+(rec.nama||'-')+'</b>')
          + row('NIK', rec.nik)
          + row('TTL', rec.ttl)
          + row('Agama', rec.agama)
          + row('Status Kawin', rec.statusKawin)
          + row('Pendidikan', rec.pendidikan)
          + row('Pekerjaan', rec.pekerjaan)
          + row('Alamat', rec.alamat)
          + row('Telp / WA', w.telp)
          + row('Email', w.email)
          + '</table>'
          + '<div style="margin-top:14px; background:#fffbeb; border-left:4px solid #f59e0b; padding:10px 12px; border-radius:8px;"><b style="color:#92400e;">Keperluan:</b><br>' + String(rec.keperluan||'-').replace(/\n/g,'<br>') + '</div>';
        if (rec.status === 'Ditolak') {
          html += '<div style="margin-top:12px; background:#fee2e2; border-left:4px solid #ef4444; padding:10px 12px; border-radius:8px;"><b style="color:#991b1b;">Alasan Ditolak:</b><br>' + String(rec.alasanTolak||'-').replace(/\n/g,'<br>') + '</div>';
        }
        html += '</div>';
        var showAction = (rec.status !== 'Selesai' && rec.status !== 'Ditolak');
        Swal.fire({
          title: 'Detail Permohonan Surat',
          html: html,
          width: 620,
          showCloseButton: true,
          showConfirmButton: showAction,
          showDenyButton: showAction,
          showCancelButton: !showAction,
          cancelButtonText: 'Tutup',
          confirmButtonText: '<i class="fa-solid fa-check"></i> ACC',
          denyButtonText: '<i class="fa-solid fa-xmark"></i> Tolak / Revisi',
          confirmButtonColor: '#10b981',
          denyButtonColor: '#ef4444'
        }).then(function(res){
          if (res.isConfirmed) window.accSuratDetail(id);
          else if (res.isDenied) window.tolakSuratDetail(id);
        });
      };

      window.accSuratDetail = function(id) {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var idx = db.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return;
        db[idx].status = 'Selesai';
        if (!db[idx].noSurat || db[idx].noSurat === '-') db[idx].noSurat = window.getAutoNomorSurat();
        var count = parseInt(localStorage.getItem('surat_counter')); if (isNaN(count) || count < 178) count = 178;
        localStorage.setItem('surat_counter', count + 1);
        db[idx].token = genToken6();
        db[idx].tglAcc = new Date().toLocaleDateString('id-ID');
        localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
        if (typeof loadSuratAdmin === 'function') loadSuratAdmin();
        if (typeof syncSemuaData === 'function') syncSemuaData(true);
        setTimeout(function(){ window.kirimTokenSurat(id); }, 350);
      };

      window.tolakSuratDetail = function(id) {
        Swal.fire({
          title: 'Tolak / Revisi Pengajuan',
          input: 'textarea',
          inputLabel: 'Alasan penolakan / catatan revisi',
          inputPlaceholder: 'Tulis alasan atau hal yang perlu direvisi...',
          showCancelButton: true,
          cancelButtonText: 'Batal',
          confirmButtonText: 'Kirim Penolakan',
          confirmButtonColor: '#ef4444',
          inputValidator: function(v){ if (!v || v.trim().length < 5) return 'Alasan minimal 5 karakter'; }
        }).then(function(r){
          if (!r.isConfirmed) return;
          var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
          var idx = db.findIndex(function(x){ return x.id === id; });
          if (idx === -1) return;
          db[idx].status = 'Ditolak';
          db[idx].alasanTolak = r.value;
          db[idx].tglTolak = new Date().toLocaleDateString('id-ID');
          localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
          if (typeof loadSuratAdmin === 'function') loadSuratAdmin();
          if (typeof syncSemuaData === 'function') syncSemuaData(true);
          Toast.fire({ icon:'success', title:'Penolakan dikirim' });
        });
      };

      window.kirimTokenSurat = function(id) {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var idx = db.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return;
        var rec = db[idx];
        if (!rec.token) {
          rec.token = genToken6();
          db[idx] = rec;
          localStorage.setItem('db_req_surat_v2', JSON.stringify(db));
        }
        var w = wargaByRecord(rec);
        var msgWA = 'Halo ' + (rec.nama||'') + ', surat pengantar Anda dengan No ' + (rec.noSurat||'-') + ' (Kode: ' + (rec.kodePengajuan||'-') + ') telah disetujui. Token download Anda: *' + rec.token + '* — Silakan masukkan token ini di Portal Warga untuk mengunduh surat.';
        var subj = 'Token Download Surat ' + (rec.noSurat||'');
        var bodyEmail = 'Halo ' + (rec.nama||'') + ',\r\n\r\nSurat pengantar Anda telah disetujui.\r\nNomor Surat: ' + (rec.noSurat||'-') + '\r\nKode Pengajuan: ' + (rec.kodePengajuan||'-') + '\r\n\r\nToken Download: ' + rec.token + '\r\n\r\nSilakan masukkan token di portal warga untuk mengunduh surat.';
        var html = '<div style="text-align:left; font-size:0.95rem;">'
          + '<div style="background:#ecfdf5; border:1px solid #10b981; padding:14px; border-radius:10px; margin-bottom:12px; text-align:center;">'
          + '<div style="font-size:0.85rem; color:#065f46;">Token Download (6 digit)</div>'
          + '<div style="font-size:1.8rem; font-weight:800; color:#065f46; letter-spacing:6px; margin-top:4px;">' + rec.token + '</div>'
          + '</div>'
          + '<p>Penerima: <b>' + (rec.nama||'-') + '</b></p>'
          + '<p>WhatsApp: <b>' + (w.telp||'(belum ada)') + '</b><br>Email: <b>' + (w.email||'(belum ada)') + '</b></p>'
          + '<p style="color:#64748b; font-size:0.85rem;">Klik tombol di bawah untuk membuka pesan. Token siap dikirim — tinggal tekan kirim di aplikasi WA / email Anda.</p>'
          + '</div>';
        Swal.fire({
          title: 'Kirim Token ke Warga',
          html: html,
          width: 540,
          showDenyButton: !!w.email,
          showConfirmButton: !!w.telp,
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          confirmButtonText: '<i class="fa-brands fa-whatsapp"></i> Kirim via WA',
          denyButtonText: '<i class="fa-solid fa-envelope"></i> Kirim via Email',
          confirmButtonColor: '#25D366',
          denyButtonColor: '#0284c7'
        }).then(function(r){
          if (r.isConfirmed && w.telp) {
            window.open('https://wa.me/' + normalizePhone(w.telp) + '?text=' + encodeURIComponent(msgWA), '_blank', 'noopener');
          } else if (r.isDenied && w.email) {
            window.open('mailto:' + w.email + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(bodyEmail), '_blank', 'noopener');
          }
        });
      };

      window.lihatPenolakanWarga = function(id) {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var rec = db.find(function(x){ return x.id === id; });
        if (!rec) return;
        Swal.fire({
          icon: 'warning',
          title: 'Pengajuan Ditolak / Perlu Revisi',
          html: '<div style="text-align:left;"><p><b>Kode:</b> ' + (rec.kodePengajuan||'-') + '</p><div style="background:#fee2e2; border-left:4px solid #ef4444; padding:10px 12px; border-radius:8px; margin-top:10px;"><b style="color:#991b1b;">Catatan dari RT:</b><br>' + String(rec.alasanTolak||'-').replace(/\n/g,'<br>') + '</div></div>',
          confirmButtonText: 'Mengerti',
          confirmButtonColor: '#ef4444'
        });
      };

      window.downloadSuratDenganToken = function(id) {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var rec = db.find(function(x){ return x.id === id; });
        if (!rec) return;
        if (!rec.token) {
          if (typeof window.cetakPDFSurat === 'function') return window.cetakPDFSurat(id, false);
          return;
        }
        Swal.fire({
          title: 'Masukkan Token Download',
          html: '<p style="font-size:0.9rem; color:#64748b;">Token 6 digit telah dikirim oleh sekretaris ke WhatsApp / email Anda.</p>',
          input: 'text',
          inputAttributes: { maxlength: 6, autocapitalize: 'off', autocorrect: 'off', inputmode: 'numeric' },
          inputPlaceholder: 'XXXXXX',
          showCancelButton: true,
          cancelButtonText: 'Batal',
          confirmButtonText: 'Verifikasi & Download',
          confirmButtonColor: '#2563eb',
          preConfirm: function(v) {
            if (!v || v.trim().length !== 6) { Swal.showValidationMessage('Token harus 6 digit'); return false; }
            if (v.trim() !== rec.token) { Swal.showValidationMessage('Token salah. Periksa kembali.'); return false; }
            return true;
          },
          footer: '<a href="#" id="sp-resend-token" style="color:#2563eb;">Tidak menerima token? Minta kirim ulang</a>'
        }).then(function(r){
          if (r.isConfirmed) {
            if (typeof window.cetakPDFSurat === 'function') window.cetakPDFSurat(id, false);
          }
        });
        setTimeout(function(){
          var a = document.getElementById('sp-resend-token');
          if (a) a.onclick = function(e){ e.preventDefault(); Swal.close(); window.mintaTokenUlang(id); };
        }, 200);
      };

      window.mintaTokenUlang = function(id) {
        var db = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var rec = db.find(function(x){ return x.id === id; });
        if (!rec) return;
        var msg = 'Halo Pak Sekretaris, mohon kirim ulang token download untuk surat ' + (rec.noSurat||'-') + ' (Kode: ' + (rec.kodePengajuan||'-') + ') atas nama ' + (rec.nama||'-') + '. Terima kasih.';
        window.open('https://wa.me/' + ADMIN_WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        Toast.fire({ icon:'info', title:'WhatsApp ke sekretaris dibuka' });
      };
    })();



// ============================================================
// PATCH: Fungsi hilang portal warga, koperasi, admin, tamu
// ============================================================

// ── 1. updateNavBadges ───────────────────────────────────────
window.updateNavBadges = function() {
    try {
        var aduan = JSON.parse(localStorage.getItem('db_aduan') || '[]');
        var surat = JSON.parse(localStorage.getItem('db_surat') || '[]');
        var pending = aduan.filter(function(a){ return a.status === 'Menunggu' || a.status === 'Diproses' || a.status === 'Baru' || a.status === 'Pending'; }).length;
        var suratPending = surat.filter(function(s){ return s.status === 'Proses' || s.status === 'Baru'; }).length;
        var elAduan = document.getElementById('badge-aduan');
        var elSurat = document.getElementById('badge-surat');
        if (elAduan) { elAduan.textContent = pending; elAduan.style.display = pending > 0 ? 'inline-block' : 'none'; }
        if (elSurat) { elSurat.textContent = suratPending; elSurat.style.display = suratPending > 0 ? 'inline-block' : 'none'; }
    } catch(e) { console.warn('[updateNavBadges]', e); }
};
loadDashboardWarga = function() {
    try {
        var kasArr     = JSON.parse(localStorage.getItem('db_kas')        || '[]');
        var wargaArr   = JSON.parse(localStorage.getItem('db_warga')      || '[]');
        var infoArisan = JSON.parse(localStorage.getItem('db_info_arisan')|| 'null');
        var benSaldoAwal = parseFloat(localStorage.getItem('ben_saldo_awal') || '0');
        var saldoAwal    = benSaldoAwal > 0 
                           ? benSaldoAwal 
                           : parseFloat(localStorage.getItem('db_saldo_awal') || '0');
        var saldo = saldoAwal;
        kasArr.forEach(function(k){
            if ((k.tipe||'').toLowerCase() === 'masuk') saldo += Number(k.nominal||0);
            else saldo -= Number(k.nominal||0);
        });
        if (kasArr.length === 0) {
            var benIuran = JSON.parse(localStorage.getItem('ben_iuran') || '[]');
            var benKomp  = JSON.parse(localStorage.getItem('ben_komponen') || '[]');
            benIuran.forEach(function(b){
                var total = 0;
                benKomp.forEach(function(k){
                    if (b[k.id] === true) total += Number(k.nominal || 0);
                });
                saldo += total;
            });
        }
        var fmt = window.fmt || function(v){ return 'Rp '+Number(v||0).toLocaleString('id-ID'); };
        var el = function(id){ return document.getElementById(id); };

        var wNameEl = el('warga-welcome-name');
        if (wNameEl && window.loggedInWarga && window.loggedInWarga.nama) {
            var nm = window.loggedInWarga.nama.trim().split(/\s+/).slice(0,2).join(' ');
            wNameEl.textContent = nm;
        }
        var gEl = el('warga-greeting-time');
        if (gEl) {
            var h = new Date().getHours();
            var salam = h < 11 ? 'Selamat Pagi ☀️' : h < 15 ? 'Selamat Siang 🌤️' : h < 18 ? 'Selamat Sore 🌇' : 'Selamat Malam 🌙';
            gEl.textContent = salam + ' · ' + new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
        }

        if (el('warga-saldo-kas')) { el('warga-saldo-kas').textContent = fmt(saldo); el('warga-saldo-kas').style.cssText = ''; }
        if (el('warga-total-kk'))   el('warga-total-kk').textContent   = wargaArr.length + ' KK';
        if (infoArisan) {
            if (el('warga-arisan-nama')) el('warga-arisan-nama').textContent = infoArisan.arisanNama || '-';
            if (el('warga-arisan-tgl'))  el('warga-arisan-tgl').textContent  = infoArisan.arisanTgl  || '';
            if (el('warga-host-nama'))   el('warga-host-nama').textContent   = infoArisan.hostNama   || '-';
            if (el('warga-host-tgl'))    el('warga-host-tgl').textContent    = infoArisan.hostTgl    || '';
        }
        var now = new Date().toLocaleTimeString('id-ID');
        ['upd-kas','upd-warga'].forEach(function(id){
            if (el(id)) el(id).textContent = 'Diperbarui ' + now;
        });
    } catch(e){ console.warn('[loadDashboardWarga]', e); }
    window.loadQuickAccessPanel();
    if (typeof window.gtRefreshDashboard === 'function') window.gtRefreshDashboard();
    try{ patchRekapArisan(); }catch(e){}
};
window.loadDashboardWarga.__gtV12 = true;  // ← cegah patch lama override

window.loadQuickAccessPanel = function() {
    try {
        var el = function(id){ return document.getElementById(id); };
        if (!el('qa-iuran-status')) return;
        var warga = window.loggedInWarga;

        // ── Iuran Bulan Ini ──────────────────────────────────────────────
        var bulan = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        var lunas = false;
        if (warga) {
            var iuranDb = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var now = new Date();
            var bln = now.getMonth() + 1;
            var thn = now.getFullYear();
            lunas = iuranDb.some(function(r) {
                return String(r.wargaId) === String(warga.id) &&
                       Number(r.bulan) === bln && Number(r.tahun) === thn &&
                       (r.status === 'posted' || r.status === 'lunas');
            });
        }
        if (el('qa-iuran-status')) {
            el('qa-iuran-status').innerHTML = lunas
                ? '<span style="color:#4ade80;"><i class="fa-solid fa-circle-check"></i> Lunas</span>'
                : '<span style="color:#fb923c;"><i class="fa-solid fa-circle-xmark"></i> Belum Lunas</span>';
            el('qa-iuran-sub').textContent = bulan;
        }

        // ── Surat Terakhir ────────────────────────────────────────────────
        var suratDb = JSON.parse(localStorage.getItem('db_req_surat_v2') || '[]');
        var suratKu = warga ? suratDb.filter(function(s){ return String(s.idWarga) === String(warga.id) || String(s.wargaId) === String(warga.id); }) : [];
        if (el('qa-surat-status')) {
            if (suratKu.length) {
                var last = suratKu[suratKu.length - 1];
                var stMap = { Menunggu:'#fb923c', Diproses:'#60a5fa', Selesai:'#4ade80', Ditolak:'#f87171' };
                var stColor = stMap[last.status] || '#94a3b8';
                el('qa-surat-status').innerHTML = '<span style="color:'+stColor+';">'+last.status+'</span>';
                var suratLabel = (last.keperluan || last.jenis || 'Surat Pengantar');
                el('qa-surat-sub').textContent = suratLabel.length > 30 ? suratLabel.substring(0,30)+'…' : suratLabel;
            } else {
                el('qa-surat-status').textContent = 'Belum ada';
                el('qa-surat-sub').textContent = 'Ajukan surat pertama Anda';
            }
        }

        // ── Pengumuman RT ─────────────────────────────────────────────────
        var beritaDb = JSON.parse(localStorage.getItem('db_berita') || '[]');
        var readHash = localStorage.getItem('gt_local_berita_read') || '';
        var unread = beritaDb.filter(function(b){ return readHash.indexOf(String(b.id)) === -1; }).length;
        if (el('qa-berita-status')) {
            if (beritaDb.length === 0) {
                el('qa-berita-status').textContent = 'Belum ada';
                el('qa-berita-sub').textContent = 'Tidak ada pengumuman';
            } else if (unread > 0) {
                el('qa-berita-status').innerHTML = '<span style="color:#c084fc;"><i class="fa-solid fa-circle" style="font-size:0.5rem;vertical-align:middle;"></i> '+unread+' belum dibaca</span>';
                el('qa-berita-sub').textContent = beritaDb.length + ' total pengumuman';
            } else {
                el('qa-berita-status').innerHTML = '<span style="color:#4ade80;"><i class="fa-solid fa-check"></i> Semua dibaca</span>';
                el('qa-berita-sub').textContent = beritaDb.length + ' pengumuman';
            }
        }

        // ── Aduan Saya ────────────────────────────────────────────────────
        var aduanDb = JSON.parse(localStorage.getItem('db_aduan') || '[]');
        var aduanKu = warga ? aduanDb.filter(function(a){ return String(a.wargaId) === String(warga.id); }) : [];
        if (el('qa-aduan-status')) {
            if (aduanKu.length === 0) {
                el('qa-aduan-status').textContent = 'Tidak ada';
                el('qa-aduan-sub').textContent = 'Belum ada laporan';
            } else {
                var nProses = aduanKu.filter(function(a){ return a.status === 'Diproses'; }).length;
                var nTunggu = aduanKu.filter(function(a){ return a.status === 'Menunggu'; }).length;
                if (nProses > 0) {
                    el('qa-aduan-status').innerHTML = '<span style="color:#60a5fa;"><i class="fa-solid fa-spinner fa-spin"></i> '+nProses+' Diproses</span>';
                } else if (nTunggu > 0) {
                    el('qa-aduan-status').innerHTML = '<span style="color:#fb923c;">'+nTunggu+' Menunggu</span>';
                } else {
                    el('qa-aduan-status').innerHTML = '<span style="color:#4ade80;"><i class="fa-solid fa-check"></i> Selesai</span>';
                }
                el('qa-aduan-sub').textContent = aduanKu.length + ' total laporan';
            }
        }
    } catch(e){ console.warn('[loadQuickAccessPanel]', e); }
};
// ── 3. loadKoperasiData ──────────────────────────────────────
window.loadKoperasiData = function() {
    try {
        var db       = JSON.parse(localStorage.getItem('db_koperasi') || '{}');
        var simpanan = db.simpanan || [];
        var pinjaman = db.pinjaman || [];
        var fmt = window.fmt || function(v){ return 'Rp '+Number(v||0).toLocaleString('id-ID'); };
        var el  = function(id){ return document.getElementById(id); };
        var nik = (window.loggedInWarga && (window.loggedInWarga.nik || window.loggedInWarga.id)) || '';
        var nama= (window.loggedInWarga && window.loggedInWarga.nama) || '';

        var totalTab = simpanan
            .filter(function(s){ return s.nik===nik || s.nama===nama; })
            .reduce(function(acc,s){
                return acc + (s.jenis==='Penarikan' ? -Number(s.nominal||0) : Number(s.nominal||0));
            }, 0);

        var totalPinj = pinjaman
            .filter(function(p){ return (p.nik===nik||p.nama===nama) && p.status!=='Lunas'; })
            .reduce(function(acc,p){ return acc + Number(p.sisa||p.plafon||0); }, 0);

        var shu = Math.round(totalTab * 0.05);
        if (el('w_kop_tabungan')) el('w_kop_tabungan').textContent = fmt(totalTab);
        if (el('w_kop_pinjaman')) el('w_kop_pinjaman').textContent = fmt(totalPinj);
        if (el('w_kop_shu'))      el('w_kop_shu').textContent      = fmt(shu);

        // Tabel simpanan
        var tbSimpanan = el('tbody-w-simpanan');
        if (tbSimpanan) {
            tbSimpanan.innerHTML = simpanan
                .filter(function(s){ return s.nik===nik||s.nama===nama; })
                .map(function(s){
                    return '<tr><td>'+(s.tanggal||'-')+'</td><td>'+(s.jenis||'-')+'</td><td>'+fmt(s.nominal)+'</td></tr>';
                }).join('') || '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">Belum ada data</td></tr>';
        }

        // Tabel angsuran
        var tbCicilan = el('tbody-w-cicilan');
        if (tbCicilan) {
            var pinjamanSaya = pinjaman.filter(function(p){ return p.nik===nik||p.nama===nama; });
            tbCicilan.innerHTML = pinjamanSaya.map(function(p){
                return '<tr><td>'+(p.tanggal||'-')+'</td><td>'+fmt(p.plafon)+'</td><td>'+fmt(p.sisa||0)+'</td><td>'+(p.status||'-')+'</td></tr>';
            }).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Belum ada data</td></tr>';
        }

        // Tabel pinjaman lunas warga
        var tbPinjamanLunas = el('tbody-w-pinjaman-lunas');
        if (tbPinjamanLunas) {
            var pinjamanLunas = pinjaman.filter(function(p){ return (p.nik===nik||p.nama===nama) && p.status==='Lunas'; });
            tbPinjamanLunas.innerHTML = pinjamanLunas.map(function(p){
                return '<tr><td>'+(p.tanggal||'-')+'</td><td>'+fmt(p.plafon)+'</td><td>'+fmt(p.plafon)+'</td><td><span class="badge badge-selesai">Lunas</span></td></tr>';
            }).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Belum ada pinjaman yang lunas</td></tr>';
        }

        // Kop admin tabs
        var tbKopSimpanan = el('tbody-kop-simpanan');
        if (tbKopSimpanan) {
            tbKopSimpanan.innerHTML = simpanan.map(function(s,i){
                return '<tr><td>'+(i+1)+'</td><td>'+(s.nama||'-')+'</td><td>'+(s.tanggal||'-')+'</td><td>'+(s.jenis||'-')+'</td><td>'+fmt(s.nominal)+'</td></tr>';
            }).join('') || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">Belum ada data</td></tr>';
        }
        var tbKopPinjaman = el('tbody-kop-pinjaman');
        if (tbKopPinjaman) {
            tbKopPinjaman.innerHTML = pinjaman.map(function(p,i){
                return '<tr><td>'+(i+1)+'</td><td>'+(p.nama||'-')+'</td><td>'+(p.tanggal||'-')+'</td><td>'+fmt(p.plafon)+'</td><td>'+fmt(p.sisa||0)+'</td><td>'+(p.status||'-')+'</td></tr>';
            }).join('') || '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Belum ada data</td></tr>';
        }
        if (typeof loadKopLaporan === 'function') loadKopLaporan();
    } catch(e){ console.warn('[loadKoperasiData]', e); }
};
// ── 4. loadKopLaporan (sudah ada, skip) ─────────────────────

// ── 5. loadAdminDashboard ────────────────────────────────────
window.loadAdminDashboard = function() {
    try {
        var warga   = JSON.parse(localStorage.getItem('db_warga')  || '[]');
        var aduan   = JSON.parse(localStorage.getItem('db_aduan')  || '[]');
        var surat   = JSON.parse(localStorage.getItem('db_surat')  || '[]');
        var kas     = JSON.parse(localStorage.getItem('db_kas')    || '[]');
        var fmt = window.fmt || function(v){ return 'Rp '+Number(v||0).toLocaleString('id-ID'); };
        var el  = function(id){ return document.getElementById(id); };
        var saldo = kas.reduce(function(acc,k){
            return acc + ((k.tipe||'').toLowerCase()==='masuk' ? Number(k.nominal||0) : -Number(k.nominal||0));
        }, 0);
        if (el('admin-total-warga'))  el('admin-total-warga').textContent  = warga.length;
        if (el('admin-total-aduan'))  el('admin-total-aduan').textContent  = aduan.filter(function(a){ return a.status==='Menunggu'||a.status==='Diproses'||a.status==='Baru'||a.status==='Pending'; }).length;
        if (el('admin-total-surat'))  el('admin-total-surat').textContent  = surat.filter(function(s){ return s.status==='Proses'||s.status==='Baru'; }).length;
        if (el('admin-saldo-kas'))    el('admin-saldo-kas').textContent    = fmt(saldo);
        if (typeof window.updateNavBadges === 'function') window.updateNavBadges();
    } catch(e){ console.warn('[loadAdminDashboard]', e); }
};

// ── 6. loadNotulenAdmin ──────────────────────────────────────
window.loadNotulenAdmin = function() {
    try {
        var data = JSON.parse(localStorage.getItem('db_notulen') || '[]');
        var el   = function(id){ return document.getElementById(id); };
        var tb   = el('tbody-notulen');
        if (!tb) return;
        if (!data.length) {
            tb.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">Belum ada arsip notulen</td></tr>';
            return;
        }
        tb.innerHTML = data.map(function(n){
            return '<tr>' +
                '<td style="white-space:nowrap;">'+(n.tanggal||'-')+'</td>' +
                '<td><b>'+(n.judul||n.agenda||'-')+'</b></td>' +
                '<td style="white-space:nowrap;">' +
                  '<button class="btn-table btn-tbl-view" onclick="cetakNotulenPDF('+n.id+')" title="Unduh PDF Notulen"><i class="fa-solid fa-file-pdf"></i></button> ' +
                  '<button class="btn-table btn-tbl-del" onclick="hapusNotulen('+n.id+')" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
                '</td>' +
                '</tr>';
        }).join('');
    } catch(e){ console.warn('[loadNotulenAdmin]', e); }
};

window.hapusNotulen = window.hapusNotulen || function(id) {
    if (!confirm('Hapus notulen ini?')) return;
    var data = JSON.parse(localStorage.getItem('db_notulen') || '[]');
    data = data.filter(function(n){ return n.id !== id; });
    localStorage.setItem('db_notulen', JSON.stringify(data));
    window.loadNotulenAdmin();
};
// ── NOTULEN: simpanNotulen ──────────────────────────────────────────────
window.simpanNotulen = function(e) {
    e.preventDefault();
    var tgl   = document.getElementById('inp_notul_tgl').value.trim();
    var judul = document.getElementById('inp_notul_judul').value.trim();
    var isi   = document.getElementById('inp_notul_isi').value.trim();
    if (!tgl || !judul || !isi) { Swal.fire('Lengkapi Data', 'Tanggal, judul, dan isi rapat wajib diisi.', 'warning'); return; }
    var db = JSON.parse(localStorage.getItem('db_notulen') || '[]');
    db.unshift({ id: Date.now(), tanggal: tgl, judul: judul, isi: isi, created: new Date().toISOString() });
    localStorage.setItem('db_notulen', JSON.stringify(db));
    if (typeof syncSemuaData === 'function') syncSemuaData(true);
    e.target.reset();
    if (typeof loadNotulenAdmin === 'function') loadNotulenAdmin();
    Swal.fire({icon:'success', title:'Tersimpan!', text:'Notulen rapat berhasil diarsipkan.', timer:2000, showConfirmButton:false});
};

// ── ARISAN: simpanInfoArisan ─────────────────────────────────────────────
window.simpanInfoArisan = function(e) {
    e.preventDefault();
    var data = {
        arisanNama: document.getElementById('inp_arisan_nama').value.trim(),
        arisanTgl:  document.getElementById('inp_arisan_tgl').value.trim(),
        hostNama:   document.getElementById('inp_host_nama').value.trim(),
        hostTgl:    document.getElementById('inp_host_tgl').value.trim(),
        updated: new Date().toISOString()
    };
    if (!data.arisanNama || !data.arisanTgl) { Swal.fire('Lengkapi Data', 'Nama penerima arisan dan tanggal wajib diisi.', 'warning'); return; }
    localStorage.setItem('db_info_arisan', JSON.stringify(data));
    if (typeof syncSemuaData === 'function') syncSemuaData(true);
    e.target.reset();
    Swal.fire({icon:'success', title:'Berhasil!', text:'Info arisan diperbarui di dasbor warga.', timer:2000, showConfirmButton:false});
};

// ── NOTULEN AI: susunNotulenAI ──────────────────────────────────────────
window.susunNotulenAI = function() {
    var ta = document.getElementById('inp_notul_isi');
    if (!ta) return;
    var raw = (ta.value || '').trim();
    if (!raw) { Swal.fire('Kosong', 'Isi poin-poin hasil rapat terlebih dahulu sebelum dirapikan.', 'info'); return; }

    var lines = raw.split('\n').map(function(l){ return l.trim(); }).filter(function(l){ return l.length > 0; });
    var poin = [];
    var buf = '';

    lines.forEach(function(line) {
        var hasBullet = /^[\-\*\u2022\u00b7\>\u2192]|^\d+[\.)]/i.test(line);
        var stripped = line
            .replace(/^[\-\*\u2022\u00b7\>\u2192]+\s*/, '')
            .replace(/^\d+[\.)]+\s*/, '')
            .replace(/^[a-z][\.)]+\s*/i, '')
            .trim();
        if (!stripped) return;
        stripped = stripped.charAt(0).toUpperCase() + stripped.slice(1);
        if (!/[.!?;:]$/.test(stripped)) stripped += '.';
        if (hasBullet || buf === '') {
            if (buf) poin.push(buf);
            buf = stripped;
        } else {
            buf += ' ' + stripped;
        }
    });
    if (buf) poin.push(buf);

    var formatted = (poin.length > 0 ? poin : lines.map(function(l){
        return l.charAt(0).toUpperCase() + l.slice(1) + (!/[.!?;:]$/.test(l) ? '.' : '');
    })).map(function(p, i){ return (i+1) + '. ' + p; }).join('\n');

    Swal.fire({
        title: '<i class="fa-solid fa-wand-magic-sparkles" style="color:#6366f1"></i> Hasil — Rapikan Notulen',
        html: '<div style="text-align:left;max-height:340px;overflow-y:auto;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:0.9rem;white-space:pre-wrap;font-family:inherit;line-height:1.8;">' + formatted.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div><p style="font-size:0.78rem;color:#64748b;margin-top:10px;margin-bottom:0;">Klik <b>Terapkan</b> untuk mengganti isi textarea dengan teks di atas.</p>',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-check"></i> Terapkan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#6366f1',
        width: 640
    }).then(function(res) {
        if (res.isConfirmed) { ta.value = formatted; ta.focus(); }
    });
};

// ── NOTULEN PDF: cetakNotulenPDF ─────────────────────────────────────────
window.cetakNotulenPDF = function(id) {
    var db = JSON.parse(localStorage.getItem('db_notulen') || '[]');
    var n  = db.find(function(x){ return x.id === id; });
    if (!n) { Swal.fire('Error', 'Data notulen tidak ditemukan.', 'error'); return; }

    var s  = JSON.parse(localStorage.getItem('db_settings') || '{}');
    var namaRT         = s.namaRT         || 'RT 005';
    var namaRW         = s.namaRW         || 'RW 012';
    var namaKetua      = s.namaKetua      || '.....................';
    var namaSekretaris = s.namaSekretaris  || '.....................';
    var kecamatan      = (s.kecamatan     || 'CANDISARI').toUpperCase();
    var kelurahan      = (s.kelurahan     || 'TEGALSARI').toUpperCase();
    var alamatRT       = s.alamatRT       || 'Jl. Tegalsari, Semarang';

    var tglObj  = n.tanggal ? new Date(n.tanggal) : new Date();
    var HARI    = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    var BULAN_N = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    var tglLong  = HARI[tglObj.getDay()] + ', ' + tglObj.getDate() + ' ' + BULAN_N[tglObj.getMonth()] + ' ' + tglObj.getFullYear();
    var now      = new Date();
    var tglCetak = now.getDate() + ' ' + BULAN_N[now.getMonth()] + ' ' + now.getFullYear();

    var isiLines = (n.isi || '').trim().split('\n').filter(function(l){ return l.trim(); });
    var isiHtml  = isiLines.map(function(l, i) {
        var txt = l.trim()
            .replace(/^[\-\*\u2022\u00b7\>\u2192]+\s*/, '')
            .replace(/^\d+[\.)]+\s*/, '')
            .trim();
        if (!txt) return '';
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        if (!/[.!?;:]$/.test(txt)) txt += '.';
        return '<tr>' +
            '<td style="border:1px solid #ccc;padding:8px 10px;text-align:center;width:38px;vertical-align:top;font-weight:bold;">' + (i+1) + '</td>' +
            '<td style="border:1px solid #ccc;padding:8px 12px;line-height:1.75;">' + txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</td>' +
            '</tr>';
    }).filter(Boolean).join('');

    var esc = function(v){ return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };

    var htmlCetak =
        '<div style="width:794px;padding:56px 68px;box-sizing:border-box;background:#fff;color:#000;' +
        'font-family:\'Times New Roman\',Times,serif;font-size:13px;line-height:1.6;">' +

        // KOP SURAT
        '<div style="display:flex;align-items:center;border-bottom:4px double #000;padding-bottom:12px;margin-bottom:20px;">' +
        '<img src="Lambang_Kota_Semarang.png" style="width:80px;height:80px;object-fit:contain;margin-right:20px;" crossorigin="anonymous">' +
        '<div style="flex:1;text-align:center;">' +
        '<div style="font-size:16px;font-weight:bold;">PEMERINTAH KOTA SEMARANG</div>' +
        '<div style="font-size:16px;font-weight:bold;margin-top:2px;">KECAMATAN ' + kecamatan + '</div>' +
        '<div style="font-size:14px;font-weight:bold;margin-top:2px;">KELURAHAN ' + kelurahan + ' — ' + esc(namaRT) + ' / ' + esc(namaRW) + '</div>' +
        '<div style="font-size:12px;font-weight:normal;margin-top:2px;">' + esc(alamatRT) + '</div>' +
        '</div></div>' +

        // JUDUL
        '<div style="text-align:center;margin:18px 0 22px;">' +
        '<div style="font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:1px;text-decoration:underline;">NOTULEN RAPAT</div>' +
        '<div style="font-size:14px;font-weight:700;margin-top:6px;">' + esc(n.judul||'Rapat Warga') + '</div>' +
        '</div>' +

        // INFO RAPAT
        '<table style="width:100%;border:none;margin-bottom:18px;font-size:13px;">' +
        '<tr><td style="border:none;width:130px;padding:3px 0;">Hari, Tanggal</td><td style="border:none;width:10px;">:</td><td style="border:none;"><b>' + esc(tglLong) + '</b></td></tr>' +
        '<tr><td style="border:none;padding:3px 0;">Agenda</td><td style="border:none;">:</td><td style="border:none;">' + esc(n.judul||'-') + '</td></tr>' +
        '<tr><td style="border:none;padding:3px 0;">Tempat</td><td style="border:none;">:</td><td style="border:none;">Wilayah ' + esc(namaRT) + '</td></tr>' +
        '</table>' +

        // HASIL RAPAT
        '<div style="font-weight:bold;font-size:13px;margin-bottom:8px;text-decoration:underline;">HASIL DAN KEPUTUSAN RAPAT:</div>' +
        '<table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:28px;">' +
        '<thead><tr style="background:#f2f2f2;">' +
        '<th style="border:1px solid #ccc;padding:8px;width:40px;text-align:center;">No</th>' +
        '<th style="border:1px solid #ccc;padding:8px;text-align:left;">Poin Hasil Rapat</th>' +
        '</tr></thead>' +
        '<tbody>' + (isiHtml || '<tr><td colspan="2" style="border:1px solid #ccc;padding:10px;text-align:center;color:#888;">Tidak ada catatan.</td></tr>') + '</tbody>' +
        '</table>' +

        // PENUTUP
        '<p style="text-align:justify;line-height:1.85;margin-bottom:30px;">Demikian notulen rapat ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.</p>' +

        // TANDA TANGAN
        '<table style="width:100%;border:none;font-size:13px;margin-bottom:16px;">' +
        '<tr>' +
        '<td style="border:none;width:50%;text-align:center;vertical-align:top;padding:4px;">' +
        'Semarang, ' + tglCetak + '<br>Sekretaris ' + esc(namaRT) + '<br><br><br><br>' +
        '<b style="text-decoration:underline;">' + esc(namaSekretaris) + '</b>' +
        '</td>' +
        '<td style="border:none;width:50%;text-align:center;vertical-align:top;padding:4px;">' +
        'Mengetahui,<br>Ketua ' + esc(namaRT) + '<br><br><br><br>' +
        '<b style="text-decoration:underline;">' + esc(namaKetua) + '</b>' +
        '</td>' +
        '</tr></table>' +

        // FOOTER
        '<div style="text-align:center;font-size:10px;color:#666;border-top:1px solid #ddd;padding-top:6px;font-style:italic;">' +
        'Notulen dibuat oleh Smart Portal ' + esc(namaRT) + ' &bull; Dicetak: ' + tglCetak +
        '</div></div>';

    var title = 'Notulen Rapat — ' + (n.judul||'Rapat Warga') + ' — ' + tglLong;
    if (typeof downloadPdfFromHtml === 'function') {
        downloadPdfFromHtml(htmlCetak, title);
    } else {
        Swal.fire('Error', 'Fungsi unduh PDF belum siap. Coba refresh halaman.', 'error');
    }
};

// ── 7. loadPengaturan ────────────────────────────────────────
window.loadPengaturan = function() {
    try {
        var s = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var el = function(id){ return document.getElementById(id); };
        var fields = [
            ['set_nama_rt','namaRT'],['set_nama_rw','namaRW'],
            ['set_ketua','namaKetua'],['set_bendahara','namaBen'],
            ['set_sekretaris','namaSekretaris'],['set_nama_bank','namaBank'],
            ['set_no_rek','noRek'],['set_nominal_iuran','nominalIuran'],
            ['set_alamat','alamatRT'],['set_tahun','tahunBerdiri']
        ];
        fields.forEach(function(f){
            var inputEl = el(f[0]);
            if (inputEl && s[f[1]] !== undefined) inputEl.value = s[f[1]];
        });
    } catch(e){ console.warn('[loadPengaturan]', e); }
};

window.simpanPengaturanSistem = window.simpanPengaturanSistem || function() {
    try {
        var s = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var el = function(id){ return document.getElementById(id); };
        var fields = [
            ['set_nama_rt','namaRT'],['set_nama_rw','namaRW'],
            ['set_ketua','namaKetua'],['set_bendahara','namaBen'],
            ['set_sekretaris','namaSekretaris'],['set_nama_bank','namaBank'],
            ['set_no_rek','noRek'],['set_nominal_iuran','nominalIuran'],
            ['set_alamat','alamatRT'],['set_tahun','tahunBerdiri']
        ];
        fields.forEach(function(f){
            var inputEl = el(f[0]);
            if (inputEl) s[f[1]] = inputEl.value;
        });
        localStorage.setItem('db_settings', JSON.stringify(s));
        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon:'success', title:'Tersimpan!', timer:1200, showConfirmButton:false });
        } else { alert('Pengaturan tersimpan!'); }
    } catch(e){ console.warn('[simpanPengaturanSistem]', e); }
};

// ── 8. loadDaruratWarga ──────────────────────────────────────
window.exportExcelIuran = function() {
    try {
        if (typeof XLSX === 'undefined') { Swal.fire('Error', 'Library XLSX belum tersedia.', 'error'); return; }
        var loggedInWarga = window.loggedInWarga;
        if (!loggedInWarga) { Swal.fire('Error', 'Anda belum login.', 'error'); return; }
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var myIuran = dbIuran.filter(function(x){ return String(x.idWarga) === String(loggedInWarga.id); });
        if (!myIuran.length) { Swal.fire('Kosong', 'Belum ada data iuran untuk akun Anda.', 'info'); return; }
        var rows = [['Bulan Periode', 'Tanggal Tercatat', 'Nominal (Rp)', 'Status']];
        myIuran.sort(function(a,b){ return b.id - a.id; }).forEach(function(i){
            rows.push([i.bulan||'-', i.tglBayar||'-', Number(i.nominal||0), i.posted ? 'Valid' : 'Proses']);
        });
        var ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{wch:20},{wch:18},{wch:15},{wch:12}];
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Iuran Saya');
        XLSX.writeFile(wb, 'Riwayat_Iuran_'+loggedInWarga.nama.replace(/\s+/g,'_')+'.xlsx');
        Toast.fire({icon:'success', title:'File Excel berhasil diunduh!'});
    } catch(e) { console.error('[exportExcelIuran]', e); Swal.fire('Gagal', 'Gagal mengekspor data: '+e.message, 'error'); }
};

// ═══════════════════════════════════════════════════════════════
// BANTUAN SOSIAL — loadBantuanSosial, simpanCatatanBantuan, dll
// ═══════════════════════════════════════════════════════════════

// Helper label & warna status sosial
function _ssBadgeHtml(ss) {
    if (!ss || ss === 'Umum') return '<span class="badge" style="background:#f1f5f9;color:#475569;">Umum</span>';
    var map = { 'Janda': ['#fdf4ff','#7e22ce'], 'Duda': ['#fff7ed','#c2410c'], 'Lansia': ['#f0fdf4','#15803d'], 'Janda + Lansia': ['#fdf4ff','#7e22ce'], 'Duda + Lansia': ['#fff7ed','#c2410c'] };
    var c = map[ss] || ['#f1f5f9','#475569'];
    return '<span class="badge" style="background:'+c[0]+';color:'+c[1]+';border:1px solid '+c[1]+'33;">'+ss+'</span>';
}

function _ssHakHtml(ss) {
    if (!ss || ss === 'Umum') return '<small style="color:#94a3b8;">–</small>';
    var hak = [];
    if (ss.includes('Janda') || ss.includes('Duda')) hak.push('<span style="color:#7c3aed;font-size:0.8rem;"><i class="fa-solid fa-circle-xmark"></i> Bebas Iuran</span>');
    hak.push('<span style="color:#e11d48;font-size:0.8rem;"><i class="fa-solid fa-star"></i> Prioritas Bantuan</span>');
    if (ss.includes('Lansia')) hak.push('<span style="color:#15803d;font-size:0.8rem;"><i class="fa-solid fa-person-cane"></i> Prioritas Lansia</span>');
    return hak.join(' ');
}

window.loadBantuanSosial = function() {
    try {
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var dbBantuan = JSON.parse(localStorage.getItem('db_bantuan') || '[]');

        // Hitung statistik
        var cJanda = 0, cDuda = 0, cLansia = 0;
        dbWarga.forEach(function(w) {
            var ss = w.statusSosial || 'Umum';
            if (ss.includes('Janda')) cJanda++;
            if (ss.includes('Duda')) cDuda++;
            if (ss.includes('Lansia')) cLansia++;
        });
        var elJ = document.getElementById('bs-total-janda');
        var elD = document.getElementById('bs-total-duda');
        var elL = document.getElementById('bs-total-lansia');
        var elB = document.getElementById('bs-total-bantuan');
        if (elJ) elJ.textContent = cJanda;
        if (elD) elD.textContent = cDuda;
        if (elL) elL.textContent = cLansia;
        if (elB) elB.textContent = dbBantuan.length;

        // Isi tabel prioritas
        var tbPrioritas = document.getElementById('tbody-prioritas-bantuan');
        if (tbPrioritas) {
            var prioritas = dbWarga.filter(function(w) {
                if (w.statusSosial && w.statusSosial !== 'Umum') return true;
                if (w.pekerjaan === 'Tidak Bekerja') return true;
                if (w.pendapatan === 'Di Bawah UMR') return true;
                return false;
            });
            if (!prioritas.length) {
                tbPrioritas.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#94a3b8;"><i class="fa-solid fa-circle-info"></i> Belum ada warga dengan kriteria prioritas. Perbarui Status Sosial, Pekerjaan, atau Pendapatan di tab Data KK.</td></tr>';
            } else {
                tbPrioritas.innerHTML = '';
                // Urutkan: Janda+Lansia/Duda+Lansia dulu, lalu Janda/Duda, lalu Lansia
                function _prioOrder(w) {
                    if (w.statusSosial === 'Janda + Lansia' || w.statusSosial === 'Duda + Lansia') return 0;
                    if (w.statusSosial === 'Janda' || w.statusSosial === 'Duda') return 1;
                    if (w.statusSosial === 'Lansia') return 2;
                    if (w.pekerjaan === 'Tidak Bekerja' && w.pendapatan === 'Di Bawah UMR') return 3;
                    if (w.pekerjaan === 'Tidak Bekerja') return 4;
                    if (w.pendapatan === 'Di Bawah UMR') return 5;
                    return 9;
                }
                prioritas.sort(function(a, b) { return _prioOrder(a) - _prioOrder(b); });
                prioritas.forEach(function(w, i) {
                    var ekoBadge = '';
                    if (!w.statusSosial || w.statusSosial === 'Umum') {
                        var parts = [];
                        if (w.pekerjaan === 'Tidak Bekerja') parts.push('Tidak Bekerja');
                        if (w.pendapatan === 'Di Bawah UMR') parts.push('Di Bawah UMR');
                        ekoBadge = '<span class="badge" style="background:#fff7ed;color:#f97316;border:1px solid #fdba7433;">' + parts.join(' + ') + '</span>';
                    }
                    var pkrInfo = (w.pekerjaan||'') + (w.pendapatan ? ' · ' + w.pendapatan : '');
                    tbPrioritas.innerHTML += '<tr><td><b>' + (i+1) + '</b></td>' +
                        '<td><b>' + escapeHtml(w.nama) + '</b><br><small>' + escapeHtml(w.alamat||'-') + '</small>' + (pkrInfo ? '<br><small style="color:#7c3aed;">' + escapeHtml(pkrInfo) + '</small>' : '') + '</td>' +
                        '<td>' + escapeHtml(w.alamat||'-') + '</td>' +
                        '<td>' + (ekoBadge || _ssBadgeHtml(w.statusSosial)) + '</td>' +
                        '<td>' + _ssHakHtml(w.statusSosial) + '</td>' +
                        '<td><button class="btn-table btn-tbl-edit" title="Catat bantuan untuk warga ini" onclick="window._prefilBantuan(' + w.id + ')"><i class="fa-solid fa-hand-holding-heart"></i></button></td></tr>';
                });
            }
        }

        // Isi dropdown pilih penerima di form
        var selWarga = document.getElementById('bs-pilih-warga');
        if (selWarga) {
            selWarga.innerHTML = '<option value="">-- Pilih nama warga penerima --</option>';
            // Tampilkan semua warga aktif, prioritas di atas
            var sorted = dbWarga.slice().sort(function(a, b) {
                var pa = (a.statusSosial && a.statusSosial !== 'Umum') ? 0 : 1;
                var pb = (b.statusSosial && b.statusSosial !== 'Umum') ? 0 : 1;
                return pa - pb;
            });
            sorted.forEach(function(w) {
                var ss = w.statusSosial && w.statusSosial !== 'Umum' ? ' [' + w.statusSosial + ']' : '';
                var opt = document.createElement('option');
                opt.value = w.id;
                opt.setAttribute('data-ss', w.statusSosial || 'Umum');
                opt.textContent = w.nama + ss;
                selWarga.appendChild(opt);
            });
        }

        // Set default periode ke bulan ini
        var periodeEl = document.getElementById('bs-periode');
        if (periodeEl && !periodeEl.value) {
            var now = new Date();
            periodeEl.value = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
        }

        // Isi tabel riwayat bantuan
        var tbRiwayat = document.getElementById('tbody-riwayat-bantuan');
        if (tbRiwayat) {
            if (!dbBantuan.length) {
                tbRiwayat.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#94a3b8;">Belum ada catatan distribusi bantuan.</td></tr>';
            } else {
                tbRiwayat.innerHTML = '';
                dbBantuan.slice().reverse().forEach(function(b) {
                    var nomStr = b.nominal ? 'Rp ' + Number(b.nominal).toLocaleString('id-ID') : '–';
                    tbRiwayat.innerHTML += '<tr>' +
                        '<td>' + (b.tgl||'-') + '</td>' +
                        '<td><b>' + escapeHtml(b.namaWarga||'-') + '</b></td>' +
                        '<td>' + _ssBadgeHtml(b.statusSosial) + '</td>' +
                        '<td><b>' + escapeHtml(b.jenisBantuan||'-') + '</b></td>' +
                        '<td>' + (b.periode||'-') + '</td>' +
                        '<td>' + nomStr + '</td>' +
                        '<td><small>' + escapeHtml(b.catatan||'-') + '</small></td>' +
                        '<td><button class="btn-table btn-tbl-del" onclick="window.hapusBantuan(' + b.id + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                        '</tr>';
                });
            }
        }
    } catch(e) { console.error('[loadBantuanSosial]', e); }
};

window._prefilBantuan = function(idWarga) {
    var selWarga = document.getElementById('bs-pilih-warga');
    if (selWarga) selWarga.value = idWarga;
    var formEl = document.querySelector('#bantuan-sosial form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.simpanCatatanBantuan = function() {
    try {
        var idWarga = document.getElementById('bs-pilih-warga').value;
        if (!idWarga) { Swal.fire('Perhatian', 'Pilih warga penerima terlebih dahulu.', 'warning'); return; }
        var selEl = document.getElementById('bs-pilih-warga');
        var namaWarga = selEl.options[selEl.selectedIndex].text.replace(/ \[.*\]$/, '');
        var ssAttr = selEl.options[selEl.selectedIndex].getAttribute('data-ss') || 'Umum';
        var jenis = document.getElementById('bs-jenis-bantuan').value;
        var periode = document.getElementById('bs-periode').value;
        var nominal = document.getElementById('bs-nominal').value;
        var catatan = document.getElementById('bs-catatan').value.trim();
        if (!periode) { Swal.fire('Perhatian', 'Isi periode bantuan terlebih dahulu.', 'warning'); return; }

        var now = new Date();
        var tgl = now.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
        var dbBantuan = JSON.parse(localStorage.getItem('db_bantuan') || '[]');
        dbBantuan.push({
            id: Date.now(),
            idWarga: idWarga, namaWarga: namaWarga, statusSosial: ssAttr,
            jenisBantuan: jenis, periode: periode, nominal: nominal ? Number(nominal) : null,
            catatan: catatan, tgl: tgl
        });
        localStorage.setItem('db_bantuan', JSON.stringify(dbBantuan));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);

        // Reset form
        document.getElementById('bs-pilih-warga').value = '';
        document.getElementById('bs-nominal').value = '';
        document.getElementById('bs-catatan').value = '';

        Toast.fire({ icon: 'success', title: 'Catatan bantuan berhasil disimpan!' });
        window.loadBantuanSosial();
    } catch(e) { console.error('[simpanCatatanBantuan]', e); Swal.fire('Error', e.message, 'error'); }
};

window.hapusBantuan = function(id) {
    Swal.fire({ title:'Hapus catatan ini?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ef4444', cancelButtonText:'Batal', confirmButtonText:'Ya, Hapus' }).then(function(r) {
        if (r.isConfirmed) {
            var db = JSON.parse(localStorage.getItem('db_bantuan') || '[]');
            db = db.filter(function(b){ return String(b.id) !== String(id); });
            localStorage.setItem('db_bantuan', JSON.stringify(db));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            Toast.fire({ icon:'success', title:'Catatan dihapus.' });
            window.loadBantuanSosial();
        }
    });
};

window.eksporExcelBantuan = function() {
    try {
        if (typeof XLSX === 'undefined') { Swal.fire('Error', 'Library XLSX belum tersedia.', 'error'); return; }
        var db = JSON.parse(localStorage.getItem('db_bantuan') || '[]');
        if (!db.length) { Swal.fire('Kosong', 'Belum ada data bantuan untuk diekspor.', 'info'); return; }
        var rows = [['No', 'Tanggal', 'Nama Warga', 'Status Sosial', 'Jenis Bantuan', 'Periode', 'Nominal (Rp)', 'Catatan']];
        db.slice().reverse().forEach(function(b, i) {
            rows.push([i+1, b.tgl||'-', b.namaWarga||'-', b.statusSosial||'-', b.jenisBantuan||'-', b.periode||'-', b.nominal||0, b.catatan||'-']);
        });
        var ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{wch:4},{wch:18},{wch:22},{wch:18},{wch:18},{wch:12},{wch:14},{wch:30}];
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bantuan Sosial RT');
        XLSX.writeFile(wb, 'Bantuan_Sosial_RT005_' + new Date().toLocaleDateString('id-ID').replace(/\//g,'-') + '.xlsx');
        Toast.fire({ icon:'success', title:'File Excel berhasil diunduh!' });
    } catch(e) { console.error('[eksporExcelBantuan]', e); Swal.fire('Gagal', e.message, 'error'); }
};

// ── Tambah db_bantuan ke runRefreshers auto-sync scope ──
// (bantuan-sosial dimuat via openAdminTab loader, tidak perlu runRefreshers tambahan)


// ═══════════════════════════════════════════════════════════════
// FITUR BARU: togglePendapatanField, toggleDataSensitif, loadNewsTicker
// ═══════════════════════════════════════════════════════════════

// [3+4] Toggle visibilitas dropdown Pendapatan berdasarkan pilihan Pekerjaan
window.togglePendapatanField = function(prefix) {
    var groupId = prefix === 'adm' ? 'adm-pendapatan-group' : 'warga-pendapatan-group';
    var pekerjaanId = prefix === 'adm' ? 'adm-kk-pekerjaan' : 'kk-pekerjaan';
    var pelEl = document.getElementById(pekerjaanId);
    var grEl = document.getElementById(groupId);
    if (!pelEl || !grEl) return;
    grEl.style.display = (pelEl.value && pelEl.value !== '') ? 'block' : 'none';
    if (!pelEl.value) {
        var pendEl = document.getElementById(prefix === 'adm' ? 'adm-kk-pendapatan' : 'kk-pendapatan');
        if (pendEl) pendEl.value = '';
    }
};

// [1] Toggle masking data sensitif di tabel KK Admin
window._GT_SHOW_SENSITIVE = false;
window._gtMaskData = function(val, last) {
    if (!val) return '-';
    var s = String(val);
    if (window._GT_SHOW_SENSITIVE) return s;
    return '•'.repeat(Math.max(0, s.length - last)) + s.slice(-last);
};
window.toggleDataSensitif = function() {
    window._GT_SHOW_SENSITIVE = !window._GT_SHOW_SENSITIVE;
    var btn = document.getElementById('btn-toggle-sensitive');
    if (btn) {
        btn.innerHTML = window._GT_SHOW_SENSITIVE
            ? '<i class="fa-solid fa-eye-slash"></i> Sembunyikan Data'
            : '<i class="fa-solid fa-eye"></i> Buka Data Sensitif';
        btn.style.background = window._GT_SHOW_SENSITIVE ? '#dc2626' : '#7c3aed';
    }
    if (typeof window.loadTabelKKAdmin === 'function') window.loadTabelKKAdmin();
};





// ═══════════════════════════════════════════════════════════════
// GT PORTAL BERITA — PREMIUM NEWS ENGINE
// ═══════════════════════════════════════════════════════════════
(function() {

var _state = {
    allItems: [],      // all fetched articles
    filtered: [],      // after search/cat filter
    page: 0,
    pageSize: 12,
    cat: 'Semua',
    query: '',
    loaded: false,
    loading: false,
    refreshTimer: null,
    bookmarks: []
};

// Sumber RSS — diambil langsung via CORS proxy + DOMParser (tanpa rss2json)
var SOURCES = [
    { name:'Detik',       cls:'src-detik',   url:'https://rss.detik.com/index.php/detikcom' },
    { name:'Kompas',      cls:'src-kompas',  url:'https://rss.kompas.com/robotic-with-cors/kompas-news/index.xml' },
    { name:'Google News', cls:'src-google',  url:'https://news.google.com/rss?hl=id&gl=ID&ceid=ID:id' },
    { name:'CNBC Ind',    cls:'src-detik',   url:'https://www.cnbcindonesia.com/rss' },
    { name:'Tribun',      cls:'src-default', url:'https://www.tribunnews.com/rss' }
];

// CORS proxy — tidak perlu API key, baca RSS secara langsung
var CORS_PROXY = 'https://corsproxy.io/?';

// Kategori keyword map
var CAT_KEYS = {
    'Nasional':   ['nasional','politik','pemerintah','dpr','presiden','menteri','indonesia'],
    'Ekonomi':    ['ekonomi','bisnis','keuangan','pasar','saham','rupiah','inflasi','pajak','perdagangan','ihsg'],
    'Teknologi':  ['teknologi','digital','ai','internet','gadget','aplikasi','startup','inovasi','software'],
    'Olahraga':   ['olahraga','sepak bola','bola','basket','bulu tangkis','atletik','liga','piala','timnas'],
    'Gaya Hidup': ['gaya hidup','kesehatan','kuliner','fashion','wisata','travel','otomotif','hiburan','film','musik']
};

function detectCat(item) {
    var text = ((item.title||'') + ' ' + (item.description||'') + ' ' + (item.categories||[]).join(' ')).toLowerCase();
    for (var cat in CAT_KEYS) {
        var keys = CAT_KEYS[cat];
        for (var i = 0; i < keys.length; i++) { if (text.indexOf(keys[i]) >= 0) return cat; }
    }
    return 'Nasional';
}

function timeAgo(pubDate) {
    if (!pubDate) return '';
    var d = new Date(pubDate); var now = Date.now();
    var diff = Math.floor((now - d.getTime()) / 1000);
    if (diff < 60) return diff + 'd lalu';
    if (diff < 3600) return Math.floor(diff/60) + ' mnt lalu';
    if (diff < 86400) return Math.floor(diff/3600) + ' jam lalu';
    if (diff < 604800) return Math.floor(diff/86400) + ' hr lalu';
    return d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
}

function srcCls(name) {
    if (!name) return 'src-default';
    var n = name.toLowerCase();
    if (n.includes('kompas')) return 'src-kompas';
    if (n.includes('detik')) return 'src-detik';
    if (n.includes('cnn')) return 'src-cnn';
    if (n.includes('tempo')) return 'src-tempo';
    if (n.includes('antara')) return 'src-antara';
    if (n.includes('google')) return 'src-google';
    return 'src-default';
}

function loadBookmarks() {
    try { _state.bookmarks = JSON.parse(localStorage.getItem('gt_news_bookmarks') || '[]'); } catch(_) { _state.bookmarks = []; }
}
function saveBookmarks() {
    try { localStorage.setItem('gt_news_bookmarks', JSON.stringify(_state.bookmarks)); } catch(_) {}
}
function isBookmarked(link) { return _state.bookmarks.some(function(b) { return b.link === link; }); }

window.gtNewsToggleBookmark = function(link, title, thumb, source, pubDate, e) {
    if (e) { e.stopPropagation(); }
    loadBookmarks();
    var idx = _state.bookmarks.findIndex(function(b) { return b.link === link; });
    if (idx >= 0) { _state.bookmarks.splice(idx, 1); }
    else { _state.bookmarks.unshift({ link: link, title: title, thumb: thumb, source: source, pubDate: pubDate, saved: Date.now() }); if (_state.bookmarks.length > 100) _state.bookmarks.pop(); }
    saveBookmarks();
    renderAll();
};

window.gtNewsShare = function(link, title, e) {
    if (e) e.stopPropagation();
    if (navigator.share) { navigator.share({ title: title, url: link }).catch(function(){}); }
    else { try { navigator.clipboard.writeText(link); Swal.fire({toast:true,position:'bottom-end',icon:'success',title:'Link disalin!',timer:2000,showConfirmButton:false}); } catch(_) { window.open(link,'_blank'); } }
};

function buildHero(item) {
    var el = document.getElementById('gt-news-hero');
    if (!el) return;
    var bm = isBookmarked(item.link);
    el.innerHTML = '';

    if (item.thumbnail) {
        var img = document.createElement('img');
        img.className = 'gt-news-hero-img';
        img.src = item.thumbnail;
        img.alt = '';
        img.loading = 'lazy';
        img.onerror = function() { this.style.opacity = '0.15'; };
        el.appendChild(img);
    } else {
        var bg = document.createElement('div');
        bg.style.cssText = 'width:100%;height:100%;background:linear-gradient(135deg,#1e3a5f,#0f172a);';
        el.appendChild(bg);
    }

    var overlay = document.createElement('div');
    overlay.className = 'gt-news-hero-overlay';
    el.appendChild(overlay);

    var cnt = document.createElement('div');
    cnt.className = 'gt-news-hero-content';

    var srcSpan = document.createElement('span');
    srcSpan.className = 'gt-hero-source gt-card-source-badge ' + srcCls(item._source);
    srcSpan.textContent = item._source || 'Berita';
    cnt.appendChild(srcSpan);

    var h2 = document.createElement('h2');
    h2.className = 'gt-hero-title';
    h2.textContent = item.title || '';
    cnt.appendChild(h2);

    var meta = document.createElement('div');
    meta.className = 'gt-hero-meta';

    var timeSpan = document.createElement('span');
    timeSpan.className = 'gt-hero-time';
    timeSpan.innerHTML = '<i class="fa-regular fa-clock"></i> ' + timeAgo(item.pubDate);
    meta.appendChild(timeSpan);

    var actions = document.createElement('div');
    actions.className = 'gt-hero-actions';

    var bmBtn = document.createElement('button');
    bmBtn.className = 'gt-hero-btn' + (bm ? ' bookmarked' : '');
    bmBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> ' + (bm ? 'Tersimpan' : 'Simpan');
    bmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.gtNewsToggleBookmark(item.link, item.title, item.thumbnail || '', item._source || '', item.pubDate || '', e);
    });
    actions.appendChild(bmBtn);

    var shareBtn = document.createElement('button');
    shareBtn.className = 'gt-hero-btn';
    shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Bagikan';
    shareBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.gtNewsShare(item.link, item.title, e);
    });
    actions.appendChild(shareBtn);

    meta.appendChild(actions);
    cnt.appendChild(meta);
    el.appendChild(cnt);

    el.style.cursor = 'pointer';
    el.onclick = function(e) { if (!e.target.closest('button')) window.open(item.link, '_blank'); };
}

function buildTrending(items) {
    var el = document.getElementById('gt-trending-scroll');
    if (!el) return;
    var top = items.slice(0, 10);
    el.innerHTML = top.map(function(item, i) {
        return '<div class="gt-trending-chip" onclick="window.open(\'' + (item.link||'').replace(/'/g,"'") + '\',\'_blank\')">' +
            '<span class="gt-trending-chip-num">' + (i+1) + '</span>' +
            '<span class="gt-trending-chip-title">' + (item.title||'') + '</span></div>';
    }).join('');
}

function buildBreaking(items) {
    var el = document.getElementById('gt-brk-inner');
    if (!el) return;
    var texts = items.slice(0, 20).map(function(item) {
        return '<span style="margin-right:50px;cursor:pointer;" onclick="window.open(\'' + (item.link||'').replace(/'/g,"'") + '\',\'_blank\')">' +
            '<span style="color:#e11d48;font-weight:700;">' + (item._source||'') + '</span> ' +
            '<span style="color:#94a3b8;">' + (item.title||'') + '</span></span>' +
            '<span style="color:#334155;margin-right:50px;">&#9679;</span>';
    }).join('');
    el.innerHTML = texts + texts; // duplicate for seamless loop
    var dur = Math.max(40, items.length * 5);
    el.style.animationDuration = dur + 's';
}

function buildCard(item) {
    var bm = isBookmarked(item.link);
    function esc2(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    var link = item.link || '#';
    var src = item._source || 'Berita';
    var thumb = item.thumbnail || '';
    return '<div class="gt-news-card" data-link="' + esc2(link) + '" data-title="' + esc2(item.title||'') + '" data-thumb="' + esc2(thumb) + '" data-src="' + esc2(src) + '" data-pub="' + esc2(item.pubDate||'') + '">' +
        '<div class="gt-news-card-thumb-wrap">' +
          (thumb ? '<img class="gt-news-card-thumb" src="' + esc2(thumb) + '" loading="lazy" alt="">' :
            '<div class="gt-news-card-thumb" style="background:#1e293b;display:flex;align-items:center;justify-content:center;"><i class="fa-regular fa-newspaper" style="color:#475569;font-size:2rem;"></i></div>') +
        '</div>' +
        '<div class="gt-card-body">' +
          '<div class="gt-card-source-row">' +
            '<span class="gt-card-source-badge ' + srcCls(src) + '">' + esc2(src) + '</span>' +
            '<span class="gt-card-time"><i class="fa-regular fa-clock"></i> ' + timeAgo(item.pubDate) + '</span>' +
          '</div>' +
          '<p class="gt-card-title">' + esc2(item.title||'-') + '</p>' +
          '<div class="gt-card-footer">' +
            '<button class="gt-card-action gt-bm-btn' + (bm ? ' bookmarked' : '') + '"><i class="fa-solid fa-bookmark"></i> ' + (bm ? 'Tersimpan' : 'Simpan') + '</button>' +
            '<button class="gt-card-action gt-share-btn"><i class="fa-solid fa-share-nodes"></i> Bagikan</button>' +
          '</div>' +
        '</div></div>';
}

// Delegated click handler for news cards
document.addEventListener('click', function(e) {
    var card = e.target.closest('.gt-news-card');
    if (!card) return;
    var link = card.getAttribute('data-link');
    var title = card.getAttribute('data-title');
    var thumb = card.getAttribute('data-thumb');
    var src = card.getAttribute('data-src');
    var pub = card.getAttribute('data-pub');
    if (e.target.closest('.bm-btn')) {
        e.stopPropagation();
        window.gtNewsToggleBookmark(link, title, thumb, src, pub, e);
        return;
    }
    if (e.target.closest('.share-btn')) {
        e.stopPropagation();
        window.gtNewsShare(link, title, e);
        return;
    }
    if (link && link !== '#') window.open(link, '_blank');
});

function setStatus(msg, online) {
    var dot = document.getElementById('gt-news-dot');
    var txt = document.getElementById('gt-news-status-text');
    if (dot) dot.style.background = online ? '#22c55e' : '#f59e0b';
    if (txt) txt.textContent = msg;
}

function renderAll() {
    loadBookmarks();
    var grid = document.getElementById('gt-news-grid');
    var lmw = document.getElementById('gt-load-more-wrap');
    var cnt = document.getElementById('gt-news-count');
    if (!grid) return;

    var items;
    if (_state.cat === 'Bookmark') {
        items = _state.bookmarks.slice();
    } else {
        items = _state.allItems.filter(function(item) {
            if (_state.cat !== 'Semua' && item._cat !== _state.cat) return false;
            if (_state.query) {
                var q = _state.query.toLowerCase();
                return (item.title||'').toLowerCase().includes(q) || (item._source||'').toLowerCase().includes(q);
            }
            return true;
        });
    }
    _state.filtered = items;
    var show = items.slice(0, (_state.page + 1) * _state.pageSize);
    if (show.length === 0) {
        grid.innerHTML = '<div class="gt-news-empty" style="grid-column:1/-1;"><i class="fa-regular fa-newspaper"></i><p>Tidak ada berita ditemukan.</p></div>';
        if (lmw) lmw.style.display = 'none';
        if (cnt) cnt.textContent = '0 artikel';
        return;
    }
    grid.innerHTML = show.map(buildCard).join('');
    if (lmw) lmw.style.display = (items.length > show.length) ? 'block' : 'none';
    if (cnt) cnt.textContent = items.length + ' artikel';
}

window.gtNewsLoadMore = function() {
    _state.page++;
    renderAll();
};

window.gtNewsSetCat = function(btn, cat) {
    _state.cat = cat;
    _state.page = 0;
    document.querySelectorAll('#gt-news-nav .gt-cat-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderAll();
};

window.gtNewsSearch = function(q) {
    _state.query = (q||'').trim();
    _state.page = 0;
    renderAll();
    // Update jumlah hasil
    setTimeout(function() {
        var cnt = document.getElementById('gt-news-search-count');
        if (!cnt) return;
        if (!_state.query) { cnt.style.display = 'none'; cnt.textContent = ''; return; }
        var cards = document.querySelectorAll('#gt-news-grid .gt-news-card');
        cnt.style.display = cards.length > 0 ? 'block' : 'block';
        cnt.textContent = cards.length + ' hasil';
        cnt.style.color = cards.length === 0 ? '#ef4444' : '#64748b';
    }, 120);
};

function parseRssXml(xmlText, src) {
    try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlText, 'text/xml');
        var items = doc.querySelectorAll('item');
        var result = [];
        var feedTitleEl = doc.querySelector('channel > title');
        var feedTitle = feedTitleEl ? feedTitleEl.textContent.replace(/\s*[-|].*$/,'').trim() : src.name;
        items.forEach(function(item) {
            var title = (item.querySelector('title') || {}).textContent || '';
            // link can be text node or attribute
            var linkEl = item.querySelector('link');
            var link = '#';
            if (linkEl) {
                link = linkEl.textContent.trim() || linkEl.getAttribute('href') || '#';
                if (!link || link === '#') {
                    var next = linkEl.nextSibling;
                    if (next && next.nodeType === 3) link = next.textContent.trim() || '#';
                }
            }
            var pubDate = (item.querySelector('pubDate') || {}).textContent || '';
            var desc = (item.querySelector('description') || {}).textContent || '';
            var thumb = '';
            var enc = item.querySelector('enclosure');
            if (enc) thumb = enc.getAttribute('url') || '';
            if (!thumb) {
                var media = item.querySelector('content');
                if (media) thumb = media.getAttribute('url') || '';
            }
            if (!thumb) {
                var mediaThumb = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
                if (mediaThumb) thumb = mediaThumb.getAttribute('url') || '';
            }
            if (!thumb && desc) {
                var imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch) thumb = imgMatch[1];
            }
            result.push({
                title: title,
                link: link,
                pubDate: pubDate,
                thumbnail: thumb,
                description: desc,
                categories: [],
                _source: feedTitle || src.name,
                _srcCls: src.cls,
                _cat: ''
            });
        });
        return result;
    } catch (e) { return []; }
}

function fetchSource(src) {
    var url = CORS_PROXY + encodeURIComponent(src.url);
    return fetch(url)
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
        })
        .then(function(text) { return parseRssXml(text, src); })
        .catch(function() { return []; });
}

window.gtNewsRefresh = function(force) {
    if (_state.loading && !force) return;
    _state.loading = true;
    _state.loaded = false;
    setStatus('Memuat berita…', false);
    var grid = document.getElementById('gt-news-grid');
    if (grid) grid.innerHTML = [1,2,3,4,5,6].map(function() { return '<div class="gt-skel" style="height:240px;border-radius:14px;"></div>'; }).join('');

    var promises = SOURCES.map(fetchSource);
    Promise.allSettled(promises).then(function(results) {
        var all = [];
        results.forEach(function(r) { if (r.status === 'fulfilled') all = all.concat(r.value); });
        // Sort by date descending
        all.sort(function(a, b) { return new Date(b.pubDate) - new Date(a.pubDate); });
        // Assign categories
        all.forEach(function(item) { item._cat = detectCat(item); });
        // Deduplicate by title similarity
        var seen = {};
        all = all.filter(function(item) {
            var key = (item.title||'').substring(0,50).toLowerCase();
            if (seen[key]) return false;
            seen[key] = true; return true;
        });
        _state.allItems = all;
        _state.page = 0;
        _state.loaded = true;
        _state.loading = false;
        // Expose articles globally so hero slider can access them
        window.__gtNewsAllArticles = all;
        loadBookmarks();
        if (all.length > 0) {
            // Build hero slider (replaces single-hero)
            if (typeof window.gtBuildHeroSlider === 'function') {
                window.gtBuildHeroSlider(all);
            }
            buildHero(all[0]);
            buildTrending(all);
            buildBreaking(all);
            renderAll();
            setStatus('Diperbarui ' + new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}), true);
            var cnt = document.getElementById('gt-news-count');
            if (cnt) cnt.textContent = all.length + ' artikel dari ' + SOURCES.length + ' sumber';
        } else {
            if (grid) grid.innerHTML = '<div class="gt-news-empty" style="grid-column:1/-1;"><i class="fa-solid fa-wifi-slash"></i><p>Gagal memuat berita. Periksa koneksi internet Anda.</p><button class="gt-load-more-btn" style="margin-top:12px;" onclick="window.gtNewsRefresh(true)"><i class="fa-solid fa-rotate"></i> Coba Lagi</button></div>';
            setStatus('Gagal memuat — coba lagi', false);
        }
        // Reset auto-refresh timer
        if (_state.refreshTimer) clearTimeout(_state.refreshTimer);
        _state.refreshTimer = setTimeout(function() { window.gtNewsRefresh(true); }, 5 * 60 * 1000);
    });
};

window.gtNewsInit = function() {
    window.gtNewsBeritaLokal();
    if (_state.loaded && _state.allItems.length > 0) { renderAll(); return; }
    window.gtNewsRefresh(true);
};


})(); // end news IIFE

// ─── Berita Lokal RT 005 ───────────────────────────────────────────────────
window.gtNewsBeritaLokal = function() {
    var wrap = document.getElementById('gt-berita-lokal-wrap');
    var grid = document.getElementById('gt-berita-lokal-grid');
    var cnt  = document.getElementById('gt-bl-count');
    if (!wrap || !grid) return;
    var db = [];
    try { db = JSON.parse(localStorage.getItem('db_berita') || '[]'); } catch(_) {}
    if (!db.length) { wrap.style.display = 'none'; return; }
    db = db.slice().reverse(); // terbaru di atas
    wrap.style.display = 'block';
    if (cnt) cnt.textContent = db.length + ' pengumuman';
    var catColors = { 'Info Warga':'#2563eb', 'Berita Duka':'#64748b', 'Kerja Bakti':'#16a34a', 'Lainnya':'#7c3aed' };
    grid.innerHTML = db.map(function(b) {
        var c = catColors[b.kategori] || '#3b82f6';
        var imgHtml = b.foto ? '<div style="height:120px;overflow:hidden;border-radius:10px 10px 0 0;"><img src="' + b.foto + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy"></div>' : '';
        var isiSingkat = (b.isi || '').length > 100 ? b.isi.substring(0,100) + '…' : (b.isi || '');
        return '<div onclick="bukaDetailBerita(' + b.id + ')" style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;" onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 20px rgba(0,0,0,0.3)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">' +
            imgHtml +
            '<div style="padding:12px 14px;">' +
              '<div style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:6px;font-size:0.7rem;font-weight:700;color:#fff;background:' + c + ';margin-bottom:8px;">' + (b.kategori||'Info') + '</div>' +
              '<div style="font-weight:700;color:#f1f5f9;font-size:0.9rem;line-height:1.4;margin-bottom:6px;">' + (b.judul||'') + '</div>' +
              '<div style="font-size:0.8rem;color:#94a3b8;margin-bottom:6px;">' + isiSingkat + '</div>' +
              '<div style="font-size:0.72rem;color:#475569;"><i class="fa-regular fa-clock"></i> ' + (b.tgl||'') + '</div>' +
            '</div></div>';
    }).join('');
};


window.loadDaruratWarga = function() {
    try {
        var data = JSON.parse(localStorage.getItem('db_darurat') || '[]');
        var container = document.getElementById('container-darurat-warga');
        if (!container) return;
        if (!data.length) {
            container.innerHTML = '<div style="text-align:center;padding:24px;color:#94a3b8;grid-column:1/-1;"><i class="fa-solid fa-circle-check" style="font-size:2rem;color:#10b981;"></i><p style="margin-top:10px;">Belum ada kontak darurat.</p></div>';
            return;
        }
        container.innerHTML = data.map(function(d){
            var iconParts = (d.icon||'fa-phone').split('|');
            var iconCls   = iconParts[0] || 'fa-phone';
            var iconColor = d.color || iconParts[1] || '#ef4444';
            var waBtn = d.wa ? '<a href="https://wa.me/'+d.wa+'" target="_blank" title="WhatsApp" style="display:inline-flex;align-items:center;gap:4px;background:#dcfce7;color:#16a34a;border-radius:8px;padding:4px 10px;font-size:0.8rem;text-decoration:none;margin-top:6px;"><i class="fa-brands fa-whatsapp"></i> WA</a>' : '';
            var mapsBtn = d.maps ? '<a href="'+d.maps+'" target="_blank" title="Peta" style="display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1d4ed8;border-radius:8px;padding:4px 10px;font-size:0.8rem;text-decoration:none;margin-top:6px;margin-left:4px;"><i class="fa-solid fa-map-location-dot"></i> Maps</a>' : '';
            return '<div class="darurat-item stat-box" style="border-left:4px solid '+iconColor+';padding:14px;cursor:default;text-align:left;">'
                + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
                + '<span style="background:'+iconColor+'22;color:'+iconColor+';width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;"><i class="fa-solid '+iconCls+'"></i></span>'
                + '<div><b style="color:#1e293b;font-size:0.95rem;line-height:1.3;">'+d.nama+'</b><br>'
                + '<span style="color:#475569;font-size:0.9rem;font-weight:600;">'+d.telp+'</span></div>'
                + '</div>'
                + waBtn + mapsBtn
                + '</div>';
        }).join('');
    } catch(e){ console.warn('[loadDaruratWarga]', e); }
};
// ── 9. loadArsipBA (stub aman) ───────────────────────────────
window.loadArsipBA = window.loadArsipBA || function() {
    try {
        var el = document.getElementById('tbody-arsip-ba') || document.getElementById('arsip-ba-list');
        if (el) el.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">Belum ada arsip</td></tr>';
    } catch(e){}
};



// ?? INJEKSI DATA LAYANAN DARURAT SEMARANG ??
(function(){
    var existing = JSON.parse(localStorage.getItem('db_darurat') || '[]');
    var seed = [
        {
            id: 1,
            nama: 'Call Center 112 Semarang',
            telp: '112',
            wa: '',
            maps: 'https://maps.google.com/?q=Balai+Kota+Semarang',
            icon: 'fa-headset|#ef4444'
        },
        {
            id: 2,
            nama: 'Polrestabes Semarang',
            telp: '110 / (024) 8444444',
            wa: '08112770110',
            maps: 'https://maps.google.com/?q=Polrestabes+Semarang',
            icon: 'fa-shield-halved|#3b82f6'
        },
        {
            id: 3,
            nama: 'Dinas Pemadam Kebakaran Kota Semarang',
            telp: '113 / (024) 7605871',
            wa: '',
            maps: 'https://maps.google.com/?q=Dinas+Pemadam+Kebakaran+Kota+Semarang',
            icon: 'fa-fire-extinguisher|#f97316'
        },
        {
            id: 4,
            nama: 'PMI Kota Semarang (Layanan Ambulans)',
            telp: '(024) 3515050',
            wa: '085225155050',
            maps: 'https://maps.google.com/?q=PMI+Kota+Semarang',
            icon: 'fa-ambulance|#10b981'
        },
        {
            id: 5,
            nama: 'Basarnas Semarang',
            telp: '115 / (024) 7629192',
            wa: '',
            maps: 'https://maps.google.com/?q=Kantor+Pencarian+dan+Pertolongan+Semarang',
            icon: 'fa-headset|#ef4444'
        }
    ];
    // Hanya inject jika db_darurat masih kosong
    if (!existing.length) {
        localStorage.setItem('db_darurat', JSON.stringify(seed));
        console.log('[SmartPortal] Injeksi 5 data layanan darurat Semarang berhasil.');
    } else {
        console.log('[SmartPortal] db_darurat sudah ada (' + existing.length + ' data), skip injeksi.');
    }
})();


// ═══════════════════════════════════════════════════════
//  Dashboard Tab Switcher
// ═══════════════════════════════════════════════════════
window.dshTab = function(tab) {
    var info   = document.getElementById('dsh-tab-info');
    var agenda = document.getElementById('dsh-tab-agenda');
    var btnI   = document.getElementById('dsh-tab-btn-info');
    var btnA   = document.getElementById('dsh-tab-btn-agenda');
    if (!info || !agenda) return;
    if (tab === 'info') {
        info.style.display   = '';
        agenda.style.display = 'none';
        if (btnI) { btnI.style.background = 'var(--primary-blue)'; btnI.style.color = '#fff'; }
        if (btnA) { btnA.style.background = 'var(--bg-panel)';     btnA.style.color = 'var(--text-muted)'; }
    } else {
        info.style.display   = 'none';
        agenda.style.display = '';
        if (btnA) { btnA.style.background = 'var(--primary-blue)'; btnA.style.color = '#fff'; }
        if (btnI) { btnI.style.background = 'var(--bg-panel)';     btnI.style.color = 'var(--text-muted)'; }
    }
};

// Greeting time update
(function updateGreeting() {
    var el = document.getElementById('warga-greeting-time');
    if (!el) return;
    var h = new Date().getHours();
    var salam = h < 11 ? 'Selamat Pagi ☀️' : h < 15 ? 'Selamat Siang 🌤️' : h < 18 ? 'Selamat Sore 🌇' : 'Selamat Malam 🌙';
    el.textContent = salam + ' · ' + new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    setTimeout(updateGreeting, 60000);
})();

// ═══════════════════════════════════════════════════════
//  GT CHAT AI ENGINE
// ═══════════════════════════════════════════════════════
(function() {
    var _open   = false;
    var _msgs   = [];
    var _lastId = 0;

    var KB = [
        {
            keys: ['surat','pengantar','permohonan','ajukan','bikin surat','buat surat'],
            answer: '📄 <b>Cara Ajukan Surat Pengantar:</b><br>1. Buka tab <b>Layanan Surat</b> di menu navigasi.<br>2. Isi form: Nama, NIK, Alamat, dan Keperluan surat.<br>3. Klik <b>Ajukan Permohonan</b>.<br>4. Tunggu konfirmasi dari sekretaris (biasanya 1–2 hari kerja).<br>5. Setelah status <b>Selesai</b>, unduh PDF di tab Surat.<br><br>💡 Status bisa Anda pantau dari kartu <b>Surat</b> di beranda.',
            quick: ['Status surat saya','Berapa lama prosesnya?','Surat sudah jadi?']
        },
        {
            keys: ['iuran','bayar','bulanan','tagihan','tunggakan'],
            answer: '💰 <b>Informasi Iuran RT:</b><br>Iuran bulanan dicatat oleh bendahara setelah Anda menyetor langsung ke pengurus.<br><br>• Status iuran bulan ini bisa dilihat di kartu <b>Iuran</b> di beranda.<br>• Riwayat lengkap ada di tab <b>Keuangan</b>.<br>• Jika ada ketidaksesuaian, silakan hubungi bendahara RT.',
            quick: ['Cek status iuran','Hubungi bendahara','Cara bayar iuran']
        },
        {
            keys: ['aduan','laporan','kerusakan','masalah','keluhan','komplain'],
            answer: '📢 <b>Cara Kirim Aduan/Laporan:</b><br>1. Buka tab <b>Kotak Aduan</b> di menu navigasi.<br>2. Pilih kategori (Infrastruktur, Keamanan, Kebersihan, dll).<br>3. Isi deskripsi masalah dan unggah foto jika ada.<br>4. Klik <b>Kirim Laporan</b>.<br><br>Tim RT akan menindaklanjuti dalam 1–3 hari kerja.',
            quick: ['Cek status aduan','Kategori aduan apa saja?']
        },
        {
            keys: ['arisan','giliran','pemenang','undian'],
            answer: '🎁 <b>Informasi Arisan RT:</b><br>Jadwal dan pemenang arisan ditentukan pengurus dan diumumkan di beranda.<br><br>• Penerima arisan bulan ini terlihat di kartu <b>Penerima Arisan</b>.<br>• Tuan rumah arisan berikutnya juga ditampilkan di beranda.<br>• Untuk info lebih lanjut, hubungi ketua RT.',
            quick: ['Siapa pemenang arisan?','Kapan arisan berikutnya?']
        },
        {
            keys: ['profil','data','kk','kartu keluarga','nik','alamat','update data'],
            answer: '👤 <b>Update Data Profil:</b><br>1. Buka tab <b>Profil Saya</b> di menu navigasi.<br>2. Klik tombol <b>Edit</b> pada baris data Anda.<br>3. Perbarui informasi yang diperlukan.<br>4. Klik <b>Simpan Perubahan</b>.<br><br>Data akan otomatis tersinkron ke server.',
            quick: ['Cara tambah anggota keluarga','Lupa password']
        },
        {
            keys: ['password','lupa password','reset','login gagal'],
            answer: '🔐 <b>Ganti Password:</b><br>1. Buka tab <b>Profil Saya</b>.<br>2. Gulir ke bawah ke bagian <b>Pengaturan Keamanan</b>.<br>3. Isi Password Lama dan Password Baru.<br>4. Klik <b>Update Password</b>.<br><br>Jika lupa password lama, hubungi admin/sekretaris RT untuk reset.',
            quick: ['Hubungi admin RT']
        },
        {
            keys: ['darurat','emergency','polisi','ambulans','pemadam','kebakaran','bpbd'],
            answer: '🚨 <b>Kontak Darurat Kota Semarang:</b><br>• 🚓 Polisi: <b>110</b><br>• 🚑 Ambulans: <b>118 / 119</b><br>• 🚒 Pemadam: <b>113</b><br>• 🏥 BPBD: <b>024-3584946</b><br><br>Daftar lengkap ada di tombol <b>Call Darurat</b> di menu atas.',
            quick: ['Nomor RT setempat','Nomor pengurus RT']
        },
        {
            keys: ['pengumuman','berita','informasi','acara','kegiatan','jadwal'],
            answer: '📰 <b>Melihat Pengumuman & Berita:</b><br>• <b>Pengumuman RT</b> (dari pengurus) ada di tab <b>Portal Berita</b> bagian atas.<br>• <b>Berita Nasional</b> dari berbagai sumber media ada di bawahnya.<br>• <b>Agenda kegiatan</b> RT bisa dilihat di tab <b>Agenda</b> di beranda.<br><br>Anda juga bisa klik kartu <b>Pengumuman</b> di beranda.',
            quick: ['Ada kegiatan apa?','Pengumuman terbaru']
        },
        {
            keys: ['biometrik','sidik jari','face id','fingerprint'],
            answer: '🔏 <b>Login Biometrik (Sidik Jari / Face ID):</b><br>Setelah melengkapi profil untuk pertama kali, portal akan menawarkan aktivasi biometrik.<br><br>Untuk mengaktifkan manual:<br>1. Buka <b>Profil Saya</b>.<br>2. Simpan perubahan data.<br>3. Ikuti instruksi yang muncul untuk daftarkan biometrik perangkat Anda.',
            quick: ['Cara login biometrik']
        },
        {
            keys: ['halo','hai','hi','hello','selamat','pagi','siang','sore','malam','apa kabar'],
            answer: '👋 Halo! Saya AI Asisten RT 005 Tegalsari.<br><br>Saya bisa membantu Anda dengan:<br>• Pengajuan dan status <b>Surat</b><br>• Info <b>Iuran</b> dan Kas RT<br>• Kirim <b>Aduan/Laporan</b><br>• Info <b>Arisan</b><br>• Update <b>Profil & Data KK</b><br>• Kontak <b>Darurat</b><br><br>Silakan ketik pertanyaan Anda! 😊',
            quick: ['Ajukan surat','Cek iuran','Kirim aduan','Kontak darurat']
        }
    ];

    function matchKB(text) {
        var q = text.toLowerCase();
        for (var i = 0; i < KB.length; i++) {
            for (var j = 0; j < KB[i].keys.length; j++) {
                if (q.indexOf(KB[i].keys[j]) !== -1) return KB[i];
            }
        }
        return null;
    }

    function scrollBottom() {
        var el = document.getElementById('gt-chat-messages');
        if (el) el.scrollTop = el.scrollHeight;
    }

    function addMsg(role, html) {
        var el = document.getElementById('gt-chat-messages');
        if (!el) return;
        var div = document.createElement('div');
        div.className = role === 'ai' ? 'gt-chat-msg-ai' : 'gt-chat-msg-user';
        if (role === 'ai') {
            div.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6d28d9);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.75rem;color:#fff;"><i class="fa-solid fa-robot"></i></div><div class="gt-chat-bubble">' + html + '</div>';
        } else {
            div.innerHTML = '<div class="gt-chat-bubble">' + html + '</div>';
        }
        el.appendChild(div);
        scrollBottom();
    }

    function setQuick(arr) {
        var wrap = document.getElementById('gt-chat-quick-wrap');
        if (!wrap) return;
        wrap.innerHTML = '';
        (arr || []).forEach(function(label) {
            var btn = document.createElement('button');
            btn.className = 'gt-chat-quick-btn';
            btn.textContent = label;
            btn.onclick = function() { processInput(label); };
            wrap.appendChild(btn);
        });
    }

    function processInput(text) {
        if (!text.trim()) return;
        addMsg('user', text);
        var inp = document.getElementById('gt-chat-input');
        if (inp) inp.value = '';
        setQuick([]);
        setTimeout(function() {
            var match = matchKB(text);
            if (match) {
                addMsg('ai', match.answer);
                setQuick(match.quick);
            } else {
                addMsg('ai', '🤔 Maaf, saya belum punya jawaban untuk itu.<br><br>Silakan hubungi pengurus RT secara langsung, atau pilih topik di bawah:');
                setQuick(['Ajukan surat','Cek iuran','Kirim aduan','Kontak darurat']);
            }
        }, 420);
    }

    function initChat() {
        var el = document.getElementById('gt-chat-messages');
        if (!el || el.children.length > 0) return;
        addMsg('ai', '👋 Halo! Saya AI Asisten RT 005.<br>Ada yang bisa saya bantu?');
        setQuick(['Ajukan surat','Cek iuran','Kirim aduan','Kontak darurat','Info arisan','Pengumuman RT']);
    }

    window.openGtChat = function() {
        var panel = document.getElementById('gt-chat-panel');
        var fab   = document.getElementById('gt-chat-fab');
        if (!panel) return;
        _open = true;
        panel.classList.add('gt-chat-open');
        if (fab) fab.style.display = 'none';
        initChat();
        var inp = document.getElementById('gt-chat-input');
        if (inp) setTimeout(function(){ inp.focus(); }, 350);
    };

    window.closeGtChat = function() {
        var panel = document.getElementById('gt-chat-panel');
        var fab   = document.getElementById('gt-chat-fab');
        if (!panel) return;
        _open = false;
        panel.classList.remove('gt-chat-open');
        if (fab) fab.style.display = 'flex';
    };

    window.gtChatSend = function() {
        var inp = document.getElementById('gt-chat-input');
        if (!inp) return;
        var text = inp.value.trim();
        if (!text) return;
        processInput(text);
    };

    // Show FAB when warga logged in
    window.__showGtChatFab = function() {
        var fab = document.getElementById('gt-chat-fab');
        if (fab) fab.style.display = 'flex';
    };
})();


(function(){
    /* ──────────────────────────────────────────────────────
       1. Update active state di left sidebar & bottom nav
    ────────────────────────────────────────────────────── */
    window.updateWargaFbNav = function(tabId) {
        // Left sidebar items
        document.querySelectorAll('#view-warga .wfb-nav-item[data-tab]').forEach(function(btn){
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        // Mobile bottom nav
        document.querySelectorAll('#wfb-mobile-nav .wfb-mob-btn[data-tab]').forEach(function(btn){
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
    };

    /* ──────────────────────────────────────────────────────
       2. Patch openWargaTab untuk update FB nav
    ────────────────────────────────────────────────────── */
    var __wfbPatchAttempts = 0;
    var __wfbPatchInterval = setInterval(function(){
        __wfbPatchAttempts++;
        if (typeof window.openWargaTab === 'function' && !window.openWargaTab.__wfbPatched) {
            var origOpenWargaTab = window.openWargaTab;
            window.openWargaTab = function(tabId) {
                var result = origOpenWargaTab.apply(this, arguments);
                try { window.updateWargaFbNav(tabId); } catch(e){}
                return result;
            };
            window.openWargaTab.__wfbPatched = true;
            clearInterval(__wfbPatchInterval);
        }
        if (__wfbPatchAttempts > 100) clearInterval(__wfbPatchInterval);
    }, 200);

    /* ──────────────────────────────────────────────────────
       3. Update user card di left sidebar
    ────────────────────────────────────────────────────── */
    window.updateWargaFbUserCard = function() {
        var warga = window.loggedInWarga;
        if (!warga) return;
        // Avatar inisial
        var nm = (warga.nama || 'W').trim();
        var initials = nm.split(/\s+/).slice(0,2).map(function(w){ return w[0].toUpperCase(); }).join('');
        var avaEl = document.getElementById('wfb-avatar-side');
        if (avaEl) avaEl.textContent = initials;
        // Nama
        var nameEl = document.getElementById('wfb-name-side');
        if (nameEl) nameEl.textContent = nm.split(/\s+/).slice(0,3).join(' ');
        // Sub-text alamat
        var roleEl = document.getElementById('wfb-role-side');
        if (roleEl) {
            var alamat = warga.alamat || '';
            roleEl.textContent = alamat ? alamat : 'Portal Warga RT 005';
        }
    };

    /* ──────────────────────────────────────────────────────
       4. Load Right Sidebar Data
    ────────────────────────────────────────────────────── */
    window.loadWargaFbRight = function() {
        try {
            var fmt = function(n) {
                n = parseFloat(n) || 0;
                return 'Rp ' + Math.round(n).toLocaleString('id-ID');
            };

            // ── Saldo Kas ──
            var kas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            var saldoAwal = parseFloat(localStorage.getItem('db_saldo_awal') || '0');
            var masuk = 0, keluar = 0;
            kas.forEach(function(x){ if(x.tipe==='masuk') masuk += (x.nominal||0); else keluar += (x.nominal||0); });
            var saldo = saldoAwal + masuk - keluar;
            var elKas = document.getElementById('wfb-saldo-kas');
            if (elKas) elKas.textContent = fmt(saldo);

            // ── Total KK ──
            var wargaDb = JSON.parse(localStorage.getItem('db_warga') || '[]');
            var elKK = document.getElementById('wfb-total-kk');
            if (elKK) elKK.textContent = wargaDb.length + ' KK';

            // ── Arisan & Tuan Rumah ──
            var arisanDb = JSON.parse(localStorage.getItem('db_arisan') || '[]');
            var elArisan = document.getElementById('wfb-arisan');
            var elHost = document.getElementById('wfb-host');
            if (arisanDb.length > 0) {
                var last = arisanDb[arisanDb.length - 1];
                if (elArisan) {
                    var namaPemenang = last.pemenang || last.nama || '—';
                    elArisan.textContent = namaPemenang.split(/\s+/).slice(0,2).join(' ');
                }
                // Host berikutnya: cari yang belum menang
                var sudahMenang = arisanDb.map(function(a){ return a.pemenang || a.nama || ''; });
                var allWarga = wargaDb.map(function(w){ return w.namaKK || w.nama || ''; });
                var belumMenang = allWarga.filter(function(n){ return n && sudahMenang.indexOf(n) === -1; });
                if (elHost) elHost.textContent = belumMenang.length > 0 ? belumMenang[0].split(/\s+/).slice(0,2).join(' ') : (last.host || '—');
            } else {
                if (elArisan) elArisan.textContent = '—';
                if (elHost) elHost.textContent = '—';
            }

            // ── Iuran Status ──
            var iuranDb = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var settings = JSON.parse(localStorage.getItem('db_settings') || '{}');
            var nominalIuran = parseFloat(settings.nominalIuran || 30000);
            var now = new Date();
            var bulanIni = (now.getMonth() + 1).toString().padStart(2,'0') + '/' + now.getFullYear();
            var iuranBulanIni = iuranDb.filter(function(x){ return x.periode === bulanIni; });
            var sudahBayar = iuranBulanIni.filter(function(x){ return x.status === 'posted' || x.status === 'Lunas'; }).length;
            var totalKK = wargaDb.length || 1;
            var pct = Math.round((sudahBayar / totalKK) * 100);
            var elIuranStatus = document.getElementById('wfb-iuran-status');
            var elBar = document.getElementById('wfb-iuran-bar');
            var elPct = document.getElementById('wfb-iuran-pct');
            var elDetail = document.getElementById('wfb-iuran-detail');
            var elProgress = document.getElementById('wfb-iuran-progress-wrap');
            if (elIuranStatus) {
                elIuranStatus.innerHTML = '<span style="font-weight:700;color:#059669;">' + sudahBayar + '</span> dari <span style="font-weight:700;">' + totalKK + '</span> KK sudah membayar';
            }
            if (elProgress) elProgress.style.display = 'block';
            if (elBar) setTimeout(function(){ elBar.style.width = pct + '%'; }, 100);
            if (elPct) elPct.textContent = pct + '%';
            if (elDetail) elDetail.textContent = fmt(sudahBayar * nominalIuran) + ' terkumpul';

            // Iuran pribadi warga yang login
            var warga = window.loggedInWarga;
            if (warga && !warga.isGuest) {
                var kkId = warga.id || warga.namaKK || '';
                var iuranPribadi = iuranBulanIni.filter(function(x){
                    return (x.kkId === kkId || x.namaKK === warga.nama || x.warga === warga.nama);
                });
                if (elIuranStatus && iuranPribadi.length > 0) {
                    var status = iuranPribadi[0].status;
                    var isLunas = status === 'posted' || status === 'Lunas';
                    elIuranStatus.innerHTML += '<br><span style="margin-top:6px;display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:' + (isLunas ? '#dcfce7;color:#166534' : '#fee2e2;color:#991b1b') + '">' + (isLunas ? '✓ Anda Sudah Lunas' : '✗ Anda Belum Bayar') + '</span>';
                }
            }

            // ── Pengurus RT ──
            var pengurusDb = JSON.parse(localStorage.getItem('db_pengurus') || '[]');
            var elPengurus = document.getElementById('wfb-pengurus');
            if (elPengurus) {
                if (!pengurusDb.length) {
                    elPengurus.innerHTML = '<div style="font-size:12px;color:#94a3b8;text-align:center;padding:8px;">Belum ada data pengurus</div>';
                } else {
                    elPengurus.innerHTML = pengurusDb.slice(0, 5).map(function(p){
                        var nama = p.nama || p.namaKK || '—';
                        var jabatan = p.jabatan || p.peran || '';
                        var inisial = nama.split(/\s+/).slice(0,2).map(function(w){ return w[0] ? w[0].toUpperCase() : ''; }).join('');
                        return '<div class="wfb-pengurus-item">'
                            + '<div class="wfb-pengurus-ava"><i class="fa-solid fa-user" style="color:#1d4ed8;font-size:13px;"></i></div>'
                            + '<div><div class="wfb-pengurus-nama">' + (nama.split(/\s+/).slice(0,3).join(' ')) + '</div>'
                            + '<div class="wfb-pengurus-jabatan">' + jabatan + '</div></div>'
                            + '</div>';
                    }).join('');
                }
            }

            // ── Kontak Darurat ──
            var daruratDb = JSON.parse(localStorage.getItem('db_darurat') || '[]');
            var elDarurat = document.getElementById('wfb-darurat-list');
            if (elDarurat) {
                if (!daruratDb.length) {
                    elDarurat.innerHTML = '<div style="font-size:12px;color:#94a3b8;">Belum ada kontak darurat</div>';
                } else {
                    elDarurat.innerHTML = daruratDb.slice(0, 5).map(function(d){
                        var nama = d.nama || d.label || d.layanan || '—';
                        var telp = d.telp || d.no || d.nomor || '';
                        return '<div class="wfb-darurat-row">'
                            + '<span style="color:#374151;font-weight:600;font-size:12px;">' + nama + '</span>'
                            + (telp ? '<a href="tel:' + telp + '" style="color:#ef4444;font-weight:700;text-decoration:none;font-size:12px;">' + telp + '</a>' : '')
                            + '</div>';
                    }).join('');
                }
            }

            // ── Update user card ──
            window.updateWargaFbUserCard();

        } catch(e) {
            console.warn('[WargaFB] loadWargaFbRight error:', e);
        }
    };

    /* ──────────────────────────────────────────────────────
       5. Hook ke runRefreshers / polling
    ────────────────────────────────────────────────────── */
    // Tambahkan ke runRefreshers jika sudah ada
    var __origRunRefreshers = window.runRefreshers;
    if (typeof __origRunRefreshers === 'function') {
        window.runRefreshers = function() {
            __origRunRefreshers.apply(this, arguments);
            try { window.loadWargaFbRight(); } catch(e){}
        };
    }
    // Polling fallback tiap 10 detik saat warga portal aktif
    setInterval(function(){
        var view = document.getElementById('view-warga');
        if (view && view.offsetParent !== null && !view.closest('[style*="display: none"]')) {
            try { window.loadWargaFbRight(); } catch(e){}
        }
    }, 10000);

    // Inisiasi setelah DOM siap
    document.addEventListener('DOMContentLoaded', function(){
        setTimeout(function(){
            try { window.loadWargaFbRight(); } catch(e){}
        }, 2000);
    });

    // Juga patch di event BukaPortal agar aktif saat pertama login warga
    var __origBukaPortal = window.BukaPortal;
    if (typeof __origBukaPortal === 'function') {
        window.BukaPortal = function(role) {
            __origBukaPortal.apply(this, arguments);
            if (role === 'warga') {
                setTimeout(function(){
                    try { window.loadWargaFbRight(); } catch(e){}
                    try { window.updateWargaFbUserCard(); } catch(e){}
                }, 300);
            }
        };
    }

    // Patch BukaPortal jika belum tersedia saat script ini jalan
    var __wfbBukaAttempts = 0;
    var __wfbBukaInterval = setInterval(function(){
        __wfbBukaAttempts++;
        if (typeof window.BukaPortal === 'function' && !window.BukaPortal.__wfbPatched) {
            var origBP = window.BukaPortal;
            window.BukaPortal = function(role) {
                var r = origBP.apply(this, arguments);
                if (role === 'warga') {
                    setTimeout(function(){
                        try { window.loadWargaFbRight(); } catch(e){}
                        try { window.updateWargaFbUserCard(); } catch(e){}
                    }, 400);
                }
                return r;
            };
            window.BukaPortal.__wfbPatched = true;
            clearInterval(__wfbBukaInterval);
        }
        if (__wfbBukaAttempts > 80) clearInterval(__wfbBukaInterval);
    }, 250);

    /* ──────────────────────────────────────────────────────
       6. Swipe gesture: swipe down to hide, swipe up to show
          Auto-scroll active button into view
    ────────────────────────────────────────────────────── */
    (function initWfbSwipe() {
        var nav = document.getElementById('wfb-mobile-nav');
        if (!nav) { setTimeout(initWfbSwipe, 500); return; }

        var touchStartY = 0, touchStartX = 0;
        var navHidden = false;
        var lastScrollY = 0;
        var scrollContent = null;

        function hideNav() {
            if (navHidden) return;
            navHidden = true;
            nav.classList.add('wfb-nav-hidden');
        }
        function showNav() {
            if (!navHidden) return;
            navHidden = false;
            nav.classList.remove('wfb-nav-hidden');
            scrollActiveIntoView();
        }

        /* Auto-scroll active button into view */
        function scrollActiveIntoView() {
            var active = nav.querySelector('.wfb-mob-btn.active');
            if (!active) return;
            try {
                active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } catch(e) {}
        }

        /* Touch on nav: swipe up to show (if hidden), swipe down to hide */
        nav.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        nav.addEventListener('touchend', function(e) {
            var dy = e.changedTouches[0].clientY - touchStartY;
            var dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
            if (dx > 40) return; /* horizontal scroll — ignore */
            if (dy < -30) showNav();   /* swipe up on nav — ensure visible */
            if (dy > 30) hideNav();    /* swipe down on nav — hide */
        }, { passive: true });

        /* Track page content scroll to auto-hide/show nav */
        function bindScrollListener() {
            var containers = document.querySelectorAll(
                '#view-warga .warga-tab-content.active, #view-warga .warga-fb-main'
            );
            containers.forEach(function(c) {
                if (c.__wfbScrollBound) return;
                c.__wfbScrollBound = true;
                c.addEventListener('scroll', function() {
                    var y = c.scrollTop;
                    var delta = y - lastScrollY;
                    lastScrollY = y;
                    if (delta > 8 && y > 60) hideNav();
                    else if (delta < -8) showNav();
                }, { passive: true });
            });
        }

        /* Rebind scroll on tab changes */
        var origOpen = window.openWargaTab;
        if (typeof origOpen === 'function' && !origOpen.__wfbSwipeBound) {
            window.openWargaTab = function(tabId) {
                var r = origOpen.apply(this, arguments);
                navHidden = false;
                nav.classList.remove('wfb-nav-hidden');
                lastScrollY = 0;
                setTimeout(function() {
                    bindScrollListener();
                    scrollActiveIntoView();
                }, 200);
                return r;
            };
            window.openWargaTab.__wfbSwipeBound = true;
        }

        /* Initial scroll into view and bind */
        setTimeout(function() {
            bindScrollListener();
            scrollActiveIntoView();
        }, 800);
    })();

})();

/* === GT-v12 JS: 9 Perbaikan FINAL === */
(function() {
  'use strict';

  function safeJ(k,fb){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v==null?fb:v;}catch(_){return fb;}}
  function el(id){return document.getElementById(id);}

  /* ── (1) FAB label permanen ── */
  function addBennyLabel() {
    if (el('gt-benny-label')) return;
    var fab = el('gt-benny-fab');
    if (!fab) return;
    var lbl = document.createElement('div');
    lbl.id = 'gt-benny-label';
    lbl.textContent = 'TANYA BENNY';
    document.body.appendChild(lbl);
    // Also fix FAB image if still robot
    var img = fab.querySelector('img');
    if (!img) {
      // FAB image already in HTML; just ensure display
    }
  }

  /* ── (3) loadDaruratWarga: grid cards + phone links ── */
  function patchDarurat() {
    if (window.__gtV12DaruratPatched) return;
    window.__gtV12DaruratPatched = true;
    function renderDarurat() {
      var db = safeJ('db_darurat', []);
      var cg = el('container-darurat-warga');
      if (!cg) return;
      cg.innerHTML = '';
      if (!db.length) {
        cg.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:24px;">Belum ada kontak darurat.</div>';
        return;
      }
      db.forEach(function(d) {
        var telClean = String(d.telp||'').replace(/\s/g,'');
        var color = d.color || '#ef4444';
        var icon  = d.icon  || 'fa-phone';
        var card = document.createElement('div');
        card.className = 'contact-card darurat-item';
        card.style.cssText = 'text-align:center;padding:14px 10px;border-radius:14px;';
        card.innerHTML =
          '<div style="width:52px;height:52px;border-radius:50%;background:'+color+'22;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">' +
          '<i class="fa-solid '+icon+'" style="font-size:1.5rem;color:'+color+'"></i></div>' +
          '<h4 class="darurat-nama" style="color:var(--gt-text,#0f172a);font-size:.82rem;font-weight:700;margin:4px 0 6px;line-height:1.3;">' + (d.nama||'') + '</h4>' +
          '<a href="tel:'+telClean+'" class="call-btn" style="text-decoration:none;">' +
          '<i class="fa-solid fa-phone"></i> ' + (d.telp||'') + '</a>';
        cg.appendChild(card);
      });
    }
    window.loadDaruratWarga = renderDarurat;
  }

  /* ── (4) Arisan datalist dari db_warga ── */
  function rebuildArisanDL() {
    var dbW = safeJ('db_warga', []);
    if (!dbW.length) return false;
    var names = dbW.map(function(w){return w.nama||'';}).filter(Boolean);
    ['inp_arisan_nama','inp_host_nama'].forEach(function(id) {
      var inp = el(id);
      if (!inp) return;
      var dlId = 'gtv12-dl-'+id;
      var dl = el(dlId) || (function(){ var d=document.createElement('datalist'); d.id=dlId; inp.parentNode.appendChild(d); return d; })();
      dl.innerHTML = '';
      names.forEach(function(n){ var o=document.createElement('option'); o.value=n; dl.appendChild(o); });
      inp.setAttribute('list', dlId);
      inp.setAttribute('autocomplete', 'off');
    });
    return true;
  }
  var _dlTimer = setInterval(function(){ if(rebuildArisanDL()) clearInterval(_dlTimer); }, 800);
  setTimeout(function(){ clearInterval(_dlTimer); }, 25000);

  /* ── (5) Sidebar toggle fix ── */
  function fixSidebarToggle() {
    try{
      if (localStorage.getItem('sidebar_state') === 'hidden') {
        document.body.classList.add('sidebar-collapsed');
      }
    }catch(_){}
    document.querySelectorAll('.btn-toggle-sidebar').forEach(function(b){
      b.style.setProperty('display','inline-flex','important');
      b.style.setProperty('align-items','center','important');
      b.style.setProperty('gap','6px','important');
      b.style.setProperty('visibility','visible','important');
      b.style.setProperty('opacity','1','important');
    });
  }

  /* ── (6) Dashboard: hero foto & nama RT ── */
  function injectHeroRingkasan() {
    var hero = document.querySelector('.gt-hero');
    if (!hero || hero.dataset.gtV12) return;
    hero.dataset.gtV12 = '1';
    var s = safeJ('db_pengaturan',null) || safeJ('db_settings',null);
    var namaRT = (s&&s.namaRT)||'RT 005 Tegalsari';
    var kel = (s&&s.namaKelurahan)||'Tegalsari';
    if (hero.querySelector('.gt-v11-hero-ring')) return;
    var ring = document.createElement('div');
    ring.className = 'gt-v11-hero-ring';
    var img = document.createElement('img');
    img.src = '/benny-avatar.png';
    img.onerror = function(){ this.style.display='none'; };
    var info = document.createElement('div');
    info.className = 'gt-v11-info';
    info.innerHTML = '<h2>Ketua: '+namaRT+'</h2><p>Kel. '+kel+' &mdash; RT 005 / RW 012</p>';
    ring.appendChild(img); ring.appendChild(info);
    hero.insertBefore(ring, hero.firstChild);
  }

  /* ── (6) Rekap RT 005 — pastikan arisan & tuan rumah tampil ── */
  function patchRekapArisan() {
    var infoArisan = safeJ('db_info_arisan', null);
    if (!infoArisan) return;
    // warga dashboard ringkasan
    if (el('warga-arisan-nama') && el('warga-arisan-nama').textContent === '—') {
      el('warga-arisan-nama').textContent = infoArisan.arisanNama || '-';
    }
    if (el('warga-arisan-tgl') && !el('warga-arisan-tgl').textContent) {
      el('warga-arisan-tgl').textContent = infoArisan.arisanTgl || '';
    }
    if (el('warga-host-nama') && el('warga-host-nama').textContent === '—') {
      el('warga-host-nama').textContent = infoArisan.hostNama || '-';
    }
    if (el('warga-host-tgl') && !el('warga-host-tgl').textContent) {
      el('warga-host-tgl').textContent = infoArisan.hostTgl || '';
    }
  }

  /* ── (8) Berita slider ── */
  function ensureBeritaSlider() {
    var container = el('warga-berita-list');
    if (!container) return;
    if (container.dataset.gtSliderV12) return;
    var db = safeJ('db_berita', null);
    if (!db || !Array.isArray(db) || !db.length) return;
    delete container.dataset.gtSlider;
    delete container.dataset.gtSliderV11;
    container.dataset.gtSliderV12 = '1';
    var items = db.slice().reverse();
    var wrap = document.createElement('div'); wrap.className = 'gt-berita-slider-wrap';
    var track = document.createElement('div'); track.className = 'gt-berita-track';
    items.forEach(function(b) {
      var isi = String(b.isi||'').substring(0,130) + (String(b.isi||'').length>130?'…':'');
      var imgH = b.foto ? '<img src="'+b.foto+'" style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-bottom:10px;">' : '';
      var slide = document.createElement('div');
      slide.className = 'gt-berita-slide';
      slide.style.cssText = 'padding:16px;box-sizing:border-box;min-width:100%;';
      slide.innerHTML = imgH +
        '<span class="news-badge">' + (b.kategori||'Berita') + '</span>' +
        '<h3 style="margin:8px 0 4px;font-size:1rem;">' + (b.judul||'') + '</h3>' +
        '<p style="font-size:.78rem;color:var(--gt-text-muted,#64748b);margin:0 0 4px;"><i class="fa-regular fa-clock"></i> ' + (b.tgl||'') + '</p>' +
        '<p style="font-size:.85rem;margin:0;">' + isi + '</p>';
      slide.addEventListener('click', function(){ if(typeof bukaDetailBerita==='function') bukaDetailBerita(b.id); });
      track.appendChild(slide);
    });
    wrap.appendChild(track);
    var ctrl = document.createElement('div'); ctrl.className = 'gt-berita-controls';
    var prev = document.createElement('button'); prev.className = 'gt-berita-arrow'; prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    var dotsW = document.createElement('div'); dotsW.className = 'gt-berita-dots';
    var counter = document.createElement('span'); counter.className = 'gt-berita-counter';
    var next = document.createElement('button'); next.className = 'gt-berita-arrow'; next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    var dots = [];
    items.forEach(function(_,i){
      var d = document.createElement('button');
      d.className = 'gt-berita-dot' + (i===0?' active':'');
      d.addEventListener('click', function(){ goTo(i); resetAuto(); });
      dotsW.appendChild(d); dots.push(d);
    });
    ctrl.appendChild(prev); ctrl.appendChild(dotsW); ctrl.appendChild(counter); ctrl.appendChild(next);
    var cur = 0, autoTimer;
    function goTo(idx){
      cur = (idx + items.length) % items.length;
      track.style.transform = 'translateX(-'+(cur*100)+'%)';
      dots.forEach(function(d,i){ d.classList.toggle('active', i===cur); });
      counter.textContent = (cur+1) + '/' + items.length;
    }
    function resetAuto(){
      clearInterval(autoTimer);
      autoTimer = setInterval(function(){ goTo(cur+1); }, 4500);
    }
    prev.addEventListener('click', function(){ goTo(cur-1); resetAuto(); });
    next.addEventListener('click', function(){ goTo(cur+1); resetAuto(); });
    wrap.addEventListener('mouseenter', function(){ clearInterval(autoTimer); });
    wrap.addEventListener('mouseleave', resetAuto);
    goTo(0); resetAuto();
    container.innerHTML = '';
    container.style.cssText = 'max-height:none;overflow:visible;';
    container.appendChild(wrap);
    container.appendChild(ctrl);
  }

  /* ── (9) SOS Sidebar Kanan — tabel rapi ── */
  function rebuildSosSidebar() {
    var old = el('gt-sos-panel');
    if (old) old.remove();
    var db = safeJ('db_darurat', []);
    if (!db || !db.length) return;
    var panel = document.createElement('div'); panel.id = 'gt-sos-panel';
    var inner = document.createElement('div'); inner.id = 'gt-sos-inner';
    var tab = document.createElement('div'); tab.id = 'gt-sos-tab';
    tab.innerHTML = '<i class="fa-solid fa-phone" style="writing-mode:horizontal-tb;font-size:.85rem;margin-bottom:3px;"></i><span>SOS</span>';
    var h4 = document.createElement('div'); h4.className = 'gt-sos-h4';
    h4.innerHTML = '<i class="fa-solid fa-siren-on"></i> Kontak Darurat';
    inner.appendChild(h4);
    var tbl = document.createElement('table'); tbl.className = 'gt-sos-table';
    db.forEach(function(d) {
      var telClean = String(d.telp||'').replace(/\s/g,'');
      var color = d.color || '#ef4444';
      var icon  = d.icon  || 'fa-phone';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="gt-sos-td-icon"><i class="fa-solid '+icon+'" style="color:'+color+';font-size:.78rem;"></i></td>' +
        '<td class="gt-sos-td-name">' + (d.nama||'') + '</td>' +
        '<td class="gt-sos-td-call"><a href="tel:'+telClean+'" class="gt-sos-call"><i class="fa-solid fa-phone"></i> '+(d.telp||'')+'</a></td>';
      tbl.appendChild(tr);
    });
    inner.appendChild(tbl);
    var btnAll = document.createElement('a');
    btnAll.className = 'gt-sos-btn-all';
    btnAll.href = '#';
    btnAll.innerHTML = '<i class="fa-solid fa-phone-volume"></i> Semua Kontak Darurat';
    btnAll.onclick = function(e){ e.preventDefault(); if(typeof openWargaTab==='function') openWargaTab('warga-darurat'); inner.classList.remove('open'); };
    inner.appendChild(btnAll);
    inner.appendChild(tab);
    panel.appendChild(inner);
    document.body.appendChild(panel);
    var open = false;
    tab.addEventListener('click', function(){ open = !open; inner.classList.toggle('open', open); });
  }

  /* ── BOOT v12 ── */
  function bootV12() {
    try{ addBennyLabel(); }catch(e){}
    try{ patchDarurat(); }catch(e){}
    try{ fixSidebarToggle(); }catch(e){}
    try{ injectHeroRingkasan(); }catch(e){}
    try{ ensureBeritaSlider(); }catch(e){}
    try{ patchRekapArisan(); }catch(e){}
    var sosOk = el('gt-sos-panel') && el('gt-sos-panel').querySelector('.gt-sos-table');
    try{ if(!sosOk) rebuildSosSidebar(); }catch(e){}
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', bootV12); }
  else { bootV12(); }
  setTimeout(bootV12, 600);
  setTimeout(bootV12, 1800);
  setTimeout(bootV12, 3500);

  /* Wrap openWargaTab to re-trigger fixes on tab switch */
  var _wt=0, _wi=setInterval(function(){
    _wt++;
    var fn = window.openWargaTab || window.bukaTabWarga;
    if (fn && !fn.__gtV12) {
      var orig2 = fn;
      var wrapped = function(t){
        var r = orig2.apply(this, arguments);
        if (t==='warga-dashboard'||t==='warga-beranda') {
          setTimeout(function(){
            var c = el('warga-berita-list');
            if (c) delete c.dataset.gtSliderV12;
            try{ ensureBeritaSlider(); }catch(e){}
            try{ injectHeroRingkasan(); }catch(e){}
            try{ patchRekapArisan(); }catch(e){}
          }, 120);
        }
        if (t==='warga-darurat') setTimeout(function(){ try{ window.loadDaruratWarga(); }catch(e){} }, 80);
        if (t==='sub-arisan'||t==='admin-arisan') setTimeout(rebuildArisanDL, 80);
        return r;
      };
      wrapped.__gtV12 = true;
      if (window.openWargaTab === fn) window.openWargaTab = wrapped;
      if (window.bukaTabWarga === fn) window.bukaTabWarga = wrapped;
      clearInterval(_wi);
    }
    if (_wt > 80) clearInterval(_wi);
  }, 300);

  /* Also patch loadDashboardWarga to ensure arisan names ─ */
  var _dw = 0, _dwi = setInterval(function(){
    _dw++;
    
    if (_dw > 80) clearInterval(_dwi);
  }, 300);

})();
/* === END GT-v12 JS === */


/* ─── GT-v13 BOOT ─── */
(function(){
  'use strict';

  /* ── FIX 7 already done in HTML ── */

  /* ── FIX 3: Sidebar toggle (v10 — mobile-aware) ── */
  function fixSidebar() {
    if (window.__gtV13Sidebar) return; window.__gtV13Sidebar = true;

    // Inject pull-handle ke setiap nav tabs
    function injectPullHandles() {
      document.querySelectorAll('.admin-nav-tabs, .nav-tabs').forEach(function(nav) {
        if (nav.querySelector('.gt-nav-pull-handle')) return;
        var handle = document.createElement('div');
        handle.className = 'gt-nav-pull-handle pull-tab-bca';
        handle.title = 'Sembunyikan/Tampilkan Menu';
        handle.addEventListener('click', function(e) {
          e.stopPropagation();
          window.toggleSidebar();
        });
        nav.appendChild(handle);
      });
    }

    // Fungsi utama toggle — mobile vs desktop
    window.toggleSidebar = window.toggleSidebar || function() {
      var isMobile = window.innerWidth <= 768;
      if (isMobile) {
        if (typeof window.gtSpOpen === 'function') window.gtSpOpen();
      } else {
        document.body.classList.toggle('sidebar-collapsed');
        var ic2 = document.body.classList.contains('sidebar-collapsed');
        try { localStorage.setItem('sidebar_state', ic2 ? 'hidden' : 'visible'); } catch(e) {}
        var btn = document.getElementById('gt-sidebar-toggle-btn');
        if (btn) {
          var ic = btn.querySelector('i');
          if (ic) ic.className = ic2 ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
        }
      }
    };

    // Restore state
    try {
      if (window.innerWidth > 768 && localStorage.getItem('sidebar_state') === 'hidden') {
        document.body.classList.add('sidebar-collapsed');
      }
    } catch(_) {}

    // Inject pull handles setelah DOM siap
    injectPullHandles();

    // Re-inject saat portal switch (BukaPortal dipanggil ulang)
    var _origBuka = window.BukaPortal;
    if (typeof _origBuka === 'function') {
      window.BukaPortal = function() {
        _origBuka.apply(this, arguments);
        setTimeout(injectPullHandles, 200);
      };
    }

    // === Scroll auto-hide: sembunyikan nav saat scroll ke bawah ===
    (function() {
      var lastY = 0;
      var ticking = false;
      var THRESHOLD = 40; // px minimum scroll sebelum trigger

      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(function() {
            var isMobile = window.innerWidth <= 768;
            if (!isMobile) { ticking = false; return; }

            // Cari scrollable tab content yang aktif
            var activeContent = document.querySelector(
              '.warga-tab-content.active, .admin-tab-content.active, .ben-tab-content.active, .kop-tab-content.active'
            );
            var scrollEl = activeContent || document.documentElement;
            var currentY = scrollEl.scrollTop || window.pageYOffset || 0;
            var delta = currentY - lastY;

            if (Math.abs(delta) > THRESHOLD) {
              var navs = document.querySelectorAll('.admin-nav-tabs, .nav-tabs');
              if (delta > 0) {
                // Scroll ke bawah → sembunyikan
                navs.forEach(function(n){
                  n.classList.add('gt-nav-hidden');
                  n.classList.add('hidden-footer');
                });
                document.body.classList.add('gt-nav-is-hidden');
                var btn = document.getElementById('gt-sidebar-toggle-btn');
                if (btn) { var ic = btn.querySelector('i'); if(ic) ic.className = 'fa-solid fa-xmark'; }
              } else {
                // Scroll ke atas → tampilkan
                navs.forEach(function(n){
                  n.classList.remove('gt-nav-hidden');
                  n.classList.remove('hidden-footer');
                });
                document.body.classList.remove('gt-nav-is-hidden');
                var btn2 = document.getElementById('gt-sidebar-toggle-btn');
                if (btn2) { var ic2 = btn2.querySelector('i'); if(ic2) ic2.className = 'fa-solid fa-bars'; }
              }
              lastY = currentY;
            }
            ticking = false;
          });
          ticking = true;
        }
      }

      // Pasang listener di window + tab content aktif
      window.addEventListener('scroll', onScroll, { passive: true });

      // Juga pasang di tab content (mereka bisa scroll sendiri)
      function attachTabScrollListeners() {
        document.querySelectorAll(
          '.warga-tab-content, .admin-tab-content, .ben-tab-content, .kop-tab-content'
        ).forEach(function(el) {
          if (!el._gtScrollBound) {
            el.addEventListener('scroll', onScroll, { passive: true });
            el._gtScrollBound = true;
          }
        });
      }
      attachTabScrollListeners();
      setTimeout(attachTabScrollListeners, 1500);

      // Tap pada konten → tampilkan nav lagi
      document.addEventListener('touchend', function(e) {
        if (!e.target.closest('.admin-nav-tabs') && !e.target.closest('.nav-tabs')) {
          // Jika tap di konten, tampilkan nav setelah 300ms
          clearTimeout(window._gtNavShowTimer);
          window._gtNavShowTimer = setTimeout(function() {
            if (window.innerWidth > 768) return;
            document.querySelectorAll('.admin-nav-tabs, .nav-tabs').forEach(function(n){
              n.classList.remove('gt-nav-hidden');
              n.classList.remove('hidden-footer');
            });
            document.body.classList.remove('gt-nav-is-hidden');
            var btn3 = document.getElementById('gt-sidebar-toggle-btn');
            if (btn3) { var ic3 = btn3.querySelector('i'); if(ic3) ic3.className = 'fa-solid fa-bars'; }
          }, 1200);
        }
      }, { passive: true });
    })();
  }

  /* ── FIX 4: News hero auto-slider ── */
  var _sliderTimer = null;

  function buildHeroSlider(articles) {
    var wrap = document.getElementById('gt-news-hero-wrap');
    if (!wrap) return;
    if (!articles || articles.length < 2) return;

    // Remove old slider if exists (rebuild on refresh)
    var old = document.getElementById('gt-hero-slider-wrap');
    if (old) { clearInterval(_sliderTimer); old.remove(); }
    delete wrap.dataset.gtV13Slider;
    wrap.dataset.gtV13Slider = '1';

    // Hide original single-hero element
    var singleHero = document.getElementById('gt-news-hero');
    if (singleHero) singleHero.style.display = 'none';

    var sliderWrap = document.createElement('div'); sliderWrap.id = 'gt-hero-slider-wrap';
    var track = document.createElement('div'); track.id = 'gt-hero-slider-track';
    var dotsEl = document.createElement('div'); dotsEl.id = 'gt-hero-slider-dots';

    var prevBtn = document.createElement('button');
    prevBtn.id = 'gt-hero-prev'; prevBtn.className = 'gt-hero-arrow';
    prevBtn.setAttribute('aria-label','Sebelumnya');
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

    var nextBtn = document.createElement('button');
    nextBtn.id = 'gt-hero-next'; nextBtn.className = 'gt-hero-arrow';
    nextBtn.setAttribute('aria-label','Berikutnya');
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

    // Use top 7 articles that have images
    var top = articles.filter(function(a){ return a.thumbnail; }).slice(0,7);
    if (top.length < 2) top = articles.slice(0, Math.min(7, articles.length));
    if (top.length < 2) return;

    var dots = [];
    top.forEach(function(a, i) {
      var slide = document.createElement('div');
      slide.className = 'gt-hero-slide';
      if (a.link) { slide.style.cursor = 'pointer'; slide.addEventListener('click', function(){ window.open(a.link,'_blank','noopener'); }); }

      var cat  = a._cat  || a._source || 'Berita';
      var src  = a._source || '';
      var title = a.title || '';
      var pub  = a.pubDate ? timeAgo(a.pubDate) : '';

      if (a.thumbnail) {
        var img = document.createElement('img');
        img.className = 'gt-hero-slide-img';
        img.src = a.thumbnail; img.alt = ''; img.loading = 'lazy';
        img.onerror = function(){ this.remove(); };
        slide.appendChild(img);
      }

      var overlay = document.createElement('div'); overlay.className = 'gt-hero-slide-overlay';
      overlay.innerHTML =
        '<div class="gt-hero-slide-badge">' + esc(cat) + (src ? ' &middot; ' + esc(src) : '') + '</div>' +
        '<h3 class="gt-hero-slide-title">' + esc(title) + '</h3>' +
        '<div class="gt-hero-slide-meta"><i class="fa-regular fa-clock"></i> ' + esc(pub) + '</div>' +
        (a.link ? '<div class="gt-hero-slide-actions"><a href="' + esc(a.link) + '" target="_blank" rel="noopener" class="gt-hero-slide-btn" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square"></i> Baca</a></div>' : '');
      slide.appendChild(overlay);
      track.appendChild(slide);

      var d = document.createElement('button');
      d.className = 'gt-hero-dot' + (i===0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i+1));
      (function(idx){ d.addEventListener('click', function(e){ e.stopPropagation(); goTo(idx); resetAuto(); }); })(i);
      dotsEl.appendChild(d); dots.push(d);
    });

    var cur = 0;
    function goTo(idx){
      cur = ((idx % top.length) + top.length) % top.length;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      dots.forEach(function(d, i){ d.classList.toggle('active', i === cur); });
    }
    function resetAuto(){
      clearInterval(_sliderTimer);
      _sliderTimer = setInterval(function(){ goTo(cur + 1); }, 4500);
    }
    prevBtn.addEventListener('click', function(e){ e.stopPropagation(); goTo(cur - 1); resetAuto(); });
    nextBtn.addEventListener('click', function(e){ e.stopPropagation(); goTo(cur + 1); resetAuto(); });
    sliderWrap.addEventListener('mouseenter', function(){ clearInterval(_sliderTimer); });
    sliderWrap.addEventListener('mouseleave', resetAuto);

    // Touch/swipe support
    var touchX = 0;
    sliderWrap.addEventListener('touchstart', function(e){ touchX = e.touches[0].clientX; }, {passive:true});
    sliderWrap.addEventListener('touchend', function(e){
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? cur+1 : cur-1); resetAuto(); }
    }, {passive:true});

    sliderWrap.appendChild(track);
    sliderWrap.appendChild(prevBtn);
    sliderWrap.appendChild(nextBtn);
    sliderWrap.appendChild(dotsEl);
    wrap.insertBefore(sliderWrap, wrap.firstChild);
    goTo(0); resetAuto();
  }

  // Expose as global so gtNewsRefresh can call it directly
  window.gtBuildHeroSlider = buildHeroSlider;

  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function timeAgo(ts){
    var d = new Date(ts); if(isNaN(d)) return '';
    var s = Math.max(0,Math.floor((Date.now()-d)/1000));
    if(s<60) return 'baru saja'; if(s<3600) return Math.floor(s/60)+' menit lalu';
    if(s<86400) return Math.floor(s/3600)+' jam lalu';
    return Math.floor(s/86400)+' hari lalu';
  }

  /* ── FIX 6: Ensure loadWargaFbRight runs after login ── */
  function ensureRightPanel(){
    if(typeof window.loadWargaFbRight === 'function'){
      try{ window.loadWargaFbRight(); }catch(e){}
    }
  }

  /* ── FIX 1+7: Ensure benny fab has correct image ── */
  function fixBennyFab(){
    var fab = document.getElementById('gt-benny-fab');
    if(!fab) return;
    var img = fab.querySelector('img');
    if(!img){
      var i = document.createElement('img');
      i.src = '/benny-avatar.png';
      i.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center 10%;border-radius:50%;';
      fab.innerHTML = '';
      fab.appendChild(i);
    }
    if(!document.getElementById('gt-benny-label')){
      var lbl = document.createElement('div');
      lbl.id = 'gt-benny-label';
      lbl.textContent = 'TANYA BENNY';
      document.body.appendChild(lbl);
    }
  }

  /* ── BOOT ── */
  function boot(){
    try{ fixSidebar(); }catch(e){}
    try{ fixBennyFab(); }catch(e){}
    try{ ensureRightPanel(); }catch(e){}
  }

  /* Intercept gtNewsRender / news data to build hero slider */
  var _ni = 0, _nt = setInterval(function(){
    _ni++;
    // Hook into the news system — watch for articles being stored
    if(window.__gtNewsAllArticles && !window.__gtHeroSliderBuilt){
      window.__gtHeroSliderBuilt = true;
      buildHeroSlider(window.__gtNewsAllArticles);
    }
    // Also watch for news grid being rendered
    var grid = document.getElementById('gt-news-grid');
    if(grid && grid.children.length > 0 && !document.getElementById('gt-hero-slider-wrap')){
      // Try to extract articles from existing hero
      var heroEl = document.getElementById('gt-news-hero');
      if(heroEl && window.__gtNewsAllArticles && !window.__gtHeroSliderBuilt){
        window.__gtHeroSliderBuilt = true;
        buildHeroSlider(window.__gtNewsAllArticles);
      }
    }
    if(_ni > 200) clearInterval(_nt);
  }, 500);

  /* Intercept openWargaTab to trigger right panel load */
  var _oi = 0, _ot = setInterval(function(){
    _oi++;
    var fn = window.openWargaTab || window.bukaTabWarga;
    if(fn && !fn.__gtV13Right){
      var orig = fn;
      var wrapped = function(t){
        var r = orig.apply(this,arguments);
        if(t==='warga-dashboard'||t==='warga-beranda'){
          setTimeout(ensureRightPanel, 200);
          setTimeout(ensureRightPanel, 1000);
        }
        return r;
      };
      wrapped.__gtV13Right = true;
      if(window.openWargaTab===fn) window.openWargaTab = wrapped;
      if(window.bukaTabWarga===fn) window.bukaTabWarga = wrapped;
      clearInterval(_ot);
    }
    if(_oi > 80) clearInterval(_ot);
  }, 300);

  /* Boot sequence */
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);

})();
/* ─── END GT-v13 ─── */


/* ═══════════════════════════════════════════════════════════
   GT PWA NATIVE v1
   SW registration · Splash · Install prompt · Offline · Theme
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. SPLASH SCREEN — inline at top of body (no injection needed) */
  function injectSplash() {
    /* Splash is baked into HTML at top of <body> for immediate render.
       This function is kept as a stub to avoid reference errors. */
    return;
    /* Dead code below preserved for reference only */
    if (document.getElementById('t1-splash')) return;
    var sp = document.createElement('div');
    sp.id = 't1-splash';
    sp.innerHTML = [
      /* Light rays */
      '<div class="t1s-ray t1s-ray-1"></div>',
      '<div class="t1s-ray t1s-ray-2"></div>',
      '<div class="t1s-ray t1s-ray-3"></div>',
      /* Floating particles */
      '<div class="t1s-dot" style="width:6px;height:6px;top:15%;left:12%;animation-delay:0s;animation-duration:5s"></div>',
      '<div class="t1s-dot" style="width:4px;height:4px;top:22%;left:80%;animation-delay:1s;animation-duration:7s"></div>',
      '<div class="t1s-dot" style="width:5px;height:5px;top:8%;left:55%;animation-delay:.5s;animation-duration:6s"></div>',
      '<div class="t1s-dot" style="width:3px;height:3px;top:30%;left:30%;animation-delay:2s;animation-duration:8s"></div>',
      '<div class="t1s-dot" style="width:7px;height:7px;top:5%;left:68%;animation-delay:1.5s;animation-duration:5.5s;opacity:.35"></div>',
      /* Logo hero area */
      '<div class="t1s-logo-wrap">',
        '<div class="t1s-logo-ring">',
          '<svg class="t1s-logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
              '<linearGradient id="t1gBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00d4ff"/><stop offset="100%" stop-color="#0052cc"/></linearGradient>',
              '<linearGradient id="t1gGreen" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00e87b"/><stop offset="100%" stop-color="#00a854"/></linearGradient>',
              '<filter id="t1glow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
            '</defs>',
            /* Orbital ring */
            '<circle cx="60" cy="60" r="55" fill="none" stroke="rgba(0,200,255,0.4)" stroke-width="1.5" stroke-dasharray="10 5"/>',
            /* T crossbar */
            '<rect x="18" y="30" width="56" height="14" rx="7" fill="url(#t1gBlue)" filter="url(#t1glow)"/>',
            /* T stem */
            '<rect x="40" y="44" width="14" height="46" rx="7" fill="url(#t1gBlue)" filter="url(#t1glow)"/>',
            /* 1 numeral */
            '<rect x="78" y="38" width="11" height="50" rx="5.5" fill="url(#t1gGreen)" filter="url(#t1glow)"/>',
            '<rect x="68" y="38" width="16" height="9" rx="4" fill="url(#t1gGreen)" filter="url(#t1glow)"/>',
            /* Green leaf accent */
            '<ellipse cx="89" cy="27" rx="9" ry="5" fill="url(#t1gGreen)" transform="rotate(-35 89 27)" opacity="0.9"/>',
            '<ellipse cx="89" cy="27" rx="5" ry="2.5" fill="rgba(255,255,255,0.4)" transform="rotate(-35 89 27)"/>',
          '</svg>',
        '</div>',
        '<div class="t1s-brand"><span class="t1s-brand-a">Tegalsari</span><span class="t1s-brand-b">OneApp</span></div>',
        '<div class="t1s-tagline">Satu Aplikasi, Banyak Kemudahan</div>',
      '</div>',
      /* Landmark skyline scene */
      '<div class="t1s-scene">',
        '<svg class="t1s-landmark-svg" viewBox="0 0 375 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">',
          '<defs>',
            '<radialGradient id="sunGlow" cx="50%" cy="90%" r="70%"><stop offset="0%" stop-color="rgba(255,220,100,0.25)"/><stop offset="100%" stop-color="rgba(255,220,100,0)"/></radialGradient>',
          '</defs>',
          /* Sun glow from horizon */
          '<rect x="0" y="0" width="375" height="120" fill="url(#sunGlow)"/>',
          /* Ground */
          '<rect x="0" y="96" width="375" height="24" fill="rgba(0,30,100,0.35)" rx="0"/>',
          /* --- SAM POO KONG (left) --- */
          '<rect x="18" y="62" width="78" height="34" rx="2" fill="rgba(255,255,255,0.38)"/>',
          '<rect x="28" y="47" width="58" height="17" rx="2" fill="rgba(255,255,255,0.38)"/>',
          '<polygon points="12,62 102,62 92,54 22,54" fill="rgba(255,255,255,0.48)"/>',
          '<polygon points="24,47 90,47 82,40 32,40" fill="rgba(255,255,255,0.48)"/>',
          '<rect x="41" y="28" width="32" height="14" rx="2" fill="rgba(255,255,255,0.38)"/>',
          '<polygon points="36,40 78,40 72,32 42,32" fill="rgba(255,255,255,0.48)"/>',
          '<polygon points="50,28 64,28 60,19 54,19" fill="rgba(255,255,255,0.52)"/>',
          '<polygon points="54,19 60,19 57,11" fill="rgba(255,255,255,0.6)"/>',
          /* --- TUGU MUDA (center) --- */
          '<ellipse cx="188" cy="97" rx="34" ry="5" fill="rgba(255,255,255,0.2)"/>',
          '<rect x="170" y="82" width="36" height="15" rx="2" fill="rgba(255,255,255,0.42)"/>',
          '<rect x="178" y="52" width="20" height="30" fill="rgba(255,255,255,0.48)"/>',
          '<rect x="176" y="68" width="24" height="6" fill="rgba(255,255,255,0.45)"/>',
          '<polygon points="176,52 200,52 196,38 180,38" fill="rgba(255,255,255,0.52)"/>',
          '<polygon points="180,38 196,38 192,24 184,24" fill="rgba(255,255,255,0.56)"/>',
          '<polygon points="184,24 192,24 188,14" fill="rgba(255,255,255,0.65)"/>',
          /* --- GEREJA BLENDUK (right) --- */
          '<rect x="272" y="58" width="82" height="38" rx="2" fill="rgba(255,255,255,0.38)"/>',
          '<ellipse cx="313" cy="57" rx="29" ry="20" fill="rgba(255,255,255,0.44)"/>',
          '<rect x="311" y="36" width="4" height="17" fill="rgba(255,255,255,0.7)"/>',
          '<rect x="304" y="43" width="18" height="4" fill="rgba(255,255,255,0.7)"/>',
          '<rect x="279" y="62" width="8" height="34" fill="rgba(255,255,255,0.28)"/>',
          '<rect x="295" y="62" width="8" height="34" fill="rgba(255,255,255,0.28)"/>',
          '<rect x="323" y="62" width="8" height="34" fill="rgba(255,255,255,0.28)"/>',
          '<rect x="339" y="62" width="8" height="34" fill="rgba(255,255,255,0.28)"/>',
          '<rect x="301" y="74" width="24" height="22" rx="12" fill="rgba(0,25,90,0.22)"/>',
          /* Horizon glow line */
          '<rect x="0" y="95" width="375" height="2" fill="rgba(255,200,80,0.25)"/>',
        '</svg>',
        '<div class="t1s-scene-labels">',
          '<div class="t1s-slabel"><i class="fa-solid fa-torii-gate"></i><span>Sam Poo Kong</span></div>',
          '<div class="t1s-slabel"><i class="fa-solid fa-monument"></i><span>Tugu Muda</span></div>',
          '<div class="t1s-slabel"><i class="fa-solid fa-church"></i><span>Gereja Blenduk</span></div>',
        '</div>',
      '</div>',
      /* Value cards */
      '<div class="t1s-values">',
        '<div class="t1s-val"><span class="t1s-val-icon"><i class="fa-solid fa-people-group" style="color:#4cf;font-size:1rem"></i></span><b>Mudah</b><small>Digunakan</small></div>',
        '<div class="t1s-val"><span class="t1s-val-icon"><i class="fa-solid fa-shield-halved" style="color:#4d4;font-size:1rem"></i></span><b>Aman</b><small>Terpercaya</small></div>',
        '<div class="t1s-val"><span class="t1s-val-icon"><i class="fa-solid fa-bolt" style="color:#fc4;font-size:1rem"></i></span><b>Cepat</b><small>&amp; Efisien</small></div>',
        '<div class="t1s-val"><span class="t1s-val-icon"><i class="fa-solid fa-network-wired" style="color:#c8f;font-size:1rem"></i></span><b>Terintegrasi</b><small>Untuk Kita</small></div>',
      '</div>',
      /* Loading bar */
      '<div class="t1s-load-wrap">',
        '<div class="t1s-load-text">Memuat TegalsariOneApp...</div>',
        '<div class="t1s-load-bar"><div class="t1s-load-fill" id="t1s-fill"></div></div>',
      '</div>',
      /* Bottom wave + city skyline */
      '<div class="t1s-bottom">',
        '<svg class="t1s-wave-svg" viewBox="0 0 375 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">',
          '<path d="M0,22 C70,4 140,42 215,18 C290,-6 340,32 375,12 L375,56 L0,56 Z" fill="rgba(5,40,160,0.6)"/>',
          '<path d="M0,36 C65,22 148,50 220,34 C292,18 338,44 375,30 L375,56 L0,56 Z" fill="rgba(3,25,100,0.75)"/>',
          /* City skyline buildings */
          '<rect x="10" y="38" width="18" height="18" fill="rgba(255,255,255,0.12)"/>',
          '<rect x="32" y="30" width="14" height="26" fill="rgba(255,255,255,0.1)"/>',
          '<rect x="50" y="34" width="20" height="22" fill="rgba(255,255,255,0.12)"/>',
          '<rect x="305" y="32" width="16" height="24" fill="rgba(255,255,255,0.1)"/>',
          '<rect x="325" y="38" width="12" height="18" fill="rgba(255,255,255,0.12)"/>',
          '<rect x="341" y="28" width="20" height="28" fill="rgba(255,255,255,0.1)"/>',
        '</svg>',
        '<div class="t1s-people">',
          '<i class="fa-solid fa-person"></i>',
          '<i class="fa-solid fa-person-dress"></i>',
          '<i class="fa-solid fa-person"></i>',
          '<i class="fa-solid fa-person-dress"></i>',
          '<i class="fa-solid fa-person"></i>',
        '</div>',
        '<div class="t1s-footer">Tegalsari One App, Solusi untuk Semua!</div>',
      '</div>'
    ].join('');
    document.body.insertBefore(sp, document.body.firstChild);

    /* Start loading bar fill after short delay */
    setTimeout(function () {
      var fill = document.getElementById('t1s-fill');
      if (fill) fill.style.width = '100%';
    }, 120);

    /* Dismiss logic */
    function dismiss() {
      var el = document.getElementById('t1-splash');
      if (!el || el.classList.contains('t1s-out')) return;
      el.classList.add('t1s-out');
      setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 550);
    }

    /* Always show for ~3.2s, hard cap 4s */
    var dismissed = false;
    function safeDismiss() {
      if (dismissed) return;
      dismissed = true;
      dismiss();
    }
    setTimeout(safeDismiss, 3200);
    window.addEventListener('load', function () { setTimeout(safeDismiss, 2600); });
  }

  /* Show splash on every page load (not just PWA) */
  if (document.body) injectSplash();
  else document.addEventListener('DOMContentLoaded', injectSplash);

  /* ── 2. SERVICE WORKER REGISTRATION ──────────────────── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          // Check for SW update
          reg.addEventListener('updatefound', function () {
            var newSW = reg.installing;
            if (!newSW) return;
            newSW.addEventListener('statechange', function () {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast(newSW);
              }
            });
          });

          // Notify SW of version request
          if (reg.active) reg.active.postMessage({ type: 'GET_VERSION' });
        })
        .catch(function (err) { console.warn('[SW] Registration failed:', err); });

      // Listen for SW messages
      navigator.serviceWorker.addEventListener('message', function (e) {
        if (e.data?.type === 'SYNC_TRIGGERED') {
          if (window.gtRefreshDashboard) window.gtRefreshDashboard();
        }
      });
    });
  }

  /* ── 3. UPDATE TOAST ─────────────────────────────────── */
  function showUpdateToast(newSW) {
    var t = document.getElementById('ft-update-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ft-update-toast';
      t.innerHTML = '<span>✨ Versi baru tersedia</span><button id="ft-update-reload">Perbarui</button>';
      document.body.appendChild(t);
    }
    t.classList.add('show');
    document.getElementById('ft-update-reload').onclick = function () {
      newSW.postMessage({ type: 'SKIP_WAITING' });
      t.classList.remove('show');
      setTimeout(function () { window.location.reload(); }, 300);
    };
    setTimeout(function () { t.classList.remove('show'); }, 8000);
  }

  /* ── 4. INSTALL PROMPT (Android A2HS) ─── satu handler terpusat ── */

  /* Cek cooldown 24 jam (bukan permanent dismiss) */
  function _gtInstallDismissed() {
    try {
      var ts = localStorage.getItem('ft-install-dismissed-ts');
      if (!ts) return false;
      return (Date.now() - parseInt(ts)) < 86400000; /* 24 jam */
    } catch { return false; }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window._gtDeferredPrompt = e;
    /* Tampil 12 detik setelah event (setelah splash 10s selesai) */
    var delay = _gtInstallDismissed() ? 0 : 12000;
    if (!_gtInstallDismissed()) setTimeout(_gtShowInstallBanner, delay);
    /* Juga tampilkan floating button setelah splash selesai */
    setTimeout(function () {
      var btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'flex';
    }, 11000);
  });

  function _gtShowInstallBanner() {
    if (document.getElementById('ft-install-banner')) return;
    if (!window._gtDeferredPrompt) return;
    var banner = document.createElement('div');
    banner.id = 'ft-install-banner';
    banner.innerHTML = [
      '<button id="ft-install-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>',
      '<div id="ft-install-icon">',
        '<img src="/Lambang_Kota_Semarang.png" alt="" onerror="this.style.display=\'none\'">',
      '</div>',
      '<div id="ft-install-text">',
        '<div id="ft-install-title">Pasang di HP Anda</div>',
        '<div id="ft-install-sub">Smart Portal RT 005 — akses offline, lebih cepat</div>',
      '</div>',
      '<button id="ft-install-btn">Pasang</button>'
    ].join('');
    document.body.appendChild(banner);
    setTimeout(function () { banner.classList.add('ft-banner-show'); }, 50);

    document.getElementById('ft-install-btn').onclick = function () {
      window.triggerPWAInstall();
    };

    document.getElementById('ft-install-close').onclick = function () {
      window._gtHideInstallBanner();
      /* Simpan timestamp (cooldown 24 jam, bukan permanent) */
      try { localStorage.setItem('ft-install-dismissed-ts', String(Date.now())); } catch {}
    };
  }

  window._gtHideInstallBanner = function () {
    var b = document.getElementById('ft-install-banner');
    if (!b) return;
    b.classList.remove('ft-banner-show');
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400);
    var btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'none';
  };

  /* Hapus key lama (permanent dismiss) agar tidak menghalangi */
  try { localStorage.removeItem('ft-install-dismissed'); } catch {}

  /* ── 5. OFFLINE INDICATOR ────────────────────────────── */
  function updateOnlineStatus() {
    var bar = document.getElementById('ft-offline-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'ft-offline-bar';
      bar.textContent = '⚡ Tidak ada koneksi — mode offline';
      document.body.appendChild(bar);
    }
    if (!navigator.onLine) {
      bar.classList.add('ft-offline-show');
    } else {
      bar.classList.remove('ft-offline-show');
    }
  }

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  setTimeout(updateOnlineStatus, 1000);

  /* ── 6. DYNAMIC THEME-COLOR (matches dark mode toggle) ─ */
  function syncThemeColor() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var color  = isDark ? '#0b1220' : '#1e3a8a';
    var metas  = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach(function (m) {
      var media = m.getAttribute('media') || '';
      if (media.includes('dark') && isDark)  m.setAttribute('content', color);
      if (!media.includes('dark') && !isDark) m.setAttribute('content', color);
      if (!media) m.setAttribute('content', color);
    });
  }

  // Patch gtToggleTheme to also sync theme-color
  var _themeCheckInterval = setInterval(function () {
    if (window.gtToggleTheme && !window.gtToggleTheme.__ftTheme) {
      var orig = window.gtToggleTheme;
      window.gtToggleTheme = function () {
        var r = orig.apply(this, arguments);
        setTimeout(syncThemeColor, 50);
        return r;
      };
      window.gtToggleTheme.__ftTheme = true;
      clearInterval(_themeCheckInterval);
    }
  }, 200);

  setTimeout(syncThemeColor, 300);

  /* ── 7. ANDROID HARDWARE BACK BUTTON (PWA) ───────────── */
  window.addEventListener('popstate', function () {
    // If inside warga view, go back to dashboard on back button
    var activeTab = document.querySelector('#view-warga .warga-tab-content.active');
    if (activeTab && activeTab.id !== 'warga-dashboard') {
      if (window.openWargaTab) window.openWargaTab('warga-dashboard');
      history.pushState(null, '', location.href);
    }
  });

  // Push initial state for back button support
  var isStandalonePWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;
  if (isStandalonePWA) {
    history.pushState(null, '', location.href);
    // On every tab switch, push a history state
    var _tabPatchInterval = setInterval(function () {
      if (window.openWargaTab && !window.openWargaTab.__ftBack) {
        var origTab = window.openWargaTab;
        window.openWargaTab = function (tabId) {
          if (tabId !== 'warga-dashboard') {
            history.pushState({ tab: tabId }, '', location.href);
          }
          return origTab.apply(this, arguments);
        };
        window.openWargaTab.__ftBack = true;
        clearInterval(_tabPatchInterval);
      }
    }, 400);
  }

  /* ── 8. PREVENT DOUBLE-TAP ZOOM (Android) ────────────── */
  var lastTouch = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouch < 320) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  /* ── 9. MOMENTUM SCROLL OPTIMIZATION ────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var scrollEls = document.querySelectorAll(
      '#view-warga .warga-tab-content, #view-warga .warga-fb-main, #view-warga .warga-fb-right'
    );
    scrollEls.forEach(function (el) {
      el.style.webkitOverflowScrolling = 'touch';
      el.style.overscrollBehavior = 'contain';
    });
  });

})();


/* ═══════════════════════════════════════════════════════════
   GT FINTECH MICRO-INTERACTIONS v1
   Ripple · AnimatedCounter · SkeletonLoading · SpringFeedback
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Util ── */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutSpring(t) {
    var c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  /* ══════════════════════════════════════════════════════════
     1. RIPPLE EFFECT — touch-accurate, spring-fade out
  ══════════════════════════════════════════════════════════ */
  function createRipple(el, clientX, clientY, dark) {
    var rect = el.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var size = Math.max(rect.width, rect.height) * 2.2;
    var ink = document.createElement('span');
    ink.className = 'ft-ripple-ink' + (dark ? ' ft-ripple-dark' : '');
    ink.style.cssText = [
      'width:' + size + 'px', 'height:' + size + 'px',
      'top:' + (y - size / 2) + 'px', 'left:' + (x - size / 2) + 'px',
      'position:absolute'
    ].join(';');
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ink);
    setTimeout(function () { if (ink.parentNode) ink.parentNode.removeChild(ink); }, 650);
  }

  function bindRipple(el) {
    if (el.__ftR) return;
    el.__ftR = true;
    var isLight = el.classList.contains('gt-qa-card') ||
                  el.classList.contains('dsh-ring-card') ||
                  el.classList.contains('wfb-card');
    el.addEventListener('pointerdown', function (e) {
      createRipple(el, e.clientX, e.clientY, isLight);
    });
  }

  function initRipples() {
    var sels = [
      '#view-warga .gt-qa-card',
      '#view-warga .dsh-ring-card',
      '#view-warga .wfb-card',
      '#view-warga .wfb-btn-full',
      '#view-warga .btn-action',
      '.wfb-mob-btn',
      '#view-warga .dsh-ai-btn'
    ];
    qsa(sels.join(',')).forEach(function (el) { bindRipple(el); });
  }

  /* ══════════════════════════════════════════════════════════
     2. ANIMATED COUNTER — spring ease-out, locale-aware
  ══════════════════════════════════════════════════════════ */
  function animateValue(el, finalStr, duration) {
    duration = duration || 1100;
    var txt = (finalStr || '').trim();
    // Parse "Rp 1.234.567" or "128 KK" or "42"
    var m = txt.match(/^(Rp\s*)?([0-9]+(?:[.,][0-9]+)*)(.*)$/);
    if (!m) return;
    var prefix   = m[1] || '';
    var numRaw   = m[2].replace(/[.,]/g, '');
    var suffix   = m[3] || '';
    var target   = parseInt(numRaw, 10);
    if (isNaN(target) || target === 0) return;

    el.classList.add('ft-counter');
    var start = null;
    var isCur = prefix.indexOf('Rp') !== -1;

    function fmt(n) {
      if (isCur) return 'Rp\u00A0' + n.toLocaleString('id-ID');
      return n.toLocaleString('id-ID') + (suffix ? '\u00A0' + suffix.trim() : '');
    }
    function tick(ts) {
      if (!start) start = ts;
      var pct = clamp((ts - start) / duration, 0, 1);
      el.textContent = fmt(Math.round(easeOutSpring(pct) * target));
      if (pct < 1) requestAnimationFrame(tick);
      else el.textContent = finalStr; // ensure exact final text
    }
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════════════════════════
     3. SKELETON SHIMMER on stat cards while data loads
  ══════════════════════════════════════════════════════════ */
  var SKEL_DARK = 'background:linear-gradient(90deg,#1a2744 25%,#233152 50%,#1a2744 75%);background-size:600px 100%;animation:ftShimmer 1.5s ease-in-out infinite;border-radius:6px;color:transparent!important;min-height:1em;display:inline-block;width:75%;';
  var SKEL_LIGHT= 'background:linear-gradient(90deg,#eef1f6 25%,#e4e8f0 50%,#eef1f6 75%);background-size:600px 100%;animation:ftShimmer 1.5s ease-in-out infinite;border-radius:6px;color:transparent!important;min-height:1em;display:inline-block;width:75%;';

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function skelOn(el)  { el.__skelOrig = el.textContent; el.style.cssText = isDark() ? SKEL_DARK : SKEL_LIGHT; }
  function skelOff(el) { el.style.cssText = ''; }

  var COUNTER_IDS = ['warga-saldo-kas', 'warga-total-kk', 'warga-arisan-nama', 'warga-host-nama'];

  function setupSkeleton() {
    COUNTER_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.__ftSkel) return;
      el.__ftSkel = true;

      var empty = ['—', '', 'Rp 0', '0'];
      if (empty.indexOf((el.textContent || '').trim()) !== -1) {
        skelOn(el);
      }

      var obs = new MutationObserver(function () {
        var txt = (el.textContent || '').trim();
        if (empty.indexOf(txt) === -1 && txt !== '') {
          skelOff(el);
          obs.disconnect();
          // Animate numeric counters
          if (/^(Rp\s*)?[0-9]/.test(txt)) {
            setTimeout(function () { animateValue(el, txt); }, 80);
          }
        }
      });
      obs.observe(el, { childList: true, subtree: true, characterData: true });
    });
  }

  /* ══════════════════════════════════════════════════════════
     4. TOUCH FEEDBACK — haptic-like visual spring on nav
  ══════════════════════════════════════════════════════════ */
  function initTouchFeedback() {
    qsa('#view-warga .wfb-nav-item').forEach(function (btn) {
      if (btn.__ftTF) return;
      btn.__ftTF = true;
      btn.addEventListener('pointerdown', function () {
        btn.style.transition = 'transform .09s';
        btn.style.transform  = 'scale(.93)';
      });
      btn.addEventListener('pointerup pointercancel', function () {
        btn.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)';
        btn.style.transform  = '';
      });
    });

    qsa('.wfb-mob-btn').forEach(function (btn) {
      if (btn.__ftTF) return;
      btn.__ftTF = true;
      btn.addEventListener('pointerdown', function () {
        btn.style.transition = 'transform .08s';
        btn.style.transform  = 'scale(.78)';
      });
      ['pointerup','pointerleave','pointercancel'].forEach(function (ev) {
        btn.addEventListener(ev, function () {
          btn.style.transition = 'transform .38s cubic-bezier(.34,1.56,.64,1)';
          btn.style.transform  = btn.classList.contains('active') ? 'scale(1)' : '';
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     5. SMOOTH PAGE TRANSITION — re-trigger on tab switch
  ══════════════════════════════════════════════════════════ */
  function triggerTransition(tabId) {
    var el = document.getElementById(tabId);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = '';
  }

  /* ══════════════════════════════════════════════════════════
     6. PATCH openWargaTab — inject all enhancements on switch
  ══════════════════════════════════════════════════════════ */
  function patchOpenWargaTab() {
    if (!window.openWargaTab || window.openWargaTab.__ftMicro) return;
    var orig = window.openWargaTab;
    window.openWargaTab = function (tabId) {
      var r = orig.apply(this, arguments);
      triggerTransition(tabId);
      setTimeout(function () {
        initRipples();
        initTouchFeedback();
        if (tabId === 'warga-dashboard') setupSkeleton();
      }, 60);
      return r;
    };
    window.openWargaTab.__ftMicro = true;
  }

  /* ══════════════════════════════════════════════════════════
     7. COUNTER for QA status values (animate on dashboard load)
  ══════════════════════════════════════════════════════════ */
  function setupQACounters() {
    ['qa-iuran-status','qa-surat-status','qa-berita-status','qa-aduan-status'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el || el.__ftQA) return;
      el.__ftQA = true;
      var obs = new MutationObserver(function() {
        var txt = (el.textContent||'').trim();
        if (txt && txt !== '—') {
          obs.disconnect();
          if (/[0-9]/.test(txt)) {
            setTimeout(function(){ animateValue(el, txt, 900); }, 150);
          }
        }
      });
      obs.observe(el, { childList: true, subtree: true, characterData: true });
    });
  }

  /* ══════════════════════════════════════════════════════════
     8. INIT
  ══════════════════════════════════════════════════════════ */
  function init() {
    initRipples();
    initTouchFeedback();
    setupSkeleton();
    setupQACounters();
    patchOpenWargaTab();

    // Re-patch if openWargaTab loads late
    var attempts = 0;
    var pid = setInterval(function () {
      patchOpenWargaTab();
      if (++attempts > 20) clearInterval(pid);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 200); });
  } else {
    setTimeout(init, 200);
  }
})();


(function(){

var WARGA_MENUS = [
  {icon:"fa-gauge",         label:"Dashboard",        fn:"openWargaTab('warga-dashboard')"},
  {icon:"fa-newspaper",     label:"Berita Portal",    fn:"openWargaTab('warga-berita-portal')"},
  {icon:"fa-money-bill",    label:"Keuangan",         fn:"openWargaTab('warga-keuangan')"},
  {icon:"fa-piggy-bank",    label:"Koperasi",         fn:"openWargaTab('warga-koperasi')"},
  {icon:"fa-envelope",      label:"Surat",            fn:"openWargaTab('warga-surat')"},
  {icon:"fa-flag",          label:"Aduan",            fn:"openWargaTab('warga-aduan')"},
  {icon:"fa-sitemap",       label:"Struktur",         fn:"openWargaTab('warga-struktur')"},
  {icon:"fa-triangle-exclamation", label:"Darurat",   fn:"openWargaTab('warga-darurat')"},
  {icon:"fa-user",          label:"Profil",           fn:"openWargaTab('warga-profil')"},
];

var ADMIN_MENUS = [
  {icon:"fa-users-rectangle",   label:"Data Keluarga (KK)",  fn:"openAdminTab('admin-datakk'); if(typeof loadTabelKKAdmin==='function') loadTabelKKAdmin();"},
  {icon:"fa-truck-moving",      label:"Mutasi Warga",        fn:"openAdminTab('mutasi')"},
  {icon:"fa-envelope",          label:"Surat & Acc",         fn:"openAdminTab('surat'); if(typeof loadSuratAdmin==='function') loadSuratAdmin();"},
  {icon:"fa-inbox",             label:"Kotak Aduan",         fn:"openAdminTab('admin-aduan')"},
  {icon:"fa-tower-broadcast",   label:"Publikasi Info",      fn:"openAdminTab('admin-publikasi')"},
  {icon:"fa-sitemap",           label:"Susunan Pengurus",    fn:"openAdminTab('admin-struktur')"},
  {icon:"fa-gear",              label:"Pengaturan Sistem",   fn:"openAdminTab('pengaturan')"},
  {icon:"fa-hand-holding-heart",label:"Bantuan Sosial",      fn:"openAdminTab('bantuan-sosial')"},
  {icon:"fa-truck-medical",     label:"Call Darurat",        fn:"openAdminTab('darurat')"},
];

var BEN_MENUS = [
  {icon:"fa-cash-register",        label:"Input Data",          fn:"openBenTab('ben-input')"},
  {icon:"fa-file-invoice-dollar",  label:"Laporan BA Kas",      fn:"openBenTab('ben-laporan')"},
];

var KOP_MENUS = [
  {icon:"fa-coins",          label:"Buku Tabungan",     fn:"openKopTab('kop-simpanan')"},
  {icon:"fa-handshake-angle",label:"Pinjaman Pintar",   fn:"openKopTab('kop-pinjaman')"},
  {icon:"fa-chart-line",     label:"Tutup Buku (SHU)",  fn:"openKopTab('kop-laporan')"},
];

function gtSpOpen() {
  var overlay = document.getElementById("gt-sp-overlay");
  var drawer  = document.getElementById("gt-sp-drawer");
  if (!overlay || !drawer) return;

  // Tentukan role aktif
  var isAdmin = (typeof loggedInAs !== "undefined" && loggedInAs === "admin");
  var isBen   = (typeof loggedInAs !== "undefined" && loggedInAs === "bendahara");
  var isKop   = (typeof loggedInAs !== "undefined" && loggedInAs === "koperasi");
  var isWarga = !isAdmin && !isBen && !isKop;

  // Set title
  var titleEl = document.getElementById("gt-sp-title");
  var roleEl  = document.getElementById("gt-sp-role");
  if (isAdmin) {
    titleEl.textContent = "Portal Admin";
    roleEl.textContent  = "Administrator";
  } else if (isBen) {
    titleEl.textContent = "Portal Bendahara";
    roleEl.textContent  = "Bendahara";
  } else if (isKop) {
    titleEl.textContent = "Portal Koperasi";
    roleEl.textContent  = "Koperasi";
  } else {
    titleEl.textContent = "Portal Warga";
    var nm = (window.loggedInWarga && window.loggedInWarga.nama) ? window.loggedInWarga.nama : "Warga";
    roleEl.textContent  = nm;
  }

  // Pilih menu
  var menus = isAdmin ? ADMIN_MENUS : isBen ? BEN_MENUS : isKop ? KOP_MENUS : WARGA_MENUS;

  // Render menu
  var list = document.getElementById("gt-sp-list");
  list.innerHTML = "";
  menus.forEach(function(m) {
    var btn = document.createElement("button");
    btn.className = "sp-item";
    btn.innerHTML = "<i class=\"fa-solid " + m.icon + "\"></i><span>" + m.label + "</span>";
    btn.addEventListener("click", function() {
      // Hapus active dari semua item
      list.querySelectorAll(".sp-item").forEach(function(el){ el.classList.remove("active"); });
      btn.classList.add("active");
      // Jalankan fungsi navigasi
      try { eval(m.fn); } catch(e) { console.warn("gtSidebar nav error:", e); }
      // Tutup sidebar setelah navigasi
      setTimeout(gtSpClose, 150);
    });
    list.appendChild(btn);
  });

  overlay.classList.add("open");
  drawer.classList.add("open");
  document.body.style.overflow = "hidden";
}

function gtSpClose() {
  var overlay = document.getElementById("gt-sp-overlay");
  var drawer  = document.getElementById("gt-sp-drawer");
  if (overlay) overlay.classList.remove("open");
  if (drawer)  drawer.classList.remove("open");
  document.body.style.overflow = "";
}

window.gtSpOpen  = gtSpOpen;
window.gtSpClose = gtSpClose;

// Tutup dengan tombol ESC
document.addEventListener("keydown", function(e){
  if (e.key === "Escape") gtSpClose();
});

// Swipe kiri untuk tutup
(function(){
  var startX = 0;
  var drawer = document.getElementById("gt-sp-drawer");
  if (!drawer) return;
  drawer.addEventListener("touchstart", function(e){ startX = e.touches[0].clientX; }, {passive:true});
  drawer.addEventListener("touchend",   function(e){
    if (e.changedTouches[0].clientX - startX < -60) gtSpClose();
  }, {passive:true});
})();

console.log("[gtSidebar] Mobile sidebar final loaded OK");
})();

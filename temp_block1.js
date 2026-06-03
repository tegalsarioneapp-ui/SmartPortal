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

    // Tampilkan panel pengujian developer hanya di host dev (localhost / *.replit.dev)
    (function(){
        try {
            var h = location.hostname || '';
            var isDev = h === 'localhost' || h === '127.0.0.1' || /\.replit\.dev$/i.test(h) || /\.repl\.co$/i.test(h);
            if (!isDev) return;
            var apply = function(){
                var p = document.getElementById('gt-dev-test-panel');
                if (p) p.style.display = '';
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', apply);
            } else { apply(); }
        } catch(e) {}
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
            var arr = safeJSON('riwayatSurat', []) || safeJSON('dataSurat', []) || [];
            if (!Array.isArray(arr) || arr.length === 0){
                return '<div class="gt-status-empty"><i class="fa-regular fa-envelope"></i>Belum ada pengajuan surat. Silakan ajukan dari menu Layanan Surat.</div>';
            }
            var nik = getCurrentUserNik();
            var mine = nik ? arr.filter(function(x){ return (x.nik||x.req_nik||'')===nik; }) : arr.slice();
            if (mine.length === 0) mine = arr.slice();
            mine.sort(function(a,b){ return new Date(b.tgl||b.tanggal||0) - new Date(a.tgl||a.tanggal||0); });
            var item = mine[0];
            var status = (item.status || item.statusSurat || 'Terkirim').toString().toLowerCase();
            var cur = 0;
            if (/proses|review|verif|rt/.test(status)) cur = 1;
            if (/setuju|valid|approve/.test(status))   cur = 2;
            if (/selesai|terbit|cetak|ttd|tanda|done/.test(status)) cur = 3;
            if (/tolak|reject|batal/.test(status)) cur = 1;
            var steps = [
                {icon:'fa-paper-plane', label:'Terkirim'},
                {icon:'fa-user-check',  label:'Proses RT'},
                {icon:'fa-stamp',       label:'Disetujui'},
                {icon:'fa-check-double',label:'Selesai'}
            ];
            var keperluan = (item.keperluan || item.req_keperluan || 'Pengajuan Surat').toString();
            if (keperluan.length > 70) keperluan = keperluan.substring(0,70) + '...';
            return '<div class="gt-status-head"><div><h4 class="gt-status-title"><i class="fa-solid fa-envelope-circle-check" style="color:var(--gt-primary-600);"></i>'+escapeHtml(keperluan)+'</h4><div class="gt-status-meta">Diajukan '+fmtDate(item.tgl||item.tanggal)+(item.no_surat?' • No. '+escapeHtml(item.no_surat):'')+'</div></div><span class="badge '+(cur===3?'badge-masuk':cur===0?'badge-menunggu':'badge-menunggu')+'">'+escapeHtml(item.status||'Diproses')+'</span></div>'
                + renderTimeline(steps, cur);
        }

        function buildAduanStatus(){
            var arr = safeJSON('dataAduan', []) || safeJSON('riwayatAduan', []) || [];
            if (!Array.isArray(arr) || arr.length === 0){
                return '<div class="gt-status-empty"><i class="fa-regular fa-comment-dots"></i>Belum ada aduan. Sampaikan keluhan via menu Lapor Pak RT.</div>';
            }
            var nik = getCurrentUserNik();
            var mine = nik ? arr.filter(function(x){ return (x.nik||'')===nik; }) : arr.slice();
            if (mine.length === 0) mine = arr.slice();
            mine.sort(function(a,b){ return new Date(b.tgl||b.tanggal||0) - new Date(a.tgl||a.tanggal||0); });
            var it = mine[0];
            var st = (it.status||'Diterima').toString().toLowerCase();
            var cur = 0;
            if (/proses|tindak|review/.test(st)) cur = 1;
            if (/selesai|done|tutup|resolved/.test(st)) cur = 2;
            var steps = [
                {icon:'fa-inbox',       label:'Diterima'},
                {icon:'fa-screwdriver-wrench', label:'Ditindaklanjuti'},
                {icon:'fa-circle-check',label:'Selesai'}
            ];
            var judul = (it.judul || it.kategori || 'Aduan').toString();
            return '<div class="gt-status-head"><div><h4 class="gt-status-title"><i class="fa-solid fa-bullhorn" style="color:var(--gt-danger-500);"></i>'+escapeHtml(judul)+'</h4><div class="gt-status-meta">Dilaporkan '+fmtDate(it.tgl||it.tanggal)+' • Kategori: '+escapeHtml(it.kategori||'-')+'</div></div><span class="badge '+(cur===2?'badge-masuk':'badge-menunggu')+'">'+escapeHtml(it.status||'Diproses')+'</span></div>'
                + renderTimeline(steps, cur);
        }

        function ensureDashboardWidgets(){
            var dash = document.getElementById('warga-dashboard');
            if (!dash) return;
            if (document.getElementById('gt-citizen-shell')) return; // already injected

            var name = (document.getElementById('warga-welcome-name') || {}).textContent || 'Warga';
            var hour = new Date().getHours();
            var greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
            var today = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

            var shell = document.createElement('div');
            shell.id = 'gt-citizen-shell';

            var hero = '<div class="gt-hero"><h1>'+greet+', '+escapeHtml(name)+'</h1><p>Pusat layanan dan transparansi RT 005 Tegalsari dalam genggaman Anda.</p><div class="gt-hero-meta"><span class="gt-hero-chip"><i class="fa-regular fa-calendar"></i>'+today+'</span><span class="gt-hero-chip"><i class="fa-solid fa-shield-halved"></i>Akses Aman</span></div></div>';

            var svcCards = SERVICES.map(function(s){
                return '<button type="button" class="gt-service-card" onclick="openWargaTab(\''+s.id+'\')">'
                    + '<span class="gt-svc-icon" style="background:'+s.grad+';"><i class="fa-solid '+s.icon+'"></i></span>'
                    + '<h4>'+s.title+'</h4>'
                    + '<p>'+s.desc+'</p>'
                    + '<span class="gt-svc-arrow"><i class="fa-solid fa-arrow-right"></i></span>'
                    + '</button>';
            }).join('');
            var svcSection = '<div class="gt-section-title"><h3><i class="fa-solid fa-grip"></i> Layanan Cepat</h3></div><div class="gt-service-grid">'+svcCards+'</div>';

            var statusSection = '<div class="gt-section-title"><h3><i class="fa-solid fa-route"></i> Status Pengajuan Saya</h3><button class="gt-link" onclick="if(window.gtRefreshDashboard) gtRefreshDashboard();"><i class="fa-solid fa-rotate"></i> Perbarui</button></div>'
                + '<div class="gt-status-grid">'
                + '<div class="gt-status-card" id="gt-status-surat">'+buildSuratStatus()+'</div>'
                + '<div class="gt-status-card" id="gt-status-aduan">'+buildAduanStatus()+'</div>'
                + '</div>';

            shell.innerHTML = hero + svcSection + statusSection
                + '<div class="gt-section-title"><h3><i class="fa-solid fa-chart-pie"></i> Ringkasan Lingkungan</h3></div>';
            dash.insertBefore(shell, dash.firstChild);
        }

        window.gtRefreshDashboard = function(){
            var s = document.getElementById('gt-status-surat'); if (s) s.innerHTML = buildSuratStatus();
            var a = document.getElementById('gt-status-aduan'); if (a) a.innerHTML = buildAduanStatus();
        };

        function boot(){ try { ensureDashboardWidgets(); } catch(e){ console.warn('gt-dashboard init', e); } }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
        else boot();
        setTimeout(boot, 800);
        setTimeout(boot, 2500);
        // Re-render status timelines whenever the user navigates back to dashboard
        var origOpen = window.openWargaTab;
        if (typeof origOpen === 'function' && !origOpen.__gtWrapped){
            window.openWargaTab = function(t){ var r = origOpen.apply(this, arguments); if (t === 'warga-dashboard') { setTimeout(function(){ ensureDashboardWidgets(); window.gtRefreshDashboard(); }, 50); } return r; };
            window.openWargaTab.__gtWrapped = true;
        } else {
            // openWargaTab not yet defined — wrap once it appears
            var tries = 0;
            var w = setInterval(function(){
                tries++;
                if (typeof window.openWargaTab === 'function' && !window.openWargaTab.__gtWrapped){
                    var orig = window.openWargaTab;
                    window.openWargaTab = function(t){ var r = orig.apply(this, arguments); if (t === 'warga-dashboard') { setTimeout(function(){ ensureDashboardWidgets(); window.gtRefreshDashboard(); }, 50); } return r; };
                    window.openWargaTab.__gtWrapped = true;
                    clearInterval(w);
                }
                if (tries > 40) clearInterval(w);
            }, 250);
        }
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
                +   '<div class="gt-warga-field"><span class="gt-fld-label">Nomor KK</span><span class="gt-fld-value">'+esc(w.kk || '-')+'</span></div>'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">NIK</span><span class="gt-fld-value">'+esc(w.nik || '-')+'</span></div>'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">Alamat</span><span class="gt-fld-value">'+esc(w.alamat || '-')+'</span></div>'
                +   '<div class="gt-warga-field"><span class="gt-fld-label">Pekerjaan</span><span class="gt-fld-value">'+esc(w.pekerjaan || '-')+'</span></div>'
                +   (w.telp ? '<div class="gt-warga-field"><span class="gt-fld-label">Telepon</span><span class="gt-fld-value"><a href="tel:'+esc(w.telp)+'" style="color:var(--gt-primary-600);text-decoration:none;">'+esc(w.telp)+'</a></span></div>' : '')
                +   (w.istri ? '<div class="gt-warga-field"><span class="gt-fld-label">Nama Istri</span><span class="gt-fld-value">'+esc(w.istri)+'</span></div>' : '')
                +   (anak ? '<div class="gt-warga-field"><span class="gt-fld-label">Data Anak</span><span class="gt-fld-value">'+esc(anak)+'</span></div>' : '')
                +   (w.bpjs ? '<div class="gt-warga-field"><span class="gt-fld-label">No. BPJS</span><span class="gt-fld-value">'+esc(w.bpjs)+'</span></div>' : '')
                + '</div></div>';
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
            return '<tr><td style="border:1px solid #000; text-align:center;">'+(i+1)+'</td>'+
                   '<td style="border:1px solid #000;">'+x.tgl+'</td>'+
                   '<td style="border:1px solid #000;"><b>'+(x.namaWarga||'-')+'</b></td>'+
                   '<td style="border:1px solid #000;">'+(x.jenis||'-')+'</td>'+
                   '<td style="border:1px solid #000; text-align:right;">'+fmt(n)+'</td></tr>';
        }).join('');
        var saldo = totalSetor - totalTarik;
        var tgl = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
        var html = '<div class="letter-paper" style="padding:0;">'+
            '<div class="kop-surat-resmi"><img src="/Lambang_Kota_Semarang.png" style="width:70px; filter:grayscale(100%);">'+
            '<div style="flex:1; text-align:center;"><h2 style="margin:0; font-size:1.3rem; font-weight:bold; text-transform:uppercase;">KOPERASI WARGA RT 005 / RW 012</h2>'+
            '<h3 style="margin:2px 0; font-size:1rem; font-weight:normal;">KELURAHAN TEGALSARI &bull; KECAMATAN CANDISARI &bull; SEMARANG</h3></div></div>'+
            '<hr style="border:0; border-top:3px solid black;"><h3 style="text-align:center; text-decoration:underline;">BERITA ACARA REKAP TABUNGAN ('+bulan+')</h3>'+
            '<p>Pada hari ini, '+tgl+', telah dilakukan rekapitulasi transaksi tabungan koperasi warga sebagai berikut:</p>'+
            '<table style="width:100%; border-collapse:collapse; margin:10px 0;"><thead><tr style="background:#eee;">'+
            '<th style="border:1px solid #000;">No</th><th style="border:1px solid #000;">Tanggal</th><th style="border:1px solid #000;">Nama Anggota</th>'+
            '<th style="border:1px solid #000;">Jenis</th><th style="border:1px solid #000;">Nominal</th></tr></thead><tbody>'+rows+
            '<tr style="background:#f8f8f8; font-weight:bold;"><td colspan="4" style="border:1px solid #000; text-align:right;">Total Setoran</td><td style="border:1px solid #000; text-align:right;">'+fmt(totalSetor)+'</td></tr>'+
            '<tr style="background:#f8f8f8; font-weight:bold;"><td colspan="4" style="border:1px solid #000; text-align:right;">Total Penarikan</td><td style="border:1px solid #000; text-align:right;">'+fmt(totalTarik)+'</td></tr>'+
            '<tr style="background:#fff3cd; font-weight:bold;"><td colspan="4" style="border:1px solid #000; text-align:right;">SALDO BERSIH</td><td style="border:1px solid #000; text-align:right;">'+fmt(saldo)+'</td></tr>'+
            '</tbody></table>'+
            '<table style="width:100%; margin-top:40px; text-align:center; border:none;"><tr>'+
            '<td style="width:50%; border:none;">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">'+settings.namaRT+'</b></td>'+
            '<td style="width:50%; border:none;">Semarang, '+tgl+'<br>Bendahara<br><br><br><br><b style="text-decoration:underline;">'+settings.namaBen+'</b></td>'+
            '</tr></table></div>';
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
            return '<tr><td style="border:1px solid #000; text-align:center;">'+(i+1)+'</td>'+
                   '<td style="border:1px solid #000;">'+x.tgl+'</td>'+
                   '<td style="border:1px solid #000;"><b>'+(x.namaWarga||'-')+'</b></td>'+
                   '<td style="border:1px solid #000; text-align:right;">'+fmt(x.plafon)+'</td>'+
                   '<td style="border:1px solid #000; text-align:center;">'+(x.bunga||10)+'%</td>'+
                   '<td style="border:1px solid #000; text-align:right;">'+fmt(x.sisa)+'</td>'+
                   '<td style="border:1px solid #000; text-align:center;">'+(x.status||'Aktif')+'</td></tr>';
        }).join('');
        var tgl = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
        var html = '<div class="letter-paper" style="padding:0;">'+
            '<div class="kop-surat-resmi"><img src="/Lambang_Kota_Semarang.png" style="width:70px; filter:grayscale(100%);">'+
            '<div style="flex:1; text-align:center;"><h2 style="margin:0; font-size:1.3rem; font-weight:bold; text-transform:uppercase;">KOPERASI WARGA RT 005 / RW 012</h2>'+
            '<h3 style="margin:2px 0; font-size:1rem; font-weight:normal;">KELURAHAN TEGALSARI &bull; KECAMATAN CANDISARI &bull; SEMARANG</h3></div></div>'+
            '<hr style="border:0; border-top:3px solid black;"><h3 style="text-align:center; text-decoration:underline;">BERITA ACARA REKAP PINJAMAN ('+bulan+')</h3>'+
            '<p>Pada hari ini, '+tgl+', telah dilakukan rekapitulasi pinjaman koperasi warga sebagai berikut:</p>'+
            '<table style="width:100%; border-collapse:collapse; margin:10px 0; font-size:0.9rem;"><thead><tr style="background:#eee;">'+
            '<th style="border:1px solid #000;">No</th><th style="border:1px solid #000;">Tanggal</th><th style="border:1px solid #000;">Peminjam</th>'+
            '<th style="border:1px solid #000;">Plafon</th><th style="border:1px solid #000;">Bunga</th>'+
            '<th style="border:1px solid #000;">Sisa Hutang</th><th style="border:1px solid #000;">Status</th></tr></thead><tbody>'+rows+
            '<tr style="background:#fff3cd; font-weight:bold;"><td colspan="3" style="border:1px solid #000; text-align:right;">TOTAL</td>'+
            '<td style="border:1px solid #000; text-align:right;">'+fmt(totPlafon)+'</td>'+
            '<td style="border:1px solid #000;"></td>'+
            '<td style="border:1px solid #000; text-align:right;">'+fmt(totSisa)+'</td>'+
            '<td style="border:1px solid #000;"></td></tr></tbody></table>'+
            '<table style="width:100%; margin-top:40px; text-align:center; border:none;"><tr>'+
            '<td style="width:50%; border:none;">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">'+settings.namaRT+'</b></td>'+
            '<td style="width:50%; border:none;">Semarang, '+tgl+'<br>Bendahara<br><br><br><br><b style="text-decoration:underline;">'+settings.namaBen+'</b></td>'+
            '</tr></table></div>';
        printViaIframe(html, 'BA_Rekap_Pinjaman_'+bulan);
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
        
        if(role === 'warga' && loggedInWarga) {
            document.getElementById('user-name').innerText = loggedInWarga.nama; document.getElementById('user-role').innerText = loggedInWarga.isGuest ? "Akses Publik Terbatas" : "Anggota Warga RT 005";
            document.getElementById('user-avatar').style.background = loggedInWarga.isGuest ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #2563eb)"; document.getElementById('user-avatar').innerHTML = loggedInWarga.isGuest ? "<i class='fa-solid fa-eye'></i>" : "<i class='fa-solid fa-user'></i>";
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
            }
        } 
        else if(role === 'bendahara') { document.getElementById('user-name').innerText = "Bapak Suparmin"; document.getElementById('user-role').innerText = "Otoritas Keuangan RT 005"; document.getElementById('user-avatar').style.background = "linear-gradient(135deg, #10b981, #059669)"; document.getElementById('user-avatar').innerHTML = "<i class='fa-solid fa-vault'></i>"; let v = document.getElementById('view-bendahara'); v.style.display = ''; v.classList.add('active-grid'); openBenTab('ben-input'); document.getElementById('ben-tgl').valueAsDate = new Date(); } 
        else if(role === 'koperasi') { document.getElementById('user-name').innerText = "Pengurus Koperasi"; document.getElementById('user-role').innerText = "Simpan Pinjam RT 005"; document.getElementById('user-avatar').style.background = "linear-gradient(135deg, #8b5cf6, #6d28d9)"; document.getElementById('user-avatar').innerHTML = "<i class='fa-solid fa-handshake-angle'></i>"; let v = document.getElementById('view-koperasi'); v.style.display = ''; v.classList.add('active-grid'); openKopTab('kop-simpanan'); } 
        else if(role === 'admin') { document.getElementById('user-name').innerText = "Christian Eka"; document.getElementById('user-role').innerText = "Otoritas Sekretaris RT 005"; document.getElementById('user-avatar').style.background = "linear-gradient(135deg, #f59e0b, #b45309)"; document.getElementById('user-avatar').innerHTML = "<i class='fa-solid fa-user-tie'></i>"; let v = document.getElementById('view-admin'); v.style.display = ''; v.classList.add('active-grid'); openAdminTab('admin-datakk'); document.getElementById('p_no').value = getNextSuratNumber(); document.getElementById('p_tgl_manual').innerText = new Date().toLocaleDateString('id-ID'); }
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
    };
    if(aLoaders[t]) aLoaders[t]();
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
        let data = { nama: document.getElementById('kk-nama').value, kk: document.getElementById('kk-nokk').value, nik: document.getElementById('kk-nik').value, pekerjaan: document.getElementById('kk-pekerjaan').value, bpjs: document.getElementById('kk-bpjs').value, email: (document.getElementById('kk-email')||{}).value || '', istri: document.getElementById('kk-istri').value, alamat: document.getElementById('kk-alamat').value, anak: anak };
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
        if(!loggedInWarga) return; let db = JSON.parse(localStorage.getItem('db_warga')) || []; let myData = db.find(x => String(x.id) === String(loggedInWarga.id)); let tb = document.getElementById('tbody-profil-saya');
        if(!tb) return; tb.innerHTML = ''; if(myData) { tb.innerHTML = `<tr><td><b style="color:var(--primary-dark); font-size:1.05rem;">${myData.nama}</b><br><small>NIK: ${myData.nik||'-'}</small></td><td><b>${myData.alamat}</b></td><td style="white-space:nowrap;"><button class="btn-action bg-blue" style="margin-bottom:4px;" onclick="window.lihatProfilWarga()"><i class="fa-solid fa-eye"></i> Lihat</button><br><button class="btn-action bg-gold" onclick="siapkanEditProfilSaya()"><i class="fa-solid fa-pen"></i> Edit</button></td></tr>`; } else { tb.innerHTML = `<tr><td colspan="3" style="text-align:center;">Anda belum melengkapi data.</td></tr>`; }
    };
    window.siapkanEditProfilSaya = function() {
        let db = JSON.parse(localStorage.getItem('db_warga')) || []; let myData = db.find(x => String(x.id) === String(loggedInWarga.id));
        if(myData) { document.getElementById('kk-nama').value = myData.nama||''; document.getElementById('kk-nokk').value = myData.kk||''; document.getElementById('kk-nik').value = myData.nik||''; document.getElementById('kk-pekerjaan').value = myData.pekerjaan||''; document.getElementById('kk-bpjs').value = myData.bpjs||''; document.getElementById('kk-istri').value = myData.istri||''; document.getElementById('kk-alamat').value = myData.alamat||'';
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
    window.simpanKKAdmin = function() { let db = JSON.parse(localStorage.getItem('db_warga')) || []; let anak = []; document.querySelectorAll('.adm_anak').forEach(i => { if(i.value.trim() !== '') anak.push(i.value.trim()); }); let id = document.getElementById('adm-kk-id').value; let __aktifEl = document.getElementById('adm-kk-aktif'); let __aktif = __aktifEl ? !!__aktifEl.checked : true; let data = { nama: document.getElementById('adm-kk-nama').value, kk: document.getElementById('adm-kk-nokk').value, nik: document.getElementById('adm-kk-nik').value, pekerjaan: document.getElementById('adm-kk-pekerjaan').value, telp: document.getElementById('adm-kk-telp').value, istri: document.getElementById('adm-kk-istri').value, alamat: document.getElementById('adm-kk-alamat').value, anak: anak, aktif: __aktif }; if(id) { let idx = db.findIndex(x => String(x.id) === String(id)); if(idx !== -1) db[idx] = { id: parseInt(id), ...data }; } else { db.push({ id: Date.now(), ...data }); } localStorage.setItem('db_warga', JSON.stringify(db)); localStorage.setItem('ts_warga', new Date().toISOString()); tampilFormKKAdmin(false); loadTabelKKAdmin(); if (typeof syncSemuaData === 'function') syncSemuaData(true); Toast.fire({icon:'success', title:'Disimpan!'}); };
    window.prosesImportExcelWarga = function(e) { let file = e.target.files[0]; if(!file) return; let reader = new FileReader(); reader.onload = function(evt) { let data = new Uint8Array(evt.target.result); let wb = XLSX.read(data, {type: 'array'}); let rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1}); let db = JSON.parse(localStorage.getItem('db_warga')) || []; let added = 0; for(let i=1; i<rows.length; i++) { let r=rows[i]; if(r&&r[0]){ db.push({ id: Date.now()+Math.random(), nama: String(r[0]).trim(), kk: r[1]||'', nik: r[2]||'', alamat: r[3]||'', istri: '', anak: [] }); added++; } } localStorage.setItem('db_warga', JSON.stringify(db)); loadTabelKKAdmin(); if(typeof syncSemuaData==='function') syncSemuaData(true); Swal.fire('Selesai', `${added} KK terupload.`, 'success'); }; reader.readAsArrayBuffer(file); e.target.value = ''; };
    window.closeModalProfil = function() { document.getElementById('modal-profil').classList.remove('show'); };
    window.loadTabelKKAdmin = function() { 
        let db = JSON.parse(localStorage.getItem('db_warga')) || []; 
        let tb = document.getElementById('body-tabel-kk-admin'); 
        if(!tb) return; tb.innerHTML = ''; 
        if(db.length === 0) { tb.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada KK.</td></tr>`; return; } 
        db.forEach((w, idx) => { 
            let listAnak = w.anak && w.anak.length > 0 ? w.anak.join(', ') : '-'; 
            tb.innerHTML += `<tr>
                <td>${idx+1}</td>
                <td>
                    <div style="min-width: 120px; white-space: normal; word-break: break-word; line-height: 1.4;">
                        <b style="color:var(--primary-dark);">${w.nama}</b> <span title="${w.aktif===false?'Tidak aktif di wilayah':'Aktif di wilayah RT 005'}" style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:999px; font-size:0.7rem; font-weight:700; vertical-align:middle; ${w.aktif===false ? 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;' : 'background:#dcfce7; color:#166534; border:1px solid #86efac;'}"><i class="fa-solid fa-circle" style="font-size:0.55rem;"></i> ${w.aktif===false?'Tidak Aktif':'Aktif'}</span><br><small>NIK: ${w.nik||'-'}</small>
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
            document.getElementById('adm-kk-id').value = w.id; document.getElementById('adm-kk-nama').value = w.nama||''; document.getElementById('adm-kk-nokk').value = w.kk||''; document.getElementById('adm-kk-nik').value = w.nik||''; document.getElementById('adm-kk-pekerjaan').value = w.pekerjaan||''; document.getElementById('adm-kk-telp').value = w.telp||''; document.getElementById('adm-kk-istri').value = w.istri||''; document.getElementById('adm-kk-alamat').value = w.alamat||''; document.getElementById('adm-container-anak').innerHTML = ''; if(document.getElementById('adm-kk-aktif')) document.getElementById('adm-kk-aktif').checked = (w.aktif !== false); 
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
    let db = JSON.parse(localStorage.getItem('db_warga')) || [];
    // Cari data berdasarkan ID
    let warga = db.find(x => String(x.id) === String(id));

    if (warga) {
        let listAnak = Array.isArray(warga.anak) ? warga.anak.join(', ') : '-';
        
        Swal.fire({
            title: 'Detail Keluarga',
            html: `
                <div style="text-align: left; font-size: 0.9rem;">
                    <div style="margin-bottom:12px; padding:10px 14px; border-radius:10px; display:inline-flex; align-items:center; gap:10px; font-weight:700; ${warga.aktif===false ? 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;' : 'background:#dcfce7; color:#166534; border:1px solid #86efac;'}"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; ${warga.aktif===false ? 'background:#dc2626;' : 'background:#16a34a;'}"></span>${warga.aktif===false ? 'TIDAK AKTIF di Wilayah RT 005 (Data tetap tersimpan)' : 'AKTIF tinggal di Wilayah RT 005'}</div><br><p><strong>Kepala Keluarga:</strong> ${warga.nama}</p>
                    <p><strong>No. KK:</strong> ${warga.kk || '-'}</p>
                    <p><strong>NIK:</strong> ${warga.nik || '-'}</p>
                    <p><strong>Pekerjaan:</strong> ${warga.pekerjaan || '-'}</p>
                    <p><strong>Istri:</strong> ${warga.istri || '-'}</p>
                    <p><strong>Anak:</strong> ${listAnak}</p>
                    <p><strong>Alamat:</strong> ${warga.alamat || '-'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: 'var(--primary-blue)'
        });
    } else {
        Swal.fire('Error', 'Data tidak ditemukan', 'error');
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
    window.hapusMutasi = function(id) { let db = JSON.parse(localStorage.getItem('mutasi')) || []; localStorage.setItem('mutasi', JSON.stringify(db.filter(x => x.id !== id))); syncSemuaData(); };

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
    window.hapusBerita = function(id) { let db = JSON.parse(localStorage.getItem('db_berita')) || []; localStorage.setItem('db_berita', JSON.stringify(db.filter(x => x.id !== id))); syncSemuaData(); };
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
    window.hapusSurat = function(id) { let db = JSON.parse(localStorage.getItem('db_req_surat')) || []; localStorage.setItem('db_req_surat', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); };
    

    window.kirimAduanWarga = function(e) { e.preventDefault(); let f = document.getElementById('aduan-bukti').files[0]; if(f) { let r = new FileReader(); r.onload = function(evt) { prosesSimpanAduan(evt.target.result); }; r.readAsDataURL(f); } else { Swal.fire('Gagal', 'Wajib upload foto!', 'warning'); } };
    window.prosesSimpanAduan = function(b64) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let d = new Date(); let tFormat = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`; db.push({ id: Date.now(), tglAsli: tFormat, tglTampil: d.toLocaleDateString('id-ID'), idPelapor: loggedInWarga.id, namaPelapor: loggedInWarga.nama, kategori: document.getElementById('aduan-kategori').value, judul: document.getElementById('aduan-judul').value, isi: document.getElementById('aduan-isi').value, foto: b64, status: 'Menunggu' }); localStorage.setItem('db_aduan', JSON.stringify(db)); document.getElementById('aduan-judul').value=''; document.getElementById('aduan-isi').value=''; if (typeof syncSemuaData === 'function') syncSemuaData(true); Swal.fire('Terkirim!', 'Aduan masuk ke meja RT.', 'success'); };
    window.lihatBuktiAduan = function(id) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let a = db.find(x=>x.id===id); if(a && a.foto) Swal.fire({ imageUrl: a.foto, width: 600 }); };
    window.updateStatusAduan = function(id, val) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let idx = db.findIndex(x=>x.id===id); if(idx!==-1) { db[idx].status=val; localStorage.setItem('db_aduan',JSON.stringify(db)); syncSemuaData(); Toast.fire({icon:'success',title:'Status Update!'}); } };
    window.hapusAduan = function(id) { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; localStorage.setItem('db_aduan', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); };
    window.loadAduanWarga = function() { if(!loggedInWarga) return; let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let my = db.filter(x => String(x.idPelapor)===String(loggedInWarga.id)); let tb = document.getElementById('tbody-aduan-warga'); if(tb) { tb.innerHTML=''; my.forEach(a => { let bd = a.status==='Selesai'?'badge-selesai':'badge-menunggu'; tb.innerHTML+=`<tr><td>${a.tglTampil}</td><td>${a.kategori}</td><td><b>${a.judul}</b></td><td><button class="btn-action bg-blue" onclick="lihatBuktiAduan(${a.id})"><i class="fa-solid fa-image"></i></button></td><td><span class="badge ${bd}">${a.status}</span></td></tr>`; }); } };
    window.loadAduanAdmin = function() { let db = JSON.parse(localStorage.getItem('db_aduan')) || []; let fb = document.getElementById('filter-bulan-aduan').value; let tb = document.getElementById('tbody-aduan-admin'); if(tb) { tb.innerHTML=''; if(fb!=='Semua') db=db.filter(x=>x.tglAsli.split('-')[1]===fb); db.forEach(a => { let s = `<select style="padding:6px;font-size:0.8rem;" onchange="updateStatusAduan(${a.id}, this.value)"><option value="Menunggu" ${a.status==='Menunggu'?'selected':''}>Menunggu</option><option value="Diproses" ${a.status==='Diproses'?'selected':''}>Diproses</option><option value="Selesai" ${a.status==='Selesai'?'selected':''}>Selesai</option></select>`; tb.innerHTML+=`<tr><td><b>${a.tglTampil}</b><br><small>${a.namaPelapor}</small></td><td>${a.kategori}</td><td><b>${a.judul}</b><br><small>${a.isi}</small></td><td><button class="btn-action bg-blue" onclick="lihatBuktiAduan(${a.id})"><i class="fa-solid fa-image"></i></button> <button class="btn-table btn-tbl-del" onclick="hapusAduan(${a.id})"><i class="fa-solid fa-trash"></i></button></td><td>${s}</td></tr>`; }); } };
    window.cetakRekapAduan = function() {
        let db = JSON.parse(localStorage.getItem('db_aduan')) || [];
        let fb = (document.getElementById('filter-bulan-aduan')||{}).value || 'Semua';
        if (fb !== 'Semua') db = db.filter(x => (x.tglAsli||'').split('-')[1] === fb);
        if (!db.length) return Swal.fire('Kosong','Belum ada aduan untuk periode ini.','info');
        let settings = JSON.parse(localStorage.getItem('db_settings')) || { namaRT:'Bapak Kasimin' };
        let tgl = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
        let rows = db.map((a,i) => '<tr><td style="border:1px solid #000; text-align:center;">'+(i+1)+'</td>'+
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
    window.hitungOtomatisIuran = function() {
    let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
    if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
    let tot = ji.reduce(function(s,x){return s+(x.nominal||0);},0);
    let t = document.querySelectorAll('.cb-bulan:checked').length * tot;
    if(document.getElementById('ben-iuran-amt')) document.getElementById('ben-iuran-amt').value = t;
};
    window.simpanIuranKolektif = function(e) {
    if(e && e.preventDefault) e.preventDefault();
    
    // 1. Kunci status login (supaya tidak balik ke login screen)
    localStorage.setItem('isLoggedIn', 'true');

    let idWarga = document.getElementById('ben-warga').value;
    let bulanTerpilih = [];
    document.querySelectorAll('.cb-bulan:checked').forEach(cb => bulanTerpilih.push(cb.value));

    // Validasi input
    if (!idWarga || bulanTerpilih.length === 0) {
        return Swal.fire('Gagal', 'Pilih nama warga dan centang bulannya!', 'error');
    }

    // Ambil database yang ada
    let dbKas = JSON.parse(localStorage.getItem('db_kas')) || [];
    let masterWarga = JSON.parse(localStorage.getItem('db_warga')) || [];
    let warga = masterWarga.find(w => String(w.id) === String(idWarga));
    let namaWarga = warga ? warga.nama : "Warga";

    // 2. PROSES INPUT KE KAS (Breakdown 20rb: 10rb, 5rb, 5rb)
    bulanTerpilih.forEach(bln => {
        let tglSekarang = new Date().toISOString().split('T')[0];
        let randomID = Date.now() + Math.random();
        
        // Catat ke Kas Bendahara (dinamis dari db_jenis_iuran)
        let ji = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if (!ji.length) ji = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        ji.forEach(function(j, idx) {
            dbKas.push({ id: randomID + idx, idWarga: idWarga, tgl: tglSekarang, uraian: `Iuran ${j.nama} (${bln}) - ${namaWarga}`, tipe: 'masuk', nominal: j.nominal });
        });
    });

    // Simpan Kas kembali ke storage
    localStorage.setItem('db_kas', JSON.stringify(dbKas));

    // 3. PROSES UPDATE MATRIKS (PENTING!)
    // Matriks iuran biasanya membaca dari 'db_iuran'
    let dbIuran = JSON.parse(localStorage.getItem('db_iuran')) || [];
    
    bulanTerpilih.forEach(bln => {
        // Cek dulu apakah bulan ini sudah pernah dibayar supaya tidak double di matriks
        let sudahAda = dbIuran.find(x => String(x.idWarga) === String(idWarga) && x.bulan === bln);
        
        if (!sudahAda) {
            dbIuran.push({
                id: Date.now() + Math.random(),
                idWarga: idWarga,
                nama: namaWarga,
                bulan: bln,
                tahun: new Date().getFullYear(),
                nominal: (function(){ let ji = JSON.parse(localStorage.getItem('db_jenis_iuran')||'[]'); return ji.length ? ji.reduce(function(s,x){return s+(x.nominal||0);},0) : 20000; })(),
                tgl: new Date().toISOString().split('T')[0]
            });
        }
    });
    
    // Simpan Matriks kembali ke storage
    localStorage.setItem('db_iuran', JSON.stringify(dbIuran));

    // 4. SELESAI & REFRESH TAMPILAN
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data masuk ke Kas & Matriks Iuran.',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        // Reset centang di form
        document.querySelectorAll('.cb-bulan').forEach(cb => cb.checked = false);
        if(document.getElementById('ben-iuran-amt')) document.getElementById('ben-iuran-amt').value = 0;
        
        // Panggil fungsi refresh yang ada di file kamu
        if (typeof loadKasBendahara === "function") loadKasBendahara();
        if (typeof loadMatriksIuran === "function") loadMatriksIuran(); // Ini yang bikin matriks update
        if (typeof syncSemuaData === "function") syncSemuaData();
    });
};
    window.loadKasBendahara = function() {
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var sAwal = parseInt(localStorage.getItem('db_saldo_awal') || '0') || 0;

        // Simpan ke global untuk filter
        window._kasAllData = dbKas.slice().sort(function(a,b){ return new Date(a.tgl) - new Date(b.tgl); });
        window._kasSaldoAwal = sAwal;

        // Isi saldo awal
        if(document.getElementById('ben-display-saldo-awal'))
            document.getElementById('ben-display-saldo-awal').innerText = fmt(sAwal);
        if(document.getElementById('ben-lap-saldo-awal'))
            document.getElementById('ben-lap-saldo-awal').innerText = fmt(sAwal);

        // Hitung total keseluruhan untuk stat box
        var sAkhir = sAwal;
        var totalMasuk = 0;
        var totalKeluar = 0;
        window._kasAllData.forEach(function(k) {
            var nominal = Number(k.nominal) || 0;
            if(k.tipe === 'masuk') { sAkhir += nominal; totalMasuk += nominal; }
            else { sAkhir -= nominal; totalKeluar += nominal; }
        });

        if(document.getElementById('ben-total-masuk'))
            document.getElementById('ben-total-masuk').innerText = fmt(totalMasuk);
        if(document.getElementById('ben-total-keluar'))
            document.getElementById('ben-total-keluar').innerText = fmt(totalKeluar);
        if(document.getElementById('ben-lap-saldo-akhir'))
            document.getElementById('ben-lap-saldo-akhir').innerText = fmt(sAkhir);
        if(document.getElementById('ben-saldo-kas-input'))
            document.getElementById('ben-saldo-kas-input').innerText = fmt(sAkhir);
        if(document.getElementById('warga-saldo-kas'))
            document.getElementById('warga-saldo-kas').innerText = fmt(sAkhir);

        // Render tabel dengan filter aktif
        window.filterLaporanKas();
    };

    window.filterLaporanKas = function() {
        var tb = document.getElementById('tbody-laporan-kas');
        if (!tb) return;

        var allData = window._kasAllData || [];
        var sAwal   = window._kasSaldoAwal || 0;

        // Ambil nilai filter
        var dari   = (document.getElementById('kas-filter-dari')   || {}).value || '';
        var sampai = (document.getElementById('kas-filter-sampai') || {}).value || '';
        var tipe   = (document.getElementById('kas-filter-tipe')   || {}).value || '';
        var cari   = ((document.getElementById('kas-filter-cari')  || {}).value || '').toLowerCase().trim();

        // Hitung saldo berjalan sampai sebelum filter (agar saldo akurat)
        // saldo berjalan dihitung dari awal berdasarkan urutan tanggal
        var saldoMap = [];
        var sRun = sAwal;
        allData.forEach(function(k) {
            var n = Number(k.nominal) || 0;
            if (k.tipe === 'masuk') sRun += n; else sRun -= n;
            saldoMap.push({ id: k.id, saldo: sRun });
        });

        // Filter data
        var filtered = allData.filter(function(k) {
            if (dari   && k.tgl < dari)   return false;
            if (sampai && k.tgl > sampai) return false;
            if (tipe   && k.tipe !== tipe) return false;
            if (cari) {
                var uraian = (k.uraian || k.keterangan || '').toLowerCase();
                if (uraian.indexOf(cari) === -1) return false;
            }
            return true;
        });

        // Hitung stat filter
        var fMasuk = 0, fKeluar = 0;
        filtered.forEach(function(k) {
            var n = Number(k.nominal) || 0;
            if (k.tipe === 'masuk') fMasuk += n; else fKeluar += n;
        });

        // Update info filter
        var elStat = document.getElementById('kas-filter-stat');
        var elInfo = document.getElementById('kas-filter-info');
        var adaFilter = dari || sampai || tipe || cari;

        if (elInfo) elInfo.innerText = filtered.length + ' transaksi';

        if (elStat) {
            if (adaFilter) {
                elStat.style.display = 'block';
                elStat.innerHTML =
                    '<i class="fa-solid fa-filter"></i> Hasil filter: ' +
                    '<span style="color:#16a34a;margin-left:8px;"><i class="fa-solid fa-circle-arrow-up"></i> Masuk: ' + fmt(fMasuk) + '</span>' +
                    '<span style="color:#dc2626;margin-left:12px;"><i class="fa-solid fa-circle-arrow-down"></i> Keluar: ' + fmt(fKeluar) + '</span>' +
                    '<span style="color:#1e40af;margin-left:12px;"><i class="fa-solid fa-scale-balanced"></i> Selisih: ' + fmt(fMasuk - fKeluar) + '</span>';
            } else {
                elStat.style.display = 'none';
            }
        }

        // Render tabel
        if (filtered.length === 0) {
            tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">' +
                (adaFilter ? '<i class="fa-solid fa-magnifying-glass"></i> Tidak ada transaksi sesuai filter.' : 'Belum ada transaksi kas.') +
                '</td></tr>';
            return;
        }

        var rows = '';
        filtered.forEach(function(k) {
            var nominal = Number(k.nominal) || 0;
            var saldoEntry = saldoMap.find(function(s){ return s.id === k.id; });
            var saldoRun = saldoEntry ? saldoEntry.saldo : 0;
            var warnaTipe = k.tipe === 'masuk'
                ? 'style="color:#166534;font-weight:700;"'
                : 'style="color:#991b1b;font-weight:700;"';
            var ikonTipe = k.tipe === 'masuk'
                ? '<i class="fa-solid fa-circle-arrow-up" style="color:#16a34a;"></i>'
                : '<i class="fa-solid fa-circle-arrow-down" style="color:#dc2626;"></i>';
            rows += '<tr>' +
                '<td>' + (k.tgl || '-') + '</td>' +
                '<td><b>' + (k.uraian || k.keterangan || '-') + '</b></td>' +
                '<td>' + ikonTipe + ' <span ' + warnaTipe + '>' + (k.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</span></td>' +
                '<td>' + fmt(nominal) + ' <small style="color:var(--text-muted);">(Saldo: ' + fmt(saldoRun) + ')</small></td>' +
                '<td><button class="btn-table btn-tbl-del" onclick="hapusKas(' + k.id + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        });
        tb.innerHTML = rows;
    };

    window.resetFilterKas = function() {
        var ids = ['kas-filter-dari','kas-filter-sampai','kas-filter-cari'];
        ids.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });
        var tipe = document.getElementById('kas-filter-tipe');
        if (tipe) tipe.value = '';
        window.filterLaporanKas();
    };
    window.hapusKas = function(id) { let db = JSON.parse(localStorage.getItem('db_kas')) || []; localStorage.setItem('db_kas', JSON.stringify(db.filter(x=>x.id!==id))); syncSemuaData(); };

    
    window.cetakLaporanKas = function() {
        var now = new Date();
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var bulanOpts = BULAN.map(function(b,i){ return '<option value="'+i+'"'+(i===now.getMonth()?' selected':'')+'>'+b+'</option>'; }).join('');
        var thnOpts = '';
        for (var y = now.getFullYear()-2; y <= now.getFullYear()+1; y++) {
            thnOpts += '<option value="'+y+'"'+(y===now.getFullYear()?' selected':'')+'>'+y+'</option>';
        }
        Swal.fire({
            title: '<i class="fa-solid fa-print"></i> Cetak Laporan Kas',
            html: '<div style="text-align:left;font-size:0.9rem;color:#1e293b;">'+
                  '<label style="font-weight:700;display:block;margin-bottom:6px;">Pilih Bulan</label>'+
                  '<select id="swal-bulan" style="width:100%;padding:8px;border-radius:8px;border:1px solid #cbd5e1;margin-bottom:14px;">'+bulanOpts+'</select>'+
                  '<label style="font-weight:700;display:block;margin-bottom:6px;">Pilih Tahun</label>'+
                  '<select id="swal-tahun" style="width:100%;padding:8px;border-radius:8px;border:1px solid #cbd5e1;">'+thnOpts+'</select>'+
                  '</div>',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-file-pdf"></i> Cetak PDF',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#1e40af',
            background: '#fff',
            color: '#1e293b',
        }).then(function(r){
            if (!r.isConfirmed) return;
            var bln = parseInt(document.getElementById('swal-bulan').value);
            var thn = parseInt(document.getElementById('swal-tahun').value);
            window._doCetakKas(bln, thn);
        });
    };

    function buatKop(namaRT, namaRW) {
        return '<div style="display:flex;align-items:center;gap:16px;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:16px;">'
            + '<div style="flex:1;text-align:center;">'
            + '<div style="font-size:13px;font-weight:700;text-transform:uppercase;">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>'
            + '<div style="font-size:11px;">Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>'
            + '</div>'
            + '</div>';
    }
    function buatCSS() {
        return '<style>'
            + 'body{font-family:"Times New Roman",Times,serif;font-size:11pt;color:#000;background:#fff;margin:0;padding:24px 32px;}'
            + 'table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10pt;}'
            + 'th{background:#f0f0f0;color:#000;border:1px solid #000;padding:6px 8px;text-align:left;font-weight:700;}'
            + 'td{border:1px solid #000;padding:5px 8px;color:#000;background:#fff;}'
            + 'tbody tr:nth-child(even) td{background:#fafafa;}'
            + 'tfoot td{background:#f0f0f0;font-weight:700;border:1px solid #000;}'
            + '.judul{text-align:center;font-size:13pt;font-weight:700;text-transform:uppercase;text-decoration:underline;margin:14px 0 4px;}'
            + '.sub{text-align:center;font-size:10pt;margin-bottom:14px;color:#000;}'
            + '.section-title{font-size:11pt;font-weight:700;text-transform:uppercase;margin:20px 0 6px;border-bottom:2px solid #000;padding-bottom:3px;}'
            + '.sum-table{width:60%;margin:10px 0 16px 0;border-collapse:collapse;}'
            + '.sum-table td{border:1px solid #000;padding:5px 10px;font-size:10pt;background:#fff;}'
            + '.sum-table .lbl{width:65%;font-weight:600;}'
            + '.sum-table .val{width:35%;text-align:right;font-weight:700;}'
            + '.sum-table tfoot td{background:#f0f0f0;font-weight:700;}'
            + '.ttd{display:flex;justify-content:space-between;margin-top:48px;}'
            + '.ttd-box{text-align:center;width:220px;font-size:10pt;line-height:2;}'
            + '.ttd-name{font-weight:700;text-decoration:underline;}'
            + '.pagebreak{page-break-after:always;}'
            + '@media print{body{padding:16px 24px;}.pagebreak{page-break-after:always;}}'
            + '</style>';
    }
    window._doCetakKas = function(bln, thn) {
        var BULAN    = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var dbKas    = JSON.parse(localStorage.getItem('db_kas')||'[]');
        var sAwal    = parseInt(localStorage.getItem('db_saldo_awal')||'0')||0;
        var st       = JSON.parse(localStorage.getItem('db_settings')||'{}');
        var namaRT   = st.namaRT  || 'Bapak Kasimin';
        var namaRW   = st.namaRW  || 'Bapak Mulyono';
        var namaBen  = st.namaBen || 'Bapak Parmin';
        var blnStr   = BULAN[bln] + ' ' + thn;
        var tglCetak = new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});

        function fmtRp(n){ return 'Rp '+Number(n||0).toLocaleString('id-ID'); }
        function tglFmt(s){ if(!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}); }
        function isKhusus(u){ var x=(u||'').toLowerCase(); return ['uang meja','uang sosial','iuran sosial','17 agustus','agustusan'].some(function(k){return x.indexOf(k)!==-1;}); }

        var all = dbKas.filter(function(k){
            if(!k.tgl) return false;
            var d = new Date(k.tgl);
            return d.getMonth()===bln && d.getFullYear()===thn;
        });
        all.sort(function(a,b){ return new Date(a.tgl)-new Date(b.tgl); });

        var utama  = all.filter(function(k){ return !isKhusus(k.uraian); });
        var khusus = all.filter(function(k){ return  isKhusus(k.uraian); });

        var totMU = utama.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKU = utama.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);
        var sAkh  = sAwal + totMU - totKU;
        var totMK = khusus.filter(function(k){return k.tipe==='masuk';}).reduce(function(s,k){return s+k.nominal;},0);
        var totKK = khusus.filter(function(k){return k.tipe==='keluar';}).reduce(function(s,k){return s+k.nominal;},0);

        var kop = buatKop(namaRT, namaRW);
        var css = buatCSS();

        var saldoRow = sAwal;
        var rowsUtama = utama.length === 0
            ? '<tr><td colspan="6" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi kas utama</td></tr>'
            : utama.map(function(k,i){
                if(k.tipe==='masuk') saldoRow+=k.nominal; else saldoRow-=k.nominal;
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td>'+
                    '<td style="text-align:right;font-weight:700;">'+fmtRp(saldoRow)+'</td></tr>';
              }).join('');

        var rowsKhusus = khusus.length === 0
            ? '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi dana khusus</td></tr>'
            : khusus.map(function(k,i){
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td></tr>';
              }).join('');

        var rowsLampiran = all.length === 0
            ? '<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Tidak ada transaksi</td></tr>'
            : all.map(function(k,i){
                return '<tr><td style="text-align:center;">'+(i+1)+'</td>'+
                    '<td>'+tglFmt(k.tgl)+'</td>'+
                    '<td>'+(k.uraian||'-')+'</td>'+
                    '<td style="text-align:center;" class="'+k.tipe+'">'+(k.tipe==='masuk'?'Pemasukan':'Pengeluaran')+'</td>'+
                    '<td style="text-align:right;" class="'+k.tipe+'">'+fmtRp(k.nominal)+'</td></tr>';
              }).join('');

        var ttd = '<div class="ttd">'+
            '<div class="ttd-box">Mengetahui,<br>Ketua RT 005<br><br><br><br><b style="text-decoration:underline;">'+namaRT+'</b></div>'+
            '<div class="ttd-box">Semarang, '+tglCetak+'<br>Bendahara RT 005<br><br><br><br><b style="text-decoration:underline;">'+namaBen+'</b></div>'+
            '</div>';

        var img_src = '/Lambang_Kota_Semarang.png';
        // alias variabel agar htmlOut baru bisa pakai nama konsisten
        var fmt        = fmtRp;
        var saldoAwal  = sAwal;
        var totalMasuk = totMU;
        var totalKeluar= totKU;
        var saldoAkhir = sAkh;
        var bulanLabel = blnStr;
        var ttdKiri    = namaRT;
        var ttdKanan   = namaBen;
        var HARI_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        var tglObj          = new Date();
        var hariCetak       = HARI_ID[tglObj.getDay()];
        var tglCetakLengkap = tglObj.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});

        var htmlOut = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@page{size:A4;margin:3cm 3cm 3cm 4cm;}
*,*::before,*::after{box-sizing:border-box;}
body{font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;background:#fff;margin:0;padding:0;}
.kop-table{width:100%;border-collapse:collapse;}
.kop-logo{width:80px;text-align:center;vertical-align:middle;}
.kop-logo img{width:72px;height:auto;}
.kop-text{text-align:center;vertical-align:middle;padding:0 8px;}
.kop-text .b1{font-size:11pt;}
.kop-text .b2{font-size:12pt;font-weight:bold;letter-spacing:.5px;}
.kop-text .b3{font-size:13pt;font-weight:bold;letter-spacing:1px;}
.kop-text .b4{font-size:11pt;font-weight:bold;margin-top:2px;}
.kop-text .al{font-size:9pt;font-style:italic;margin-top:3px;}
hr.garis{border:none;border-top:3px double #000;margin:6px 0 0;}
.judul{text-align:center;font-size:13pt;font-weight:bold;text-decoration:underline;text-transform:uppercase;margin:16px 0 4px;}
.sub{text-align:center;font-size:10pt;margin-bottom:4px;}
.nomor{text-align:center;font-size:10pt;margin-bottom:14px;}
.pembuka{text-align:justify;text-indent:30px;line-height:1.8;margin:14px 0 10px;font-size:10.5pt;}
.tbl-pihak{width:100%;border:none;border-collapse:collapse;margin-left:20px;line-height:1.8;font-size:10.5pt;}
.tbl-pihak td{border:none;padding:1px 4px;vertical-align:top;}
.section-title{font-size:11pt;font-weight:bold;text-transform:uppercase;margin:20px 0 6px;border-bottom:2px solid #000;padding-bottom:3px;}
table.trx{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:10pt;}
table.trx th{background:#f0f0f0;color:#000;border:1px solid #000;padding:6px 8px;text-align:left;font-weight:700;}
table.trx td{border:1px solid #000;padding:5px 8px;color:#000;background:#fff;}
table.trx tbody tr:nth-child(even) td{background:#fafafa;}
table.trx tfoot td{background:#f0f0f0;font-weight:700;border:1px solid #000;}
.masuk{color:#14532d;}.keluar{color:#7f1d1d;}
.sum-table{width:60%;border-collapse:collapse;margin:8px 0 16px;}
.sum-table td{border:1px solid #000;padding:5px 10px;font-size:10pt;}
.sum-table .lbl{font-weight:600;}.sum-table .val{text-align:right;font-weight:700;}
.sum-table tfoot td{background:#f0f0f0;font-weight:700;}
.rekap-table{width:70%;border-collapse:collapse;margin:8px 0 16px;}
.rekap-table td{border:1px solid #000;padding:5px 10px;font-size:10pt;}
.rekap-table .lbl{font-weight:600;}.rekap-table .val{text-align:right;font-weight:700;}
.rekap-table tfoot td{background:#f0f0f0;font-weight:800;font-size:11pt;}
.penutup{text-align:justify;text-indent:30px;line-height:1.8;margin:20px 0 10px;font-size:10.5pt;}
.ttd-table{width:100%;border:none;border-collapse:collapse;margin-top:40px;text-align:center;}
.ttd-table td{border:none;padding:4px 8px;vertical-align:top;font-size:10.5pt;line-height:1.8;}
.ttd-nama{font-weight:bold;text-decoration:underline;margin-top:56px;display:block;}
.pagebreak{page-break-after:always;}
@media print{body{padding-top:15px;}}
</style></head><body>
<!-- KOP -->
<table class="kop-table"><tr>
  <td class="kop-logo"><img src="${img_src}" onerror="this.style.display='none'"></td>
  <td class="kop-text">
    <div class="b1">PEMERINTAH KOTA SEMARANG</div>
    <div class="b2">KECAMATAN CANDISARI</div>
    <div class="b3">KELURAHAN TEGALSARI</div>
    <div class="b4">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</div>
    <div class="al">Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang &mdash; Provinsi Jawa Tengah 50196</div>
  </td>
  <td class="kop-logo"></td>
</tr></table>
<hr class="garis">

<!-- JUDUL -->
<div class="judul">Berita Acara Laporan Kas RT 005</div>
<div class="sub">RT 005 / RW 012 &mdash; Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang</div>
<div class="nomor">Periode: ${blnStr}</div>

<!-- TEKS PEMBUKA -->
<p class="pembuka">Pada hari ini, <strong>${hariCetak}</strong> tanggal <strong>${tglCetakLengkap}</strong>, bertempat di lingkungan RT 005 Kelurahan Tegalsari, Kecamatan Candisari, Kota Semarang, yang bertanda tangan di bawah ini:</p>

<table class="tbl-pihak">
  <tr><td style="width:3%;">1.</td><td style="width:18%;">Nama</td><td style="width:2%;">:</td><td><strong>${namaBen}</strong></td></tr>
  <tr><td></td><td>Jabatan</td><td>:</td><td>Bendahara RT 005</td></tr>
  <tr><td></td><td colspan="3">Selanjutnya disebut sebagai <strong>PIHAK PERTAMA (Pembuat Laporan)</strong>.</td></tr>
  <tr><td colspan="4" style="height:10px;"></td></tr>
  <tr><td>2.</td><td>Nama</td><td>:</td><td><strong>${namaRT}</strong></td></tr>
  <tr><td></td><td>Jabatan</td><td>:</td><td>Ketua RT 005</td></tr>
  <tr><td></td><td colspan="3">Selanjutnya disebut sebagai <strong>PIHAK KEDUA (Pemeriksa / Menyetujui)</strong>.</td></tr>
</table>

<p class="pembuka">Menyatakan dengan sesungguhnya bahwa PIHAK PERTAMA telah menyusun dan menyerahkan Laporan Keuangan (Buku Kas) RT 005 Periode Bulan ${blnStr} kepada PIHAK KEDUA, dengan rincian data keuangan sebagai berikut:</p>

<!-- BAGIAN A: KAS UTAMA -->
<div class="section-title">A. Laporan Kas Utama</div>
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal</td><td class="val">${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan</td><td class="val masuk">${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran</td><td class="val keluar">${fmtRp(totKU)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir</td><td class="val">${fmtRp(sAkh)}</td></tr></tfoot>
</table>
<table class="trx">
  <thead><tr>
    <th style="width:35px;">No</th>
    <th style="width:90px;">Tanggal</th>
    <th>Uraian Transaksi</th>
    <th style="width:110px;text-align:center;">Tipe</th>
    <th style="width:115px;text-align:right;">Nominal</th>
    <th style="width:115px;text-align:right;">Saldo</th>
  </tr></thead>
  <tbody>${rowsUtama}</tbody>
  <tfoot><tr>
    <td colspan="4" style="text-align:right;">SALDO AKHIR KAS UTAMA</td>
    <td colspan="2" style="text-align:right;">${fmtRp(sAkh)}</td>
  </tr></tfoot>
</table>

<!-- BAGIAN B: DANA KHUSUS -->
<div class="section-title">B. Laporan Dana Khusus</div>
<div style="font-size:9.5pt;color:#475569;margin:-4px 0 8px;">(Uang Meja &bull; Uang Sosial &bull; 17 Agustus)</div>
<table class="sum-table">
  <tbody>
    <tr><td class="lbl">Total Pemasukan Dana Khusus</td><td class="val masuk">${fmtRp(totMK)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Dana Khusus</td><td class="val keluar">${fmtRp(totKK)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Dana Khusus</td><td class="val">${fmtRp(totMK-totKK)}</td></tr></tfoot>
</table>
<table class="trx">
  <thead><tr>
    <th style="width:35px;">No</th>
    <th style="width:90px;">Tanggal</th>
    <th>Uraian</th>
    <th style="width:110px;text-align:center;">Tipe</th>
    <th style="width:115px;text-align:right;">Nominal</th>
  </tr></thead>
  <tbody>${rowsKhusus}</tbody>
  <tfoot><tr>
    <td colspan="3" style="text-align:right;">SALDO DANA KHUSUS</td>
    <td colspan="2" style="text-align:right;">${fmtRp(totMK-totKK)}</td>
  </tr></tfoot>
</table>

<!-- REKAPITULASI -->
<div class="section-title">C. Rekapitulasi Keseluruhan</div>
<table class="rekap-table">
  <tbody>
    <tr><td class="lbl">Saldo Awal Periode</td><td class="val">${fmtRp(sAwal)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Kas Utama</td><td class="val masuk">${fmtRp(totMU)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Kas Utama</td><td class="val keluar">${fmtRp(totKU)}</td></tr>
    <tr><td class="lbl">Total Pemasukan Dana Khusus</td><td class="val masuk">${fmtRp(totMK)}</td></tr>
    <tr><td class="lbl">Total Pengeluaran Dana Khusus</td><td class="val keluar">${fmtRp(totKK)}</td></tr>
  </tbody>
  <tfoot><tr><td class="lbl">Saldo Akhir Kas Utama</td><td class="val">${fmtRp(sAkh)}</td></tr></tfoot>
</table>

<!-- TEKS PENUTUP -->
<p class="penutup">Demikian Berita Acara Laporan Kas ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Apabila di kemudian hari terdapat kekeliruan dalam laporan ini, maka akan dilakukan perbaikan sebagaimana mestinya.</p>

<!-- TTD -->
<table class="ttd-table">
  <tr>
    <td style="width:50%;"></td>
    <td style="width:50%;">Semarang, ${tglCetakLengkap}</td>
  </tr>
  <tr>
    <td>Mengetahui / Menyetujui,<br><strong>PIHAK KEDUA</strong><br>Ketua RT 005<span class="ttd-nama">( ${namaRT} )</span></td>
    <td>Dibuat dan Dilaporkan Oleh,<br><strong>PIHAK PERTAMA</strong><br>Bendahara RT 005<span class="ttd-nama">( ${namaBen} )</span></td>
  </tr>
</table>

</body></html>`;

                var bodyOnly = htmlOut;
        window.downloadPdfFromHtml(bodyOnly, 'BA_Kas_' + blnStr.replace(/\s+/g,'_'));
    };


    window.simpanKopTabungan = function(e) { e.preventDefault(); let s=document.getElementById('k_simpan_warga'); if(!s.value) return; let amt = parseInt(document.getElementById('k_simpan_amt').value)||0; if(amt<=0) return Swal.fire('Nominal kosong','Mohon isi nominal tabungan.','warning'); let db=JSON.parse(localStorage.getItem('db_kop_simpan'))||[]; db.push({id:Date.now(), idWarga:s.value, namaWarga:s.options[s.selectedIndex].text, jenis:document.getElementById('k_simpan_jenis').value, nominal:amt, tgl:new Date().toLocaleDateString('id-ID'), tglIso: new Date().toISOString()}); localStorage.setItem('db_kop_simpan',JSON.stringify(db)); localStorage.setItem('ts_kop_simpan', new Date().toISOString()); e.target.reset(); if(typeof jQuery !== 'undefined') $(s).val('').trigger('change'); if(typeof syncSemuaData==='function') syncSemuaData(true); if(typeof loadKoperasiData==='function') loadKoperasiData(); Toast.fire({icon:'success',title:'Catat Tabungan Berhasil'}); };
    window.runRTChecking = function() { let w = document.getElementById('k_pinjam_warga').value; let db = JSON.parse(localStorage.getItem('db_kop_pinjam'))||[]; let a = db.find(x=>String(x.idWarga)===String(w)&&x.status!=='Lunas'); document.getElementById('rt-checking-result').innerHTML = a ? `<span style="color:red">Ditolak: Masih ada hutang Rp ${fmt(a.sisa)}</span>` : `<span style="color:green">Layak Diproses</span>`; document.getElementById('form-pinjaman-container').style.display = a?'none':'block'; };
    window.updatePreviewPinjaman = function() {
        let a = parseInt(document.getElementById('p-amt').value)||0;
        let t = parseInt((document.getElementById('p-tenor')||{}).value) || 3;
        let tot = a + Math.round(a*0.1);
        let ang = t > 0 ? Math.ceil(tot / t) : tot;
        document.getElementById('p-total').value = fmt(tot);
        let elA = document.getElementById('p-angsuran'); if (elA) elA.value = fmt(ang) + ' / periode (x ' + t + ')';
    };
    window.ajukanPinjamanPintar = function(e) {
        e.preventDefault();
        let sel = document.getElementById('k_pinjam_warga');
        let amt = parseInt(document.getElementById('p-amt').value) || 0;
        let tenor = parseInt((document.getElementById('p-tenor')||{}).value) || 3;
        if (amt <= 0) return Swal.fire('Plafon Tidak Valid','Mohon isi nominal pinjaman dengan benar.','warning');
        if (!sel.value) return Swal.fire('Peminjam Kosong','Pilih nama warga calon peminjam.','warning');
        let bunga = Math.round(amt * 0.1);
        let total = amt + bunga;
        let angsuran = Math.ceil(total / tenor);
        let db = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];
        let now = new Date();
        db.push({
            id: Date.now(),
            idWarga: sel.value,
            namaWarga: sel.options[sel.selectedIndex].text,
            plafon: amt,
            bunga: 10,
            bungaNominal: bunga,
            totalKewajiban: total,
            tenor: tenor,
            angsuran: angsuran,
            cicilanKe: 0,
            sisa: total,
            riwayatBayar: [],
            status: 'Aktif',
            tgl: now.toLocaleDateString('id-ID'),
            tglPengajuan: now.toISOString()
        });
        localStorage.setItem('db_kop_pinjam', JSON.stringify(db));
        localStorage.setItem('ts_kop_pinjam', new Date().toISOString());
        e.target.reset();
        if (typeof jQuery !== 'undefined') $(sel).val('').trigger('change');
        document.getElementById('form-pinjaman-container').style.display='none';
        if (typeof syncSemuaData === 'function') syncSemuaData(true);
        if (typeof loadKoperasiData === 'function') loadKoperasiData();
        Swal.fire({
            icon:'success', title:'Pinjaman Disetujui & Cair',
            html: '<div style="text-align:left;">'+
                '<p>Plafon: <b>'+ fmt(amt) +'</b></p>'+
                '<p>Bunga (10%): <b>'+ fmt(bunga) +'</b></p>'+
                '<p>Total Kewajiban: <b>'+ fmt(total) +'</b></p>'+
                '<p>Tenor: <b>'+ tenor +' periode</b></p>'+
                '<p>Angsuran/Periode: <b>'+ fmt(angsuran) +'</b></p>'+
                '</div>'
        });
    };
    window.loadKoperasiData = function() {
        let dbS = JSON.parse(localStorage.getItem('db_kop_simpan')) || [];
        let dbP = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];

        // Tabel Tabungan (admin)
        let ts = document.getElementById('tbody-koperasi-simpanan');
        if (ts) {
            ts.innerHTML = '';
            if (dbS.length === 0) ts.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748b;">Belum ada transaksi tabungan.</td></tr>';
            dbS.slice().sort((a,b)=>(b.id||0)-(a.id||0)).forEach(function(rec){
                ts.innerHTML += '<tr><td>'+ rec.tgl +'</td><td><b>'+ rec.namaWarga +'</b></td><td>'+ rec.jenis +'</td><td>'+ fmt(rec.nominal) +'</td><td><button class="btn-table btn-tbl-del" onclick="hapusKopSimpan('+ rec.id +')"><i class="fa-solid fa-trash"></i></button></td></tr>';
            });
        }

        // Tabel Pinjaman Aktif (admin)
        let tp = document.getElementById('tbody-koperasi-pinjaman');
        if (tp) {
            tp.innerHTML = '';
            let aktif = dbP.filter(function(x){ return x.status !== 'Lunas'; });
            if (aktif.length === 0) tp.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b;">Tidak ada pinjaman aktif.</td></tr>';
            aktif.forEach(function(p){
                let tenor = p.tenor || 3;
                let totK = p.totalKewajiban || ((p.plafon||0) + Math.round((p.plafon||0)*0.1));
                let dibayar = totK - (p.sisa || 0);
                let cicil = (p.cicilanKe || (Array.isArray(p.riwayatBayar)?p.riwayatBayar.length:0));
                tp.innerHTML += '<tr>'+
                    '<td>'+ p.id +'</td>'+
                    '<td><b>'+ p.namaWarga +'</b><br><small style="color:#64748b;">Periode '+ Math.min(cicil, tenor) +'/'+ tenor +'</small></td>'+
                    '<td>'+ fmt(p.plafon||0) +'</td>'+
                    '<td style="text-align:center;">'+ tenor +'x</td>'+
                    '<td style="color:#16a34a;"><b>'+ fmt(dibayar) +'</b></td>'+
                    '<td style="color:#dc2626;"><b>'+ fmt(p.sisa||0) +'</b></td>'+
                    '<td><button class="btn-action bg-green" onclick="bayarCicilan('+ p.id +')"><i class="fa-solid fa-hand-holding-dollar"></i> Bayar</button></td>'+
                '</tr>';
            });
        }

        // Tabel Pinjaman Lunas (admin)
        let tl = document.getElementById('tbody-koperasi-pinjaman-lunas');
        if (tl) {
            tl.innerHTML = '';
            let lunas = dbP.filter(function(x){ return x.status === 'Lunas'; }).sort(function(a,b){ return (new Date(b.tglLunasIso||0)) - (new Date(a.tglLunasIso||0)); });
            if (lunas.length === 0) tl.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b;">Belum ada pinjaman yang lunas.</td></tr>';
            lunas.forEach(function(p){
                let totK = p.totalKewajiban || ((p.plafon||0) + Math.round((p.plafon||0)*0.1));
                tl.innerHTML += '<tr>'+
                    '<td>'+ (p.tglLunas || '-') +'</td>'+
                    '<td><b>'+ p.namaWarga +'</b></td>'+
                    '<td>'+ fmt(p.plafon||0) +'</td>'+
                    '<td><b>'+ fmt(totK) +'</b></td>'+
                    '<td style="text-align:center;">'+ (p.tenor||3) +'x</td>'+
                    '<td><button class="btn-table btn-tbl-view" onclick="lihatRiwayatPinjaman('+ p.id +')" title="Lihat detail riwayat angsuran"><i class="fa-solid fa-eye"></i></button></td>'+
                '</tr>';
            });
        }

        // === Sisi Warga (jika sedang login & melihat tab koperasi-nya) ===
        try {
            let wargaId = localStorage.getItem('loggedInWarga');
            if (wargaId) {
                let myPinj = dbP.filter(function(x){ return String(x.idWarga) === String(wargaId); });
                let myTab = dbS.filter(function(x){ return String(x.idWarga) === String(wargaId); });
                let totalTabungan = myTab.reduce(function(a,r){ return a + (r.nominal||0); }, 0);
                let sisaPinj = myPinj.filter(function(x){ return x.status !== 'Lunas'; }).reduce(function(a,r){ return a + (r.sisa||0); }, 0);
                let shu = Math.round(totalTabungan * 0.05);
                let elT = document.getElementById('w_kop_tabungan'); if (elT) elT.innerText = fmt(totalTabungan);
                let elP = document.getElementById('w_kop_pinjaman'); if (elP) elP.innerText = fmt(sisaPinj);
                let elS = document.getElementById('w_kop_shu');      if (elS) elS.innerText = fmt(shu);

                let tbC = document.getElementById('tbody-w-cicilan');
                if (tbC) {
                    tbC.innerHTML = '';
                    let allCicil = [];
                    myPinj.forEach(function(p){ (p.riwayatBayar||[]).forEach(function(r){ allCicil.push({ pid: p.id, periode: r.periode, tenor: p.tenor||3, tgl: r.tgl, nominal: r.nominal, tglIso: r.tglIso }); }); });
                    allCicil.sort(function(a,b){ return new Date(b.tglIso||0) - new Date(a.tglIso||0); });
                    if (allCicil.length === 0) tbC.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748b;">Belum ada angsuran tercatat.</td></tr>';
                    allCicil.forEach(function(r){
                        tbC.innerHTML += '<tr><td>'+ r.periode +' / '+ r.tenor +'</td><td>'+ r.tgl +'</td><td>#'+ r.pid +'</td><td><b>'+ fmt(r.nominal) +'</b></td></tr>';
                    });
                }

                let tbL = document.getElementById('tbody-w-pinjaman-lunas');
                if (tbL) {
                    tbL.innerHTML = '';
                    let myLunas = myPinj.filter(function(x){ return x.status === 'Lunas'; }).sort(function(a,b){ return new Date(b.tglLunasIso||0) - new Date(a.tglLunasIso||0); });
                    if (myLunas.length === 0) tbL.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748b;">Belum ada pinjaman lunas.</td></tr>';
                    myLunas.forEach(function(p){
                        let totK = p.totalKewajiban || ((p.plafon||0) + Math.round((p.plafon||0)*0.1));
                        tbL.innerHTML += '<tr><td>'+ (p.tglLunas||'-') +'</td><td>#'+ p.id +'</td><td>'+ fmt(p.plafon||0) +'</td><td><b>'+ fmt(totK) +'</b></td><td><span style="background:#dcfce7; color:#166534; padding:3px 10px; border-radius:999px; font-weight:700; font-size:0.8rem;"><i class="fa-solid fa-check-double"></i> LUNAS</span></td></tr>';
                    });
                }
            }
        } catch(e){ console.warn('warga koperasi render error', e); }
    };

    // Lihat riwayat angsuran satu pinjaman (untuk pinjaman lunas)
    window.lihatRiwayatPinjaman = function(id) {
        let dbP = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];
        let p = dbP.find(function(x){ return String(x.id) === String(id); });
        if (!p) return;
        let rb = Array.isArray(p.riwayatBayar) ? p.riwayatBayar : [];
        let totK = p.totalKewajiban || ((p.plafon||0) + Math.round((p.plafon||0)*0.1));
        let html = '<div style="text-align:left;">'+
            '<p><b>Peminjam:</b> '+ p.namaWarga +'</p>'+
            '<p><b>Plafon:</b> '+ fmt(p.plafon||0) +' &nbsp; <b>Total Kewajiban:</b> '+ fmt(totK) +' &nbsp; <b>Tenor:</b> '+ (p.tenor||3) +'x</p>'+
            '<table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-top:8px;">'+
                '<thead><tr style="background:#f1f5f9;"><th style="padding:6px;">Periode</th><th style="padding:6px; text-align:left;">Tanggal</th><th style="padding:6px; text-align:right;">Nominal</th></tr></thead>'+
                '<tbody>'+ (rb.length ? rb.map(function(r){ return '<tr><td style="padding:6px; border-bottom:1px solid #e2e8f0; text-align:center;">'+ r.periode +'</td><td style="padding:6px; border-bottom:1px solid #e2e8f0;">'+ (r.tgl||'-') +'</td><td style="padding:6px; border-bottom:1px solid #e2e8f0; text-align:right;"><b>'+ fmt(r.nominal||0) +'</b></td></tr>'; }).join('') : '<tr><td colspan="3" style="text-align:center; padding:10px; color:#64748b;">Tidak ada riwayat.</td></tr>') +'</tbody>'+
            '</table>'+
            (p.status==='Lunas' ? '<p style="margin-top:10px;"><b>Tanggal Lunas:</b> '+ (p.tglLunas||'-') +'</p>' : '')+
        '</div>';
        Swal.fire({ title:'<i class="fa-solid fa-receipt"></i> Riwayat Angsuran #'+ p.id, html: html, width: 600, confirmButtonText:'Tutup' });
    };
    window.hapusKopSimpan = function(id) { let db = JSON.parse(localStorage.getItem('db_kop_simpan')) || []; localStorage.setItem('db_kop_simpan', JSON.stringify(db.filter(x=>x.id!==id))); localStorage.setItem('ts_kop_simpan', new Date().toISOString()); if(typeof syncSemuaData==='function') syncSemuaData(true); if(typeof loadKoperasiData==='function') loadKoperasiData(); };
    window.bayarCicilan = function(id) {
        let dbP = JSON.parse(localStorage.getItem('db_kop_pinjam')) || [];
        let idx = dbP.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return Swal.fire('Error','Pinjaman tidak ditemukan.','error');
        let p = dbP[idx];
        // Migrasi data lama yang belum punya schema baru
        if (typeof p.tenor !== 'number' || p.tenor <= 0) p.tenor = 3;
        if (typeof p.totalKewajiban !== 'number') p.totalKewajiban = (p.plafon || 0) + Math.round((p.plafon||0)*0.1);
        if (typeof p.angsuran !== 'number') p.angsuran = Math.ceil(p.totalKewajiban / p.tenor);
        if (!Array.isArray(p.riwayatBayar)) p.riwayatBayar = [];
        if (typeof p.cicilanKe !== 'number') p.cicilanKe = p.riwayatBayar.length;
        if (typeof p.sisa !== 'number') p.sisa = p.totalKewajiban - p.riwayatBayar.reduce((a,r)=>a+(r.nominal||0),0);

        let periodeBerikut = Math.min(p.cicilanKe + 1, p.tenor);
        let angsuranWajib = Math.min(p.angsuran, p.sisa);

        let riwayatHtml = p.riwayatBayar.length ? p.riwayatBayar.map(function(r){
            return '<tr><td style="padding:4px 8px; border-bottom:1px solid #e2e8f0; text-align:center;">'+ r.periode +'</td>'+
                   '<td style="padding:4px 8px; border-bottom:1px solid #e2e8f0;">'+ (r.tgl||'-') +'</td>'+
                   '<td style="padding:4px 8px; border-bottom:1px solid #e2e8f0; text-align:right;"><b>'+ fmt(r.nominal||0) +'</b></td></tr>';
        }).join('') : '<tr><td colspan="3" style="padding:10px; text-align:center; color:#64748b;"><i>Belum ada angsuran tercatat.</i></td></tr>';

        let body = '<div style="text-align:left; font-size:0.92rem;">'+
            '<div style="background:#f8fafc; padding:12px 14px; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:12px;">'+
                '<div><b>Peminjam:</b> '+ p.namaWarga +'</div>'+
                '<div><b>Plafon:</b> '+ fmt(p.plafon||0) +' &nbsp;<b>Total Kewajiban:</b> '+ fmt(p.totalKewajiban) +'</div>'+
                '<div><b>Tenor:</b> '+ p.tenor +' periode &nbsp;<b>Angsuran/periode:</b> '+ fmt(p.angsuran) +'</div>'+
                '<div style="margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1;"><b>Sisa Hutang:</b> <span style="color:#dc2626; font-weight:800;">'+ fmt(p.sisa) +'</span></div>'+
                '<div><b>Status:</b> Akan dibayar <b>periode ke-'+ periodeBerikut +' dari '+ p.tenor +'</b></div>'+
            '</div>'+
            '<div style="margin-bottom:8px;"><b>Riwayat Angsuran</b></div>'+
            '<div style="max-height:160px; overflow:auto; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:12px;">'+
                '<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">'+
                '<thead><tr style="background:#f1f5f9;"><th style="padding:6px;">Periode</th><th style="padding:6px; text-align:left;">Tanggal</th><th style="padding:6px; text-align:right;">Nominal</th></tr></thead>'+
                '<tbody>'+ riwayatHtml +'</tbody></table>'+
            '</div>'+
            '<label style="display:block; font-weight:700; margin-bottom:6px;">Nominal Bayar (Rp)</label>'+
            '<input id="bayar-amt-input" type="number" min="1" max="'+ p.sisa +'" value="'+ angsuranWajib +'" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">'+
            '<small style="color:#64748b;">Default = angsuran wajib periode ini ('+ fmt(angsuranWajib) +'). Boleh dilebihkan.</small>'+
        '</div>';

        Swal.fire({
            title: '<i class="fa-solid fa-hand-holding-dollar"></i> Bayar Angsuran',
            html: body, width: 560, focusConfirm: false,
            showCancelButton: true, cancelButtonText: 'Batal',
            confirmButtonText: '<i class="fa-solid fa-check"></i> Bayar Sekarang',
            confirmButtonColor: '#16a34a',
            preConfirm: function(){
                let v = parseInt(document.getElementById('bayar-amt-input').value)||0;
                if (v <= 0) { Swal.showValidationMessage('Nominal harus lebih dari 0'); return false; }
                if (v > p.sisa) { Swal.showValidationMessage('Maksimum '+ fmt(p.sisa)); return false; }
                return v;
            }
        }).then(function(res){
            if (!res.isConfirmed) return;
            let bayar = res.value;
            let now = new Date();
            p.cicilanKe = (p.cicilanKe || 0) + 1;
            p.riwayatBayar.push({ periode: p.cicilanKe, tgl: now.toLocaleDateString('id-ID'), tglIso: now.toISOString(), nominal: bayar });
            p.sisa = Math.max(0, p.sisa - bayar);
            if (p.sisa <= 0) {
                p.status = 'Lunas';
                p.tglLunas = now.toLocaleDateString('id-ID');
                p.tglLunasIso = now.toISOString();
            }
            dbP[idx] = p;
            localStorage.setItem('db_kop_pinjam', JSON.stringify(dbP));
            localStorage.setItem('ts_kop_pinjam', new Date().toISOString());
            if (typeof syncSemuaData === 'function') syncSemuaData(true);
            if (typeof loadKoperasiData === 'function') loadKoperasiData();
            if (p.status === 'Lunas') {
                Swal.fire({ icon:'success', title:'Pinjaman LUNAS', html:'<b>'+ p.namaWarga +'</b> telah melunasi pinjaman.<br>Total dibayar: <b>'+ fmt(p.totalKewajiban) +'</b><br>Pinjaman dipindahkan ke <b>Daftar Lunas</b>.' });
            } else {
                Toast.fire({ icon:'success', title:'Bayar '+ fmt(bayar) +' tersimpan (sisa '+ fmt(p.sisa) +')' });
            }
        });
    };
    // === 1. MESIN MATRIKS & TOTAL KARTU BENDAHARA (DENGAN RINCIAN) ===
    // === MESIN HIDE & SEEK DAFTAR PENAGIHAN ===

 // === MESIN ANALISA & PENAGIHAN (VERSI BARU) ===

    function getJenisIuranMap() {
        var def = [{nama:'Pembangunan',nominal:10000},{nama:'Uang Meja',nominal:5000},{nama:'17 Agustus',nominal:5000},{nama:'Sosial',nominal:5000}];
        var ji = JSON.parse(localStorage.getItem('db_jenis_iuran')||'null');
        return (ji && ji.length) ? ji : def;
    }

    function getSaldoKas() {
        var db = JSON.parse(localStorage.getItem('db_kas')||'[]');
        var sAwal = parseInt(localStorage.getItem('db_saldo_awal')||'0')||0;
        var m = db.filter(function(x){return x.tipe==='masuk';}).reduce(function(s,x){return s+x.nominal;},0);
        var k = db.filter(function(x){return x.tipe==='keluar';}).reduce(function(s,x){return s+x.nominal;},0);
        return sAwal+m-k;
    }

    function mkBadge(teks,warna,ikon) {
        return '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;background:'+warna+'20;color:'+warna+';border:1px solid '+warna+'40;"><i class="fa-solid fa-'+ikon+'"></i>'+teks+'</span>';
    }

    window.loadAnalisaUangMeja = function() {
        var settings    = JSON.parse(localStorage.getItem('db_settings')||'{}');
        var dbIuran     = JSON.parse(localStorage.getItem('db_iuran')||'[]');
        var dbWarga     = JSON.parse(localStorage.getItem('db_warga')||'[]');
        var dbPertemuan = JSON.parse(localStorage.getItem('db_pertemuan')||'[]');
        var ji          = getJenisIuranMap();
        var now         = new Date();
        var bulanNama   = new Intl.DateTimeFormat('id-ID',{month:'long'}).format(now);
        var tahunSkg    = now.getFullYear();
        var periode     = bulanNama+' '+tahunSkg;
        var el = document.getElementById('bulan-tagihan-info');
        if(el) el.innerHTML = '<i class="fa-solid fa-calendar-days"></i> '+periode;
        var iuranBln = dbIuran.filter(function(x){
            return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase() && String(x.tahun||tahunSkg)===String(tahunSkg);
        });
        var sudahMap = {};
        iuranBln.forEach(function(x){ sudahMap[x.idWarga]=x; });
        var jmlBayar   = Object.keys(sudahMap).length;
        var wargaAktif = dbWarga.filter(function(w){return w.status!=='nonaktif';});
        var jmlWarga   = wargaAktif.length;
        var nomMeja=0,nomBangun=0,nomAgustus=0,nomSosial=0;
        ji.forEach(function(j){
            var n=j.nama.toLowerCase();
            if(n.includes('meja'))         nomMeja=j.nominal;
            else if(n.includes('bangun'))  nomBangun=j.nominal;
            else if(n.includes('agustus')) nomAgustus=j.nominal;
            else if(n.includes('sosial'))  nomSosial=j.nominal;
        });
        var targetMeja      = settings.targetUangMeja||250000;
        var mejaTerkumpul   = jmlBayar*nomMeja;
        var mejaKurang      = Math.max(0,targetMeja-mejaTerkumpul);
        var bangunTerkumpul = jmlBayar*nomBangun;
        var sosialTerkumpul = jmlBayar*nomSosial;
        var agusTerkumpul   = jmlBayar*nomAgustus;
        var agusKumulatif   = dbPertemuan.reduce(function(s,p){return s+(p.agustusTerkumpul||0);},0)+agusTerkumpul;
        var tKey     = 'talangan_meja_'+periode.replace(/ /g,'_');
        var talangan = JSON.parse(localStorage.getItem(tKey)||'null');
        window.currentDefisitMeja = mejaKurang;
        window.currentPeriodeKey  = periode;
        window.currentTalaganKey  = tKey;
        var belumBayar = wargaAktif.filter(function(w){return !sudahMap[w.id];});
        var btnNalangi = document.getElementById('btn-nalangi');
        if(btnNalangi) btnNalangi.style.display='none';

        var sisaTalangan = talangan ? (talangan.nominal-(talangan.dikembalikan||0)) : 0;
        var saldoKas     = getSaldoKas();

        // ── KARTU MEJA ──
        var btnMeja = '';
        if(!talangan && mejaKurang>0) {
            btnMeja = '<button onclick="eksekusiDanaTalangan()" style="width:100%;margin-top:12px;padding:11px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fa-solid fa-shield-heart"></i> Talangi '+fmt(mejaKurang)+'</button>';
        } else if(talangan && sisaTalangan>0) {
            btnMeja = '<button onclick="catatPengembalianTalangan()" style="width:100%;margin-top:12px;padding:11px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fa-solid fa-rotate-left"></i> Catat Pengembalian (Sisa '+fmt(sisaTalangan)+')</button>';
        } else if(talangan && sisaTalangan<=0) {
            btnMeja = '<div style="margin-top:12px;padding:10px;border-radius:10px;background:#dcfce7;color:#166534;font-weight:700;font-size:0.85rem;text-align:center;"><i class="fa-solid fa-circle-check"></i> Talangan Lunas</div>';
        }

        // ── KARTU PEMBANGUNAN ──
        var stSetor = JSON.parse(localStorage.getItem('setor_bangun_'+periode.replace(/ /g,'_'))||'null');
        var btnBangun = !stSetor
            ? '<button onclick="setorPembangunanKeKas()" style="width:100%;margin-top:12px;padding:11px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fa-solid fa-arrow-right-to-bracket"></i> Setor ke Kas ('+fmt(bangunTerkumpul)+')</button>'
            : '<div style="margin-top:12px;padding:10px;border-radius:10px;background:#dbeafe;color:#1d4ed8;font-weight:700;font-size:0.85rem;text-align:center;"><i class="fa-solid fa-circle-check"></i> Sudah Disetor '+new Date(stSetor.tgl).toLocaleDateString('id-ID')+'</div>';

        // ── KARTU SOSIAL ──
        var stSosial = JSON.parse(localStorage.getItem('setor_sosial_'+periode.replace(/ /g,'_'))||'null');
        var btnSosial = !stSosial
            ? '<button onclick="catatSosialBA()" style="width:100%;margin-top:12px;padding:11px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fa-solid fa-book-open"></i> Catat ke BA Arisan</button>'
            : '<div style="margin-top:12px;padding:10px;border-radius:10px;background:#ede9fe;color:#6d28d9;font-weight:700;font-size:0.85rem;text-align:center;"><i class="fa-solid fa-circle-check"></i> Sudah Dicatat BA</div>';

        // ── KARTU 17 AGUSTUS ──
        var btnAgustus = '<div style="margin-top:12px;padding:10px;border-radius:10px;background:var(--bg-light,#f8fafc);border:1px solid var(--border-color,#e2e8f0);font-size:0.82rem;color:var(--text-muted);text-align:center;"><i class="fa-solid fa-piggy-bank" style="color:#f59e0b;"></i> Dipegang Bendahara Pembantu</div>';

        // ── RENDER UTAMA ──
        var wrap = document.getElementById('analisa-wrap');
        if(!wrap) return;

        wrap.innerHTML =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:24px;">'

        // Kartu Meja
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);border-top:4px solid #f59e0b;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
        +'<span style="font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);"><i class="fa-solid fa-mug-hot" style="color:#f59e0b;margin-right:6px;"></i>Uang Meja</span>'
        +(mejaKurang>0 ? mkBadge('Kurang','#ef4444','triangle-exclamation') : mkBadge('Cukup','#10b981','circle-check'))
        +'</div>'
        +'<div style="display:flex;flex-direction:column;gap:8px;">'
        +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fef9c3;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#78350f;">TARGET TUAN RUMAH</span><span style="font-weight:900;color:#78350f;">'+fmt(targetMeja)+'</span></div>'
        +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#f0fdf4;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#166534;">TERKUMPUL ('+jmlBayar+' warga)</span><span style="font-weight:900;color:#166534;">'+fmt(mejaTerkumpul)+'</span></div>'
        +(mejaKurang>0 ? '<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fef2f2;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#991b1b;">KEKURANGAN</span><span style="font-weight:900;color:#b91c1c;">'+fmt(mejaKurang)+'</span></div>' : '')
        +(talangan ? '<div style="padding:8px 12px;background:#fef2f2;border-radius:10px;font-size:0.78rem;color:#991b1b;"><i class="fa-solid fa-info-circle"></i> Ditalangi '+fmt(talangan.nominal)+' | Kembali '+fmt(talangan.dikembalikan||0)+'</div>' : '')
        +'</div>'
        +btnMeja
        +'</div>'

        // Kartu Pembangunan
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);border-top:4px solid #3b82f6;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
        +'<span style="font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);"><i class="fa-solid fa-person-digging" style="color:#3b82f6;margin-right:6px;"></i>Pembangunan</span>'
        +(stSetor ? mkBadge('Disetor','#3b82f6','circle-check') : mkBadge('Belum Setor','#94a3b8','clock'))
        +'</div>'
        +'<div style="display:flex;flex-direction:column;gap:8px;">'
        +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#f0f9ff;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#1d4ed8;">TERKUMPUL ('+jmlBayar+' warga)</span><span style="font-weight:900;color:#1d4ed8;">'+fmt(bangunTerkumpul)+'</span></div>'
        +'<div style="padding:8px 12px;background:var(--bg-light,#f8fafc);border-radius:10px;font-size:0.78rem;color:var(--text-muted);"><i class="fa-solid fa-circle-info" style="color:#3b82f6;"></i> Disetor ke Bendahara → Masuk Kas Utama</div>'
        +'</div>'
        +btnBangun
        +'</div>'

        // Kartu Sosial
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);border-top:4px solid #8b5cf6;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
        +'<span style="font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);"><i class="fa-solid fa-handshake" style="color:#8b5cf6;margin-right:6px;"></i>Sosial</span>'
        +(stSosial ? mkBadge('Dicatat BA','#8b5cf6','circle-check') : mkBadge('Belum Dicatat','#94a3b8','clock'))
        +'</div>'
        +'<div style="display:flex;flex-direction:column;gap:8px;">'
        +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#f5f3ff;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#6d28d9;">TERKUMPUL ('+jmlBayar+' warga)</span><span style="font-weight:900;color:#6d28d9;">'+fmt(sosialTerkumpul)+'</span></div>'
        +'<div style="padding:8px 12px;background:var(--bg-light,#f8fafc);border-radius:10px;font-size:0.78rem;color:var(--text-muted);"><i class="fa-solid fa-circle-info" style="color:#8b5cf6;"></i> Tidak masuk Kas Utama → Langsung ke Arisan Ibu-Ibu</div>'
        +'</div>'
        +btnSosial
        +'</div>'

        // Kartu 17 Agustus
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);border-top:4px solid #f97316;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
        +'<span style="font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);"><i class="fa-solid fa-flag" style="color:#f97316;margin-right:6px;"></i>17 Agustus</span>'
        +mkBadge('Ben. Pembantu','#f97316','user-shield')
        +'</div>'
        +'<div style="display:flex;flex-direction:column;gap:8px;">'
        +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fff7ed;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#c2410c;">BULAN INI</span><span style="font-weight:900;color:#c2410c;">'+fmt(agusTerkumpul)+'</span></div>'
        +'<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fef3c7;border-radius:10px;"><span style="font-size:0.8rem;font-weight:700;color:#92400e;">SALDO KUMULATIF</span><span style="font-weight:900;color:#92400e;">'+fmt(agusKumulatif)+'</span></div>'
        +'<div style="padding:8px 12px;background:var(--bg-light,#f8fafc);border-radius:10px;font-size:0.78rem;color:var(--text-muted);"><i class="fa-solid fa-circle-info" style="color:#f97316;"></i> Dipegang Bendahara Pembantu — tidak masuk Kas Utama</div>'
        +'</div>'
        +btnAgustus
        +'</div>'

        +'</div>'

        // ── SECTION BELUM BAYAR ──
        +'<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;border:1px solid var(--border-color,#e2e8f0);margin-bottom:16px;">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">'
        +'<span style="font-weight:800;font-size:1rem;color:var(--text-dark,#1e293b);"><i class="fa-solid fa-users-viewfinder" style="color:#ef4444;margin-right:6px;"></i>Belum Bayar Bulan Ini</span>'
        +'<span style="background:#fef2f2;color:#991b1b;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;border:1px solid #fecaca;">'+belumBayar.length+' warga</span>'
        +'</div>'
        +(belumBayar.length===0
            ? '<div style="text-align:center;padding:24px;color:#10b981;font-weight:700;"><i class="fa-solid fa-circle-check" style="font-size:2rem;margin-bottom:8px;display:block;"></i>Semua warga sudah membayar!</div>'
            : '<div style="display:flex;flex-direction:column;gap:8px;" id="list-belum-bayar">'
              + belumBayar.map(function(w){
                  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-light,#f8fafc);border-radius:10px;border:1px solid var(--border-color,#e2e8f0);">'
                    +'<span style="font-weight:600;color:var(--text-dark,#1e293b);font-size:0.9rem;"><i class="fa-solid fa-user" style="color:#94a3b8;margin-right:6px;"></i>'+esc(w.nama)+'</span>'
                    +'<button onclick="bayarCepatTagihan('+w.id+',\''+w.nama.replace(/'/g,"\\'")+'\')" '
                    +'style="padding:6px 14px;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;font-size:0.8rem;">'
                    +'<i class="fa-solid fa-bolt"></i> Bayar Cepat</button>'
                    +'</div>';
              }).join('')
              +'</div>'
        )
        +'</div>';
    };

    window.eksekusiDanaTalangan = function() {
        var kurang  = window.currentDefisitMeja||0;
        var periode = window.currentPeriodeKey||'';
        var tKey    = window.currentTalaganKey||'';
        if(!kurang||!periode) return Swal.fire('Info','Tidak ada kekurangan.','info');
        if(localStorage.getItem(tKey)) return Swal.fire('Info','Talangan bulan ini sudah pernah dilakukan.','info');
        var saldo = getSaldoKas();
        if(saldo<kurang) return Swal.fire('Gagal','Saldo kas tidak cukup ('+fmt(saldo)+')','error');
        Swal.fire({
            title:'Talangi Uang Meja?',
            html:'Kas Utama akan dipotong <b>'+fmt(kurang)+'</b><br>untuk mencukupi target tuan rumah <b>'+fmt((JSON.parse(localStorage.getItem('db_settings')||'{}').targetUangMeja||250000))+'</b>',
            icon:'warning',showCancelButton:true,
            confirmButtonColor:'#ef4444',confirmButtonText:'Ya, Talangi!'
        }).then(function(r){
            if(!r.isConfirmed) return;
            var tgl = new Date().toISOString().split('T')[0];
            var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
            var kasId = Date.now();
            dbKas.push({id:kasId,tgl:tgl,uraian:'Dana Talangan Uang Meja ('+periode+')',tipe:'keluar',nominal:kurang});
            localStorage.setItem('db_kas',JSON.stringify(dbKas));
            localStorage.setItem(tKey,JSON.stringify({nominal:kurang,kasId:kasId,tgl:tgl,dikembalikan:0}));
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire('Berhasil','Dana talangan '+fmt(kurang)+' tercatat di Kas.','success').then(function(){ loadAnalisaUangMeja(); });
        });
    };

    window.catatPengembalianTalangan = function() {
        var tKey    = window.currentTalaganKey||'';
        var periode = window.currentPeriodeKey||'';
        var talangan = JSON.parse(localStorage.getItem(tKey)||'null');
        if(!talangan) return Swal.fire('Info','Tidak ada talangan aktif.','info');
        var sisa = talangan.nominal-(talangan.dikembalikan||0);
        if(sisa<=0) return Swal.fire('Info','Talangan sudah lunas.','info');
        Swal.fire({
            title:'Catat Pengembalian Talangan',
            html:'Sisa talangan: <b>'+fmt(sisa)+'</b><br>Masukkan nominal yang dikembalikan:',
            input:'number',inputValue:sisa,inputAttributes:{min:1,max:sisa},
            showCancelButton:true,confirmButtonColor:'#10b981',confirmButtonText:'Simpan'
        }).then(function(r){
            if(!r.isConfirmed||!r.value) return;
            var nominal = Math.min(parseInt(r.value)||0, sisa);
            if(nominal<=0) return;
            var tgl = new Date().toISOString().split('T')[0];
            var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
            dbKas.push({id:Date.now(),tgl:tgl,uraian:'Pengembalian Talangan Uang Meja ('+periode+')',tipe:'masuk',nominal:nominal});
            localStorage.setItem('db_kas',JSON.stringify(dbKas));
            talangan.dikembalikan = (talangan.dikembalikan||0)+nominal;
            localStorage.setItem(tKey,JSON.stringify(talangan));
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire('Berhasil','Pengembalian '+fmt(nominal)+' tercatat.','success').then(function(){ loadAnalisaUangMeja(); });
        });
    };

    window.setorPembangunanKeKas = function() {
        var periode = window.currentPeriodeKey||'';
        var sKey    = 'setor_bangun_'+periode.replace(/ /g,'_');
        if(localStorage.getItem(sKey)) return Swal.fire('Info','Sudah disetor bulan ini.','info');
        var settings    = JSON.parse(localStorage.getItem('db_settings')||'{}');
        var dbIuran     = JSON.parse(localStorage.getItem('db_iuran')||'[]');
        var dbWarga     = JSON.parse(localStorage.getItem('db_warga')||'[]');
        var ji          = getJenisIuranMap();
        var now         = new Date();
        var bulanNama   = new Intl.DateTimeFormat('id-ID',{month:'long'}).format(now);
        var tahunSkg    = now.getFullYear();
        var iuranBln    = dbIuran.filter(function(x){ return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()&&String(x.tahun||tahunSkg)===String(tahunSkg); });
        var sudahMap    = {}; iuranBln.forEach(function(x){ sudahMap[x.idWarga]=x; });
        var jmlBayar    = Object.keys(sudahMap).length;
        var nomBangun   = 0; ji.forEach(function(j){ if(j.nama.toLowerCase().includes('bangun')) nomBangun=j.nominal; });
        var total       = jmlBayar*nomBangun;
        if(!total) return Swal.fire('Info','Belum ada data iuran bulan ini.','info');
        Swal.fire({
            title:'Setor Pembangunan ke Kas?',
            html:'Total <b>'+fmt(total)+'</b> dari <b>'+jmlBayar+' warga</b> akan masuk Kas Utama.',
            icon:'question',showCancelButton:true,
            confirmButtonColor:'#3b82f6',confirmButtonText:'Ya, Setor!'
        }).then(function(r){
            if(!r.isConfirmed) return;
            var tgl = new Date().toISOString().split('T')[0];
            var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
            dbKas.push({id:Date.now(),tgl:tgl,uraian:'Setoran Iuran Pembangunan ('+periode+')',tipe:'masuk',nominal:total});
            localStorage.setItem('db_kas',JSON.stringify(dbKas));
            localStorage.setItem(sKey,JSON.stringify({tgl:tgl,nominal:total}));
            if(typeof syncSemuaData==='function') syncSemuaData(true);
            Swal.fire('Berhasil','Setoran '+fmt(total)+' masuk Kas Utama.','success').then(function(){ loadAnalisaUangMeja(); });
        });
    };

    window.catatSosialBA = function() {
        var periode = window.currentPeriodeKey||'';
        var sKey    = 'setor_sosial_'+periode.replace(/ /g,'_');
        if(localStorage.getItem(sKey)) return Swal.fire('Info','Sudah dicatat BA bulan ini.','info');
        var dbIuran  = JSON.parse(localStorage.getItem('db_iuran')||'[]');
        var dbWarga  = JSON.parse(localStorage.getItem('db_warga')||'[]');
        var ji       = getJenisIuranMap();
        var now      = new Date();
        var bulanNama= new Intl.DateTimeFormat('id-ID',{month:'long'}).format(now);
        var tahunSkg = now.getFullYear();
        var iuranBln = dbIuran.filter(function(x){ return (x.bulan||'').toLowerCase()===bulanNama.toLowerCase()&&String(x.idWarga); });
        var totalSosial = iuranBln.reduce(function(s,x){ var ji2=getJenisIuranMap(); return s+(ji2.sosial||0); },0);
        var sKey2 = 'setor_sosial_'+periode.replace(/ /g,'_');
        localStorage.setItem(sKey2, JSON.stringify({tgl:new Date().toISOString(),nominal:totalSosial}));
        var dbKas = JSON.parse(localStorage.getItem('db_kas')||'[]');
        dbKas.push({id:Date.now(),tgl:new Date().toISOString().split('T')[0],uraian:'Dana Sosial Arisan '+bulanNama+' '+tahunSkg,tipe:'masuk',nominal:totalSosial});
        localStorage.setItem('db_kas',JSON.stringify(dbKas));
        localStorage.setItem('ts_kas',new Date().toISOString());
        if(typeof syncSemuaData==='function') syncSemuaData(true);
        Toast.fire({icon:'success',title:'Dana Sosial dicatat ke BA & Kas'});
        if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja();
    };
        window.togglePenagihanList = function() {
        let el = document.getElementById('container-penagihan-list');
        let icon = document.getElementById('icon-toggle-penagihan');
        if(el.style.display === 'none') {
            el.style.display = 'block';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            el.style.display = 'none';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    };

    // Fungsi Tombol Setor Tunai (Opsi 4 Pilihan)
    window.promptSetorIuran = function() {
        let bulanSkg = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        let st = JSON.parse(localStorage.getItem('status_setor_' + bulanSkg)) || { meja:0, bangun:0, agustus:0 };
        
        Swal.fire({
            title: 'Setorkan Uang Tunai',
            html: `
                <div style="background:#fee2e2; border:1px solid #ef4444; color:#991b1b; padding:15px; border-radius:10px; margin-bottom:20px; font-size:0.95rem; font-weight:bold; text-align:left;">
                    <i class="fa-solid fa-triangle-exclamation"></i> PERHATIAN: Mohon dicek kembali jumlah uang fisik yang disetorkan agar sudah sesuai dengan yang ada di sistem!
                </div>
                <div style="text-align:left; font-size:1.05rem; display:flex; flex-direction:column; gap:12px;">
                    <label style="cursor:pointer;"><input type="radio" name="opt_setor" value="meja" ${st.meja>=1?'disabled':''}> Setor Pos Uang Meja ${st.meja>=1?'(Sudah)':''}</label>
                    <label style="cursor:pointer;"><input type="radio" name="opt_setor" value="bangun" ${st.bangun>=1?'disabled':''}> Setor Pos Pembangunan ${st.bangun>=1?'(Sudah)':''}</label>
                    <label style="cursor:pointer;"><input type="radio" name="opt_setor" value="agustus" ${st.agustus>=1?'disabled':''}> Setor Pos 17 Agustus ${st.agustus>=1?'(Sudah)':''}</label>
                    <hr style="border-top:1px dashed #cbd5e1;">
                    <label style="cursor:pointer; font-weight:bold; color:var(--primary-dark);"><input type="radio" name="opt_setor" value="semua" checked> Setorkan SEMUA Pos Sekaligus</label>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-handshake"></i> Eksekusi Setoran',
            confirmButtonColor: '#0ea5e9'
        }).then((res) => {
            if(res.isConfirmed) {
                let pilihan = document.querySelector('input[name="opt_setor"]:checked');
                if(!pilihan) return;
                let val = pilihan.value;
                if(val === 'semua') {
                    if(st.meja === 0) st.meja = 1;
                    if(st.bangun === 0) st.bangun = 1;
                    if(st.agustus === 0) st.agustus = 1;
                } else {
                    st[val] = 1;
                }
                localStorage.setItem('status_setor_' + bulanSkg, JSON.stringify(st));
                if(typeof syncSemuaData==='function') syncSemuaData(true);
                loadAnalisaUangMeja();
                Swal.fire('Setoran Diproses', 'Menunggu Bendahara menekan tombol Validasi Terima.', 'success');
            }
        });
    };

    // Fungsi Validasi Terima oleh Bendahara
    window.validasiTerimaSetoran = function() {
        let bulanSkg = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        let st = JSON.parse(localStorage.getItem('status_setor_' + bulanSkg)) || { meja:0, bangun:0, agustus:0 };
        
        // Cek apakah ada yang statusnya 1 (sedang diproses)
        if(st.meja !== 1 && st.bangun !== 1 && st.agustus !== 1) {
            return Swal.fire('Info', 'Tidak ada setoran tertunda yang perlu divalidasi saat ini.', 'info');
        }

        Swal.fire({
            title: 'Validasi Terima Uang',
            html: `
                <div style="background:#fef3c7; border:1px solid #f59e0b; color:#b45309; padding:15px; border-radius:10px; margin-bottom:20px; font-size:0.95rem; font-weight:bold; text-align:left;">
                    <i class="fa-solid fa-triangle-exclamation"></i> PERHATIAN: Pastikan Anda (Bendahara) telah menghitung ulang uang fisik dan jumlahnya sudah sesuai dengan laporan sistem sebelum klik Validasi.
                </div>
                <div style="text-align:left; font-size:1.05rem; display:flex; flex-direction:column; gap:12px;">
                    <label style="cursor:pointer;"><input type="radio" name="opt_terima" value="meja" ${st.meja!==1?'disabled':''}> Terima Uang Meja</label>
                    <label style="cursor:pointer;"><input type="radio" name="opt_terima" value="bangun" ${st.bangun!==1?'disabled':''}> Terima Uang Pembangunan</label>
                    <label style="cursor:pointer;"><input type="radio" name="opt_terima" value="agustus" ${st.agustus!==1?'disabled':''}> Terima Uang 17 Agustus</label>
                    <hr style="border-top:1px dashed #cbd5e1;">
                    <label style="cursor:pointer; font-weight:bold; color:var(--success);"><input type="radio" name="opt_terima" value="semua" checked> Terima SEMUA Setoran Tertunda</label>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check-double"></i> Validasi Sekarang',
            confirmButtonColor: '#10b981'
        }).then((res) => {
            if(res.isConfirmed) {
                let pilihan = document.querySelector('input[name="opt_terima"]:checked');
                if(!pilihan) return;
                let val = pilihan.value;
                if(val === 'semua') {
                    if(st.meja === 1) st.meja = 2;
                    if(st.bangun === 1) st.bangun = 2;
                    if(st.agustus === 1) st.agustus = 2;
                } else {
                    st[val] = 2;
                }
                localStorage.setItem('status_setor_' + bulanSkg, JSON.stringify(st));
                if(typeof syncSemuaData==='function') syncSemuaData(true);
                loadAnalisaUangMeja();
                Swal.fire('Validasi Berhasil', 'Uang fisik telah diterima resmi oleh Bendahara.', 'success');
            }
        });
    };

    // Fungsi Bayar Cepat

    // Fungsi Nalangi Uang Meja

    // === MESIN ARSIP BERITA ACARA (BA) KEUANGAN (KAS TERPISAH & LOGO SEMARANG) ===
    
    // 1. Mesin Pembuat Template Surat (Dipakai untuk Preview & Cetak agar 100% sama)

    // 2. Fungsi Tombol "Buat Laporan BA"

    // 3. Mesin Penggambar Tabel Arsip BA

    // 4. Mesin Cetak Dokumen (Memanggil template yang sama dengan Preview)

    // 5. Mesin Hapus Arsip
    // === 10. DARURAT, ARISAN, DASHBOARD & SYNC ===
    window.simpanDarurat = function() { let db = JSON.parse(localStorage.getItem('db_darurat')) || []; let ikonVal = document.getElementById('d_icon').value.split('|'); db.push({ id: Date.now(), nama: document.getElementById('d_nama').value, telp: document.getElementById('d_telp').value, wa: document.getElementById('d_wa').value, maps: document.getElementById('d_maps').value, icon: ikonVal[0], color: ikonVal[1] }); localStorage.setItem('db_darurat', JSON.stringify(db)); document.getElementById('form-darurat').reset(); syncSemuaData(); Toast.fire({icon:'success',title:'Kontak Disimpan'}); };
    window.hapusDarurat = function(id) { let db = JSON.parse(localStorage.getItem('db_darurat')) || []; db = db.filter(x => x.id !== id); localStorage.setItem('db_darurat', JSON.stringify(db)); syncSemuaData(); };
    window.loadDaruratWarga = function() { let db = JSON.parse(localStorage.getItem('db_darurat')) || []; let cg = document.getElementById('container-darurat-warga'); if(cg){ cg.innerHTML = ''; db.forEach(d => { cg.innerHTML += `<div class="contact-card darurat-item"><i class="fa-solid ${d.icon}" style="font-size:2rem; color:${d.color};"></i><h4 class="darurat-nama">${d.nama}</h4><h3>${d.telp}</h3><div class="action-btns"><a href="tel:${d.telp}" class="call-btn"><i class="fa-solid fa-phone"></i></a></div></div>`; }); } };
    window.simpanInfoArisan = function(e) { e.preventDefault(); let d = { arisanNama: document.getElementById('inp_arisan_nama').value, arisanTgl: document.getElementById('inp_arisan_tgl').value, hostNama: document.getElementById('inp_host_nama').value, hostTgl: document.getElementById('inp_host_tgl').value }; localStorage.setItem('db_info_arisan', JSON.stringify(d)); localStorage.setItem('ts_arisan', new Date().toISOString()); syncSemuaData(); e.target.reset(); Toast.fire({icon:'success',title:'Arisan Disimpan'}); };
    window.loadDashboardWarga = function() {
    // Helper: format waktu relatif
    function relWaktu(tsStr) {
        if(!tsStr) return 'Belum pernah diperbarui';
        const ts = new Date(tsStr), now = new Date();
        const diffMs = now - ts;
        const diffMnt = Math.floor(diffMs / 60000);
        const diffJam = Math.floor(diffMs / 3600000);
        const diffHari = Math.floor(diffMs / 86400000);
        const jam = ts.getHours().toString().padStart(2,'0');
        const mnt = ts.getMinutes().toString().padStart(2,'0');
        const tgl = ts.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
        let rel;
        if(diffMnt < 1) rel = 'Baru saja';
        else if(diffMnt < 60) rel = diffMnt + ' menit lalu';
        else if(diffJam < 24) rel = diffJam + ' jam lalu';
        else rel = diffHari + ' hari lalu';
        const freshClass = diffMnt < 10 ? 'upd-fresh' : 'upd-stale';
        return { text: rel + ' (' + tgl + ', ' + jam + ':' + mnt + ')', freshClass };
    }
    function setUpd(id, tsKey) {
        const el = document.getElementById(id);
        if(!el) return;
        const ts = localStorage.getItem(tsKey);
        if(!ts) { el.innerHTML = '<i class="fa-solid fa-rotate"></i> Belum pernah diperbarui'; el.className = 'last-update-text upd-stale'; return; }
        const r = relWaktu(ts);
        el.innerHTML = '<i class="fa-solid fa-rotate-right"></i> ' + r.text;
        el.className = 'last-update-text ' + r.freshClass;
    }
    // Hitung saldo kas
    let dbKas = JSON.parse(localStorage.getItem('db_kas')) || [];
    let sAwal = parseInt(localStorage.getItem('db_saldo_awal')) || 0;
    let sAkhir = sAwal;
    dbKas.forEach(k => { if(k.tipe==='masuk') sAkhir += k.nominal; else sAkhir -= k.nominal; });
    let fmt = v => 'Rp ' + Number(v).toLocaleString('id-ID');
    let elKas = document.getElementById('warga-saldo-kas');
    if(elKas) elKas.innerText = fmt(sAkhir);
    // Total warga
    let w = document.getElementById('warga-total-kk');
    if(w) w.innerText = (JSON.parse(localStorage.getItem('db_warga'))||[]).length + ' KK';
    // Arisan & host
    let ar = JSON.parse(localStorage.getItem('db_info_arisan'));
    if(ar) {
        if(document.getElementById('warga-arisan-nama')) document.getElementById('warga-arisan-nama').innerText = ar.arisanNama || 'Belum ada data';
        if(document.getElementById('warga-arisan-tgl'))  document.getElementById('warga-arisan-tgl').innerText  = ar.arisanTgl  ? 'Jadwal: ' + ar.arisanTgl  : '';
        if(document.getElementById('warga-host-nama'))   document.getElementById('warga-host-nama').innerText   = ar.hostNama   || 'Belum ada data';
        if(document.getElementById('warga-host-tgl'))    document.getElementById('warga-host-tgl').innerText    = ar.hostTgl    ? 'Jadwal: ' + ar.hostTgl    : '';
    }
    // Update timestamp tiap kartu
    setUpd('upd-kas',    'ts_kas');
    setUpd('upd-arisan', 'ts_arisan');
    setUpd('upd-host',   'ts_arisan');
    setUpd('upd-warga',  'ts_warga');
};

    // === MESIN NOTULEN (RAPAT RT) ===
    window.simpanNotulen = function(e) {
        e.preventDefault();
        let db = JSON.parse(localStorage.getItem('db_notulen')) || [];
        db.push({ 
            id: Date.now(), 
            tgl: document.getElementById('inp_notul_tgl').value, 
            judul: document.getElementById('inp_notul_judul').value, 
            isi: document.getElementById('inp_notul_isi').value 
        });
        localStorage.setItem('db_notulen', JSON.stringify(db));
        e.target.reset(); 
        syncSemuaData(); 
        Toast.fire({icon:'success', title:'Notulen Disimpan'});
    };

    window.loadNotulenAdmin = function() {
        let db = JSON.parse(localStorage.getItem('db_notulen')) || []; 
        let tb = document.getElementById('tbody-notulen'); 
        if(!tb) return; // Mencegah error jika salah alamat
        tb.innerHTML = '';
        
        if(db.length === 0) { 
            tb.innerHTML = '<tr><td colspan="3" style="text-align:center; color:gray;">Belum ada arsip notulen rapat.</td></tr>'; 
            return; 
        }
        
        // Memunculkan data dari yang paling baru (reverse)
        db.slice().reverse().forEach(n => { 
            tb.innerHTML += `<tr>
                <td>${n.tgl}</td>
                <td><b style="color:var(--primary-dark); font-size:1.05rem;">${n.judul}</b></td>
                <td>
                    <button class="btn-action bg-gold" onclick="cetakNotulen(${n.id})"><i class="fa-solid fa-print"></i> Cetak Dokumen</button> 
                    <button class="btn-table btn-tbl-del" onclick="hapusNotulen(${n.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`; 
        });
    };
    window.hapusNotulen = function(id) { let db = JSON.parse(localStorage.getItem('db_notulen')) || []; localStorage.setItem('db_notulen', JSON.stringify(db.filter(x => x.id !== id))); syncSemuaData(); };
    window.cetakNotulen = function(id) {
        let db = JSON.parse(localStorage.getItem('db_notulen')) || []; let n = db.find(x => x.id === id); if(!n) return;
        let set = JSON.parse(localStorage.getItem('db_settings')) || { namaRT: "Bapak Kasimin" };
        // Bangun konten kop surat agar preview cetak benar-benar muncul
        let isiHTML = (n.isi||'').replace(/\n/g, '<br>');
        let html = '<div class="letter-paper" style="padding:0;">'+
            '<div class="kop-surat-resmi"><img src="/Lambang_Kota_Semarang.png" style="width:70px; filter:grayscale(100%);">'+
            '<div style="flex:1; text-align:center;"><h2 style="margin:0; font-size:1.4rem; font-weight:bold; text-transform:uppercase;">PENGURUS RUKUN TETANGGA 005 RUKUN WARGA 012</h2>'+
            '<h3 style="margin:2px 0; font-size:1.1rem; font-weight:normal; text-transform:uppercase;">KELURAHAN TEGALSARI &bull; KECAMATAN CANDISARI &bull; KOTA SEMARANG</h3></div></div>'+
            '<div style="border-top:3px solid black; border-bottom:1px solid black; height:1px; margin-bottom:20px;"></div>'+
            '<h3 style="text-align:center; text-decoration:underline; font-weight:bold; margin-bottom:25px;">NOTULENSI RAPAT</h3>'+
            '<table style="width:100%; font-size:1.05rem; border:none; margin-bottom:25px;">'+
            '<tr><td style="width:170px; border:none; padding:3px 0;">Hari, Tanggal</td><td style="width:20px; border:none;">:</td><td style="border:none;"><b>'+n.tgl+'</b></td></tr>'+
            '<tr><td style="border:none; padding:3px 0;">Agenda Utama</td><td style="border:none;">:</td><td style="border:none;"><b>'+n.judul+'</b></td></tr></table>'+
            '<div style="line-height:1.7; text-align:justify; margin-bottom:50px; min-height:200px;">'+isiHTML+'</div>'+
            '<div style="margin-top:40px; text-align:right; font-size:1.05rem; padding-right:20px;">Mengetahui,<br>Ketua RT. 005 / RW. 012<br><br><br><br><br><b style="text-decoration:underline;">'+(set.namaRT||'Bapak Kasimin')+'</b></div>'+
            '</div>';
        printViaIframe(html, 'Notulen_'+(n.judul||'Rapat').replace(/\s+/g,'_'));
    };
    window.susunNotulenAI = function() {
        let isi = document.getElementById('inp_notul_isi').value; if(!isi) return Swal.fire('Gagal', 'Tulis poin rapat dulu sebelum dirapikan AI.', 'warning');
        Swal.fire({title: 'Memproses AI...', text: 'Merangkum & merapikan format...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
        setTimeout(() => {
            let format = "BERIKUT ADALAH HASIL KESEPAKATAN RAPAT:\n\n" + isi.split('\n').filter(x=>x.trim()!=='').map((x, i) => `${i+1}. ` + x.trim()).join('\n');
            document.getElementById('inp_notul_isi').value = format; Swal.close(); Toast.fire({icon: 'success', title: 'Teks Dirapikan'});
        }, 1200);
    };

    // === 12. PENGATURAN & DATABASE (BACKUP/RESTORE) ===
    window.simpanPengaturanSistem = function() {
        let settings = {
            namaRT: document.getElementById('set_nama_rt').value || "Bapak Kasimin",
            namaRW: document.getElementById('set_nama_rw').value || "Bapak Mulyono",
            namaBen: document.getElementById('set_nama_ben').value || "Bapak Parmin",
            nomIuran: parseInt(document.getElementById('set_nominal_iuran').value) || 20000,
            bungaKop: parseInt(document.getElementById('set_bunga_kop').value) || 10
        };
        localStorage.setItem('db_settings', JSON.stringify(settings));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);
        Swal.fire('Berhasil', 'Parameter sistem diperbarui.', 'success');
    };

    // ── Parameter Pertemuan RT (target meja + PIN ben pembantu) ──
    window.simpanParameterPertemuan = function() {
        let targetMeja = parseInt(document.getElementById('set_target_uang_meja').value);
        let pin        = (document.getElementById('set_pin_ben_pembantu').value || '').trim();

        if (!targetMeja || targetMeja < 1000) {
            return Swal.fire('Periksa Input', 'Target uang meja harus diisi dan minimal Rp 1.000.', 'warning');
        }
        if (pin && (!/^[0-9]{4}$/.test(pin))) {
            return Swal.fire('PIN Tidak Valid', 'PIN harus 4 digit angka.', 'warning');
        }

        let param = JSON.parse(localStorage.getItem('db_param_pertemuan') || '{}');
        param.targetUangMeja = targetMeja;
        if (pin) param.pinBenPembantu = pin;

        localStorage.setItem('db_param_pertemuan', JSON.stringify(param));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);

        // Reset field PIN setelah simpan (keamanan)
        document.getElementById('set_pin_ben_pembantu').value = '';

        Swal.fire({
            icon: 'success',
            title: 'Parameter Disimpan!',
            html: `Target Uang Meja: <b>Rp ${targetMeja.toLocaleString('id-ID')}</b><br>` +
                  (pin ? '<span style="color:#10b981;"><i class="fa-solid fa-check"></i> PIN Bendahara Pembantu diperbarui</span>' : 'PIN tidak diubah'),
            confirmButtonColor: '#6366f1'
        });
    };

    // ── Toggle visibility PIN input ──
    window.togglePinVisibility = function(inputId, iconId) {
        let inp  = document.getElementById(inputId);
        let icon = document.getElementById(iconId);
        if (!inp) return;
        if (inp.type === 'password') {
            inp.type = 'text';
            if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
        } else {
            inp.type = 'password';
            if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
        }
    };
    window.simpanPasswordSistem = async function() {
        let pwDb = JSON.parse(localStorage.getItem('db_passwords')) || {};
        let fields = [
            {id:'set_pw_admin',      key:'admin',      label:'Admin'},
            {id:'set_pw_bendahara',  key:'bendahara',  label:'Bendahara'},
            {id:'set_pw_koperasi',   key:'koperasi',   label:'Koperasi'},
            {id:'set_pw_warga',      key:'warga',      label:'Warga'},
        ];
        let changed = [];
        fields.forEach(function(f) {
            let val = (document.getElementById(f.id) || {}).value;
            if (val && val.trim()) { pwDb[f.key] = val.trim(); changed.push(f.label); }
        });
        if (!changed.length) return Swal.fire('Info', 'Tidak ada password yang diubah (semua field kosong).', 'info');
        let confirm = await Swal.fire({
            icon: 'warning',
            title: 'Konfirmasi Ganti Password',
            html: 'Password untuk <b>' + changed.join(', ') + '</b> akan diubah.<br>Pastikan Anda sudah mencatatnya!',
            showCancelButton: true,
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444'
        });
        if (!confirm.isConfirmed) return;
        localStorage.setItem('db_passwords', JSON.stringify(pwDb));
        if (typeof syncSemuaData === 'function') syncSemuaData(true);
        fields.forEach(function(f) { let el = document.getElementById(f.id); if(el) el.value = ''; });
        // Update placeholder to reflect saved status
        if(typeof loadPengaturan === 'function') loadPengaturan();
        Swal.fire({icon:'success', title:'Password Diperbarui!', html: 'Password <b>' + changed.join(', ') + '</b> berhasil diubah dan disinkron ke server.', confirmButtonColor:'#10b981'});
    };
    window.loadPengaturan = function() {
        let s = JSON.parse(localStorage.getItem('db_settings')) || {namaRT: "Bapak Kasimin", namaRW: "Bapak Mulyono", namaBen: "Bapak Parmin", nomIuran: 20000, bungaKop: 10};
        if(document.getElementById('set_nama_rt')) document.getElementById('set_nama_rt').value = s.namaRT;
        if(document.getElementById('set_nama_rw')) document.getElementById('set_nama_rw').value = s.namaRW;
        if(document.getElementById('set_nama_ben')) document.getElementById('set_nama_ben').value = s.namaBen;
        if(document.getElementById('set_nominal_iuran')) document.getElementById('set_nominal_iuran').value = s.nomIuran;
        if(typeof renderJenisIuran === 'function') renderJenisIuran();
        if(document.getElementById('set_bunga_kop')) document.getElementById('set_bunga_kop').value = s.bungaKop;

        // Load parameter pertemuan
        let _param = JSON.parse(localStorage.getItem('db_param_pertemuan') || '{}');
        let _elMeja = document.getElementById('set_target_uang_meja');
        let _elPin  = document.getElementById('set_pin_ben_pembantu');
        if (_elMeja) _elMeja.value = _param.targetUangMeja || 250000;
        if (_elPin)  { _elPin.value = ''; _elPin.placeholder = _param.pinBenPembantu ? '••••  (sudah diset)' : 'Belum diset'; }
        
        // Perbarui placeholder field password sesuai status tersimpan
        let _savedPw = JSON.parse(localStorage.getItem('db_passwords')) || {};
        let _defaultPw = {admin:'admin005', bendahara:'benda005', koperasi:'koperasi005', warga:'rt005'};
        ['admin','bendahara','koperasi','warga'].forEach(function(role) {
            let el = document.getElementById('set_pw_' + role);
            if(el) el.placeholder = _savedPw[role]
                ? '(sudah diubah — isi untuk ganti lagi)'
                : '(default: ' + _defaultPw[role] + ')';
        });
        // Sinkronisasi Nama Pengurus ke Kertas PDF / Surat
        if(document.getElementById('p_nama_rw')) document.getElementById('p_nama_rw').innerText = s.namaRW;
        if(document.getElementById('p_nama_rt')) document.getElementById('p_nama_rt').innerText = s.namaRT;
        if(document.getElementById('pdf-nama-rw')) document.getElementById('pdf-nama-rw').innerText = s.namaRW;
        if(document.getElementById('pdf-nama-rt')) document.getElementById('pdf-nama-rt').innerText = s.namaRT;
    };
    // === BACKUP & RESTORE DARI SERVER (POSTGRESQL) ===
    window.exportData = async function() {
        try {
            Swal.fire({ title: 'Mengunduh backup...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const API_URL = "https://smartportal-production.up.railway.app";
            const resp = await fetch(`${API_URL}/api/kv`, { cache: 'no-store' });
            if (!resp.ok) throw new Error('Gagal menghubungi server');
            const data = await resp.json();
            const entries = data.entries || [];
            const backup = {
                _meta: {
                    version: 2,
                    source: 'postgresql',
                    exportedAt: new Date().toISOString(),
                    app: 'Smart Portal RT 005 Tegalsari',
                    rowCount: entries.length
                },
                entries: entries
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Backup_SmartPortalRT005_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            Swal.fire({
                icon: 'success',
                title: 'Backup Berhasil!',
                html: `<b>${entries.length} data</b> berhasil diunduh dari server PostgreSQL.<br><small style="color:#64748b">File: ${a.download}</small>`,
                confirmButtonColor: '#10b981'
            });
        } catch(err) {
            Swal.fire('Gagal', 'Tidak bisa mengunduh backup: ' + err.message, 'error');
        }
    };
    window.prosesImportData = function(e) {
        let file = e.target.files[0]; if (!file) return;
        let reader = new FileReader();
        reader.onload = async function(evt) {
            try {
                let parsed = JSON.parse(evt.target.result);
                let entries = [];
                if (parsed._meta && parsed._meta.version === 2 && Array.isArray(parsed.entries)) {
                    entries = parsed.entries;
                } else if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                    entries = Object.entries(parsed).map(([key, value]) => ({ key, value }));
                } else {
                    throw new Error('Format file tidak dikenali');
                }
                const LOCAL_ONLY_KEYS = ['isLoggedIn','loggedInAs','loggedInWarga','gt_theme','gt_notif_read'];
                entries = entries.filter(en => en.key && !LOCAL_ONLY_KEYS.includes(en.key) && !en.key.startsWith('gt_local_'));
                if (!entries.length) throw new Error('Tidak ada data untuk di-restore');

                const confirm = await Swal.fire({
                    icon: 'warning',
                    title: 'Konfirmasi Restore',
                    html: `Akan me-restore <b>${entries.length} data</b> ke server.<br>Data yang ada di server akan <b>ditimpa</b>.<br><br>Lanjutkan?`,
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Restore!',
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#3b82f6'
                });
                if (!confirm.isConfirmed) { e.target.value = ''; return; }

                Swal.fire({ title: 'Me-restore data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const BATCH = 50;
                for (let i = 0; i < entries.length; i += BATCH) {
                    const batch = entries.slice(i, i + BATCH);
                    const API_URL = "https://smartportal-production.up.railway.app";
                    await fetch(`${API_URL}/api/kv`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ writes: batch, originId: 'restore-' + Date.now() })
                    });
                }
                entries.forEach(entry => { try { localStorage.setItem(entry.key, entry.value); } catch(_){} });
                Swal.fire({
                    icon: 'success',
                    title: 'Restore Berhasil!',
                    html: `<b>${entries.length} data</b> berhasil di-restore ke server PostgreSQL.<br>Semua perangkat akan menerima data ini secara otomatis.`,
                    confirmButtonColor: '#10b981'
                });
            } catch(err) {
                Swal.fire('Error', 'File backup rusak atau tidak valid: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    
    
    // === PROGRESS BAR ===
    window.gtProgress = {
        _timer: null,
        _val: 0,
        start: function() {
            var bar = document.getElementById('gt-progress-bar');
            if (!bar) return;
            clearInterval(this._timer);
            this._val = 5;
            bar.style.width = '5%';
            bar.classList.add('loading');
            bar.classList.remove('done');
            var self = this;
            this._timer = setInterval(function() {
                if (self._val < 85) { self._val += Math.random() * 8; bar.style.width = self._val + '%'; }
            }, 200);
        },
        done: function() {
            var bar = document.getElementById('gt-progress-bar');
            if (!bar) return;
            clearInterval(this._timer);
            bar.style.width = '100%';
            setTimeout(function() { bar.classList.add('done'); setTimeout(function() { bar.style.width = '0%'; bar.classList.remove('loading','done'); }, 500); }, 200);
        }
    };

    // === SCROLL TO TOP BUTTON ===
    window.addEventListener('scroll', function() {
        var btn = document.getElementById('btn-scroll-top');
        if (!btn) return;
        if (window.scrollY > 300) { btn.style.display = 'flex'; }
        else { btn.style.display = 'none'; }
    }, {passive: true});

    // === OFFLINE BANNER ===
    function updateOfflineBanner() {
        var banner = document.getElementById('offline-banner');
        if (!banner) return;
        banner.style.display = navigator.onLine ? 'none' : 'block';
        document.body.classList.toggle('is-offline', !navigator.onLine);
    }
    window.addEventListener('online', updateOfflineBanner);
    window.addEventListener('offline', updateOfflineBanner);
    document.addEventListener('DOMContentLoaded', updateOfflineBanner);

    // === INFO APLIKASI ===
    window.refreshInfoAplikasi = async function() {
        try {
            const API_URL = "https://smartportal-production.up.railway.app";
            var resp = await fetch(`${API_URL}/api/audit`, {cache:'no-store'});
            var data = await resp.json();
            var elTotal = document.getElementById('info-total-data');
            var elSSE = document.getElementById('info-sse-status');
            if (elTotal) elTotal.textContent = data.rowCount !== undefined ? data.rowCount + ' baris' : '—';
            if (elSSE) {
                elSSE.textContent = data.sseSubscribers !== undefined ? data.sseSubscribers + ' subscriber aktif' : '—';
            }
        } catch(e) {}
        var elSync = document.getElementById('info-last-sync');
        if (elSync) {
            var ts = localStorage.getItem('ts_last_sync') || localStorage.getItem('_gt_last_poll');
            if (ts) {
                try {
                    var d = new Date(ts);
                    elSync.textContent = d.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
                } catch(_) { elSync.textContent = ts.slice(11,19); }
            }
        }
    };
    window.showAuditDetail = async function() {
        try {
            const API_URL = "https://smartportal-production.up.railway.app";
            var resp = await fetch(`${API_URL}/api/audit`, {cache:'no-store'});
            var d = await resp.json();
            await Swal.fire({
                title: '<i class="fa-solid fa-stethoscope"></i> Audit Server',
                html: `<div style="text-align:left;font-size:0.88rem;line-height:2;">
                    <b>Driver:</b> ${d.driver || '—'}<br>
                    <b>Total Baris DB:</b> ${d.rowCount !== undefined ? d.rowCount : '—'}<br>
                    <b>SSE Subscriber:</b> ${d.sseSubscribers !== undefined ? d.sseSubscribers : '—'}<br>
                    <b>Server Time:</b> ${d.serverTime ? new Date(d.serverTime).toLocaleString('id-ID') : '—'}<br>
                    <b>Status:</b> ${d.message || '—'}
                </div>`,
                confirmButtonColor: '#6366f1',
                icon: 'info'
            });
        } catch(e) {
            Swal.fire('Gagal', 'Tidak bisa menghubungi server audit: ' + e.message, 'error');
        }
    };
    // Auto-refresh info when entering settings tab
    var _origOpenAdminTab = window.openAdminTab;
    if (typeof _origOpenAdminTab === 'function') {
        window.openAdminTab = function(tab) {
            _origOpenAdminTab(tab);
            if (tab === 'pengaturan') setTimeout(refreshInfoAplikasi, 300);
        };
    }

    // === EXCEL EXPORT ===
    window.exportExcelWarga = function() {
        try {
            var db = JSON.parse(localStorage.getItem('db_warga')) || [];
            if (!db.length) { Swal.fire('Info', 'Belum ada data warga.', 'info'); return; }
            var rows = [['No','Nama KK','No. KK','NIK','Alamat','Nama Istri','Jumlah Anak']];
            db.forEach(function(w,i) {
                rows.push([i+1, w.nama||'', w.kk||'', w.nik||'', w.alamat||'', w.istri||'', (w.anak||[]).length]);
            });
            var ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{wch:4},{wch:30},{wch:20},{wch:20},{wch:35},{wch:25},{wch:12}];
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data Warga');
            XLSX.writeFile(wb, 'DataWarga_RT005_' + new Date().toISOString().slice(0,10) + '.xlsx');
        } catch(e) { Swal.fire('Error', 'Gagal export Excel: ' + e.message, 'error'); }
    };
    window.exportExcelKas = function() {
        try {
            var db = JSON.parse(localStorage.getItem('db_kas')) || [];
            if (!db.length) { Swal.fire('Info', 'Belum ada data kas.', 'info'); return; }
            var rows = [['No','Tanggal','Keterangan','Jenis','Nominal (Rp)']];
            db.forEach(function(k,i) {
                rows.push([i+1, k.tanggal||'', k.keterangan||'', k.jenis||'', Number(k.nominal)||0]);
            });
            var ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{wch:4},{wch:14},{wch:40},{wch:10},{wch:16}];
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Kas RT');
            XLSX.writeFile(wb, 'KasRT005_' + new Date().toISOString().slice(0,10) + '.xlsx');
        } catch(e) { Swal.fire('Error', 'Gagal export Excel: ' + e.message, 'error'); }
    };
    window.exportExcelIuran = function() {
        try {
            var db = JSON.parse(localStorage.getItem('db_iuran')) || [];
            var warga = JSON.parse(localStorage.getItem('db_warga')) || [];
            if (!db.length) { Swal.fire('Info', 'Belum ada data iuran.', 'info'); return; }
            var rows = [['No','Nama Warga','Bulan-Tahun','Status','Nominal (Rp)','Tanggal Bayar']];
            db.forEach(function(d,i) {
                var w = warga.find(function(x){ return x.id == d.wargaId; });
                rows.push([i+1, w?w.nama:'?', d.bulan||'', d.lunas?'Lunas':'Belum', Number(d.nominal)||0, d.tglBayar||'']);
            });
            var ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{wch:4},{wch:28},{wch:14},{wch:10},{wch:14},{wch:14}];
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Iuran RT');
            XLSX.writeFile(wb, 'IuranRT005_' + new Date().toISOString().slice(0,10) + '.xlsx');
        } catch(e) { Swal.fire('Error', 'Gagal export Excel: ' + e.message, 'error'); }
    };


    // ═══════════════════════════════════════════════════════════════
    // WEB PUSH NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════
    var _gtPushPublicKey = null;
    var _gtPushSub = null;

    // Convert VAPID base64 key to Uint8Array
    function urlBase64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        var rawData = atob(base64);
        var outputArray = new Uint8Array(rawData.length);
        for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    }

    // Load VAPID public key from server
    async function loadPushPublicKey() {
        if (_gtPushPublicKey) return _gtPushPublicKey;
        try {
            const API_URL = "https://smartportal-production.up.railway.app";
            var r = await fetch(`${API_URL}/api/push/vapid-public-key`);
            var d = await r.json();
            _gtPushPublicKey = d.publicKey;
        } catch(e) {}
        return _gtPushPublicKey;
    }

    // Check current push subscription status and update UI
    window.checkPushStatus = async function() {
        var statusEl = document.getElementById('push-status-warga');
        var btnEl = document.getElementById('btn-toggle-push');
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            if (statusEl) statusEl.textContent = 'Perangkat tidak mendukung notifikasi push';
            if (btnEl) btnEl.style.display = 'none';
            return;
        }
        try {
            var reg = await navigator.serviceWorker.ready;
            var sub = await reg.pushManager.getSubscription();
            _gtPushSub = sub;
            if (sub) {
                if (statusEl) statusEl.textContent = '✓ Aktif — notifikasi akan masuk ke perangkat ini';
                if (btnEl) { btnEl.innerHTML = '<i class="fa-solid fa-bell-slash"></i> Nonaktifkan Notifikasi'; btnEl.style.background = '#ef4444'; }
            } else {
                if (statusEl) statusEl.textContent = 'Belum aktif di perangkat ini';
                if (btnEl) { btnEl.innerHTML = '<i class="fa-solid fa-bell"></i> Aktifkan Notifikasi'; btnEl.style.background = '#7c3aed'; }
            }
        } catch(e) {}
    };

    // Toggle subscribe/unsubscribe
    window.togglePushSubscription = async function() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            Swal.fire('Tidak Didukung', 'Perangkat atau browser ini tidak mendukung notifikasi push.', 'warning');
            return;
        }
        try {
            var reg = await navigator.serviceWorker.ready;
            var sub = await reg.pushManager.getSubscription();
            if (sub) {
                // Unsubscribe
                const API_URL = "https://smartportal-production.up.railway.app";
                await fetch(`${API_URL}/api/push/unsubscribe`, { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({endpoint: sub.endpoint}) });
                await sub.unsubscribe();
                _gtPushSub = null;
                window.checkPushStatus();
                if (typeof Toast !== 'undefined') Toast.fire({icon:'info', title:'Notifikasi dinonaktifkan'});
            } else {
                // Subscribe — request permission first
                var perm = await Notification.requestPermission();
                if (perm !== 'granted') {
                    Swal.fire('Izin Ditolak', 'Aktifkan izin notifikasi di pengaturan browser Anda, lalu coba lagi.', 'warning');
                    return;
                }
                var publicKey = await loadPushPublicKey();
                if (!publicKey) { Swal.fire('Error', 'Gagal mengambil kunci notifikasi dari server.', 'error'); return; }
                var newSub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
                _gtPushSub = newSub;
                const API_URL = "https://smartportal-production.up.railway.app";
                var r = await fetch(`${API_URL}/api/push/subscribe`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(newSub) });
                var d = await r.json();
                window.checkPushStatus();
                if (typeof Toast !== 'undefined') Toast.fire({icon:'success', title:'Notifikasi diaktifkan! (' + d.total + ' perangkat terdaftar)'});
            }
        } catch(e) {
            Swal.fire('Error', 'Gagal mengubah pengaturan notifikasi: ' + e.message, 'error');
        }
    };

    // Admin: refresh subscriber count
    window.refreshPushCount = async function() {
        try {
            const API_URL = "https://smartportal-production.up.railway.app";
            var r = await fetch(`${API_URL}/api/push/count`);
            var d = await r.json();
            var el = document.getElementById('push-sub-count');
            if (el) el.textContent = d.count + ' perangkat terdaftar';
        } catch(e) {}
    };

    // Admin: kirim push notification ke semua subscriber
    window.kirimPushNotifikasi = async function() {
        var title = (document.getElementById('push-title') || {}).value?.trim();
        var body = (document.getElementById('push-body') || {}).value?.trim();
        if (!title || !body) { Swal.fire('Lengkapi', 'Judul dan isi pesan wajib diisi.', 'warning'); return; }
        var confirm = await Swal.fire({
            icon: 'question',
            title: 'Kirim Notifikasi?',
            html: `Judul: <b>${title}</b><br>Isi: ${body}<br><br>Akan dikirim ke semua perangkat yang sudah berlangganan.`,
            showCancelButton: true, confirmButtonText: 'Kirim!', cancelButtonText: 'Batal', confirmButtonColor: '#7c3aed'
        });
        if (!confirm.isConfirmed) return;
        Swal.fire({title:'Mengirim notifikasi...', allowOutsideClick:false, didOpen:()=>Swal.showLoading()});
        try {
            const API_URL = "https://smartportal-production.up.railway.app";
            var r = await fetch(`${API_URL}/api/push/send`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, body}) });
            var d = await r.json();
            Swal.fire({
                icon: d.sent > 0 ? 'success' : 'info',
                title: d.sent > 0 ? 'Notifikasi Terkirim!' : 'Tidak Ada Subscriber',
                html: `Terkirim: <b>${d.sent}</b> perangkat${d.failed ? ` | Gagal: ${d.failed}` : ''}`,
                confirmButtonColor: '#7c3aed'
            });
            window.refreshPushCount();
            document.getElementById('push-title').value = '';
            document.getElementById('push-body').value = '';
        } catch(e) { Swal.fire('Error', 'Gagal mengirim: ' + e.message, 'error'); }
    };

    // Auto-check push status when warga profil tab opens
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            if (typeof checkPushStatus === 'function') checkPushStatus();
        }, 2000);
        // Also run when tab is shown
        var origOpenWargaTab = window.openWargaTab;
        if (typeof origOpenWargaTab === 'function' && !origOpenWargaTab.__pushWrapped) {
            window.openWargaTab = function(tab) {
                origOpenWargaTab(tab);
                if (tab === 'warga-profil') setTimeout(checkPushStatus, 300);
            };
            window.openWargaTab.__pushWrapped = true;
        }
        // Refresh push count when admin enters pengaturan
        var origOpenAdminTab2 = window.openAdminTab;
        if (typeof origOpenAdminTab2 === 'function' && !origOpenAdminTab2.__pushWrapped) {
            window.openAdminTab = function(tab) {
                origOpenAdminTab2(tab);
                if (tab === 'pengaturan') { setTimeout(refreshPushCount, 400); setTimeout(refreshInfoAplikasi, 400); }
            };
            window.openAdminTab.__pushWrapped = true;
        }
    });

        window.bukaMenuResetData = function() {
        Swal.fire({
            title: 'Pilih Data yang Akan Dihapus',
            input: 'select',
            inputOptions: {
                'warga': '🗑️ Data Keluarga & Mutasi (KK)',
                'keuangan': '🗑️ Data Keuangan (Kas & Iuran)',
                'koperasi': '🗑️ Data Koperasi (Tabungan & Pinjam)',
                'persuratan': '🗑️ Data Surat, Aduan & Agenda',
                'semua': '⚠️ RESET TOTAL (Semua Data Pabrik)'
            },
            inputPlaceholder: '-- Pilih Kategori Reset --',
            showCancelButton: true,
            confirmButtonText: 'Lanjut',
            confirmButtonColor: '#ef4444'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                let kategori = result.value;
                let namaKategori = result.value.toUpperCase();
                
                // Konfirmasi Lapis Kedua (Keamanan Ekstra)
                Swal.fire({
                    title: `Konfirmasi Hapus ${namaKategori}`,
                    text: `Ketik "HAPUS" untuk melenyapkan data ${namaKategori} secara permanen dari sistem.`,
                    input: 'text',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    confirmButtonText: 'Eksekusi Hapus'
                }).then((r) => {
                    if (r.isConfirmed && r.value === 'HAPUS') {
                        // Proses Pemilahan Penghapusan
                        if (kategori === 'warga') {
                            localStorage.removeItem('db_warga');
                            localStorage.removeItem('data_warga_mandiri');
                            localStorage.removeItem('mutasi');
                        } else if (kategori === 'keuangan') {
                            localStorage.removeItem('db_kas');
                            localStorage.removeItem('db_iuran');
                            localStorage.removeItem('db_saldo_awal');
                        } else if (kategori === 'koperasi') {
                            localStorage.removeItem('db_kop_simpan');
                            localStorage.removeItem('db_kop_pinjam');
                            localStorage.removeItem('db_kop_angsur');
                        } else if (kategori === 'persuratan') {
                            localStorage.removeItem('db_req_surat');
                            localStorage.removeItem('db_aduan');
                            localStorage.removeItem('db_notulen');
                            localStorage.removeItem('kegiatan');
                            localStorage.removeItem('db_berita');
                        } else if (kategori === 'semua') {
                            localStorage.clear();
                        }
                        
                        Swal.fire('Berhasil!', `Data ${namaKategori} telah dibersihkan dari sistem.`, 'success').then(() => location.reload());
                    } else if (r.isConfirmed) {
                        Swal.fire('Gagal', 'Kata kunci salah! Penghapusan dibatalkan demi keamanan.', 'error');
                    }
                });
            }
        });
    };

    // === 1. PERBAIKAN MATRIKS IURAN (ANTI-BLANK ERROR) ===
window.loadMatriksIuran = function() {
        var dbIuran    = JSON.parse(localStorage.getItem('db_iuran')  || '[]');
        var dbWarga    = JSON.parse(localStorage.getItem('db_warga')  || '[]');
        var dbJI       = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if(!dbJI.length) dbJI = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        var nominalStd = dbJI.reduce(function(s,x){ return s+(x.nominal||0); }, 0) || 25000;
        var validWarga = dbWarga.filter(function(w){ return w && w.nama && w.nama.trim() !== ''; });
        var bulanArr   = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var bulanShort = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        var now        = new Date();
        var bulanIni   = bulanArr[now.getMonth()];
        var el         = function(id){ return document.getElementById(id); };
        var totalWarga=validWarga.length, lunasIni=0, belumIni=0, pendingCount=0, kurangCount=0;
        var uangTertahan=dbIuran.filter(function(x){return !x.posted;}).reduce(function(s,i){return s+(Number(i.nominal)||0);},0);
        var uangMasuk=dbIuran.filter(function(x){return x.posted;}).reduce(function(s,i){return s+(Number(i.nominal)||0);},0);
        validWarga.forEach(function(w){
            var b=dbIuran.find(function(i){return String(i.idWarga)===String(w.id)&&i.bulan===bulanIni;});
            if(b){ if(b.posted){ if(Number(b.nominal)<nominalStd)kurangCount++; else lunasIni++; } else pendingCount++; }
            else belumIni++;
        });
        if(el('mtrx-stat-total'))   el('mtrx-stat-total').textContent=totalWarga;
        if(el('mtrx-stat-lunas'))   el('mtrx-stat-lunas').textContent=lunasIni;
        if(el('mtrx-stat-belum'))   el('mtrx-stat-belum').textContent=belumIni;
        if(el('mtrx-stat-pending')) el('mtrx-stat-pending').textContent=pendingCount;
        if(el('iuran-stat-kurang')) el('iuran-stat-kurang').textContent=kurangCount;
        if(el('ben-total-iuran-terkumpul')) el('ben-total-iuran-terkumpul').textContent=fmt(uangMasuk);
        if(el('ben-iuran-hold'))    el('ben-iuran-hold').textContent=fmt(uangTertahan);
        var pct=totalWarga>0?Math.round((lunasIni/totalWarga)*100):0;
        if(el('mtrx-progress-bar'))         el('mtrx-progress-bar').style.width=pct+'%';
        if(el('mtrx-progress-pct'))         el('mtrx-progress-pct').textContent=pct+'%';
        if(el('mtrx-progress-label-kiri'))  el('mtrx-progress-label-kiri').textContent=lunasIni+' lunas';
        if(el('mtrx-progress-label-kanan')) el('mtrx-progress-label-kanan').textContent=belumIni+' belum bayar';
        var wrap=el('mtrx-accordion-wrap');
        if(!wrap) return;
        wrap.innerHTML='';
        if(!validWarga.length){
            wrap.innerHTML='<div style="text-align:center;padding:40px;color:#94a3b8;">Belum ada data warga.</div>';
            return;
        }
        var sorted=validWarga.slice().sort(function(a,b){return String(a.nama).localeCompare(String(b.nama));});
        sorted.forEach(function(w){
            var totalRow=0,lunasCount=0,pendingRow=0,kurangRow=0,bulanData=[];
            bulanArr.forEach(function(bln,idx){
                var sudahTiba=idx<=now.getMonth();
                var bayar=dbIuran.find(function(i){return String(i.idWarga)===String(w.id)&&i.bulan===bln;});
                var status='future',nominal=0;
                if(bayar){
                    nominal=Number(bayar.nominal)||0; totalRow+=nominal;
                    if(bayar.posted){if(nominal<nominalStd){status='kurang';kurangRow++;}else{status='lunas';lunasCount++;}}
                    else{status='pending';pendingRow++;}
                } else if(sudahTiba) status='belum';
                bulanData.push({bln:bln,short:bulanShort[idx],status:status,nominal:nominal,sudahTiba:sudahTiba});
            });
            var stIni=bulanData[now.getMonth()]?bulanData[now.getMonth()].status:'belum';
            var bColor={'lunas':'#dcfce7','pending':'#fef9c3','kurang':'#ffedd5','belum':'#fee2e2','future':'#f1f5f9'};
            var bText={'lunas':'#166534','pending':'#854d0e','kurang':'#9a3412','belum':'#991b1b','future':'#94a3b8'};
            var bLabel={'lunas':'LUNAS','pending':'PENDING','kurang':'KURANG','belum':'BELUM','future':'-'};
            var fgMap={'lunas':'#16a34a','pending':'#d97706','kurang':'#ea580c','belum':'#dc2626','future':'#cbd5e1'};
            var iconMap={'lunas':'fa-check-double','pending':'fa-clock','kurang':'fa-triangle-exclamation','belum':'fa-xmark','future':'fa-minus'};
            var totalBulanTiba=bulanData.filter(function(b){return b.sudahTiba;}).length||1;
            var pctRow=Math.round((lunasCount/totalBulanTiba)*100);
            var pbarColor=pctRow>=100?'#10b981':pctRow>=60?'#f59e0b':'#ef4444';
            var avatarLetter=String(w.nama).charAt(0).toUpperCase();
            var avatarBg=['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9'][w.id%6]||'#6366f1';
            var cellHTML=bulanData.map(function(b){
                var oc=(b.sudahTiba||b.status!=='future')?'onclick="inputIuranCepat('+w.id+',\''+b.bln+'\')"':'';
                return '<div class="mtrx-bulan-cell '+b.status+'" '+oc+' title="'+b.bln+(b.nominal?' - '+fmt(b.nominal):'')+'">'+
                    '<i class="fa-solid '+iconMap[b.status]+'" style="color:'+fgMap[b.status]+';font-size:1rem;"></i>'+
                    '<span>'+b.short+'</span>'+
                    '<span style="font-size:0.65rem;">'+(b.nominal?fmt(b.nominal):'-')+'</span>'+
                '</div>';
            }).join('');
            var detailBar='<div class="mtrx-detail-bar">'+
                '<span style="font-size:0.8rem;color:#64748b;font-weight:600;"><i class="fa-solid fa-coins" style="color:#f59e0b;"></i> Total: <b>'+fmt(totalRow)+'</b></span>'+
                '<span style="font-size:0.8rem;color:#64748b;font-weight:600;"><i class="fa-solid fa-check" style="color:#10b981;"></i> Lunas: <b>'+lunasCount+'/'+totalBulanTiba+'</b></span>'+
                (kurangRow?'<span style="font-size:0.8rem;color:#ea580c;font-weight:600;"><i class="fa-solid fa-triangle-exclamation"></i> Kurang: '+kurangRow+'</span>':'')+
                (pendingRow?'<span style="font-size:0.8rem;color:#d97706;font-weight:600;"><i class="fa-solid fa-clock"></i> Pending: '+pendingRow+'</span>':'')+
                '<div style="margin-left:auto;display:flex;gap:6px;">'+
                    '<button class="btn-action" style="background:#6366f1;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="inputIuranCepat('+w.id+',\''+bulanIni+'\')"><i class="fa-solid fa-plus"></i> Input</button>'+
                    '<button class="btn-action" style="background:#0ea5e9;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="lihatKartuWarga('+w.id+')"><i class="fa-solid fa-id-card"></i></button>'+
                '</div>'+
            '</div>';
            var rowHTML='<div class="mtrx-accordion-item" style="border-radius:12px;overflow:hidden;margin-bottom:6px;">'+
                '<div class="mtrx-row-header" onclick="toggleMtrxRow('+w.id+')" id="mtrx-hdr-'+w.id+'">'+
                    '<div style="width:36px;height:36px;border-radius:50%;background:'+avatarBg+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.9rem;flex-shrink:0;">'+avatarLetter+'</div>'+
                    '<div class="mtrx-nama-col">'+
                        '<div class="mtrx-nama-text">'+w.nama+'</div>'+
                        '<div class="mtrx-prog-inline">'+
                            '<div class="mtrx-prog-inline-bar"><div class="mtrx-prog-inline-fill" style="width:'+pctRow+'%;background:'+pbarColor+';"></div></div>'+
                            '<span style="font-size:0.7rem;color:#64748b;font-weight:600;">'+pctRow+'%</span>'+
                        '</div>'+
                    '</div>'+
                    '<span style="font-size:0.75rem;background:'+bColor[stIni]+';color:'+bText[stIni]+';border-radius:999px;padding:3px 10px;font-weight:800;flex-shrink:0;">'+bLabel[stIni]+'</span>'+
                    '<span style="font-size:0.8rem;color:#64748b;font-weight:600;flex-shrink:0;">'+fmt(totalRow)+'</span>'+
                    '<i class="fa-solid fa-chevron-down mtrx-chevron"></i>'+
                '</div>'+
                '<div class="mtrx-row-body" id="mtrx-body-'+w.id+'">'+
                    '<div class="mtrx-bulan-grid">'+cellHTML+'</div>'+
                    detailBar+
                '</div>'+
            '</div>';
            wrap.innerHTML+=rowHTML;
        });
        window._matriksAllItems=Array.from(wrap.querySelectorAll('.mtrx-accordion-item'));
    };
    window.toggleMtrxRow = function(wid) {
        var hdr=document.getElementById('mtrx-hdr-'+wid);
        var body=document.getElementById('mtrx-body-'+wid);
        if(!hdr||!body) return;
        var isOpen=hdr.classList.contains('open');
        document.querySelectorAll('.mtrx-row-header.open').forEach(function(h){h.classList.remove('open');});
        document.querySelectorAll('.mtrx-row-body.open').forEach(function(b){b.classList.remove('open');});
        if(!isOpen){hdr.classList.add('open');body.classList.add('open');}
    };
    window.filterMatriksIuran = function(q,status) {
        var items=window._matriksAllItems||[];
        var sq=(q||'').toLowerCase().trim();
        var sf=status||(document.getElementById('mtrx-filter-status')?document.getElementById('mtrx-filter-status').value:'');
        items.forEach(function(item){
            var nama=(item.querySelector('.mtrx-nama-text')||{}).textContent||'';
            var badge=(item.querySelector('.mtrx-row-header span')||{}).textContent||'';
            var matchQ=!sq||nama.toLowerCase().includes(sq);
            var matchS=!sf||badge.trim()===sf;
            item.style.display=(matchQ&&matchS)?'':'none';
        });
    };



    window.cariTagihan = function(e) {
        // 1. Tangkap ketikan langsung dari kotak yang sedang aktif (mengakali ID kembar)
        let eventObj = e || window.event;
        let keyword = "";
        
        if (eventObj && eventObj.target) {
            keyword = eventObj.target.value.toLowerCase();
        } else {
            // Jalur alternatif jika event gagal: Cari kotak pencarian yang terlihat di layar
            let inputs = document.querySelectorAll("input[placeholder*='Cari nama']");
            let visibleInput = Array.from(inputs).find(el => el.offsetParent !== null);
            keyword = visibleInput ? visibleInput.value.toLowerCase() : "";
        }

        // 2. Eksekusi penyortiran pada tabel
        let rows = document.querySelectorAll(".row-tagihan-unik");
        rows.forEach(row => {
            let elNama = row.querySelector(".nama-warga-pencarian");
            if (elNama) {
                let nama = elNama.innerText.toLowerCase();
                // Jika nama mengandung huruf yang diketik, tampilkan! Jika tidak, sembunyikan.
                row.style.display = nama.includes(keyword) ? "" : "none";
            }
        });
    };

    window.setorUangMeja = function() {
        let uang = window.currentTerkumpulMeja || 0;
        let bulanSkg = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        
        Swal.fire({
            title: 'Serahkan Uang Meja?',
            html: `Uang meja terkumpul bulan ini sebesar <b>${fmt(uang)}</b> akan ditandai telah diserahkan kepada Tuan Rumah / Bendahara.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: '<i class="fa-solid fa-check"></i> Ya, Serahkan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem('setor_meja_' + bulanSkg, 'true');
                if(typeof syncSemuaData==='function') syncSemuaData(true);
                loadAnalisaUangMeja(); 
                Swal.fire('Berhasil!', 'Status uang meja bulan ini telah diserahkan.', 'success');
            }
        });
    };



    // === 3. MESIN ARSIP BA KAS (DENGAN LOGO SEMARANG) ===
    window.buatTemplateSuratBA = function(ba, settings) {
        return `
        <div class="letter-paper" style="padding: 20px 30px; color: black; font-family: 'Times New Roman', Times, serif; background: white; margin: 0 auto;">
            <div style="display:flex; align-items:center; border-bottom: 3px solid black; padding-bottom: 15px; margin-bottom: 20px;">
                <img src="/Lambang_Kota_Semarang.png" style="width: 75px; height: auto; margin-right: 20px;" alt="Logo Semarang">
                <div style="flex:1; text-align:center;">
                    <h2 style="margin:0; font-size:1.4rem; text-transform:uppercase; letter-spacing:1px; color:black;">PENGURUS RT 005 / RW 012</h2>
                    <h3 style="margin:5px 0; font-size:1.1rem; font-weight:normal; color:black;">KELURAHAN TEGALSARI - KOTA SEMARANG</h3>
                    <p style="margin:0; font-size:0.85rem; font-style:italic; color:black;">Sekretariat: Jl. Tegalsari Raya, Kota Semarang, Jawa Tengah</p>
                </div>
                <div style="width: 75px;"></div>
            </div>
            <h3 style="text-align:center; text-decoration:underline; font-size:1.2rem; margin-bottom:20px; color:black;">BERITA ACARA LAPORAN KEUANGAN</h3>
            <p style="font-size:1.05rem; line-height:1.6; text-align:justify; margin-top:0; color:black;">
                Pada hari ini tanggal <b>${ba.tgl}</b>, kami selaku Pengurus RT 005 telah menyusun dan melaporkan Rekapitulasi Keuangan Warga untuk periode <b>${ba.periode}</b>, dengan rincian pemisahan pos dana sebagai berikut:
            </p>
            <h4 style="margin:20px 0 10px 0; font-size:1.1rem; color:black; text-decoration:underline;">A. KAS UTAMA (Operasional & Pembangunan)</h4>
            <table style="width:100%; border-collapse:collapse; font-size:1.05rem; margin-bottom:20px; color:black;">
                <tr><td style="padding:6px 0;">1. Saldo Awal (Bawaan)</td><td style="text-align:right;">${fmt(ba.sAwal)}</td></tr>
                <tr><td style="padding:6px 0;">2. Pemasukan Kas Utama</td><td style="text-align:right;">${fmt(ba.masukUtama)}</td></tr>
                <tr><td style="padding:6px 0; border-bottom:2px solid black;">3. Pengeluaran Kas Utama</td><td style="text-align:right; border-bottom:2px solid black;">- ${fmt(ba.keluarUtama)}</td></tr>
                <tr><td style="padding:10px 0; font-weight:bold;">SISA SALDO KAS UTAMA</td><td style="text-align:right; font-weight:bold; font-size:1.1rem;">${fmt(ba.saldoUtama)}</td></tr>
            </table>
            <h4 style="margin:20px 0 10px 0; font-size:1.1rem; color:black; text-decoration:underline;">B. KAS TABUNGAN KHUSUS (Terpisah)</h4>
            <table style="width:100%; border-collapse:collapse; font-size:1.05rem; margin-bottom:20px; color:black;">
                <tr><td style="padding:6px 0;">1. Tabungan Uang Meja (Terkumpul)</td><td style="text-align:right; font-weight:bold;">${fmt(ba.masukMeja)}</td></tr>
                <tr><td style="padding:6px 0;">2. Tabungan 17 Agustus (Terkumpul)</td><td style="text-align:right; font-weight:bold;">${fmt(ba.masukAgustus)}</td></tr>
            </table>
            <p style="font-size:1.05rem; line-height:1.6; text-align:justify; margin-bottom: 40px; color:black;">
                Demikian Berita Acara Laporan Keuangan ini dibuat dengan sebenar-benarnya dan penuh transparansi untuk dapat diketahui serta disetujui oleh seluruh warga RT 005.
            </p>
            <div style="display:flex; justify-content:space-between; text-align:center; font-size:1.05rem; margin-top:30px; color:black;">
                <div><p style="margin-bottom:60px;">Mengetahui,<br><b>Ketua RT 005</b></p><p style="text-decoration:underline; font-weight:bold; margin:0;">${settings.namaRT}</p></div>
                <div><p style="margin-bottom:60px;">Dibuat Oleh,<br><b>Bendahara RT 005</b></p><p style="text-decoration:underline; font-weight:bold; margin:0;">${settings.namaBen}</p></div>
            </div>
        </div>`;
    };

    window.promptBAKas = function() {
        Swal.fire({ title: 'Buat Laporan BA Kas', text: 'Ketik periode bulan laporan (Cth: Agustus 2026)', input: 'text', inputPlaceholder: 'Bulan ... Tahun ...', showCancelButton: true, confirmButtonText: 'Lihat Preview Surat <i class="fa-solid fa-file-invoice"></i>', confirmButtonColor: '#0ea5e9' }).then(r => {
            if(r.isConfirmed && r.value) {
                let periode = r.value; let dbKas = JSON.parse(localStorage.getItem('db_kas')) || []; let sAwal = parseInt(localStorage.getItem('db_saldo_awal')) || 0;
                let tMasukMeja = dbKas.filter(x => x.tipe === 'masuk' && x.uraian.toLowerCase().includes('uang meja')).reduce((s,i) => s + i.nominal, 0);
                let tMasukAgustus = dbKas.filter(x => x.tipe === 'masuk' && x.uraian.toLowerCase().includes('17 agustus')).reduce((s,i) => s + i.nominal, 0);
                let tMasukUtama = dbKas.filter(x => x.tipe === 'masuk' && !x.uraian.toLowerCase().includes('uang meja') && !x.uraian.toLowerCase().includes('17 agustus')).reduce((s,i) => s + i.nominal, 0);
                let tKeluarUtama = dbKas.filter(x => x.tipe === 'keluar').reduce((s,i) => s + i.nominal, 0);
                let sAkhirUtama = sAwal + tMasukUtama - tKeluarUtama; let tgl = new Date().toLocaleDateString('id-ID');
                let dataBA = { id: Date.now(), tgl: tgl, periode: periode, sAwal: sAwal, masukUtama: tMasukUtama, keluarUtama: tKeluarUtama, saldoUtama: sAkhirUtama, masukMeja: tMasukMeja, masukAgustus: tMasukAgustus };
                let settings = JSON.parse(localStorage.getItem('db_settings')) || { namaRT: "Bapak Kasimin", namaBen: "Bapak Parmin" };
                
                let previewHTML = buatTemplateSuratBA(dataBA, settings);
                Swal.fire({ title: 'Pratinjau Dokumen BA', html: `<div style="max-height:65vh; overflow-y:auto; border:2px solid #cbd5e1; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1); background:#e2e8f0; padding:10px;">${previewHTML}</div>`, width: 750, showCancelButton: true, cancelButtonText: 'Batal', confirmButtonText: '<i class="fa-solid fa-save"></i> Simpan ke Arsip', confirmButtonColor: '#10b981' }).then(res => {
                    if(res.isConfirmed) {
                        let dbBA = JSON.parse(localStorage.getItem('db_arsip_ba')) || []; dbBA.push(dataBA); localStorage.setItem('db_arsip_ba', JSON.stringify(dbBA));
                        if(typeof loadArsipBA === 'function') loadArsipBA(); openBenTab('ben-arsip'); if(typeof syncSemuaData==='function') syncSemuaData(true); Toast.fire({icon: 'success', title: 'Berhasil diarsipkan'});
                    }
                });
            } else if (r.isConfirmed) { Swal.fire('Gagal', 'Periode wajib diisi!', 'error'); }
        });
    };

    window.loadArsipBA = function() {
        let dbBA = JSON.parse(localStorage.getItem('db_arsip_ba')) || []; let tb = document.getElementById('tbody-arsip-ba'); if(!tb) return; tb.innerHTML = '';
        if(dbBA.length === 0) { tb.innerHTML = '<tr><td colspan="4" style="text-align:center; color:gray; padding:20px;">Belum ada arsip dokumen BA Kas.</td></tr>'; return; }
        dbBA.sort((a,b) => b.id - a.id).forEach(b => {
            tb.innerHTML += `<tr><td>${b.tgl}</td><td><b style="color:var(--primary-dark);">Laporan Kas</b><br><small style="color:var(--success); font-weight:bold;">Saldo Utama: ${fmt(b.saldoUtama)}</small></td><td><b style="font-size:1.05rem;">${b.periode}</b></td><td style="text-align:center;"><button class="btn-action bg-blue" onclick="cetakBA(${b.id})" title="Cetak / Download PDF" style="padding:6px 12px; font-size:0.85rem;"><i class="fa-solid fa-download"></i> Cetak</button> <button class="btn-table btn-tbl-del" onclick="hapusBA(${b.id})" title="Hapus Arsip" style="margin-left:5px;"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        });
    };

    window.cetakBA = function(id) {
        let dbBA = JSON.parse(localStorage.getItem('db_arsip_ba')) || []; let ba = dbBA.find(x => x.id === id);
        let settings = JSON.parse(localStorage.getItem('db_settings')) || { namaRT: "Bapak Kasimin", namaBen: "Bapak Parmin" };
        if(!ba) return;
        let html = buatTemplateSuratBA(ba, settings);
        printViaIframe(html, 'BA_Kas_'+(ba.periode||'').replace(/\s+/g,'_'));
    };

    window.hapusBA = function(id) {
        Swal.fire({ title: 'Hapus Laporan?', text: "Arsip ini akan dilenyapkan secara permanen!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus!' }).then((result) => {
            if (result.isConfirmed) { let dbBA = JSON.parse(localStorage.getItem('db_arsip_ba')) || []; dbBA = dbBA.filter(x => x.id !== id); localStorage.setItem('db_arsip_ba', JSON.stringify(dbBA)); loadArsipBA(); if(typeof syncSemuaData==='function') syncSemuaData(true); Toast.fire({icon:'success', title:'Arsip Dihapus'}); }
        });
    };

    // === 4. OVERRIDE FUNGSI TAB & SINKRONISASI ===
    // === OVERRIDE FUNGSI TAB AGAR SEMUA MEREFRESH OTOMATIS ===
    window.openBenTab = function(t) {
    document.querySelectorAll(".ben-tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll("#view-bendahara .admin-tab-btn").forEach(el => {
        el.classList.remove("active");
        if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(t)) el.classList.add("active");
    });
    if(document.getElementById(t)) document.getElementById(t).classList.add("active");
    window.scrollTo({top: 0, behavior: 'smooth'});
    const bLoaders = {
        'ben-input':      function(){ if(typeof populateDropdownWarga==='function') populateDropdownWarga(); },
        'ben-iuran':      function(){ if(typeof loadTabIuranKolektif==='function') loadTabIuranKolektif(); },
        'ben-laporan':    function(){ if(typeof loadKasBendahara==='function') loadKasBendahara(); },
        'ben-matriks':    function(){ if(typeof loadMatriksIuran==='function') loadMatriksIuran(); },
        'ben-penagihan':  function(){ if(typeof loadAnalisaUangMeja==='function') loadAnalisaUangMeja(); },
        'ben-arsip':      function(){ if(typeof loadArsipBA==='function') loadArsipBA(); },
    };
    if(bLoaders[t]) bLoaders[t]();
};
    // === FITUR POP-UP KARTU DIGITAL WARGA (UPGRADE DESAIN & ANTI-MACET) ===
    var _iuranWargaTerpilih = null;

    var _iuranWargaTerpilih = null;

    window.loadTabIuranKolektif = function() {
        _iuranWargaTerpilih = null;
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var bulanIni = new Date().toLocaleString('id-ID',{month:'long'});
        var lunas = dbWarga.filter(function(w){
            return dbIuran.some(function(x){ return String(x.idWarga)===String(w.id) && x.bulan===bulanIni && x.posted; });
        }).length;
        if(document.getElementById('iuran-stat-total-warga')) document.getElementById('iuran-stat-total-warga').innerText = dbWarga.length;
        if(document.getElementById('iuran-stat-lunas')) document.getElementById('iuran-stat-lunas').innerText = lunas;
        if(document.getElementById('iuran-stat-belum')) document.getElementById('iuran-stat-belum').innerText = dbWarga.length - lunas;
        window._iuranDbWarga = dbWarga;
        window._iuranDbIuran = dbIuran;
        window.renderListWargaIuran(dbWarga);
        window.renderRiwayatIuranHariIni();
        window.renderKurangBayar();
    };

    window.renderListWargaIuran = function(list) {
        var el = document.getElementById('iuran-list-warga');
        if (!el) return;
        if (!list || list.length === 0) {
            el.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">Tidak ada warga ditemukan.</div>';
            return;
        }
        var dbIuran = window._iuranDbIuran || JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var bulanIni = new Date().toLocaleString('id-ID', {month:'long'});
        var html = '';
        list.forEach(function(w) {
            var lunas = dbIuran.some(function(x) {
                return String(x.idWarga) === String(w.id) && x.bulan === bulanIni && x.posted;
            });
            var isActive = window._iuranWargaTerpilih && String(window._iuranWargaTerpilih.id) === String(w.id);
            html += '<div onclick="pilihWargaIuran(' + w.id + ')" style="' +
                'padding:10px 14px; border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;' +
                'background:' + (isActive ? 'var(--primary-blue)' : 'var(--gt-surface, #f8fafc)') + ';' +
                'color:' + (isActive ? '#fff' : 'inherit') + ';' +
                'border:1px solid ' + (isActive ? 'var(--primary-blue)' : '#e2e8f0') + ';' +
                'transition:all 0.15s;">' +
                '<span style="font-weight:600; font-size:0.92rem;">' + w.nama + '</span>' +
                '<span style="font-size:0.78rem; font-weight:700; padding:3px 8px; border-radius:20px; background:' +
                (lunas ? '#dcfce7' : '#fee2e2') + '; color:' + (lunas ? '#166534' : '#991b1b') + ';">' +
                (lunas ? '✓ Lunas' : '✗ Belum') + '</span>' +
                '</div>';
        });
        el.innerHTML = html;
    };

    window.filterWargaIuran = function() {
        var q = (document.getElementById('iuran-search-warga') || {}).value || '';
        var dbWarga = window._iuranDbWarga || JSON.parse(localStorage.getItem('db_warga') || '[]');
        var filtered = q.trim() === '' ? dbWarga : dbWarga.filter(function(w) {
            return w.nama && w.nama.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        });
        window.renderListWargaIuran(filtered);
    };

    window.pilihWargaIuran = function(id) {
        var dbWarga = window._iuranDbWarga || JSON.parse(localStorage.getItem('db_warga') || '[]');
        var w = dbWarga.find(function(x) { return String(x.id) === String(id); });
        if (!w) return;
        window._iuranWargaTerpilih = w;
        var elNama = document.getElementById('iuran-nama-terpilih');
        if (elNama) elNama.innerText = w.nama;
        // Re-render list agar highlight aktif
        window.filterWargaIuran();
        // Load status bulan
        if (typeof window.loadBulanIuran === 'function') window.loadBulanIuran(w);
    };


    window.simpanIuranKolektifBaru = function() {
        if(!_iuranWargaTerpilih) return Swal.fire('Gagal','Pilih warga terlebih dahulu!','error');
        var checked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        if(checked.length === 0) return Swal.fire('Gagal','Pilih minimal satu bulan!','error');
        var bulanDipilih = Array.from(checked).map(function(el){ return el.getAttribute('data-bulan'); });
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
        var tgl = new Date().toISOString().split('T')[0];
        var idBase = Date.now();
        bulanDipilih.forEach(function(bulan, idx) {
            dbIuran.push({ id: idBase+idx, idWarga: _iuranWargaTerpilih.id, namaWarga: _iuranWargaTerpilih.nama, bulan: bulan, nominal: nominalIuran, tanggal: tgl, posted: true });
            dbKas.push({ id: idBase+1000+idx, tgl: tgl, uraian: 'Iuran '+bulan+' - '+_iuranWargaTerpilih.nama, tipe: 'masuk', nominal: nominalIuran, sumber: 'iuran' });
        });
        localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
        localStorage.setItem('db_kas', JSON.stringify(dbKas));
        window._iuranDbIuran = dbIuran;
        Swal.fire('Berhasil!', _iuranWargaTerpilih.nama+' - '+bulanDipilih.length+' bulan tercatat!', 'success');
        window.loadTabIuranKolektif();
    };

    window.resetPilihWargaIuran = function() {
        _iuranWargaTerpilih = null;
        var elNama = document.getElementById('iuran-nama-terpilih');
        if(elNama) elNama.innerText = '- Pilih warga dulu';
        var grid = document.getElementById('iuran-bulan-grid');
        if(grid) grid.innerHTML = '<div style="text-align:center;color:var(--tm);padding:20px;grid-column:1/-1;">Pilih warga untuk melihat status bulan</div>';
        var elTotal = document.getElementById('iuran-total-display');
        if(elTotal) elTotal.innerText = 'Rp 0';
        var elBreak = document.getElementById('iuran-breakdown-display');
        if(elBreak) elBreak.innerText = '';
        window.renderListWargaIuran(window._iuranDbWarga || []);
    };

    window.loadBulanIuran = function(w) {
        var grid = document.getElementById('iuran-bulan-grid');
        if (!grid) return;
        var dbIuran = window._iuranDbIuran || JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;
        var BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                     'Juli','Agustus','September','Oktober','November','Desember'];
        var html = '';
        var totalDipilih = 0;
        var jumlahDipilih = 0;

        BULAN.forEach(function(bulan) {
            var sudahBayar = dbIuran.some(function(x) {
                return String(x.idWarga) === String(w.id) && x.bulan === bulan && x.posted;
            });
            if (sudahBayar) {
                html += '<div style="padding:10px 6px; border-radius:10px; text-align:center; font-size:0.82rem; font-weight:700;' +
                    'background:#dcfce7; color:#166534; border:2px solid #86efac; cursor:not-allowed;">' +
                    '<i class="fa-solid fa-check"></i><br>' + bulan + '</div>';
            } else {
                html += '<div data-bulan="' + bulan + '" data-checked="false" onclick="toggleBulanIuran(this)" ' +
                    'style="padding:10px 6px; border-radius:10px; text-align:center; font-size:0.82rem; font-weight:700;' +
                    'background:var(--gt-surface,#f8fafc); color:var(--text-dark); border:2px solid #e2e8f0; cursor:pointer;' +
                    'transition:all 0.15s;">' +
                    bulan + '</div>';
            }
        });

        grid.innerHTML = html;

        // Reset total
        var elTotal = document.getElementById('iuran-total-display');
        if (elTotal) elTotal.innerText = 'Rp 0';
        var elBreak = document.getElementById('iuran-breakdown-display');
        if (elBreak) elBreak.innerText = '';
    };

    window.toggleBulanIuran = function(el) {
        var checked = el.getAttribute('data-checked') === 'true';
        var dbSettings = JSON.parse(localStorage.getItem('db_settings') || '{}');
        var nominalIuran = Number(dbSettings.nominalIuran) || 25000;

        if (checked) {
            el.setAttribute('data-checked', 'false');
            el.style.background = 'var(--gt-surface,#f8fafc)';
            el.style.borderColor = '#e2e8f0';
            el.style.color = 'var(--text-dark)';
        } else {
            el.setAttribute('data-checked', 'true');
            el.style.background = 'var(--primary-blue)';
            el.style.borderColor = 'var(--primary-blue)';
            el.style.color = '#fff';
        }

        // Hitung total
        var allChecked = document.querySelectorAll('#iuran-bulan-grid [data-checked="true"]');
        var total = allChecked.length * nominalIuran;
        var elTotal = document.getElementById('iuran-total-display');
        if (elTotal) elTotal.innerText = 'Rp ' + total.toLocaleString('id-ID');

        // Breakdown
        var dbJenis = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        var elBreak = document.getElementById('iuran-breakdown-display');
        if (elBreak && dbJenis.length > 0 && allChecked.length > 0) {
            var breakHtml = dbJenis.map(function(j) {
                return j.nama + ': Rp ' + (Number(j.nominal) * allChecked.length).toLocaleString('id-ID');
            }).join(' &nbsp;|&nbsp; ');
            elBreak.innerHTML = breakHtml;
        } else if (elBreak) {
            elBreak.innerText = '';
        }
    };


    // ═══ SISTEM KURANG BAYAR ═══
    // Nominal seharusnya per periode:
    // Jan-Mei 2026 = 20000 (3 komponen)
    // Jun 2026+    = 25000 (4 komponen, tambah Uang Sosial)
    var BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'];

    function getNominalSeharusnya(bulan, tahun) {
        tahun = tahun || 2026;
        var idx = BULAN_LIST.indexOf(bulan);
        if (tahun < 2026) return 20000;
        if (tahun === 2026 && idx <= 4) return 20000; // Jan=0 s/d Mei=4
        return 25000;
    }

    window.hitungKurangBayar = function() {
        var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
        var dbWarga = JSON.parse(localStorage.getItem('db_warga') || '[]');
        var hasil = [];

        dbIuran.forEach(function(x) {
            if (!x.posted) return;
            var nominalDibayar = Number(x.nominal) || 0;
            var tahun = 2026;
            // Coba baca tahun dari field tanggal jika ada
            if (x.tanggal) {
                var t = new Date(x.tanggal);
                if (!isNaN(t)) tahun = t.getFullYear();
            }
            var seharusnya = getNominalSeharusnya(x.bulan, tahun);
            var kurang = seharusnya - nominalDibayar;
            if (kurang > 0) {
                var warga = dbWarga.find(function(w) {
                    return String(w.id) === String(x.idWarga);
                });
                hasil.push({
                    idIuran: x.id,
                    idWarga: x.idWarga,
                    namaWarga: x.namaWarga || (warga ? warga.nama : 'Unknown'),
                    bulan: x.bulan,
                    tanggal: x.tanggal || '',
                    nominalDibayar: nominalDibayar,
                    seharusnya: seharusnya,
                    kurang: kurang
                });
            }
        });

        // Urutkan: nama warga → bulan
        hasil.sort(function(a, b) {
            if (a.namaWarga < b.namaWarga) return -1;
            if (a.namaWarga > b.namaWarga) return 1;
            return BULAN_LIST.indexOf(a.bulan) - BULAN_LIST.indexOf(b.bulan);
        });

        return hasil;
    };

    window.renderKurangBayar = function() {
        var tbody = document.getElementById('tbody-kurang-bayar');
        var elTotal = document.getElementById('kurang-bayar-total');
        var elStat = document.getElementById('iuran-stat-kurang');
        if (!tbody) return;

        var data = window.hitungKurangBayar();

        if (elStat) elStat.innerText = data.length;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#16a34a;padding:20px;font-weight:700;">' +
                '<i class="fa-solid fa-circle-check"></i> Tidak ada kurang bayar!</td></tr>';
            if (elTotal) elTotal.innerText = '';
            return;
        }

        var totalKurang = data.reduce(function(s, x) { return s + x.kurang; }, 0);
        if (elTotal) elTotal.innerText = 'Total kekurangan: Rp ' + totalKurang.toLocaleString('id-ID');

        var rows = '';
        data.forEach(function(x) {
            rows += '<tr>' +
                '<td style="font-weight:600;">' + x.namaWarga + '</td>' +
                '<td>' + x.bulan + '</td>' +
                '<td style="color:var(--text-muted);">Rp ' + x.nominalDibayar.toLocaleString('id-ID') + '</td>' +
                '<td>Rp ' + x.seharusnya.toLocaleString('id-ID') + '</td>' +
                '<td style="color:#d97706; font-weight:800;">Rp ' + x.kurang.toLocaleString('id-ID') + '</td>' +
                '<td><button class="btn-table" style="background:#fef9c3;color:#92400e;border:1px solid #fde047;" ' +
                'onclick="lunasiSatuKurangBayar(' + JSON.stringify(x.idWarga) + ',\'' + x.bulan + '\',' + x.kurang + ',\'' + x.namaWarga + '\')">' +
                '<i class="fa-solid fa-coins"></i> Lunasi</button></td>' +
                '</tr>';
        });
        tbody.innerHTML = rows;
    };

    window.lunasiSatuKurangBayar = function(idWarga, bulan, kurang, namaWarga) {
        Swal.fire({
            title: 'Lunasi Kekurangan?',
            html: '<b>' + namaWarga + '</b> bulan <b>' + bulan + '</b><br>' +
                  'Kekurangan: <b style="color:#d97706;">Rp ' + kurang.toLocaleString('id-ID') + '</b>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lunasi!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#f59e0b'
        }).then(function(result) {
            if (!result.isConfirmed) return;

            var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            var tgl = new Date().toISOString().split('T')[0];

            // Update nominal di db_iuran
            dbIuran.forEach(function(x) {
                if (String(x.idWarga) === String(idWarga) && x.bulan === bulan && x.posted) {
                    x.nominal = (Number(x.nominal) || 0) + kurang;
                    x.sudahLunasKurang = true;
                }
            });

            // Catat ke kas
            dbKas.push({
                id: Date.now(),
                tgl: tgl,
                uraian: 'Pelunasan kurang bayar ' + bulan + ' - ' + namaWarga + ' (Uang Sosial)',
                tipe: 'masuk',
                nominal: kurang,
                sumber: 'iuran'
            });

            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);

            Swal.fire('Berhasil!', 'Kekurangan ' + namaWarga + ' bulan ' + bulan + ' sudah dilunasi!', 'success');
            window.renderKurangBayar();
            if (typeof window.loadTabIuranKolektif === 'function') window.loadTabIuranKolektif();
        });
    };

    window.lunasiSemuaKurangBayar = function() {
        var data = window.hitungKurangBayar();
        if (data.length === 0) return Swal.fire('Info', 'Tidak ada kurang bayar!', 'info');

        var totalKurang = data.reduce(function(s, x) { return s + x.kurang; }, 0);

        Swal.fire({
            title: 'Lunasi Semua Kekurangan?',
            html: '<b>' + data.length + ' item</b> dari <b>' + 
                  [...new Set(data.map(function(x){return x.namaWarga;}))].length + ' warga</b><br>' +
                  'Total: <b style="color:#d97706;">Rp ' + totalKurang.toLocaleString('id-ID') + '</b>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lunasi Semua!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#f59e0b'
        }).then(function(result) {
            if (!result.isConfirmed) return;

            var dbIuran = JSON.parse(localStorage.getItem('db_iuran') || '[]');
            var dbKas = JSON.parse(localStorage.getItem('db_kas') || '[]');
            var tgl = new Date().toISOString().split('T')[0];

            data.forEach(function(x) {
                dbIuran.forEach(function(rec) {
                    if (String(rec.idWarga) === String(x.idWarga) && rec.bulan === x.bulan && rec.posted) {
                        rec.nominal = (Number(rec.nominal) || 0) + x.kurang;
                        rec.sudahLunasKurang = true;
                    }
                });
                dbKas.push({
                    id: Date.now() + Math.random(),
                    tgl: tgl,
                    uraian: 'Pelunasan kurang bayar ' + x.bulan + ' - ' + x.namaWarga + ' (Uang Sosial)',
                    tipe: 'masuk',
                    nominal: x.kurang,
                    sumber: 'iuran'
                });
            });

            localStorage.setItem('db_iuran', JSON.stringify(dbIuran));
            localStorage.setItem('db_kas', JSON.stringify(dbKas));
            if (typeof syncSemuaData === 'function') syncSemuaData(true);

            Swal.fire('Berhasil!', 'Semua kekurangan (' + data.length + ' item) sudah dilunasi!', 'success');
            window.renderKurangBayar();
            if (typeof window.loadTabIuranKolektif === 'function') window.loadTabIuranKolektif();
        });
    };

    window.renderRiwayatIuranHariIni = function() {
        var dbIuran = window._iuranDbIuran || [];
        var tgl = new Date().toISOString().split('T')[0];
        var hariIni = dbIuran.filter(function(x){ return x.tanggal === tgl; });
        var tb = document.getElementById('tbody-iuran-hari-ini');
        if(!tb) return;
        if(hariIni.length === 0) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;">Belum ada transaksi iuran hari ini</td></tr>';
            return;
        }
        tb.innerHTML = hariIni.sort(function(a,b){ return b.id - a.id; }).map(function(x){
            return '<tr>'
                + '<td><b>'+x.namaWarga+'</b></td>'
                + '<td>'+x.bulan+'</td>'
                + '<td>'+x.nominal+'</td>'
                + '<td><span style="background:#dcfce7;color:#166534;border-radius:999px;padding:2px 8px;font-size:0.75rem;font-weight:700;">Tercatat</span></td>'
                + '</tr>';
        }).join('');
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
          if(typeof loadKasBendahara === 'function') { loadKasBendahara(); loaded = true; }
          if(typeof loadMatriksIuran === 'function') { loadMatriksIuran(); loaded = true; }
          if(typeof loadKoperasiData === 'function') { loadKoperasiData(); loaded = true; }
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
          if(typeof loadAnalisaUangMeja === 'function') { loadAnalisaUangMeja(); loaded = true; }
          if(typeof loadArsipBA === 'function') { loadArsipBA(); loaded = true; }

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
                tb.innerHTML += `<tr><td>${s.tglPengajuan}</td><td><b style="color:var(--primary-dark);">${(s.keperluan||'').substring(0,25)}...</b></td><td>${s.noSurat}</td><td><span class="badge ${badge}">${s.status}</span></td><td>${btnAction}</td></tr>`;
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
        let db = JSON.parse(localStorage.getItem('db_req_surat_v2')) || [];
        localStorage.setItem('db_req_surat_v2', JSON.stringify(db.filter(x => x.id !== id)));
        if(typeof syncSemuaData==='function') syncSemuaData(true);
        if(typeof loadSuratAdmin === 'function') loadSuratAdmin();
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
    window.toggleSidebar = function() {
        // Menambahkan/menghapus class 'sidebar-collapsed' pada body
        document.body.classList.toggle('sidebar-collapsed');
        
        // Simpan preferensi user agar saat refresh tidak kembali ke awal
        let isCollapsed = document.body.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebar_state', isCollapsed ? 'hidden' : 'visible');
    };

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
                            if (typeof gtRestoreSession === 'function') gtRestoreSession();
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
            var r = orig.apply(this, arguments);
            // Setelah portal terbuka & lastView ada → restore tab terakhir untuk role ini
            try {
                var lv = JSON.parse(localStorage.getItem('gt_local_lastView')||'{}');
                if (lv && lv.role === role && lv.tab) {
                    setTimeout(function(){
                        if (role==='warga' && typeof window.openWargaTab==='function') window.openWargaTab(lv.tab);
                        else if (role==='admin' && typeof window.openAdminTab==='function') window.openAdminTab(lv.tab);
                        else if (role==='koperasi' && typeof window.openKopTab==='function') window.openKopTab(lv.tab);
                        else if (role==='bendahara' && typeof window.openBenTab==='function') window.openBenTab(lv.tab);
                    }, 60);
                }
            } catch(_){}
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
            return orig.apply(this, arguments);
        };
        window.logout.__gtSessionWrapped = true;
    })();
    // Auto-restore saat halaman dimuat
    window.gtRestoreSession = function(){
        try {
            var raw = localStorage.getItem('gt_local_session');
            if (!raw) return false;
            var sess = JSON.parse(raw);
            if (!sess || !sess.role) return false;
            // Sesi kadaluwarsa setelah 12 jam tanpa aktivitas
            if (sess.at && (Date.now() - sess.at) > 12*60*60*1000) {
                localStorage.removeItem('gt_local_session');
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
            if (typeof window.BukaPortal === 'function') window.BukaPortal(sess.role);
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
    // =======================================================
    // 7. MESIN PENGUJIAN DEVELOPER (AUTO-TESTING)
    // =======================================================
    window.suntikDataTest = function() {
        Swal.fire({
            title: 'Mulai Uji Coba?',
            text: "Sistem akan menyuntikkan 50 Warga dan 5 Pengurus palsu ke dalam tabel.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ya, Suntik Data!'
        }).then((result) => {
            if (result.isConfirmed) {
                let dbWarga = JSON.parse(localStorage.getItem('db_warga')) || [];
                let dbPengurus = JSON.parse(localStorage.getItem('db_pengurus')) || [];

                // 1. Suntik 50 Warga (Pakai ID khusus "TEST-W-" agar mudah dikenali mesin)
                for(let i = 1; i <= 50; i++) {
                    dbWarga.push({
                        id: "TEST-W-" + Date.now() + i, 
                        nama: "Warga Dummy Ke-" + i,
                        kk: "3374000000" + i,
                        nik: "3374111100" + i,
                        alamat: "Jl. Tegalsari Dummy Blok " + i,
                        pekerjaan: "Pekerjaan Test",
                        telp: "081234567" + i,
                        istri: "Istri Dummy " + i,
                        anak: ["Anak Dummy A"]
                    });
                }

                // 2. Suntik 5 Pengurus (Pakai ID khusus "TEST-P-")
                let jabatanList = ["Ketua RT Test", "Sekretaris Test", "Bendahara Test", "Keamanan Test", "Humas Test"];
                for(let i = 0; i < 5; i++) {
                    dbPengurus.push({
                        id: "TEST-P-" + Date.now() + i,
                        nama: "Pengurus Dummy " + (i+1),
                        jabatan: jabatanList[i],
                        kategori: "inti",
                        level: i + 1,
                        foto: ""
                    });
                }

                localStorage.setItem('db_warga', JSON.stringify(dbWarga));
                localStorage.setItem('db_pengurus', JSON.stringify(dbPengurus));

                // 3. Refresh Layar & Simpan ke Cloud
                if(typeof loadTabelKKAdmin === 'function') loadTabelKKAdmin();
                if(typeof loadPengurus === 'function') loadPengurus();
                if(typeof loadStrukturPengurus === 'function') loadStrukturPengurus();
                

                Swal.fire('Berhasil!', '55 Data Test telah mengudara di aplikasi.', 'success');
            }
        });
    };

    window.bersihkanDataTest = function() {
        Swal.fire({
            title: 'Sapu Bersih?',
            text: "Hanya data hasil suntikan (Dummy) yang akan dihapus. Data asli warga Bapak 100% aman.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Bersihkan!'
        }).then((result) => {
            if (result.isConfirmed) {
                let dbWarga = JSON.parse(localStorage.getItem('db_warga')) || [];
                let dbPengurus = JSON.parse(localStorage.getItem('db_pengurus')) || [];

                // Cek & saring buang semua data yang berawalan "TEST-"
                let wargaBersih = dbWarga.filter(x => !String(x.id).startsWith("TEST-W-"));
                let pengurusBersih = dbPengurus.filter(x => !String(x.id).startsWith("TEST-P-"));

                localStorage.setItem('db_warga', JSON.stringify(wargaBersih));
                localStorage.setItem('db_pengurus', JSON.stringify(pengurusBersih));

                // Refresh Layar & Timpa Cloud dengan data yang sudah bersih
                if(typeof loadTabelKKAdmin === 'function') loadTabelKKAdmin();
                if(typeof loadPengurus === 'function') loadPengurus();
                if(typeof loadStrukturPengurus === 'function') loadStrukturPengurus();
                

                Toast.fire({icon: 'success', title: 'Aplikasi Kembali Bersih!'});
            }
        });
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
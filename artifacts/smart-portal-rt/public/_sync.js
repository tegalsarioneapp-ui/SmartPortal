// SMART PORTAL RT _sync.js
(function(){
    if(window.GT_SYNC_INSTALLED) return;
    window.GT_SYNC_INSTALLED = true;
    
    var _h = window.location.hostname;
    var API_BASE_URL = (_h === 'localhost' || _h.includes('replit') || _h.includes('127.0.0.1'))
        ? ''
        : 'https://smartportal-production.up.railway.app';
    var API_BASE    = API_BASE_URL + '/api/kv';
    var KEYS_URL    = API_BASE_URL + '/api/kv/keys';
    var SSE_URL     = API_BASE_URL + '/api/kv/stream';
    var AUDIT_URL   = API_BASE_URL + '/api/audit';
    var HEALTH_URL  = API_BASE_URL + '/api/health';
    var POLL_MS        = 8000;
    var POLL_MS_NO_SSE = 2500;
    var DEBOUNCE_MS    = 100;
    var ECHO_GUARD_MS  = 2500;
    var HEALTH_RETRY_MS = 7000;

    var ORIGIN_ID = 'o-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);

    // ─── health state ────────────────────────────────────────────────────────
    // 'unknown' | 'healthy' | 'degraded' | 'offline'
    var healthState = 'unknown';
    var healthRetryTimer = null;

    var LOCAL_ONLY = {
        isLoggedIn: 1, loggedInAs: 1, loggedInWarga: 1,
        gt_theme: 1, gt_notif_read: 1
    };
    function isLocalOnly(k){
        if(!k) return true;
        if(LOCAL_ONLY[k]) return true;
        if(k.indexOf('gt_local_') === 0) return true;
        return false;
    }

    var ls = window.localStorage;
    var origSet    = ls.setItem.bind(ls);
    var origGet    = ls.getItem.bind(ls);
    var origRemove = ls.removeItem.bind(ls);
    var origClear  = ls.clear.bind(ls);

    var serverTime  = null;
    var bootOverlay = null;

    // ─── boot overlay ─────────────────────────────────────────────────────────
    function ensureBootOverlay(){
        if(bootOverlay && bootOverlay.parentNode) return bootOverlay;
        var host = document.body || document.documentElement;
        if(!host) return null;
        var el = document.createElement('div');
        el.id = 'gt_sync_overlay';
        el.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0';
        el.innerHTML = [
            '<div style="text-align:center;padding:32px 24px;max-width:360px">',
            '  <div id="gt_sync_icon" style="font-size:2.4rem;margin-bottom:16px">⏳</div>',
            '  <div id="gt_sync_msg" style="font-size:1rem;color:#e2e8f0;line-height:1.5;margin-bottom:8px">Memuat data dari server...</div>',
            '  <div id="gt_sync_sub" style="font-size:0.78rem;color:#64748b;margin-bottom:20px"></div>',
            '  <button id="gt_sync_retry" style="display:none;padding:10px 28px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.95rem;font-weight:600">',
            '    Coba Lagi',
            '  </button>',
            '</div>'
        ].join('');
        host.appendChild(el);
        bootOverlay = el;
        el.querySelector('#gt_sync_retry').onclick = function(){ bootLoad(); };
        return el;
    }

    function setBootStatus(state, msg, sub){
        var el = ensureBootOverlay();
        if(!el) return;
        var icons = { loading:'⏳', error:'🔴', degraded:'🟡', offline:'📡' };
        el.querySelector('#gt_sync_icon').textContent = icons[state] || '⏳';
        el.querySelector('#gt_sync_msg').textContent  = msg;
        el.querySelector('#gt_sync_sub').textContent  = sub || '';
        el.querySelector('#gt_sync_retry').style.display = (state === 'error' || state === 'offline') ? 'inline-block' : 'none';
    }

    function hideBootOverlay(){
        if(bootOverlay && bootOverlay.parentNode) bootOverlay.parentNode.removeChild(bootOverlay);
        bootOverlay = null;
    }

    // ─── post-boot health banner (non-blocking, dismissible) ─────────────────
    var healthBanner = null;

    function ensureHealthBanner(){
        if(healthBanner && healthBanner.parentNode) return healthBanner;
        var host = document.body || document.documentElement;
        if(!host) return null;
        var el = document.createElement('div');
        el.id = 'gt_health_banner';
        el.style.cssText = [
            'position:fixed;bottom:56px;left:50%;transform:translateX(-50%);',
            'z-index:2147483640;min-width:280px;max-width:480px;width:90%;',
            'padding:10px 16px;border-radius:10px;display:flex;align-items:center;gap:10px;',
            'font-size:0.85rem;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.25);',
            'transition:opacity .3s;'
        ].join('');
        host.appendChild(el);
        healthBanner = el;
        return el;
    }

    function showHealthBanner(type, msg){
        var el = ensureHealthBanner();
        if(!el) return;
        var styles = {
            degraded: { bg:'#7c3aed', icon:'⚠️', color:'#fff' },
            offline:  { bg:'#dc2626', icon:'📡', color:'#fff' }
        };
        var s = styles[type] || styles.degraded;
        el.style.background = s.bg;
        el.style.color       = s.color;
        el.style.display     = 'flex';
        el.innerHTML = [
            '<span style="font-size:1.1rem">' + s.icon + '</span>',
            '<span style="flex:1">' + msg + '</span>',
            '<button onclick="this.parentNode.style.display=\'none\'" ',
            '  style="background:none;border:none;color:inherit;font-size:1.1rem;cursor:pointer;padding:0 4px;opacity:.7">✕</button>'
        ].join('');
    }

    function hideHealthBanner(){
        if(healthBanner) healthBanner.style.display = 'none';
    }

    // ─── health check ─────────────────────────────────────────────────────────
    function checkHealth(duringBoot){
        return fetch(HEALTH_URL, { cache: 'no-store' })
        .then(function(r){
            return r.json().then(function(data){ return { status: r.status, data: data }; });
        })
        .then(function(res){
            var http = res.status;
            var data = res.data || {};
            if(http === 200 && data.status === 'healthy'){
                setHealthState('healthy', duringBoot);
            } else {
                // 503 or status !== 'healthy'
                setHealthState('degraded', duringBoot, data);
            }
        })
        .catch(function(){
            setHealthState('offline', duringBoot);
        });
    }

    function setHealthState(state, duringBoot, healthData){
        var prev = healthState;
        healthState = state;

        if(state === 'healthy'){
            if(duringBoot) return;           // handled by applyBootData
            hideHealthBanner();
            scheduleHealthRetry(false);      // stop aggressive retry
            console.info('[Health] Backend healthy');
        } else if(state === 'degraded'){
            var dbErr = healthData && healthData.db && healthData.db.error ? ' (DB: ' + healthData.db.error + ')' : '';
            if(duringBoot){
                setBootStatus('degraded',
                    'Server sedang bermasalah, coba beberapa saat lagi',
                    'Beberapa fitur mungkin tidak tersedia' + dbErr);
            } else {
                showHealthBanner('degraded', 'Server sedang bermasalah — beberapa fitur mungkin tidak tersedia');
            }
            scheduleHealthRetry(true);
            console.warn('[Health] Backend degraded' + dbErr);
        } else {                              // offline
            if(duringBoot){
                setBootStatus('offline',
                    'Server tidak dapat dihubungi',
                    'Periksa koneksi internet atau coba beberapa saat lagi');
            } else {
                showHealthBanner('offline', 'Server tidak dapat dihubungi — sedang menyambung ulang…');
            }
            scheduleHealthRetry(true);
            console.warn('[Health] Backend offline');
        }

        // Auto-recover: when state goes healthy→ after being degraded/offline, refresh data
        if(prev !== 'healthy' && prev !== 'unknown' && state === 'healthy'){
            pollNow().then(reconcileKeys);
        }
    }

    function scheduleHealthRetry(active){
        if(healthRetryTimer){ clearTimeout(healthRetryTimer); healthRetryTimer = null; }
        if(!active) return;
        healthRetryTimer = setTimeout(function(){
            healthRetryTimer = null;
            checkHealth(false);
        }, HEALTH_RETRY_MS);
    }

    // ─── refreshers ───────────────────────────────────────────────────────────
    function runRefreshers(){
        var names = [
            'loadDashboardWarga','loadTabelKKAdmin','populateDropdownWarga',
            'loadPengaturan','loadProfilPribadiWarga','loadFormArisan',
            'loadMutasi','loadPengurus',
            'loadBeritaAdmin','loadBeritaWarga','loadKegiatan',
            'loadAduanAdmin','loadAduanWarga',
            'loadKasBendahara','loadAnalisaUangMeja','loadMatriksIuran','loadArsipBA',
            'loadKoperasiData','loadKopLaporan',
            'loadDaruratAdmin','loadDaruratWarga','loadSuratAdmin','loadSuratWarga',
            'loadNotulenAdmin','loadIuranPribadiWarga'
        ];
        for(var i=0; i<names.length; i++){
            var fn = window[names[i]];
            if(typeof fn === 'function'){ try{ fn(); }catch(e){} }
        }
    }

    function applyBootData(data, viaAsync){
        serverTime = data.serverTime || new Date().toISOString();
        var entries = data.entries || [];
        var serverKeys = {};
        var i, k;
        for(i=0; i<entries.length; i++){
            if(isLocalOnly(entries[i].key)) continue;
            serverKeys[entries[i].key] = 1;
            if(entries[i].value == null) origRemove(entries[i].key);
            else origSet(entries[i].key, entries[i].value);
        }
        var stale = [];
        for(i=0; i<ls.length; i++){
            k = ls.key(i);
            if(k && !isLocalOnly(k) && !serverKeys[k]) stale.push(k);
        }
        for(i=0; i<stale.length; i++) origRemove(stale[i]);

        window.__GT_SYNC_BOOTED__ = true;
        hideBootOverlay();
        if(viaAsync) runRefreshers();
        console.info('✓ Smart Portal RT terhubung ke PostgreSQL pusat');

        // Run a non-blocking health check now to catch degraded DB state
        checkHealth(false);
    }

    // ─── boot load ────────────────────────────────────────────────────────────
    function bootLoadAsync(){
        // First check health to give a specific error message
        checkHealth(true).then(function(){
            // If health already failed, overlay is already set — don't clobber it
            if(healthState === 'healthy' || healthState === 'unknown'){
                setBootStatus('loading', 'Memuat data dari server...');
            }
            return fetch(API_BASE, { headers: { Accept: 'application/json' }, cache: 'no-store' });
        })
        .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function(data){ applyBootData(data, true); })
        .catch(function(){
            // Health state already set; just ensure retry button visible
            if(healthState === 'offline'){
                setBootStatus('offline',
                    'Server tidak dapat dihubungi',
                    'Periksa koneksi internet atau coba beberapa saat lagi');
            } else {
                setBootStatus('error',
                    'Server sedang bermasalah, coba beberapa saat lagi',
                    'Klik tombol di bawah untuk mencoba kembali');
            }
        });
    }

    function bootLoad(){
        setBootStatus('loading', 'Memuat data dari server...');
        try{
            var xhr = new XMLHttpRequest();
            xhr.open('GET', API_BASE, false);   // synchronous
            xhr.send(null);
            if(xhr.status >= 200 && xhr.status < 300){
                applyBootData(JSON.parse(xhr.responseText), false);
            } else {
                bootLoadAsync();
            }
        }catch(e){
            bootLoadAsync();
        }
    }

    bootLoad();

    // ─── pill / pending state ─────────────────────────────────────────────────
    var pillState = { mode: 'syncing', pending: 0, lastSync: null };
    function setPill(p){ for(var k in p) pillState[k] = p[k]; }

    var pendingWrites  = {};
    var lastLocalWrite = {};
    var flushTimer     = null;
    var flushing       = false;
    var flushResolvers = [];

    function pendingCount(){ var n=0; for(var k in pendingWrites) n++; return n; }

    function notifyFlushResolvers(){
        var r = flushResolvers.slice(); flushResolvers = [];
        for(var i=0; i<r.length; i++){ try{ r[i](); }catch(_){} }
    }

    function queueWrite(key, val){
        pendingWrites[key] = val;
        lastLocalWrite[key] = { value: val, ts: Date.now() };
        if(flushTimer) clearTimeout(flushTimer);
        flushTimer = setTimeout(flush, DEBOUNCE_MS);
    }

    function flush(){
        flushTimer = null;
        if(flushing){ setTimeout(flush, 200); return; }
        var keys = Object.keys(pendingWrites);
        if(!keys.length){ notifyFlushResolvers(); return; }
        var writes = [], deletes = [];
        for(var i=0; i<keys.length; i++){
            var v = pendingWrites[keys[i]];
            if(v === null) deletes.push(keys[i]);
            else           writes.push({ key: keys[i], value: v });
        }
        flushing = true;
        fetch(API_BASE, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ writes: writes, deletes: deletes, originId: ORIGIN_ID })
        })
        .then(function(r){ if(!r.ok) throw new Error(); return r.json(); })
        .then(function(resp){
            if(resp.serverTime) serverTime = resp.serverTime;
            for(var i=0; i<keys.length; i++) delete pendingWrites[keys[i]];
            setPill({ mode: 'online' });
            notifyFlushResolvers();
        })
        .catch(function(){ setPill({ mode: 'offline' }); notifyFlushResolvers(); })
        .finally(function(){ flushing = false; if(pendingCount()) setTimeout(flush, 200); });
    }

    // Kirim pending writes sebelum halaman ditutup/reload menggunakan sendBeacon
    function flushViaBeacon(){
        var keys = Object.keys(pendingWrites);
        if(!keys.length) return;
        var writes = [], deletes = [];
        for(var i=0; i<keys.length; i++){
            var v = pendingWrites[keys[i]];
            if(v === null) deletes.push(keys[i]);
            else           writes.push({ key: keys[i], value: v });
        }
        if(!writes.length && !deletes.length) return;
        var payload = JSON.stringify({ writes: writes, deletes: deletes, originId: ORIGIN_ID });
        if(navigator.sendBeacon){
            navigator.sendBeacon(API_BASE, new Blob([payload], { type: 'application/json' }));
        }
    }

    window.addEventListener('beforeunload', function(){
        if(flushTimer){ clearTimeout(flushTimer); flushTimer = null; }
        flushViaBeacon();
    });

    // ─── localStorage intercept ────────────────────────────────────────────────
    ls.setItem = function(k, v){
        origSet(k, String(v));
        if(!isLocalOnly(k)) queueWrite(k, String(v));
    };
    ls.removeItem = function(k){
        origRemove(k);
        if(!isLocalOnly(k)) queueWrite(k, null);
    };
    ls.clear = function(){
        var toDelete = [];
        for(var i=0; i<ls.length; i++){
            var k = ls.key(i);
            if(k && !isLocalOnly(k)) toDelete.push(k);
        }
        origClear();
        for(var j=0; j<toDelete.length; j++) pendingWrites[toDelete[j]] = null;
        if(toDelete.length){
            if(flushTimer) clearTimeout(flushTimer);
            flushTimer = setTimeout(flush, DEBOUNCE_MS);
        }
    };

    // Flush paksa yang mengembalikan Promise — dipakai oleh logout
    window.GT_FLUSH_NOW = function(){
        if(flushTimer){ clearTimeout(flushTimer); flushTimer = null; }
        if(!pendingCount()) return Promise.resolve();
        return new Promise(function(resolve){
            flushResolvers.push(resolve);
            flush();
        });
    };

    // ─── remote apply ─────────────────────────────────────────────────────────
    function applyRemote(entries){
        var changed = false;
        for(var i=0; i<entries.length; i++){
            var e = entries[i];
            if(isLocalOnly(e.key)) continue;
            var nv = e.value == null ? null : e.value;
            var ov = origGet(e.key);
            if(ov === nv) continue;
            var lw = lastLocalWrite[e.key];
            if(lw && Date.now() - lw.ts < ECHO_GUARD_MS && lw.value === nv) continue;
            if(nv == null) origRemove(e.key); else origSet(e.key, nv);
            changed = true;
        }
        if(changed) runRefreshers();
    }

    function reconcileKeys(){
        return fetch(KEYS_URL)
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(data){
            if(!data || !data.keys) return;
            var map = {};
            for(var i=0; i<data.keys.length; i++) map[data.keys[i]] = 1;
            var del = [];
            for(var i=0; i<ls.length; i++){
                var k = ls.key(i);
                if(k && !isLocalOnly(k) && !map[k]) del.push(k);
            }
            for(var i=0; i<del.length; i++) origRemove(del[i]);
        });
    }

    // ─── polling ──────────────────────────────────────────────────────────────
    var polling   = false;
    function pollNow(){
        if(polling) return Promise.resolve();
        polling = true;
        var url = API_BASE;
        if(serverTime){
            var t = new Date(new Date(serverTime).getTime() - 5000);
            url = API_BASE + '?since=' + encodeURIComponent(t.toISOString());
        }
        return fetch(url, { cache: 'no-store' })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(data){
            if(data && data.serverTime) serverTime = data.serverTime;
            if(data && data.entries)    applyRemote(data.entries);
        })
        .catch(function(){})
        .finally(function(){ polling = false; });
    }

    var pollTimer = null;
    var sseActive = false;
    function startPolling(ms){
        if(pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(pollNow, ms);
    }
    startPolling(POLL_MS_NO_SSE);

    document.addEventListener('visibilitychange', function(){
        if(document.visibilityState === 'visible') pollNow().then(reconcileKeys);
    });
    window.addEventListener('focus',  function(){ pollNow().then(reconcileKeys); });
    window.addEventListener('online', function(){ pollNow().then(reconcileKeys); startSSE(); checkHealth(false); });
    window.addEventListener('offline', function(){
        showHealthBanner('offline', 'Koneksi internet terputus — sedang mencoba menyambung ulang…');
        scheduleHealthRetry(true);
    });

    // ─── SSE ──────────────────────────────────────────────────────────────────
    var es               = null;
    var sseConnecting    = false;
    var sseReconnectTimer = null;
    var sseRetryMs       = 3000;

    function startSSE(){
        if(sseConnecting || es || typeof EventSource === 'undefined') return;
        sseConnecting = true;
        try{
            es = new EventSource(SSE_URL + '?t=' + Date.now());
            es.addEventListener('open', function(){
                sseConnecting = false;
                sseActive     = true;
                startPolling(POLL_MS);
                setPill({ mode: 'online' });
            });
            es.addEventListener('kv', function(ev){
                try{
                    var d = JSON.parse(ev.data || '{}');
                    if(d.originId === ORIGIN_ID) return;
                    if(d.entries) applyRemote(d.entries);
                }catch(e){}
            });
            es.addEventListener('error', function(){
                try{ if(es) es.close(); }catch(_){}
                es = null; sseConnecting = false; sseActive = false;
                startPolling(POLL_MS_NO_SSE);
                if(!sseReconnectTimer){
                    sseReconnectTimer = setTimeout(function(){
                        sseReconnectTimer = null;
                        startSSE();
                    }, sseRetryMs);
                }
            });
        }catch(err){
            sseConnecting = false;
        }
    }

    startSSE();

    // ─── public helpers ───────────────────────────────────────────────────────
    window.GT_SYNC_REFRESH = function(){ return pollNow().then(reconcileKeys); };
    window.GT_SYNC_AUDIT   = function(){ return fetch(AUDIT_URL).then(function(r){ return r.json(); }); };
    window.GT_HEALTH_CHECK = function(){ return checkHealth(false); };

    // Expose current health state for debugging
    Object.defineProperty(window, 'GT_HEALTH_STATE', { get: function(){ return healthState; } });

})();

// SMART PORTAL RT _sync.js
(function(){
    if(window.GT_SYNC_INSTALLED) return;
    window.GT_SYNC_INSTALLED = true;

    var API_BASE_URL = (
        window.location.hostname === 'localhost' ||
        window.location.hostname.includes('replit') ||
        window.location.hostname.includes('127.0.0.1')
    ) ? '' : 'https://smartportal-production.up.railway.app';
    var API_BASE     = API_BASE_URL + '/api/kv';
    var KEYS_URL     = API_BASE_URL + '/api/kv/keys';
    var SSE_URL      = API_BASE_URL + '/api/kv/stream';
    var AUDIT_URL    = API_BASE_URL + '/api/audit';
    var HEALTH_URL   = API_BASE_URL + '/api/health';
    var POLL_MS         = 8000;
    var POLL_MS_NO_SSE  = 2500;
    var DEBOUNCE_MS     = 100;
    var ECHO_GUARD_MS   = 2500;
    var HEALTH_RETRY_MS = 7000;
    var BOOT_TIMEOUT_MS = 3000;   // graceful-boot: max wait before continuing with local data

    var ORIGIN_ID = 'o-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);

    // ─── health state ────────────────────────────────────────────────────────
    // 'unknown' | 'healthy' | 'degraded' | 'offline'
    var healthState      = 'unknown';
    var healthRetryTimer = null;

    var LOCAL_ONLY = {
        isLoggedIn:1, loggedInAs:1, loggedInWarga:1,
        gt_theme:1, gt_notif_read:1
    };
    function isLocalOnly(k){
        if(!k) return true;
        if(LOCAL_ONLY[k]) return true;
        if(k.indexOf('gt_local_') === 0) return true;
        return false;
    }

    var ls         = window.localStorage;
    var origSet    = ls.setItem.bind(ls);
    var origGet    = ls.getItem.bind(ls);
    var origRemove = ls.removeItem.bind(ls);
    var origClear  = ls.clear.bind(ls);

    var serverTime  = null;
    var bootOverlay = null;

    // ─── boot overlay  (NON-BLOCKING: pointer-events:none on container) ───────
    function ensureBootOverlay(){
        if(bootOverlay && bootOverlay.parentNode) return bootOverlay;
        var host = document.body || document.documentElement;
        if(!host) return null;
        var el = document.createElement('div');
        el.id = 'gt_sync_overlay';
        // pointer-events:none → user can still interact with the app behind it.
        // Only the inner button gets pointer-events:auto.
        el.style.cssText = [
            'position:fixed;inset:0;z-index:2147483647;',
            'background:rgba(15,23,42,0.55);',
            'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);',
            'display:flex;flex-direction:column;align-items:center;justify-content:center;',
            'pointer-events:none;',               // ← entire overlay is click-through
            'transition:opacity .35s ease;'
        ].join('');
        el.innerHTML = [
            '<div style="',
                'text-align:center;padding:28px 24px;max-width:340px;',
                'background:#1e293b;border-radius:16px;',
                'box-shadow:0 8px 32px rgba(0,0,0,.4);',
                'pointer-events:none;',            // ← card also click-through …
            '">',
            '  <div id="gt_sync_icon" style="font-size:2rem;margin-bottom:12px">⏳</div>',
            '  <div id="gt_sync_msg"  style="font-size:.95rem;color:#e2e8f0;line-height:1.5;margin-bottom:6px">Menyinkronkan data…</div>',
            '  <div id="gt_sync_sub"  style="font-size:.75rem;color:#64748b;margin-bottom:18px"></div>',
            '  <button id="gt_sync_retry" style="',  // ← …except the button
                'display:none;padding:9px 26px;',
                'background:#3b82f6;color:#fff;border:none;',
                'border-radius:8px;cursor:pointer;font-size:.9rem;font-weight:600;',
                'pointer-events:auto;',
            '">Coba Lagi</button>',
            '</div>'
        ].join('');
        host.appendChild(el);
        bootOverlay = el;
        el.querySelector('#gt_sync_retry').onclick = function(){ bootLoadAsync(true); };
        return el;
    }

    function setBootStatus(state, msg, sub){
        var el = ensureBootOverlay();
        if(!el) return;
        var icons = { loading:'⏳', syncing:'🔄', error:'🔴', degraded:'🟡', offline:'📡' };
        el.querySelector('#gt_sync_icon').textContent = icons[state] || '⏳';
        el.querySelector('#gt_sync_msg').textContent  = msg;
        el.querySelector('#gt_sync_sub').textContent  = sub || '';
        el.querySelector('#gt_sync_retry').style.display =
            (state === 'error' || state === 'offline' || state === 'degraded') ? 'inline-block' : 'none';
    }

    function hideBootOverlay(){
        if(!bootOverlay || !bootOverlay.parentNode) return;
        var el = bootOverlay;
        bootOverlay = null;
        el.style.opacity = '0';
        setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 380);
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
            'font-size:.85rem;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.25);',
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
            degraded:{ bg:'#7c3aed', icon:'⚠️', color:'#fff' },
            offline: { bg:'#dc2626', icon:'📡', color:'#fff' },
            syncing: { bg:'#0369a1', icon:'🔄', color:'#fff' }
        };
        var s = styles[type] || styles.degraded;
        el.style.background = s.bg;
        el.style.color      = s.color;
        el.style.display    = 'flex';
        el.innerHTML = [
            '<span style="font-size:1.1rem">' + s.icon + '</span>',
            '<span style="flex:1">' + msg + '</span>',
            '<button onclick="this.parentNode.style.display=\'none\'"',
            ' style="background:none;border:none;color:inherit;font-size:1.1rem;cursor:pointer;padding:0 4px;opacity:.7">✕</button>'
        ].join('');
    }

    function hideHealthBanner(){
        if(healthBanner) healthBanner.style.display = 'none';
    }

    // ─── health check ─────────────────────────────────────────────────────────
    function checkHealth(postBoot){
        return fetch(HEALTH_URL, { cache:'no-store' })
        .then(function(r){
            return r.json().then(function(d){ return { status:r.status, data:d }; });
        })
        .then(function(res){
            if(res.status === 200 && res.data.status === 'healthy'){
                setHealthState('healthy', postBoot);
            } else {
                setHealthState('degraded', postBoot, res.data);
            }
        })
        .catch(function(){ setHealthState('offline', postBoot); });
    }

    function setHealthState(state, postBoot, healthData){
        var prev  = healthState;
        healthState = state;

        if(state === 'healthy'){
            hideHealthBanner();
            hideBootOverlay();
            scheduleHealthRetry(false);
            console.info('[Health] Backend healthy');
        } else if(state === 'degraded'){
            var dbErr = (healthData && healthData.db && healthData.db.error)
                ? ' (DB: ' + healthData.db.error + ')' : '';
            if(postBoot){
                showHealthBanner('degraded', 'Server sedang bermasalah — beberapa fitur mungkin tidak tersedia');
            } else {
                setBootStatus('degraded',
                    'Server sedang bermasalah, coba beberapa saat lagi',
                    'Beberapa fitur mungkin tidak tersedia' + dbErr);
            }
            scheduleHealthRetry(true);
            console.warn('[Health] Backend degraded' + dbErr);
        } else {  // offline
            if(postBoot){
                showHealthBanner('offline', 'Server tidak dapat dihubungi — sedang menyambung ulang…');
            } else {
                setBootStatus('offline',
                    'Server tidak dapat dihubungi',
                    'Periksa koneksi internet atau coba beberapa saat lagi');
            }
            scheduleHealthRetry(true);
            console.warn('[Health] Backend offline');
        }

        // Auto-recover: backend came back after being down → refresh data
        if(prev !== 'healthy' && prev !== 'unknown' && state === 'healthy'){
            pollNow().then(reconcileKeys);
        }
    }

    function scheduleHealthRetry(active){
        if(healthRetryTimer){ clearTimeout(healthRetryTimer); healthRetryTimer = null; }
        if(!active) return;
        healthRetryTimer = setTimeout(function(){
            healthRetryTimer = null;
            checkHealth(true);   // postBoot=true → use banner, not overlay
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
            'loadNotulenAdmin','loadIuranPribadiWarga',
            'loadAdminDashboard','updateNavBadges'
        ];
        for(var i=0; i<names.length; i++){
            var fn = window[names[i]];
            if(typeof fn === 'function'){ try{ fn(); }catch(e){} }
        }
    }

    // ─── STEP 1: apply localStorage immediately (non-blocking) ───────────────
    // UI renders right away from whatever is cached. Background sync will
    // reconcile and call runRefreshers() when server data arrives.
    function applyLocalBoot(){
        window.__GT_SYNC_BOOTED__ = true;
        // runRefreshers() will be called again after server sync;
        // call it now so session-restore and existing cached data paint immediately.
        runRefreshers();
    }

    // ─── STEP 2: server reconcile (background, with timeout) ─────────────────
    function applyBootData(data){
        serverTime = data.serverTime || new Date().toISOString();
        var entries    = data.entries || [];
        var serverKeys = {};
        var i, k;
        for(i=0; i<entries.length; i++){
            if(isLocalOnly(entries[i].key)) continue;
            serverKeys[entries[i].key] = 1;
            if(entries[i].value == null) origRemove(entries[i].key);
            else origSet(entries[i].key, entries[i].value);
        }
        // Evict stale local keys that were deleted server-side
        var stale = [];
        for(i=0; i<ls.length; i++){
            k = ls.key(i);
            if(k && !isLocalOnly(k) && !serverKeys[k]) stale.push(k);
        }
        for(i=0; i<stale.length; i++) origRemove(stale[i]);

        hideBootOverlay();
        runRefreshers();
        console.info('✓ Smart Portal RT tersinkron dengan PostgreSQL pusat');
        checkHealth(true);   // post-boot health check (banner, not overlay)
    }

    // fetchWithTimeout — wraps fetch with an AbortController deadline
    function fetchWithTimeout(url, opts, ms){
        var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        var timer = ctrl
            ? setTimeout(function(){ ctrl.abort(); }, ms)
            : null;
        var req = fetch(url, ctrl ? Object.assign({}, opts, { signal: ctrl.signal }) : opts);
        return req.finally(function(){ if(timer) clearTimeout(timer); });
    }

    // bootLoadAsync — fully async, non-blocking.
    // retrying=true when triggered from the "Coba Lagi" button.
    function bootLoadAsync(retrying){
        if(!retrying){
            // Show the non-blocking syncing overlay (semi-transparent, click-through)
            setBootStatus('syncing', 'Menyinkronkan data…', 'Anda sudah bisa menggunakan aplikasi');
        } else {
            setBootStatus('loading', 'Mencoba kembali…');
        }

        fetchWithTimeout(
            API_BASE,
            { headers:{ Accept:'application/json' }, cache:'no-store' },
            BOOT_TIMEOUT_MS
        )
        .then(function(r){
            if(r.status === 403 || r.status === 401){
                console.warn('[boot] ' + r.status + ' - lanjut dengan data lokal');
                hideBootOverlay();
                return null;
            }
            if(!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(data){
            applyBootData(data);
        })
        .catch(function(err){
            var timedOut = err && (err.name === 'AbortError' || err.message === 'AbortError');
            if(timedOut){
                // Timeout: continue app with local data, show degraded banner
                console.warn('[Boot] Fetch timed out after ' + BOOT_TIMEOUT_MS + 'ms — continuing with local data');
                hideBootOverlay();
                showHealthBanner('degraded', 'Sinkronisasi lambat — menggunakan data lokal. Mencoba ulang…');
                setHealthState('degraded', true);
            } else {
                // Network failure: run health check for specific message
                checkHealth(false).then(function(){
                    // Health check updated the overlay message — show retry button
                    if(healthState !== 'healthy'){
                        setBootStatus(healthState === 'offline' ? 'offline' : 'degraded',
                            healthState === 'offline'
                                ? 'Server tidak dapat dihubungi'
                                : 'Server sedang bermasalah, coba beberapa saat lagi',
                            'Klik tombol di bawah untuk mencoba kembali');
                    }
                });
            }
        });
    }

    // ─── BOOT SEQUENCE ────────────────────────────────────────────────────────
    // 1. Apply local cache instantly → app is interactive immediately
    // 2. Kick off background sync (non-blocking, 3s timeout)
    applyLocalBoot();
    bootLoadAsync(false);

    // ─── pill / pending state ─────────────────────────────────────────────────
    var pillState = { mode:'syncing', pending:0, lastSync:null };
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
        lastLocalWrite[key] = { value:val, ts:Date.now() };
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
            else           writes.push({ key:keys[i], value:v });
        }
        flushing = true;
        fetch(API_BASE, {
            method:  'PUT',
            headers: { 'Content-Type':'application/json' },
            body:    JSON.stringify({ writes:writes, deletes:deletes, originId:ORIGIN_ID })
        })
        .then(function(r){
            if(r.status === 403 || r.status === 401){
                // Stop semua retry - auth error
                pendingWrites = {};
                setPill({ mode:'online' });
                notifyFlushResolvers();
                flushing = false;
                console.warn('[sync] PUT ' + r.status + ' - writes discarded');
                return null;
            }
            if(!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(resp){
            if(!resp) return;
            if(resp.serverTime) serverTime = resp.serverTime;
            for(var i=0; i<keys.length; i++) delete pendingWrites[keys[i]];
            setPill({ mode:'online' });
            notifyFlushResolvers();
        })
        .catch(function(err){
            console.warn('[sync] PUT error:', err && err.message);
            setPill({ mode:'offline' });
            notifyFlushResolvers();
            // Stop flush loop - server down, jangan spam
            flushing = false;
            pendingWrites = {};
            return;
        })
        .finally(function(){ flushing = false; });
    }

    function flushViaBeacon(){
        var keys = Object.keys(pendingWrites);
        if(!keys.length) return;
        var writes = [], deletes = [];
        for(var i=0; i<keys.length; i++){
            var v = pendingWrites[keys[i]];
            if(v === null) deletes.push(keys[i]);
            else           writes.push({ key:keys[i], value:v });
        }
        if(!writes.length && !deletes.length) return;
        var payload = JSON.stringify({ writes:writes, deletes:deletes, originId:ORIGIN_ID });
        if(navigator.sendBeacon){
            navigator.sendBeacon(API_BASE, new Blob([payload], { type:'application/json' }));
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
    var polling = false;
    function pollNow(){
        if(polling) return Promise.resolve();
        polling = true;
        var url = API_BASE;
        if(serverTime){
            var t = new Date(new Date(serverTime).getTime() - 5000);
            url = API_BASE + '?since=' + encodeURIComponent(t.toISOString());
        }
        return fetch(url, { cache:'no-store' })
        .then(function(r){
            if(r.status === 403 || r.status === 401){
                console.warn('[sync] poll ' + r.status + ' - skip');
                return null;
            }
            return r.ok ? r.json() : null;
        })
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
    window.addEventListener('focus',   function(){ pollNow().then(reconcileKeys); });
    window.addEventListener('online',  function(){ pollNow().then(reconcileKeys); startSSE(); checkHealth(true); });
    window.addEventListener('offline', function(){
        showHealthBanner('offline', 'Koneksi internet terputus — sedang mencoba menyambung ulang…');
        scheduleHealthRetry(true);
    });

    // ─── SSE ──────────────────────────────────────────────────────────────────
    var es                = null;
    var sseConnecting     = false;
    var sseReconnectTimer = null;
    var sseRetryMs        = 3000;

    function startSSE(){
        if(sseConnecting || es || typeof EventSource === 'undefined') return;
        sseConnecting = true;
        try{
            es = new EventSource(SSE_URL + '?t=' + Date.now());
            es.addEventListener('open', function(){
                sseConnecting = false;
                sseActive     = true;
                startPolling(POLL_MS);
                setPill({ mode:'online' });
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
        }catch(err){ sseConnecting = false; }
    }

    startSSE();

    // ─── public helpers ───────────────────────────────────────────────────────
    window.GT_SYNC_REFRESH = function(){ return pollNow().then(reconcileKeys); };
    window.GT_SYNC_AUDIT   = function(){ return fetch(AUDIT_URL).then(function(r){ return r.json(); }); };
    window.GT_HEALTH_CHECK = function(){ return checkHealth(true); };

    Object.defineProperty(window, 'GT_HEALTH_STATE', { get:function(){ return healthState; } });

})();

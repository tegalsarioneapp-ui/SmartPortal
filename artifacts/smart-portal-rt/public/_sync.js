// SMART PORTAL RT _sync.js
(function(){
    if(window.GT_SYNC_INSTALLED) return;
    window.GT_SYNC_INSTALLED = true;
    
    const API_BASE_URL = window.__VITE_API_URL__ || "https://smartportal-production.up.railway.app";
    var API_BASE = API_BASE_URL + '/api/kv';
    var KEYS_URL = API_BASE_URL + '/api/kv/keys';
    var SSE_URL = API_BASE_URL + '/api/kv/stream';
    var AUDIT_URL = API_BASE_URL + '/api/audit';
    var POLL_MS = 8000;
    var POLL_MS_NO_SSE = 2500;
    var DEBOUNCE_MS = 100;
    var ECHO_GUARD_MS = 2500;
    
    var ORIGIN_ID = 'o-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
    
    var LOCAL_ONLY = {
        isLoggedIn: 1,
        loggedInAs: 1,
        loggedInWarga: 1,
        gt_theme: 1,
        gt_notif_read: 1
    };
    
    function isLocalOnly(k){
        if(!k) return true;
        if(LOCAL_ONLY[k]) return true;
        if(k.indexOf('gt_local_') === 0) return true;
        return false;
    }
    
    var ls = window.localStorage;
    var origSet = ls.setItem.bind(ls);
    var origGet = ls.getItem.bind(ls);
    var origRemove = ls.removeItem.bind(ls);
    var origClear = ls.clear.bind(ls);
    
    var serverTime = null;
    var bootOverlay = null;
    
    function ensureBootOverlay(){
        if(bootOverlay && bootOverlay.parentNode) return bootOverlay;
        var host = document.body || document.documentElement;
        if(!host) return null;
        var el = document.createElement('div');
        el.id = 'gt_sync_overlay';
        el.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;align-items:center;justify-content:center';
        el.innerHTML = '<div style="text-align:center"><div id="gt_sync_msg" style="font-size:1.1rem;margin-bottom:12px">Memuat data dari server...</div><button id="gt_sync_retry" style="display:none;padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1rem">Coba lagi</button></div>';
        host.appendChild(el);
        bootOverlay = el;
        el.querySelector('#gt_sync_retry').onclick = function(){ bootLoad(); };
        return el;
    }
    
    function setBootStatus(state, msg){
        var el = ensureBootOverlay();
        if(!el) return;
        el.querySelector('#gt_sync_msg').textContent = msg;
        el.querySelector('#gt_sync_retry').style.display = state === 'error' ? 'inline-block' : 'none';
    }
    
    function hideBootOverlay(){
        if(bootOverlay && bootOverlay.parentNode) bootOverlay.parentNode.removeChild(bootOverlay);
        bootOverlay = null;
    }
    
    function runRefreshers(){
        var names = [
            'loadDashboardWarga','loadTabelKKAdmin','populateDropdownWarga',
            'loadPengaturan',
            'loadProfilPribadiWarga','loadFormArisan',
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
        
        window.GT_SYNC_BOOTED = true;
        hideBootOverlay();
        if(viaAsync) runRefreshers();
        console.info('✓ Smart Portal RT terhubung ke PostgreSQL pusat');
    }
    
    function bootLoadAsync(){
        fetch(API_BASE, {headers:{Accept:'application/json'}, cache:'no-store'})
        .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
        .then(function(data){ applyBootData(data, true); })
        .catch(function(){ setBootStatus('error','Tidak bisa menghubungi server. Periksa koneksi internet.'); });
    }
    
    function bootLoad(){
        ensureBootOverlay();
        try{
            var xhr = new XMLHttpRequest();
            xhr.open('GET', API_BASE, false);
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
    
    var pillState = {mode:'syncing', pending:0, lastSync:null};
    function setPill(p){ for(var k in p) pillState[k] = p[k]; }
    
    var pendingWrites = {};
    var lastLocalWrite = {};
    var flushTimer = null;
    var flushing = false;
    var flushResolvers = [];
    
    function pendingCount(){ var n=0; for(var k in pendingWrites) n++; return n; }
    
    function notifyFlushResolvers(){
        var r = flushResolvers.slice();
        flushResolvers = [];
        for(var i=0; i<r.length; i++){ try{ r[i](); }catch(_){} }
    }
    
    function queueWrite(key, val){
        pendingWrites[key] = val;
        lastLocalWrite[key] = {value:val, ts:Date.now()};
        if(flushTimer) clearTimeout(flushTimer);
        flushTimer = setTimeout(flush, DEBOUNCE_MS);
    }
    
    function flush(){
        flushTimer = null;
        if(flushing){
            setTimeout(flush, 200);
            return;
        }
        var keys = Object.keys(pendingWrites);
        if(!keys.length){
            notifyFlushResolvers();
            return;
        }
        var writes = [];
        var deletes = [];
        
        for(var i=0; i<keys.length; i++){
            var v = pendingWrites[keys[i]];
            if(v === null){
                deletes.push(keys[i]);
            } else {
                writes.push({key: keys[i], value: v});
            }
        }
        
        flushing = true;
        fetch(API_BASE, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({writes: writes, deletes: deletes, originId: ORIGIN_ID})
        })
        .then(function(r){ if(!r.ok) throw new Error(); return r.json(); })
        .then(function(resp){
            if(resp.serverTime) serverTime = resp.serverTime;
            for(var i=0; i<keys.length; i++) delete pendingWrites[keys[i]];
            setPill({mode:'online'});
            notifyFlushResolvers();
        })
        .catch(function(){ setPill({mode:'offline'}); notifyFlushResolvers(); })
        .finally(function(){ flushing = false; if(pendingCount()) setTimeout(flush, 200); });
    }

    // Kirim pending writes sebelum halaman ditutup/reload menggunakan sendBeacon
    // Ini mencegah kehilangan data saat logout (location.reload())
    function flushViaBeacon(){
        var keys = Object.keys(pendingWrites);
        if(!keys.length) return;
        var writes = [];
        var deletes = [];
        for(var i=0; i<keys.length; i++){
            var v = pendingWrites[keys[i]];
            if(v === null){ deletes.push(keys[i]); }
            else { writes.push({key: keys[i], value: v}); }
        }
        if(!writes.length && !deletes.length) return;
        var payload = JSON.stringify({writes: writes, deletes: deletes, originId: ORIGIN_ID});
        if(navigator.sendBeacon){
            navigator.sendBeacon(API_BASE, new Blob([payload], {type:'application/json'}));
        }
    }

    window.addEventListener('beforeunload', function(){
        if(flushTimer){ clearTimeout(flushTimer); flushTimer = null; }
        flushViaBeacon();
    });
    
    ls.setItem = function(k, v){
        origSet(k, String(v));
        if(!isLocalOnly(k)) queueWrite(k, String(v));
    };
    ls.removeItem = function(k){
        origRemove(k);
        if(!isLocalOnly(k)) queueWrite(k, null);
    };
    ls.clear = function(){
        // Kumpulkan semua key yang perlu dihapus dari server sebelum clear
        var toDelete = [];
        for(var i=0; i<ls.length; i++){
            var k = ls.key(i);
            if(k && !isLocalOnly(k)) toDelete.push(k);
        }
        origClear();
        // Queue semua delete ke server
        for(var j=0; j<toDelete.length; j++){
            pendingWrites[toDelete[j]] = null;
        }
        if(toDelete.length){
            if(flushTimer) clearTimeout(flushTimer);
            flushTimer = setTimeout(flush, DEBOUNCE_MS);
        }
    };

    // Fungsi flush paksa yang mengembalikan Promise
    // Dipakai oleh logout agar data terkirim dulu sebelum reload
    window.GT_FLUSH_NOW = function(){
        if(flushTimer){ clearTimeout(flushTimer); flushTimer = null; }
        if(!pendingCount()) return Promise.resolve();
        return new Promise(function(resolve){
            flushResolvers.push(resolve);
            flush();
        });
    };
    
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
    
    var polling = false;
    function pollNow(){
        if(polling) return Promise.resolve();
        polling = true;
        var url = API_BASE;
        if(serverTime){
            var t = new Date(new Date(serverTime).getTime() - 5000);
            url = API_BASE + '?since=' + encodeURIComponent(t.toISOString());
        }
        return fetch(url, {cache:'no-store'})
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(data){
            if(data && data.serverTime) serverTime = data.serverTime;
            if(data && data.entries) applyRemote(data.entries);
        })
        .catch(function(){ })
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
    window.addEventListener('focus', function(){ pollNow().then(reconcileKeys); });
    window.addEventListener('online', function(){ pollNow().then(reconcileKeys); startSSE(); });

    var es = null;
    var sseConnecting = false;
    var sseReconnectTimer = null;
    var sseRetryMs = 3000;

    function startSSE(){
        if(sseConnecting || es || typeof EventSource === 'undefined') return;
        sseConnecting = true;
        try{
            es = new EventSource(SSE_URL + '?t=' + Date.now());
            es.addEventListener('open', function(){
                sseConnecting = false;
                sseActive = true;
                startPolling(POLL_MS);
                setPill({mode:'online'});
            });
            es.addEventListener('kv', function(ev){
                try{
                    var d = JSON.parse(ev.data || '{}');
                    if(d.originId === ORIGIN_ID) return;
                    if(d.entries) applyRemote(d.entries);
                }catch(e){}
            });
            es.addEventListener('error', function(){
                try{ if(es) es.close(); }catch(_){ }
                es = null;
                sseConnecting = false;
                sseActive = false;
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
    
    window.GT_SYNC_REFRESH = function(){ return pollNow().then(reconcileKeys); };
    window.GT_SYNC_AUDIT = function(){ return fetch(AUDIT_URL).then(function(r){ return r.json(); }); };

})();

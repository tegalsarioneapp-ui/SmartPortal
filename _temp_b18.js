
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

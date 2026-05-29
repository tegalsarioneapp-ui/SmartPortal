import re

FILE = "artifacts/smart-portal-rt/index.html"
with open(FILE, "r", encoding="utf-8") as f:
    html = f.read()

# STEP 1: Hapus semua sidebar script/style lama
OLD_IDS = [
    "gt-mobile-sidebar-fix-style",
    "gt-mobile-sidebar-fix-script",
    "gt-mobile-chatgpt-sidebar-style",
    "gt-mobile-chatgpt-sidebar-script",
    "gt-portal-sidebar-menu-style",
    "gt-portal-sidebar-menu-script",
    "gt-mobile-sidebar-final-style",
    "gt-mobile-sidebar-final-script",
    "gt-sidebar-click-final-style",
    "gt-sidebar-click-final-script",
    "gt-smartportal-sidebar-style",
    "gt-smartportal-sidebar-script",
]
removed = 0
for id_ in OLD_IDS:
    pattern = rf"<(style|script)[^>]*id=\"{re.escape(id_)}\"[^>]*>.*?</\1>"
    new_html, count = re.subn(pattern, "", html, flags=re.DOTALL)
    if count:
        print(f"Removed: {id_}")
        html = new_html
        removed += count
    else:
        print(f"Not found: {id_}")

# Hapus DOM sidebar lama
dom_patterns = [
    r'<div id="gt-sp-overlay"[^>]*>.*?</div>',
    r'<div id="gt-sp-drawer"[^>]*>.*?</div>',
    r'<button id="gt-sp-hamburger"[^>]*>.*?</button>',
    r'<!-- GT SMARTPORTAL MOBILE SIDEBAR.*?-->',
    r'<!-- DRAWER HTML -->',
    r'<!-- HAMBURGER BUTTON -->',
]
for pat in dom_patterns:
    new_html, count = re.subn(pat, "", html, flags=re.DOTALL)
    if count:
        print(f"Removed DOM: {pat[:40]}")
        html = new_html

print(f"Cleanup selesai. Total removed: {removed}\n")

# STEP 2: Buat konten inject
INJECT = r"""
<style id="gt-smartportal-sidebar-style">
#gt-sp-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9998;backdrop-filter:blur(2px)}
#gt-sp-overlay.open{display:block}
#gt-sp-drawer{position:fixed;top:0;left:0;bottom:0;width:280px;max-width:85vw;background:#111827;z-index:9999;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform 0.3s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,0.4);padding-bottom:env(safe-area-inset-bottom,0px)}
#gt-sp-drawer.open{transform:translateX(0)}
#gt-sp-drawer .sp-head{display:flex;align-items:center;justify-content:space-between;padding:18px 16px 14px;border-bottom:1px solid #1f2937}
#gt-sp-drawer .sp-title{color:#f9fafb;font-size:1rem;font-weight:700}
#gt-sp-drawer .sp-role{font-size:0.72rem;color:#6b7280;margin-top:2px}
#gt-sp-drawer .sp-close{background:#1f2937;border:none;color:#9ca3af;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center}
#gt-sp-drawer .sp-close:hover{background:#374151;color:#f9fafb}
#gt-sp-drawer .sp-list{flex:1;overflow-y:auto;padding:10px}
#gt-sp-drawer .sp-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;color:#d1d5db;font-size:0.92rem;font-weight:500;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;transition:background 0.15s,color 0.15s;margin-bottom:2px}
#gt-sp-drawer .sp-item:hover{background:#1f2937;color:#f9fafb}
#gt-sp-drawer .sp-item.active{background:#1d4ed8;color:#fff}
#gt-sp-drawer .sp-item i{width:20px;text-align:center;font-size:0.95rem;flex-shrink:0}
#gt-sp-drawer .sp-section-label{font-size:0.68rem;color:#4b5563;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:8px 14px 4px}
#gt-sp-drawer .sp-divider{height:1px;background:#1f2937;margin:8px 4px}
#gt-sp-drawer .sp-footer{padding:12px 16px;border-top:1px solid #1f2937;font-size:0.75rem;color:#4b5563;text-align:center}
#gt-sp-hamburger{display:none;position:fixed;top:12px;left:12px;z-index:9997;background:#1d4ed8;color:#fff;border:none;border-radius:10px;width:40px;height:40px;font-size:1.1rem;cursor:pointer;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
#gt-sp-hamburger:hover{background:#1e40af}
@media(max-width:768px){#gt-sp-hamburger{display:flex}}
</style>

<div id="gt-sp-overlay" onclick="gtSpClose()"></div>
<div id="gt-sp-drawer">
  <div class="sp-head">
    <div>
      <div class="sp-title" id="gt-sp-title">SmartPortal RT</div>
      <div class="sp-role" id="gt-sp-role">Menu</div>
    </div>
    <button class="sp-close" onclick="gtSpClose()"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <div class="sp-list" id="gt-sp-list"></div>
  <div class="sp-footer">SmartPortal RT &copy; 2025</div>
</div>
<button id="gt-sp-hamburger" onclick="gtSpOpen()"><i class="fa-solid fa-bars"></i></button>

<script id="gt-smartportal-sidebar-script">
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
</script>
"""

# STEP 3: Inject sebelum </body>
if "</body>" in html:
    html = html.replace("</body>", INJECT + "\n</body>", 1)
    print("Injected before </body>")
else:
    html = html + INJECT
    print("Appended to end of file")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("\nDone! File saved.")
print("Buka browser dan test mobile sidebar.")

import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { icon: "🏠", label: "Beranda",       id: "beranda" },
  { icon: "📢", label: "Pengumuman",    id: "pengumuman" },
  { icon: "💰", label: "Iuran",         id: "iuran" },
  { icon: "📝", label: "Layanan Surat", id: "surat" },
  { icon: "📋", label: "Aduan",         id: "aduan" },
  { icon: "🏪", label: "Koperasi",      id: "koperasi" },
  { icon: "🚨", label: "Darurat",       id: "darurat" },
];

const ANNOUNCEMENTS = [
  { id: 1, title: "Kerja Bakti Minggu Depan", date: "28 Mei 2026", body: "Seluruh warga RT 005 diharapkan hadir kerja bakti pada hari Minggu, 2 Juni 2026 pukul 07.00 WIB.", author: "Ketua RT" },
  { id: 2, title: "Pembayaran Iuran Bulan Juni", date: "25 Mei 2026", body: "Iuran bulanan Juni sudah dapat dibayarkan mulai 1 Juni 2026. Harap tepat waktu.", author: "Bendahara RT" },
  { id: 3, title: "Posyandu Balita", date: "20 Mei 2026", body: "Kegiatan Posyandu Balita akan diadakan pada 5 Juni 2026 di balai RT.", author: "Kader Posyandu" },
];

export default function PortalWargaPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setSidebarOpen(false);
  };

  const activeItem = NAV_ITEMS.find(i => i.id === activeNav);

  return (
    <div className="min-h-screen bg-gray-100">

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* MOBILE DRAWER */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">RT</div>
            <div>
              <div className="text-blue-700 font-bold text-sm">Portal Warga</div>
              <div className="text-gray-500 text-xs">RT 005 Tegalsari</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0] ?? "W"}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
          </div>
        </div>

        <nav className="px-3 py-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${activeNav === item.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {activeNav === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 px-4 py-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium py-2 px-3 rounded-lg hover:bg-red-50 transition-colors">
            <span>🚪</span> Keluar dari Portal
          </button>
        </div>
      </aside>

      {/* TOP NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm h-14 flex items-center px-4 gap-2 border-b-2 border-blue-500">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-1" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1"/><rect y="9" width="20" height="2" rx="1"/><rect y="15" width="20" height="2" rx="1"/>
          </svg>
        </button>

        <div className="flex items-center gap-2 min-w-0 lg:min-w-[200px]">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">RT</div>
          <div className="hidden sm:block">
            <div className="text-blue-700 font-bold text-sm">Portal Warga</div>
            <div className="text-gray-500 text-xs">RT 005 Tegalsari</div>
          </div>
        </div>

        <div className="hidden md:block ml-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">🏠 Mode Warga</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold" title={user?.name}>
            {user?.name?.[0] ?? "W"}
          </div>
          <button onClick={handleLogout} className="hidden sm:block text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            Keluar
          </button>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col fixed top-14 left-0 w-56 h-[calc(100vh-56px)] bg-white border-r border-gray-200 py-4 px-2 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer mb-2">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0] ?? "W"}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
          </div>
        </div>

        <div className="border-t border-gray-200 mb-2" />

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${activeNav === item.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <span className="text-xl w-7 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {activeNav === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        ))}

        <div className="border-t border-gray-200 mt-auto pt-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <span>🚪</span> Keluar
          </button>
          <p className="text-xs text-gray-400 px-2 mt-2">© 2026 Smart Portal RT 005</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-56 pt-14 min-h-screen">
        <div className="p-4 md:p-6 max-w-2xl">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">{activeItem?.icon} {activeItem?.label ?? "Beranda"}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Selamat datang, {user?.name}</p>
          </div>

          {activeNav === "beranda" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h2 className="font-semibold text-gray-800 mb-3 text-sm">Pengumuman Terbaru</h2>
                {ANNOUNCEMENTS.map((ann) => (
                  <div key={ann.id} className="border-b border-gray-50 last:border-0 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 text-sm">{ann.title}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">{ann.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{ann.body}</p>
                    <p className="text-xs text-blue-500 mt-1">by {ann.author}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "💰", label: "Bayar Iuran",    id: "iuran",   color: "bg-green-50 text-green-700 border-green-100" },
                  { icon: "📝", label: "Ajukan Surat",   id: "surat",   color: "bg-blue-50 text-blue-700 border-blue-100" },
                  { icon: "📋", label: "Kirim Aduan",    id: "aduan",   color: "bg-orange-50 text-orange-700 border-orange-100" },
                  { icon: "🚨", label: "Kontak Darurat", id: "darurat", color: "bg-red-50 text-red-700 border-red-100" },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleNavClick(action.id)}
                    className={"w-full flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors hover:opacity-80 " + action.color}
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeNav !== "beranda" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-5xl mb-3">{activeItem?.icon}</div>
              <h2 className="text-lg font-semibold text-gray-700">{activeItem?.label}</h2>
              <p className="text-sm text-gray-400 mt-1">Halaman ini sedang dalam pengembangan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

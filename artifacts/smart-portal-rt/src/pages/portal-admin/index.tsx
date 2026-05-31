import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const ADMIN_NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", id: "dashboard" },
  { icon: "👥", label: "Data Warga", id: "warga" },
  { icon: "💰", label: "Keuangan RT", id: "keuangan" },
  { icon: "📢", label: "Pengumuman", id: "pengumuman" },
  { icon: "📋", label: "Aduan Masuk", id: "aduan" },
  { icon: "📝", label: "Layanan Surat", id: "surat" },
  { icon: "🏛️", label: "Struktur RT", id: "struktur" },
  { icon: "⚙️", label: "Pengaturan", id: "settings" },
];

const STATS = [
  { label: "Total Warga", value: "142 Jiwa", icon: "👥", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total KK", value: "38 KK", icon: "🏠", color: "text-green-600", bg: "bg-green-50" },
  { label: "Saldo Kas", value: "Rp 4.250.000", icon: "💰", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Aduan Pending", value: "3", icon: "📋", color: "text-orange-600", bg: "bg-orange-50" },
];

const RECENT_ACTIVITIES = [
  { time: "09:15", action: "Surat keterangan domisili diajukan oleh Budi Santoso", type: "surat" },
  { time: "08:40", action: "Aduan lampu jalan gang 3 dari Pak Bambang", type: "aduan" },
  { time: "07:30", action: "Iuran bulan Mei diterima dari 5 KK", type: "iuran" },
  { time: "Kemarin", action: "Pengumuman kerja bakti dipublikasikan", type: "pengumuman" },
];

export default function PortalAdminPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE DRAWER SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              RT
            </div>
            <div>
              <div className="text-indigo-700 font-bold text-sm leading-tight">Admin Portal</div>
              <div className="text-gray-500 text-xs leading-tight">RT 005 Tegalsari</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Tutup sidebar"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0] ?? "A"}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
            <div className="text-xs text-indigo-500 font-medium">Administrator</div>
          </div>
        </div>

        <nav className="px-3 py-3">
          {ADMIN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                activeNav === item.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 px-4 py-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* ── TOP NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm h-14 flex items-center px-4 gap-2 border-b-2 border-indigo-600">
        {/* Hamburger (mobile) */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-1"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1" />
            <rect y="9" width="20" height="2" rx="1" />
            <rect y="15" width="20" height="2" rx="1" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0 lg:min-w-[200px]">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            RT
          </div>
          <div className="hidden sm:block">
            <div className="text-indigo-700 font-bold text-sm leading-tight">Admin Portal</div>
            <div className="text-gray-500 text-xs leading-tight">RT 005 Tegalsari</div>
          </div>
        </div>

        {/* Badge */}
        <div className="hidden md:block ml-2">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
            🔑 Mode Admin
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base hover:bg-gray-200">
            🔔
          </button>
          <div
            className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
            title={user?.name}
          >
            {user?.name?.[0] ?? "A"}
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:block text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="pt-14 flex max-w-[1200px] mx-auto">

        {/* ── LEFT SIDEBAR (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-3 pb-6 px-2 bg-white border-r border-gray-200">
          {/* User */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer mb-2">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0] ?? "A"}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
              <div className="text-xs text-indigo-500 font-medium">Administrator</div>
            </div>
          </div>

          <div className="border-t border-gray-200 mb-2" />

          {ADMIN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                activeNav === item.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {activeNav === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </button>


          <div className="mt-auto border-t border-gray-200 pt-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>🚪</span> Keluar
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 pt-6 pb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Selamat datang, {user?.name}. Kelola RT 005 Tegalsari.</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STATS.map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className="text-3xl">{stat.icon}</div>
                <div>
                  <div className={`font-bold text-lg ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Iuran progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">💰 Progres Iuran Mei 2026</h2>
              <span className="text-sm text-green-600 font-semibold">48%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: "48%" }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Terkumpul: <b className="text-green-600">Rp 1.200.000</b></span>
              <span>Target: Rp 2.500.000</span>
            </div>
          </div>

          {/* Recent activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-3">🕒 Aktivitas Terkini</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 text-xs whitespace-nowrap pt-0.5 w-14 flex-shrink-0">
                    {activity.time}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{activity.action}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
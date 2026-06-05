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

  const activeItem = ADMIN_NAV_ITEMS.find(i => i.id === activeNav);

  return (
    <div className="min-h-screen bg-gray-100">

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* MOBILE DRAWER */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">RT</div>
            <div>
              <div className="text-indigo-700 font-bold text-sm">Admin Portal</div>
              <div className="text-gray-500 text-xs">RT 005 Tegalsari</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${activeNav === item.id ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {activeNav === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
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
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm h-14 flex items-center px-4 gap-2 border-b-2 border-indigo-600">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-1" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1"/><rect y="9" width="20" height="2" rx="1"/><rect y="15" width="20" height="2" rx="1"/>
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">RT</div>
          <div className="hidden sm:block">
            <div className="text-indigo-700 font-bold text-sm">Admin Portal</div>
            <div className="text-gray-500 text-xs">RT 005 Tegalsari</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.[0] ?? "A"}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors">
            <span>🚪</span>
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-56 bg-white border-r border-gray-200 shadow-sm z-20">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0] ?? "A"}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
            <div className="text-xs text-indigo-500 font-medium">Administrator</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${activeNav === item.id ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {activeNav === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </button>
          ))}
        </nav>

        {/* DESKTOP SIDEBAR LOGOUT - fix: onClick terpasang */}
        <div className="border-t border-gray-200 px-3 py-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium py-2 px-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Keluar dari Portal
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-56 pt-14 min-h-screen">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              {activeItem?.icon} {activeItem?.label ?? "Dashboard"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Portal Admin RT 005 Tegalsari</p>
          </div>

          {activeNav === "dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {STATS.map((s) => (
                  <div key={s.label} className={s.bg + " rounded-xl p-4 border border-white shadow-sm"}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className={"text-xl font-bold " + s.color}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h2 className="font-semibold text-gray-800 mb-3 text-sm">Aktivitas Terkini</h2>
                <div className="space-y-3">
                  {RECENT_ACTIVITIES.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-gray-400 text-xs w-14 flex-shrink-0 pt-0.5">{act.time}</span>
                      <span className="text-gray-700">{act.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeNav !== "dashboard" && (
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

import { useState } from "react";

const NAV_ITEMS = [
  { icon: "🏠", label: "Beranda", active: true },
  { icon: "👨‍👩‍👧", label: "Data Keluarga" },
  { icon: "🏛️", label: "Struktur RT" },
  { icon: "💰", label: "Status Iuran" },
  { icon: "🐷", label: "Koperasi RT" },
  { icon: "📝", label: "Layanan Surat" },
  { icon: "📢", label: "Lapor Pak RT" },
  { icon: "🚨", label: "Kontak Darurat" },
];

const POSTS = [
  {
    id: 1,
    author: "RT 005 Tegalsari",
    avatar: "🏘️",
    role: "Admin RT",
    time: "2 jam lalu",
    type: "pengumuman",
    badge: "📢 Pengumuman",
    badgeColor: "bg-blue-100 text-blue-700",
    content: "Diberitahukan kepada seluruh warga RT 005 Tegalsari bahwa akan diadakan kerja bakti pada hari Minggu, 25 Mei 2026 pukul 07.00 WIB. Mohon kehadiran seluruh warga.",
    image: null,
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    author: "Bendahara RT",
    avatar: "💼",
    role: "Bendahara",
    time: "5 jam lalu",
    type: "iuran",
    badge: "💰 Keuangan",
    badgeColor: "bg-green-100 text-green-700",
    content: "Reminder iuran RT bulan Mei 2026 sudah dapat dibayarkan. Total iuran terkumpul bulan ini: Rp 1.200.000 dari target Rp 2.500.000 (48%). Bagi yang belum membayar mohon segera konfirmasi ke bendahara.",
    image: null,
    likes: 15,
    comments: 3,
  },
  {
    id: 3,
    author: "RT 005 Tegalsari",
    avatar: "🏘️",
    role: "Admin RT",
    time: "1 hari lalu",
    type: "berita",
    badge: "📰 Berita",
    badgeColor: "bg-yellow-100 text-yellow-700",
    content: "Selamat kepada Ibu Sari Wulandari (No. 12) yang telah melahirkan bayi perempuan dengan sehat. Semoga ibu dan bayi selalu sehat. 🍼👶",
    image: null,
    likes: 42,
    comments: 12,
  },
  {
    id: 4,
    author: "Pak Bambang",
    avatar: "👴",
    role: "Warga No. 7",
    time: "2 hari lalu",
    type: "aduan",
    badge: "🔔 Aduan Warga",
    badgeColor: "bg-red-100 text-red-700",
    content: "Pak RT, lampu jalan di depan gang 3 sudah mati sejak 3 hari yang lalu. Mohon segera ditindaklanjuti untuk keamanan warga terutama malam hari.",
    image: null,
    likes: 18,
    comments: 5,
  },
];

const QUICK_STATS = [
  { label: "Saldo Kas RT", value: "Rp 4.250.000", icon: "💰", color: "text-green-600" },
  { label: "Total KK", value: "38 KK", icon: "🏠", color: "text-blue-600" },
  { label: "Warga Aktif", value: "142 Jiwa", icon: "👥", color: "text-purple-600" },
  { label: "Aduan Pending", value: "3 Aduan", icon: "📋", color: "text-orange-600" },
];

const PENGURUS = [
  { jabatan: "Ketua RT", nama: "Bapak Hendra S.", icon: "👨‍💼" },
  { jabatan: "Sekretaris", nama: "Ibu Dewi R.", icon: "📋" },
  { jabatan: "Bendahara", nama: "Bapak Agus W.", icon: "💼" },
];

function PostCard({ post }: { post: typeof POSTS[0] }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
            {post.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{post.author}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.badgeColor}`}>{post.badge}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{post.role}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{post.time}</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">···</button>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
      </div>
      <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-1">
        <span className="text-xs text-gray-400">
          {liked ? "❤️" : "👍"} {post.likes + (liked ? 1 : 0)} · 💬 {post.comments} komentar
        </span>
      </div>
      <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${liked ? "text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
        >
          {liked ? "❤️ Disukai" : "👍 Suka"}
        </button>
        <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          💬 Komentar
        </button>
      </div>
    </div>
  );
}

export function PortalWarga() {
  const [activeNav, setActiveNav] = useState("Beranda");

  return (
    <div className="min-h-screen bg-gray-100 font-sans" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── TOP NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-14 flex items-center px-4 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-[220px]">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            RT
          </div>
          <div>
            <div className="text-blue-700 font-bold text-sm leading-tight">Smart Portal</div>
            <div className="text-gray-500 text-xs leading-tight">RT 005 Tegalsari</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs mx-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pengumuman, berita..."
              className="w-full bg-gray-100 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          </div>
        </div>

        {/* Nav icons */}
        <div className="flex-1 hidden md:flex items-center justify-center gap-1">
          {["🏠", "📰", "💰", "📝"].map((icon, i) => (
            <button key={i} className={`px-6 py-3 rounded-lg text-xl transition-colors ${i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-100"}`}>
              {icon}
            </button>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base hover:bg-gray-200">🔔</button>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base hover:bg-gray-200">💬</button>
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer">A</div>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="pt-14 flex max-w-[1200px] mx-auto">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-3 pb-6 px-2">
          {/* User card */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200 cursor-pointer mb-1">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Ahmad Suherman</div>
              <div className="text-xs text-gray-400">No. Rumah 14</div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-2" />

          {/* Nav items */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                activeNav === item.label ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {activeNav === item.label && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>
          ))}

          <div className="border-t border-gray-200 my-3" />
          <p className="text-xs text-gray-400 px-2">© 2026 Smart Portal RT 005 · Indo Duta Tech</p>
        </aside>

        {/* ── CENTER FEED ── */}
        <main className="flex-1 min-w-0 px-4 pt-4 max-w-[600px] mx-auto lg:mx-0">

          {/* Story / quick actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
              <button className="flex-1 text-left bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400 hover:bg-gray-200 transition-colors">
                Buat laporan atau pertanyaan...
              </button>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-2 grid grid-cols-3 gap-1">
              <button className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <span>📢</span> Pengumuman
              </button>
              <button className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <span>🔔</span> Lapor Aduan
              </button>
              <button className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <span>📝</span> Minta Surat
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-600">Feed Komunitas</span>
            <div className="flex gap-1 ml-auto">
              {["Semua", "Pengumuman", "Iuran", "Berita"].map((f) => (
                <button key={f} className={`text-xs px-3 py-1 rounded-full font-medium ${f === "Semua" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          {POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="hidden xl:block w-[320px] flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-4 pb-6 px-3">

          {/* Quick stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">📊 Rekap RT 005</h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_STATS.map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className={`font-bold text-sm ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Iuran progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">💰 Iuran Mei 2026</h3>
              <span className="text-xs text-blue-600 font-medium">48%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "48%" }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Terkumpul: <b className="text-green-600">Rp 1.200.000</b></span>
              <span>Target: Rp 2.500.000</span>
            </div>
            <button className="mt-3 w-full bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors">
              ✅ Status Iuran Saya
            </button>
          </div>

          {/* Arisan info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">🎲 Arisan Bulan Ini</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">🏆</div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Ibu Ratna S.</div>
                <div className="text-xs text-gray-400">No. 22 · Minggu, 18 Mei 2026</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 bg-yellow-50 rounded-lg px-3 py-2">
              🏠 Host berikutnya: <b>Pak Joko (No. 5)</b> · 15 Juni 2026
            </div>
          </div>

          {/* Pengurus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">👥 Pengurus RT 005</h3>
            {PENGURUS.map((p) => (
              <div key={p.jabatan} className="flex items-center gap-3 mb-2 last:mb-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-base">{p.icon}</div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">{p.nama}</div>
                  <div className="text-xs text-gray-400">{p.jabatan}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Kontak darurat */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-700 text-sm mb-2">🚨 Kontak Darurat</h3>
            {[
              { label: "Pak RT", no: "0812-3456-7890" },
              { label: "PKM Tegalsari", no: "024-1234-5678" },
              { label: "Pemadam Api", no: "113" },
            ].map((k) => (
              <div key={k.label} className="flex items-center justify-between text-xs mb-1.5 last:mb-0">
                <span className="text-gray-600 font-medium">{k.label}</span>
                <a href={`tel:${k.no}`} className="text-red-600 font-semibold hover:underline">{k.no}</a>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

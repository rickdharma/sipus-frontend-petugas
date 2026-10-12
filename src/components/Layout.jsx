import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Inbox,
  UserPlus,
  CornerDownLeft,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const menu = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/buku", label: "Kelola Data Buku", icon: BookOpen },
  { to: "/permintaan", label: "Permintaan Peminjaman", icon: Inbox, showBadge: true },
  { to: "/peminjaman-langsung", label: "Peminjaman Langsung", icon: UserPlus },
  { to: "/pengembalian", label: "Pengembalian Buku", icon: CornerDownLeft },
  { to: "/riwayat", label: "Riwayat Transaksi", icon: FileText },
];

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Ambil jumlah pengajuan pending; dijalankan ulang setiap pindah halaman
    useEffect(() => {
    function loadPending() {
      api
        .get("/staff/dashboard")
        .then((res) => setPendingCount(res.data?.data?.pending_borrowings ?? 0))
        .catch(() => setPendingCount(0));
    }

    loadPending();
    window.addEventListener("borrowings-updated", loadPending);

    // Cleanup: lepas pendengar saat efek dijalankan ulang atau komponen ditutup
    return () => window.removeEventListener("borrowings-updated", loadPending);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-header text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h1 className="font-bold leading-tight">SIPUS - Portal Petugas</h1>
              <p className="text-xs text-indigo-200">
                Panel Pengelolaan Perpustakaan & Verifikasi Peminjaman
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-active flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              <p className="text-xs text-indigo-200">Petugas</p>
            </div>
            <button
              onClick={logout}
              title="Keluar"
              className="p-2 rounded-lg bg-primary-active hover:bg-primary-hover"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto mb-6">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
                {item.showBadge && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
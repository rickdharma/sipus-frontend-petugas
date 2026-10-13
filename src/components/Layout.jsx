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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { LogoImage } from "./Logo";

const menu = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/buku", label: "Kelola Data Buku", icon: BookOpen },
  { to: "/permintaan", label: "Permintaan Peminjaman", icon: Inbox, showBadge: true },
  { to: "/peminjaman-langsung", label: "Peminjaman Langsung", icon: UserPlus },
  { to: "/pengembalian", label: "Pengembalian Buku", icon: CornerDownLeft },
  { to: "/riwayat", label: "Riwayat Transaksi", icon: FileText },
];

const STORAGE_KEY = "sidebar_collapsed";

function loadCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // penyimpanan browser tidak tersedia
  }
}

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // gagal menyimpan pilihan tidak masalah, sidebar tetap berfungsi
    }
  }

  useEffect(() => {
    function loadPending() {
      api
        .get("/staff/dashboard")
        .then((res) => setPendingCount(res.data?.data?.pending_borrowings ?? 0))
        .catch(() => setPendingCount(0));
    }

    loadPending();
    window.addEventListener("borrowings-updated", loadPending);
    return () => window.removeEventListener("borrowings-updated", loadPending);
  }, [location.pathname]);

  // Semua kelas berawalan "md:" hanya berlaku di layar lebar
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside
        className={`relative bg-header text-white shrink-0 md:sticky md:top-0 md:h-screen flex flex-col transition-[width] duration-200 ${
          collapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="hidden md:flex absolute -right-3 top-6 z-10 w-6 h-6 items-center justify-center rounded-full bg-white text-slate-600 border border-slate-200 shadow hover:bg-slate-100"
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>

        <div
          className={`p-4 flex items-center border-b border-white/10 ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <LogoImage size={34} className="rounded-lg shadow-sm" />
            <div className={collapsed ? "md:hidden" : ""}>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white leading-tight">SIPUS</span>
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/25 text-indigo-200 uppercase leading-none border border-indigo-400/20">
                  Staff
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-normal leading-tight mt-0.5">Portal Petugas</p>
            </div>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-y-auto md:flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    collapsed ? "md:justify-center md:px-0" : ""
                  } ${isActive ? "bg-primary text-white" : "text-indigo-100 hover:bg-white/10"}`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                {item.showBadge && pendingCount > 0 && (
                  <span
                    className={`bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none ${
                      collapsed ? "md:absolute md:top-0.5 md:right-1.5" : "md:ml-auto"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`p-4 border-t border-white/10 flex items-center gap-3 ${
            collapsed ? "md:flex-col" : ""
          }`}
        >
          <div
            title={user?.name}
            className="w-9 h-9 shrink-0 rounded-full bg-primary-active flex items-center justify-center text-sm font-bold"
          >
            {user?.name?.charAt(0)}
          </div>
          <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
            <p className="text-sm font-semibold leading-tight truncate">{user?.name}</p>
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
      </aside>

      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
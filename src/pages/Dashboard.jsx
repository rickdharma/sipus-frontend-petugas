import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bell,
  Bookmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  Plus,
  ArrowRight,
  ChevronRight,
  Inbox,
  CornerDownLeft,
  FileText,
} from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

// Ambang batas stok rendah
const LOW_STOCK_THRESHOLD = 2;

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/staff/dashboard"),
      api.get("/staff/borrowings", { params: { status: "PENDING", per_page: 100 } }),
      api.get("/staff/books", { params: { per_page: 100 } }),
    ])
      .then(([statsRes, pendingRes, booksRes]) => {
        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data.data);
        }

        if (pendingRes.status === "fulfilled") {
          const list = pendingRes.value.data.data ?? [];
          const newest = [...list]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setRecent(newest);
        }

        if (booksRes.status === "fulfilled") {
          const list = booksRes.value.data.data ?? [];
          const low = list
            .filter((b) => b.stock <= LOW_STOCK_THRESHOLD)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);
          setLowStock(low);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const cardConfig = [
    {
      key: "total_books",
      label: "Total Koleksi Buku",
      hint: "Judul buku terdaftar",
      icon: BookOpen,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      valueColor: "text-slate-900",
      to: "/buku",
    },
    {
      key: "pending_borrowings",
      label: "Permintaan Menunggu",
      hint: "Perlu diverifikasi petugas",
      icon: Bell,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      valueColor: stats?.pending_borrowings > 0 ? "text-amber-600" : "text-slate-900",
      highlight: stats?.pending_borrowings > 0,
      to: "/permintaan",
    },
    {
      key: "active_borrowings",
      label: "Sedang Dipinjam",
      hint: "Buku aktif di tangan peminjam",
      icon: Bookmark,
      iconBg: "bg-sky-50 text-sky-600 border-sky-100",
      valueColor: "text-sky-700",
      to: "/pengembalian",
    },
    {
      key: "completed_borrowings",
      label: "Selesai Dikembalikan",
      hint: "Total transaksi sukses",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      valueColor: "text-emerald-700",
      to: "/riwayat",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 shadow-xs" />
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80 shadow-xs" />
          ))}
        </div>
        {/* 2-col content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-200/80 shadow-xs" />
          <div className="h-72 bg-white rounded-2xl border border-slate-200/80 shadow-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & ACTION BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Sistem Aktif
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang, {user?.name ?? "Petugas"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Pantau sirkulasi peminjaman buku, setujui pengajuan siswa, dan kelola ketersediaan koleksi perpustakaan.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link
            to="/peminjaman-langsung"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Peminjaman Langsung</span>
          </Link>
          <Link
            to="/buku"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Buku</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI METRICS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          const val = stats ? stats[card.key] ?? 0 : 0;
          return (
            <Link
              key={card.key}
              to={card.to}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                card.highlight
                  ? "border-amber-300 ring-2 ring-amber-400/20"
                  : "border-slate-200/80 hover:border-indigo-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600 tracking-tight">{card.label}</span>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}
                >
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <p className={`text-3xl font-extrabold tracking-tight ${card.valueColor}`}>{val}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">{card.hint}</span>
                  <ChevronRight size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3): PENGAJUAN PEMINJAMAN TERBARU */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Pengajuan Peminjaman Terbaru</h2>
                  <p className="text-[11px] text-slate-500">Antrean siswa yang menunggu verifikasi petugas</p>
                </div>
              </div>
              <Link
                to="/permintaan"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* List Content */}
            {recent === null ? (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs">Gagal memuat daftar pengajuan</div>
            ) : recent.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
                  <Inbox size={22} />
                </div>
                <p className="text-xs font-bold text-slate-700">Tidak Ada Pengajuan Menunggu</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua permintaan peminjaman siswa sudah disetujui atau diproses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {b.borrower_name?.charAt(0) || "P"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{b.borrower_name}</p>
                          {b.borrower_identity_number && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600">
                              {b.borrower_identity_number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {b.items?.map((i) => i.book?.title ?? `Buku #${i.book_id}`).join(", ")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Diajukan: {formatDate(b.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <StatusBadge status={b.status} />
                      <Link
                        to="/permintaan"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-2xs"
                      >
                        Verifikasi
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recent && recent.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <Link
                to="/permintaan"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
              >
                <span>Buka halaman verifikasi peminjaman</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN (1/3): STATUS STOK BUKU RENDAH */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Stok Menipis</h2>
                  <p className="text-[11px] text-slate-500">Sisa stok ≤ {LOW_STOCK_THRESHOLD} eksemplar</p>
                </div>
              </div>
              <Link
                to="/buku"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Katalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* List Content */}
            {lowStock === null ? (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs">Gagal memuat status stok</div>
            ) : lowStock.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 size={22} />
                </div>
                <p className="text-xs font-bold text-slate-800">Koleksi Stok Aman</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua buku memiliki persediaan di atas batas minimum.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{b.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.author}</p>
                      <span className="text-[10px] font-mono text-slate-400">ISBN: {b.isbn ?? "-"}</span>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          b.stock === 0
                            ? "bg-rose-600 text-white"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {b.stock === 0 ? "HABIS" : `Sisa ${b.stock}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/buku"
              className="w-full py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <span>Perbarui Data Buku</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </div>

      {/* 4. SHORTCUT NAVIGATION TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          to="/peminjaman-langsung"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserPlus size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Peminjaman di Tempat
            </h3>
            <p className="text-[11px] text-slate-500">Catat transaksi sirkulasi langsung</p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/pengembalian"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CornerDownLeft size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              Pengembalian Buku
            </h3>
            <p className="text-[11px] text-slate-500">Cek batas waktu & pengembalian</p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
        </Link>

        <Link
          to="/riwayat"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Laporan & Riwayat
            </h3>
            <p className="text-[11px] text-slate-500">Arsip seluruh transaksi sirkulasi</p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
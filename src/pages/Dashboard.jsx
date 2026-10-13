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
  User,
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
      hint: "Judul terdaftar di katalog",
      icon: BookOpen,
      to: "/buku",
    },
    {
      key: "pending_borrowings",
      label: "Permintaan Menunggu",
      hint: "Perlu verifikasi petugas",
      icon: Bell,
      isPending: true,
      to: "/permintaan",
    },
    {
      key: "active_borrowings",
      label: "Sedang Dipinjam",
      hint: "Buku aktif di peminjam",
      icon: Bookmark,
      to: "/pengembalian",
    },
    {
      key: "completed_borrowings",
      label: "Selesai Dikembalikan",
      hint: "Transaksi terselesaikan",
      icon: CheckCircle2,
      to: "/riwayat",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-slate-200/80 shadow-2xs" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80 shadow-2xs" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-200/80 shadow-2xs" />
          <div className="h-72 bg-white rounded-2xl border border-slate-200/80 shadow-2xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & ACTION BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-slate-700">SIPUS Portal Petugas</span>
            <span>•</span>
            <span>
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
            Pantau sirkulasi peminjaman buku, verifikasi permintaan pengajuan, dan pantau ketersediaan stok fisik perpustakaan.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link
            to="/peminjaman-langsung"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
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

      {/* 2. UNIFIED MONOCHROME KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          const val = stats ? stats[card.key] ?? 0 : 0;
          const isPendingAlert = card.isPending && val > 0;

          return (
            <Link
              key={card.key}
              to={card.to}
              className={`bg-white rounded-2xl border p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between group cursor-pointer ${
                isPendingAlert ? "border-amber-300 bg-amber-50/20 hover:border-amber-400" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600 tracking-tight">{card.label}</span>
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                    isPendingAlert
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200/80"
                  }`}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <p className="text-3xl font-extrabold tracking-tight font-mono text-slate-900">{val}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">{card.hint}</span>
                  {isPendingAlert ? (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                      Perlu tindakan
                    </span>
                  ) : (
                    <ChevronRight size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3): PENGAJUAN PEMINJAMAN TERBARU */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center">
                  <Clock size={15} />
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
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                  <Inbox size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-700">Tidak Ada Pengajuan Menunggu</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua permintaan peminjaman siswa sudah selesai diproses.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recent.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                        <User size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{b.borrower_name}</p>
                          {b.borrower_identity_number && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600">
                              {b.borrower_identity_number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {b.items?.map((i) => `${i.book?.title ?? `Buku #${i.book_id}`} (×${i.quantity})`).join(", ")}
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
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
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
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center">
                  <AlertTriangle size={15} />
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
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mb-2.5">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-800">Koleksi Stok Aman</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua buku memiliki persediaan di atas batas minimum.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStock.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{b.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.author}</p>
                      <span className="text-[10px] font-mono text-slate-400">ISBN: {b.isbn ?? "-"}</span>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                          b.stock === 0
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
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

      {/* 4. SHORTCUT NAVIGATION TILES (UNIFIED NEUTRAL ICONS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <Link
          to="/peminjaman-langsung"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Peminjaman di Tempat
            </h3>
            <p className="text-[11px] text-slate-500">Catat transaksi sirkulasi langsung</p>
          </div>
          <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/pengembalian"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
            <CornerDownLeft size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Pengembalian Buku
            </h3>
            <p className="text-[11px] text-slate-500">Cek batas waktu & pengembalian</p>
          </div>
          <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/riwayat"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Laporan & Riwayat
            </h3>
            <p className="text-[11px] text-slate-500">Arsip seluruh transaksi sirkulasi</p>
          </div>
          <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
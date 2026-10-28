import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BookMarked,
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
      iconBg: "bg-blue-50 text-blue-600",
      to: "/buku",
    },
    {
      key: "pending_borrowings",
      label: "Permintaan Menunggu",
      hint: "Menunggu verifikasi petugas",
      icon: Bell,
      iconBg: "bg-orange-50 text-orange-600",
      to: "/permintaan",
    },
    {
      key: "active_borrowings",
      label: "Sedang Dipinjam",
      hint: "Transaksi peminjaman aktif",
      icon: BookMarked,
      iconBg: "bg-emerald-50 text-emerald-600",
      to: "/pengembalian",
    },
    {
      key: "completed_borrowings",
      label: "Selesai Dikembalikan",
      hint: "Transaksi selesai",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      to: "/riwayat",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-slate-200/80 shadow-2xs" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="h-3.5 w-24 bg-slate-100 rounded" />
              </div>
              <div className="mt-2.5">
                <div className="h-7 w-12 bg-slate-200 rounded" />
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="h-2.5 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-xl border border-slate-200/80 shadow-2xs" />
          <div className="h-72 bg-white rounded-xl border border-slate-200/80 shadow-2xs" />
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

      {/* 2. STAT CARDS (COMPACT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          const val = stats ? stats[card.key] ?? 0 : 0;

          return (
            <Link
              key={card.key}
              to={card.to}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                    {card.label}
                  </span>
                </div>

                <div className="mt-2.5">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {val}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      {card.hint}
                    </p>
                    <ChevronRight
                      size={13}
                      className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3): PENGAJUAN PEMINJAMAN TERBARU */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
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
              <div className="divide-y divide-slate-100">
                {recent.map((b) => (
                  <div
                    key={b.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{b.borrower_name}</p>
                          {b.borrower_identity_number && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {b.borrower_identity_number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {b.items?.map((i) => `${i.book?.title ?? `Buku #${i.book_id}`} (×${i.quantity})`).join(", ")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Diajukan: {formatDate(b.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <StatusBadge status={b.status} />
                      <Link
                        to="/permintaan"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors shadow-2xs"
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
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Stok Menipis</h2>
                  <p className="text-[11px] text-slate-500">Sisa stok ≤ {LOW_STOCK_THRESHOLD}</p>
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
              <div className="divide-y divide-slate-100">
                {lowStock.map((b) => (
                  <div
                    key={b.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {b.author}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        ISBN: {b.isbn || "-"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {b.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          Habis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          Sisa {b.stock}
                        </span>
                      )}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <Link
          to="/peminjaman-langsung"
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <UserPlus size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Peminjaman di Tempat
            </h3>
            <p className="text-[11px] text-slate-500">Catat transaksi sirkulasi langsung</p>
          </div>
          <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/pengembalian"
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CornerDownLeft size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Pengembalian Buku
            </h3>
            <p className="text-[11px] text-slate-500">Cek batas waktu & pengembalian</p>
          </div>
          <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/riwayat"
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Laporan & Riwayat
            </h3>
            <p className="text-[11px] text-slate-500">Arsip seluruh transaksi sirkulasi</p>
          </div>
          <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
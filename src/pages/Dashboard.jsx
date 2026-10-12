import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Bell, Bookmark, Check, Clock, Info } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";

// Buku dianggap "stok rendah" kalau sisa stoknya <= angka ini
const LOW_STOCK_THRESHOLD = 2;

const cardConfig = [
  { key: "total_books", label: "Total Koleksi Buku", icon: BookOpen, box: "bg-indigo-50 text-indigo-600", value: "text-slate-800" },
  { key: "pending_borrowings", label: "Permintaan Pending", icon: Bell, box: "bg-amber-50 text-amber-600", value: "text-amber-600" },
  { key: "active_borrowings", label: "Sedang Dipinjam", icon: Bookmark, box: "bg-indigo-50 text-indigo-600", value: "text-indigo-600" },
  { key: "completed_borrowings", label: "Selesai Dikembalikan", icon: Check, box: "bg-green-50 text-green-600", value: "text-green-600" },
];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // allSettled: kalau satu request gagal, bagian lain di dashboard tetap tampil
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

  if (loading) return <p>Memuat data...</p>;

  let recentContent;
  if (recent === null) {
    recentContent = <p className="text-danger text-sm">Gagal memuat data pengajuan</p>;
  } else if (recent.length === 0) {
    recentContent = <p className="text-slate-500 text-sm">Tidak ada pengajuan yang menunggu.</p>;
  } else {
    recentContent = (
      <ul className="flex flex-col gap-2">
        {recent.map((b) => (
          <li key={b.id} className="flex justify-between items-center gap-3 bg-slate-50 rounded-lg p-3">
            <div>
              <p className="font-semibold text-sm">{b.borrower_name}</p>
              <p className="text-xs text-slate-500">
                {b.items?.map((i) => i.book?.title ?? `Buku #${i.book_id}`).join(", ")}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </li>
        ))}
      </ul>
    );
  }

  let stockContent;
  if (lowStock === null) {
    stockContent = <p className="text-danger text-sm">Gagal memuat data stok buku</p>;
  } else if (lowStock.length === 0) {
    stockContent = <p className="text-slate-500 text-sm">Semua stok buku masih aman.</p>;
  } else {
    stockContent = (
      <ul className="flex flex-col gap-2">
        {lowStock.map((b) => (
          <li
            key={b.id}
            className="flex justify-between items-center gap-3 bg-red-50 border border-red-100 rounded-lg p-3"
          >
            <div>
              <p className="font-semibold text-sm">{b.title}</p>
              <p className="text-xs font-mono text-slate-500">ISBN: {b.isbn ?? "-"}</p>
            </div>
            <span className="text-xs font-semibold bg-red-100 text-danger rounded-full px-2 py-1 whitespace-nowrap">
              Sisa: {b.stock}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cardConfig.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${card.box}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.value}`}>{stats[card.key] ?? 0}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-danger">Gagal memuat statistik dashboard</p>
      )}

      <section className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="flex items-center gap-2 font-bold">
            <Clock size={16} className="text-amber-500" /> Pengajuan Peminjaman Terbaru
          </h3>
          <Link to="/permintaan" className="text-sm font-semibold text-primary hover:underline">
            Lihat Semua
          </Link>
        </div>
        {recentContent}
      </section>

      <section className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="flex items-center gap-2 font-bold">
            <Info size={16} className="text-danger" /> Status Stok Buku Rendah
          </h3>
          <Link to="/buku" className="text-sm font-semibold text-primary hover:underline">
            Kelola Stok
          </Link>
        </div>
        {stockContent}
      </section>
    </div>
  );
}

export default Dashboard;
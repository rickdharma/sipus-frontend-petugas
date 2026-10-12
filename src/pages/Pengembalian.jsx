import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import BorrowedItems from "../components/BorrowedItems";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatDate } from "../utils/format";

function Pengembalian() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  function fetchRows() {
    setError("");
    return api
      .get("/staff/borrowings", { params: { status: "BORROWED", per_page: 100 } })
      .then((res) => setRows(res.data.data ?? []))
      .catch((err) => setError(getErrorMessage(err, "Gagal memuat data peminjaman")));
  }

  useEffect(() => {
    fetchRows().finally(() => setLoading(false));
  }, []);

  async function handleReturn(b) {
    if (!window.confirm(`Catat pengembalian transaksi #${b.id} (${b.borrower_name})?`)) return;

    setActingId(b.id);
    try {
      await api.post(`/staff/borrowings/${b.id}/return`);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mencatat pengembalian"));
    }
    await fetchRows();
    setActingId(null);
  }

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  // Transaksi yang terlambat ditaruh paling atas supaya petugas langsung melihatnya
  const sorted = [...rows].sort((a, b) => Number(b.is_overdue) - Number(a.is_overdue));

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="font-bold">Pencatatan Pengembalian Buku</h2>
        <p className="text-sm text-slate-500">
          Daftar buku yang sedang dipinjam. Transaksi yang terlambat ditampilkan paling atas.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {sorted.length === 0 ? (
          <p className="p-6 text-gray-500">Tidak ada buku yang sedang dipinjam saat ini.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Peminjam</th>
                <th className="p-4 font-semibold">Buku</th>
                <th className="p-4 font-semibold">Batas Pengembalian</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => (
                <tr key={b.id} className="border-t border-slate-100 align-top">
                  <td className="p-4 font-mono text-xs text-primary">#{b.id}</td>
                  <td className="p-4">
                    <p className="font-semibold">{b.borrower_name}</p>
                    {b.borrower_identity_number && (
                      <p className="text-xs text-slate-500">{b.borrower_identity_number}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <BorrowedItems items={b.items} />
                  </td>
                  <td className="p-4 text-slate-500 whitespace-nowrap">
                    {formatDate(b.due_date)}
                    {b.is_overdue && (
                      <span className="ml-2 bg-red-100 text-danger text-xs font-semibold px-2 py-0.5 rounded">
                        Terlambat
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      disabled={actingId === b.id}
                      onClick={() => handleReturn(b)}
                      className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      <Check size={14} /> Catat Pengembalian
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Pengembalian;
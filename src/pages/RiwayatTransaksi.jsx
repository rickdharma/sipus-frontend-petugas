import { useEffect, useState } from "react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import BorrowedItems from "../components/BorrowedItems";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatDate } from "../utils/format";

// Kalau nanti ternyata /history tidak mengembalikan semua status,
// cukup ganti alamat ini ke "/staff/borrowings"
const HISTORY_ENDPOINT = "/staff/borrowings/history";

const statusOptions = ["SEMUA", "PENDING", "APPROVED", "REJECTED", "BORROWED", "RETURNED"];

function RiwayatTransaksi() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("SEMUA");

  // Dijalankan ulang setiap filter berubah; penyaringan dilakukan oleh backend
  useEffect(() => {
    setLoading(true);
    setError("");

    const params = { per_page: 100 };
    if (filter !== "SEMUA") params.status = filter;

    api
      .get(HISTORY_ENDPOINT, { params })
      .then((res) => setRows(res.data.data ?? []))
      .catch((err) => setError(getErrorMessage(err, "Gagal memuat riwayat transaksi")))
      .finally(() => setLoading(false));
  }, [filter]);

  let body;
  if (loading) {
    body = <p className="p-6">Memuat data...</p>;
  } else if (error) {
    body = <p className="p-6 text-danger">{error}</p>;
  } else if (rows.length === 0) {
    body = <p className="p-6 text-gray-500">Tidak ada transaksi dengan status ini.</p>;
  } else {
    body = (
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-400">
            <th className="p-4 font-semibold">ID</th>
            <th className="p-4 font-semibold">Peminjam</th>
            <th className="p-4 font-semibold">Buku</th>
            <th className="p-4 font-semibold">Tgl Pengajuan</th>
            <th className="p-4 font-semibold">Tgl Pinjam</th>
            <th className="p-4 font-semibold">Tgl Kembali</th>
            <th className="p-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
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
              <td className="p-4 text-slate-500 whitespace-nowrap">{formatDate(b.created_at)}</td>
              <td className="p-4 text-slate-500 whitespace-nowrap">{formatDate(b.borrowed_at)}</td>
              <td className="p-4 text-slate-500 whitespace-nowrap">{formatDate(b.returned_at)}</td>
              <td className="p-4 whitespace-nowrap">
                <StatusBadge status={b.status} />
                {b.is_overdue && (
                  <span className="ml-2 bg-red-100 text-danger text-xs font-semibold px-2 py-0.5 rounded">
                    Terlambat
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex justify-between items-center gap-4">
        <h2 className="font-bold">Laporan Riwayat Keseluruhan Transaksi</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg p-2 text-sm"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "SEMUA" ? "Semua Status" : opt}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">{body}</div>
    </div>
  );
}

export default RiwayatTransaksi;
import { useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import BorrowedItems from "../components/BorrowedItems";
import { usePaginatedData } from "../hooks/usePaginatedData";
import { formatDate, kodeTransaksi } from "../utils/format";

// Menurut panduan API, /history berisi transaksi yang sudah selesai atau ditolak.
// Kalau ternyata status lain juga ikut muncul, tambahkan di daftar ini.
const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "BORROWED", label: "BORROWED" },
  { value: "RETURNED", label: "RETURNED" },
  { value: "REJECTED", label: "REJECTED" },
];

const columns = [
  {
    header: "Kode",
    cell: (b) => (
      <span className="font-mono text-xs text-primary whitespace-nowrap">{kodeTransaksi(b)}</span>
    ),
  },
  {
    header: "Peminjam",
    cell: (b) => (
      <>
        <p className="font-semibold">{b.borrower_name}</p>
        {b.borrower_identity_number && (
          <p className="text-xs text-slate-500">{b.borrower_identity_number}</p>
        )}
      </>
    ),
  },
  { header: "Buku", cell: (b) => <BorrowedItems items={b.items} /> },
  {
    header: "Tgl Pengajuan",
    cell: (b) => <span className="text-slate-500 whitespace-nowrap">{formatDate(b.created_at)}</span>,
  },
  {
    header: "Tgl Pinjam",
    cell: (b) => <span className="text-slate-500 whitespace-nowrap">{formatDate(b.borrowed_at)}</span>,
  },
  {
    header: "Tgl Kembali",
    cell: (b) => <span className="text-slate-500 whitespace-nowrap">{formatDate(b.returned_at)}</span>,
  },
  {
    header: "Status",
    cell: (b) => (
      <span className="whitespace-nowrap">
        <StatusBadge status={b.status} />
        {b.is_overdue && (
          <span className="ml-2 bg-red-100 text-danger text-xs font-semibold px-2 py-0.5 rounded">
            Terlambat
          </span>
        )}
      </span>
    ),
  },
];

function RiwayatTransaksi() {
  const [status, setStatus] = useState("");

  const table = usePaginatedData("/staff/borrowings/history", {
    params: status ? { status } : {},
    errorMessage: "Gagal memuat riwayat transaksi",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center gap-4">
        <h2 className="font-bold">Laporan Riwayat Keseluruhan Transaksi</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg p-2 text-sm"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} table={table} emptyText="Belum ada riwayat transaksi." />
    </div>
  );
}

export default RiwayatTransaksi;
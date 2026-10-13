import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import BorrowedItems from "../components/BorrowedItems";
import { usePaginatedData } from "../hooks/usePaginatedData";
import { formatDate, kodeTransaksi } from "../utils/format";

// Menurut panduan API, /history berisi transaksi yang sudah selesai atau ditolak.
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
      <span className="font-mono text-xs font-semibold text-indigo-600 whitespace-nowrap">{kodeTransaksi(b)}</span>
    ),
  },
  {
    header: "Peminjam",
    cell: (b) => (
      <>
        <p className="font-semibold text-slate-900">{b.borrower_name}</p>
        {b.borrower_identity_number && (
          <p className="text-xs font-mono text-slate-500 mt-0.5">{b.borrower_identity_number}</p>
        )}
      </>
    ),
  },
  { header: "Buku", cell: (b) => <BorrowedItems items={b.items} /> },
  {
    header: "Tgl Pengajuan",
    cell: (b) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(b.created_at)}</span>,
  },
  {
    header: "Tgl Pinjam",
    cell: (b) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(b.borrowed_at)}</span>,
  },
  {
    header: "Tgl Kembali",
    cell: (b) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(b.returned_at)}</span>,
  },
  {
    header: "Status",
    cell: (b) => (
      <span className="whitespace-nowrap">
        <StatusBadge status={b.status} />
        {b.is_overdue && (
          <span className="ml-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Laporan Riwayat Keseluruhan Transaksi</h2>
          <p className="text-xs text-slate-500 mt-0.5">Semua riwayat peminjaman yang sudah selesai atau ditolak oleh petugas.</p>
        </div>

        <div className="relative shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={14} />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-white pl-8.5 pr-9 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        table={table}
        searchable
        searchPlaceholder="Cari kode transaksi, nama peminjam..."
        emptyText="Belum ada riwayat transaksi."
      />
    </div>
  );
}

export default RiwayatTransaksi;
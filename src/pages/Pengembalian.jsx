import { useState } from "react";
import { Check } from "lucide-react";
import api from "../services/api";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import BorrowedItems from "../components/BorrowedItems";
import { usePaginatedData } from "../hooks/usePaginatedData";
import { confirmAction, toastSuccess } from "../utils/alert";
import { formatDate, kodeTransaksi } from "../utils/format";

function Pengembalian() {
  const table = usePaginatedData("/staff/borrowings", {
    params: { status: "BORROWED" },
    errorMessage: "Gagal memuat data peminjaman",
  });
  const [actingId, setActingId] = useState(null);

    async function handleReturn(b) {
    setActingId(b.id);
    const { confirmed } = await confirmAction({
      title: "Catat pengembalian buku?",
      text: `${kodeTransaksi(b)} atas nama ${b.borrower_name}. Stok buku akan bertambah kembali.`,
      confirmText: "Ya, catat",
      action: () => api.post(`/staff/borrowings/${b.id}/return`),
    });

    if (confirmed) {
      toastSuccess("Pengembalian berhasil dicatat");
      await table.refetch();
    }
    setActingId(null);
  }

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
      header: "Tgl Pinjam",
      cell: (b) => <span className="text-slate-500 whitespace-nowrap">{formatDate(b.borrowed_at)}</span>,
    },
    {
      header: "Batas Pengembalian",
      cell: (b) => (
        <span className="text-slate-500 whitespace-nowrap">
          {formatDate(b.due_date)}
          {b.is_overdue && (
            <span className="ml-2 bg-red-100 text-danger text-xs font-semibold px-2 py-0.5 rounded">
              Terlambat
            </span>
          )}
        </span>
      ),
    },
    { header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
    {
      header: "Aksi",
      align: "right",
      cell: (b) => (
        <button
          disabled={actingId === b.id}
          onClick={() => handleReturn(b)}
          className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          <Check size={14} /> Catat Pengembalian
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Pencatatan Pengembalian Buku</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Daftar buku yang sedang dipinjam oleh siswa, guru, atau tamu. Catat pengembalian saat buku fisik telah diterima kembali di meja sirkulasi.
        </p>
      </div>

      <DataTable
        columns={columns}
        table={table}
        searchable
        searchPlaceholder="Cari kode transaksi, nama peminjam..."
        emptyText="Tidak ada buku yang sedang dipinjam saat ini."
      />
    </div>
  );
}

export default Pengembalian;
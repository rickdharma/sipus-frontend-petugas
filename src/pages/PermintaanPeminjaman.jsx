import { useCallback, useEffect, useState } from "react";
import { Check, X, PackageCheck } from "lucide-react";
import api from "../services/api";
import DataTable from "../components/DataTable";
import { usePaginatedData } from "../hooks/usePaginatedData";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatDate } from "../utils/format";

const tabs = [
  {
    status: "PENDING",
    label: "Menunggu Persetujuan",
    hint: "Siswa menunggu verifikasi petugas untuk peminjaman fisik buku.",
    empty: "Tidak ada permintaan yang menunggu persetujuan.",
  },
  {
    status: "APPROVED",
    label: "Siap Diambil",
    hint: "Pengajuan sudah disetujui. Konfirmasi saat peminjam datang mengambil buku; stok berkurang dan batas pengembalian dihitung otomatis saat buku diserahkan.",
    empty: "Tidak ada buku yang menunggu diambil.",
  },
];

function kodeTransaksi(b) {
  return b.transaction_code ?? `#${b.id}`;
}

function PermintaanPeminjaman() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0 });
  const [actingId, setActingId] = useState(null);

  const table = usePaginatedData("/staff/borrowings", {
    params: { status: activeTab },
    errorMessage: "Gagal memuat data permintaan",
  });

  // Angka kecil di tiap tab diambil dari total data masing-masing status
  const fetchCounts = useCallback(() => {
    return Promise.all(
      tabs.map((t) => api.get("/staff/borrowings", { params: { status: t.status, per_page: 1 } }))
    )
      .then((results) => {
        const next = {};
        tabs.forEach((t, i) => {
          next[t.status] = results[i].data.meta?.total ?? results[i].data.data?.length ?? 0;
        });
        setCounts(next);
      })
      .catch(() => {}); // hitungan hanya pelengkap, kalau gagal diabaikan
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  async function runAction(b, action, body) {
    setActingId(b.id);
    try {
      await api.post(`/staff/borrowings/${b.id}/${action}`, body);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memproses permintaan"));
    }
    // Beri tahu Layout agar badge angka di menu ikut diperbarui
    window.dispatchEvent(new Event("borrowings-updated"));
    await Promise.all([table.refetch(), fetchCounts()]);
    setActingId(null);
  }

  function handleReject(b) {
    const alasan = window.prompt(`Alasan menolak pengajuan ${kodeTransaksi(b)} (boleh dikosongkan):`);
    if (alasan === null) return; // petugas menekan Batal
    runAction(b, "reject", alasan.trim() ? { notes: alasan.trim() } : undefined);
  }

  function handleBorrow(b) {
    if (!window.confirm(`Konfirmasi buku untuk ${kodeTransaksi(b)} sudah diserahkan ke peminjam?`)) return;
    runAction(b, "borrow");
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
    {
      header: "Buku",
      cell: (b) => (
        <>
          <ul className="flex flex-col gap-1">
            {b.items?.map((item) => {
              const kurang = item.book && item.book.stock < item.quantity;
              return (
                <li key={item.id}>
                  <span className="font-medium">{item.book?.title ?? `Buku #${item.book_id}`}</span>{" "}
                  <span className="text-slate-500">× {item.quantity}</span>
                  {item.book && (
                    <span className={`ml-2 text-xs ${kurang ? "text-danger font-semibold" : "text-slate-400"}`}>
                      sisa stok: {item.book.stock}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {b.notes && <p className="text-xs text-slate-500 italic mt-2">Catatan: {b.notes}</p>}
        </>
      ),
    },
    {
      header: "Tgl Pengajuan",
      cell: (b) => <span className="text-slate-500 whitespace-nowrap">{formatDate(b.created_at)}</span>,
    },
    {
      header: "Aksi",
      align: "right",
      // Tombol ditentukan dari status baris itu sendiri, bukan dari tab yang aktif
      cell: (b) => (
        <div className="flex justify-end gap-2">
          {b.status === "PENDING" && (
            <>
              <button
                disabled={actingId === b.id}
                onClick={() => runAction(b, "approve")}
                className="flex items-center gap-1 bg-success text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                <Check size={14} /> Setujui
              </button>
              <button
                disabled={actingId === b.id}
                onClick={() => handleReject(b)}
                className="flex items-center gap-1 bg-red-50 text-danger px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                <X size={14} /> Tolak
              </button>
            </>
          )}
          {b.status === "APPROVED" && (
            <button
              disabled={actingId === b.id}
              onClick={() => handleBorrow(b)}
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              <PackageCheck size={14} /> Konfirmasi Pengambilan
            </button>
          )}
        </div>
      ),
    },
  ];

  const current = tabs.find((t) => t.status === activeTab);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold">Daftar Permintaan Peminjaman</h2>
        <p className="text-sm text-slate-500 mb-4">{current.hint}</p>

        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.status}
              onClick={() => setActiveTab(t.status)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === t.status ? "bg-primary-soft text-primary" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
              <span className="bg-slate-200 text-slate-700 text-xs rounded-full px-2 py-0.5">
                {counts[t.status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} table={table} emptyText={current.empty} />
    </div>
  );
}

export default PermintaanPeminjaman;
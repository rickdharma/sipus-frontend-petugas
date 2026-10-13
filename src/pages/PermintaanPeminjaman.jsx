import { useCallback, useEffect, useState } from "react";
import { Check, X, PackageCheck, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
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

  // Modal Tolak
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const table = usePaginatedData("/staff/borrowings", {
    params: { status: activeTab },
    errorMessage: "Gagal memuat data permintaan",
  });

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
      .catch(() => {});
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
    window.dispatchEvent(new Event("borrowings-updated"));
    await Promise.all([table.refetch(), fetchCounts()]);
    setActingId(null);
  }

  function handleOpenReject(b) {
    setRejectTarget(b);
    setRejectReason("");
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectTarget) return;

    setSubmittingReject(true);
    await runAction(
      rejectTarget,
      "reject",
      rejectReason.trim() ? { notes: rejectReason.trim() } : undefined
    );
    setSubmittingReject(false);
    setRejectTarget(null);
  }

  function handleBorrow(b) {
    if (!window.confirm(`Konfirmasi buku untuk ${kodeTransaksi(b)} sudah diserahkan ke peminjam?`)) return;
    runAction(b, "borrow");
  }

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
    {
      header: "Buku",
      cell: (b) => (
        <>
          <ul className="flex flex-col gap-1 text-xs">
            {b.items?.map((item) => {
              const kurang = item.book && item.book.stock < item.quantity;
              return (
                <li key={item.id} className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-slate-800">{item.book?.title ?? `Buku #${item.book_id}`}</span>{" "}
                  <span className="text-slate-500 font-mono">× {item.quantity}</span>
                  {item.book && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded ${
                        kurang
                          ? "bg-rose-50 text-rose-700 font-bold border border-rose-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      sisa: {item.book.stock}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {b.notes && <p className="text-xs text-slate-500 italic mt-2">Catatan peminjam: "{b.notes}"</p>}
        </>
      ),
    },
    {
      header: "Tgl Pengajuan",
      cell: (b) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(b.created_at)}</span>,
    },
    {
      header: "Aksi",
      align: "right",
      cell: (b) => (
        <div className="flex justify-end gap-2">
          {b.status === "PENDING" && (
            <>
              <button
                type="button"
                disabled={actingId === b.id}
                onClick={() => runAction(b, "approve")}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Check size={14} /> Setujui
              </button>
              <button
                type="button"
                disabled={actingId === b.id}
                onClick={() => handleOpenReject(b)}
                className="flex items-center gap-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <X size={14} /> Tolak
              </button>
            </>
          )}
          {b.status === "APPROVED" && (
            <button
              type="button"
              disabled={actingId === b.id}
              onClick={() => handleBorrow(b)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Daftar Permintaan Peminjaman Siswa</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{current.hint}</p>

        {/* Tab Strip */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.status}
              type="button"
              onClick={() => setActiveTab(t.status)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                activeTab === t.status
                  ? "bg-indigo-600 text-white shadow-indigo-600/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  activeTab === t.status ? "bg-white/20 text-white font-bold" : "bg-slate-200 text-slate-700 font-bold"
                }`}
              >
                {counts[t.status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} table={table} emptyText={current.empty} />

      {/* Modal Dialog Form Tolak Pengajuan */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Tolak Pengajuan Peminjaman"
        subtitle="Berikan keterangan alasan penolakan jika diperlukan agar siswa mengetahui penyebabnya."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReject} className="flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="text-slate-500">Kode Transaksi: <strong className="text-slate-800 font-mono">{rejectTarget ? kodeTransaksi(rejectTarget) : ""}</strong></p>
            <p className="text-slate-500 mt-1">Nama Peminjam: <strong className="text-slate-800">{rejectTarget?.borrower_name}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
              Alasan Penolakan <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Stok buku fisik sedang mengalami kerusakan, atau ada peminjaman sebelumnya yang belum selesai..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 resize-y"
            />
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingReject}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submittingReject ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Tolak Pengajuan</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PermintaanPeminjaman;
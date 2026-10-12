import { useEffect, useState } from "react";
import { Check, X, PackageCheck } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatDate } from "../utils/format";

function stokKurang(borrowing) {
  return borrowing.items?.some((item) => item.book && item.book.stock < item.quantity);
}

function PermintaanPeminjaman() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  // PENDING = menunggu keputusan. APPROVED = jaring pengaman kalau penyerahan buku sempat gagal.
  function fetchRows() {
    setError("");
    return Promise.all([
      api.get("/staff/borrowings", { params: { status: "APPROVED", per_page: 100 } }),
      api.get("/staff/borrowings", { params: { status: "PENDING", per_page: 100 } }),
    ])
      .then(([approved, pending]) => {
        setRows([...(approved.data.data ?? []), ...(pending.data.data ?? [])]);
      })
      .catch((err) => setError(getErrorMessage(err, "Gagal memuat data permintaan")));
  }

  useEffect(() => {
    fetchRows().finally(() => setLoading(false));
  }, []);

  async function refresh() {
    // Beri tahu Layout agar badge angka di menu ikut diperbarui
    window.dispatchEvent(new Event("borrowings-updated"));
    await fetchRows();
  }

  // Setujui = approve, lalu langsung serahkan buku (borrow) supaya status jadi BORROWED dan stok berkurang
  async function handleApprove(b) {
    setActingId(b.id);
    let disetujui = false;
    try {
      await api.post(`/staff/borrowings/${b.id}/approve`);
      disetujui = true;
      await api.post(`/staff/borrowings/${b.id}/borrow`);
    } catch (err) {
      const pesan = getErrorMessage(err, "Terjadi kesalahan");
      alert(
        disetujui
          ? `Pengajuan #${b.id} sudah disetujui, tetapi buku belum bisa diserahkan:\n${pesan}\n\nTransaksi tetap ada di daftar, coba lagi lewat tombol "Serahkan Buku".`
          : pesan
      );
    }
    await refresh();
    setActingId(null);
  }

  // Dipakai hanya untuk transaksi yang tertahan di APPROVED
  async function handleHandover(b) {
    setActingId(b.id);
    try {
      await api.post(`/staff/borrowings/${b.id}/borrow`);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyerahkan buku"));
    }
    await refresh();
    setActingId(null);
  }

  async function handleReject(b) {
    const alasan = window.prompt(`Alasan menolak pengajuan #${b.id} (boleh dikosongkan):`);
    if (alasan === null) return; // petugas menekan Batal

    setActingId(b.id);
    try {
      await api.post(
        `/staff/borrowings/${b.id}/reject`,
        alasan.trim() ? { notes: alasan.trim() } : undefined
      );
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menolak pengajuan"));
    }
    await refresh();
    setActingId(null);
  }

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="font-bold">Daftar Permintaan Peminjaman Masuk</h2>
        <p className="text-sm text-slate-500">
          Siswa menunggu verifikasi petugas untuk peminjaman fisik buku. Saat disetujui, buku
          langsung dicatat dipinjam dan stok berkurang.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-6 text-gray-500">Tidak ada permintaan yang menunggu persetujuan.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Peminjam</th>
                <th className="p-4 font-semibold">Buku</th>
                <th className="p-4 font-semibold">Tgl Pengajuan</th>
                <th className="p-4 font-semibold">Batas Kembali</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const kurang = b.status === "PENDING" && stokKurang(b);
                return (
                  <tr key={b.id} className="border-t border-slate-100 align-top">
                    <td className="p-4 font-mono text-xs text-primary">#{b.id}</td>

                    <td className="p-4">
                      <p className="font-semibold">{b.borrower_name}</p>
                      {b.borrower_identity_number && (
                        <p className="text-xs text-slate-500">{b.borrower_identity_number}</p>
                      )}
                    </td>

                    <td className="p-4">
                      <ul className="flex flex-col gap-1">
                        {b.items?.map((item) => {
                          const habis = item.book && item.book.stock < item.quantity;
                          return (
                            <li key={item.id}>
                              <span className="font-medium">
                                {item.book?.title ?? `Buku #${item.book_id}`}
                              </span>{" "}
                              <span className="text-slate-500">× {item.quantity}</span>
                              {b.status === "PENDING" && item.book && (
                                <span
                                  className={`ml-2 text-xs ${
                                    habis ? "text-danger font-semibold" : "text-slate-400"
                                  }`}
                                >
                                  sisa stok: {item.book.stock}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {b.notes && (
                        <p className="text-xs text-slate-500 italic mt-2">Catatan: {b.notes}</p>
                      )}
                    </td>

                    <td className="p-4 text-slate-500">{formatDate(b.created_at)}</td>
                    <td className="p-4 text-slate-500">{formatDate(b.due_date)}</td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {b.status === "PENDING" ? (
                          <>
                            <button
                              disabled={actingId === b.id || kurang}
                              onClick={() => handleApprove(b)}
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
                        ) : (
                          <button
                            disabled={actingId === b.id}
                            onClick={() => handleHandover(b)}
                            className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                          >
                            <PackageCheck size={14} /> Serahkan Buku
                          </button>
                        )}
                      </div>
                      {kurang && (
                        <p className="text-xs text-danger text-right mt-1">Stok tidak mencukupi</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PermintaanPeminjaman;
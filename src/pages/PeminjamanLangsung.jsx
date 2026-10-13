import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  User,
  CreditCard,
  Phone,
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatDate, toDateInputValue } from "../utils/format";

const borrowerTypes = [
  { value: "guest", label: "Tamu Umum" },
  { value: "student", label: "Siswa" },
  { value: "teacher", label: "Guru" },
  { value: "staff", label: "Staf" },
];

// Aturan dari dokumentasi API: guru & staf maks 7 hari, selain itu maks 3 hari
function maxDays(type) {
  return type === "teacher" || type === "staff" ? 7 : 3;
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function initialForm() {
  return {
    borrower_name: "",
    borrower_phone: "",
    borrower_identity_number: "",
    borrower_type: "guest",
    due_date: toDateInputValue(addDays(3)),
    notes: "",
  };
}

const emptyItem = { book_id: "", quantity: 1 };

function PeminjamanLangsung() {
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(null);

  function fetchBooks() {
    return api
      .get("/staff/books", { params: { per_page: 100 } })
      .then((res) => setBooks(res.data.data ?? []))
      .catch((err) => setBooksError(getErrorMessage(err, "Gagal memuat daftar buku")));
  }

  useEffect(() => {
    fetchBooks().finally(() => setLoadingBooks(false));
  }, []);

  // Hanya buku yang masih ada stoknya yang bisa dipilih
  const availableBooks = books.filter((b) => b.stock > 0);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Ganti tipe peminjam => batas pengembalian ikut menyesuaikan aturannya
  function handleTypeChange(e) {
    const type = e.target.value;
    setForm({ ...form, borrower_type: type, due_date: toDateInputValue(addDays(maxDays(type))) });
  }

  function updateItem(index, changes) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  }

  function addItem() {
    setItems([...items, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  // Buku yang sudah dipilih di baris lain tidak muncul lagi di pilihan baris ini
  function optionsFor(index) {
    const takenElsewhere = items
      .filter((_, i) => i !== index)
      .map((item) => Number(item.book_id));
    return availableBooks.filter((b) => !takenElsewhere.includes(b.id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSuccess(null);

    const chosen = items.filter((item) => item.book_id);
    if (chosen.length === 0) {
      setFormError("Pilih minimal satu buku untuk dipinjam");
      return;
    }

    const payload = {
      borrower_name: form.borrower_name.trim(),
      borrower_type: form.borrower_type,
      due_date: form.due_date,
      items: chosen.map((item) => ({
        book_id: Number(item.book_id),
        quantity: Number(item.quantity),
      })),
    };

    if (form.borrower_phone.trim()) payload.borrower_phone = form.borrower_phone.trim();
    if (form.borrower_identity_number.trim())
      payload.borrower_identity_number = form.borrower_identity_number.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    setSaving(true);
    try {
      const res = await api.post("/staff/borrowings/direct", payload);
      setSuccess(res.data.data);
      setForm(initialForm());
      setItems([{ ...emptyItem }]);
      await fetchBooks();
    } catch (err) {
      setFormError(getErrorMessage(err, "Gagal mencatat peminjaman"));
    } finally {
      setSaving(false);
    }
  }

  if (loadingBooks) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 text-sm">
        <Loader2 size={24} className="animate-spin mx-auto text-indigo-600 mb-2" />
        Memuat daftar katalog buku...
      </div>
    );
  }

  if (booksError) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 text-sm text-rose-700 flex items-center gap-2">
        <AlertCircle size={18} />
        {booksError}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Peminjaman Langsung di Tempat</h2>
        <p className="text-xs text-slate-500 mt-1">
          Catat transaksi peminjaman fisik untuk siswa, guru, staf, atau tamu umum yang datang langsung ke meja sirkulasi.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Transaksi Berhasil Dicatat!</span>
            <p className="mt-0.5 text-emerald-800">
              Peminjaman <span className="font-mono font-bold text-emerald-950">#{success.id}</span> atas nama{" "}
              <span className="font-semibold text-emerald-950">{success.borrower_name}</span> telah aktif. Batas pengembalian:{" "}
              <span className="font-semibold text-emerald-950">{formatDate(success.due_date)}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col gap-6">
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed whitespace-pre-line font-medium">{formError}</p>
          </div>
        )}

        {/* SECTION 1: IDENTITAS PEMINJAM */}
        <div>
          <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Identitas Peminjam</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Peminjam */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Nama Lengkap Peminjam <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  name="borrower_name"
                  value={form.borrower_name}
                  onChange={handleChange}
                  placeholder="Contoh: Ahmad Dahlan"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Tipe Peminjam */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Tipe Peminjam <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.borrower_type}
                  onChange={handleTypeChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-800 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  {borrowerTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Nomor Identitas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                NIS / NIP / No. Identitas <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard size={15} />
                </div>
                <input
                  name="borrower_identity_number"
                  value={form.borrower_identity_number}
                  onChange={handleChange}
                  placeholder="Nomor kartu siswa / NIP / KTP"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                No. Telepon / WhatsApp <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={15} />
                </div>
                <input
                  name="borrower_phone"
                  value={form.borrower_phone}
                  onChange={handleChange}
                  placeholder="0812xxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Batas Pengembalian */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Batas Pengembalian <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={15} />
                </div>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  min={toDateInputValue(new Date())}
                  max={toDateInputValue(addDays(maxDays(form.borrower_type)))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3.5 py-2.5 text-sm text-slate-800 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                Maksimal durasi: <strong className="text-slate-700">{maxDays(form.borrower_type)} hari</strong> untuk tipe {borrowerTypes.find((t) => t.value === form.borrower_type)?.label}.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: BUKU YANG DIPINJAM */}
        <div>
          <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Daftar Buku yang Dipinjam</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Total {items.filter((i) => i.book_id).length} judul dipilih
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selected = books.find((b) => b.id === Number(item.book_id));
              return (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  {/* Selector Buku */}
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={item.book_id}
                      onChange={(e) => updateItem(index, { book_id: e.target.value, quantity: 1 })}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                    >
                      <option value="">-- Pilih Buku dari Katalog --</option>
                      {optionsFor(index).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} — {b.author} (Sisa stok: {b.stock})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Qty:</span>
                    <input
                      type="number"
                      min={1}
                      max={selected?.stock ?? 1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                      className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-center text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    />

                    {selected && (
                      <span className="text-xs text-slate-400 font-mono">
                        / maks {selected.stock}
                      </span>
                    )}

                    {/* Tombol Hapus Baris */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                        title="Hapus baris buku ini"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {items.length < availableBooks.length && (
            <button
              type="button"
              onClick={addItem}
              className="mt-3.5 w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Tambah Judul Buku Lain</span>
            </button>
          )}

          {availableBooks.length === 0 && (
            <p className="text-xs text-rose-600 mt-2 font-medium">
              Tidak ada buku dengan stok tersedia di perpustakaan saat ini.
            </p>
          )}
        </div>

        {/* SECTION 3: CATATAN TAMBAHAN */}
        <div>
          <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Catatan Tambahan</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
              Keterangan / Kondisi Khusus <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Contoh: Buku diserahkan langsung di meja 2, kondisi sampul sedikit terlipat..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-y"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Mencatat Transaksi...</span>
              </>
            ) : (
              <span>Simpan & Terbitkan Peminjaman</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PeminjamanLangsung;
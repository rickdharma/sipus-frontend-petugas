import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatDate, toDateInputValue } from "../utils/format";

const borrowerTypes = [
  { value: "guest", label: "Tamu Umum" },
  { value: "student", label: "Siswa" },
  { value: "teacher", label: "Guru" },
  { value: "staff", label: "Staf" },
];

// Aturan dari dokumentasi API: guru maks 7 hari, selain itu maks 3 hari
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
      setFormError("Pilih minimal satu buku");
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
    // Field opsional hanya dikirim kalau diisi
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
      await fetchBooks(); // stok sudah berubah
    } catch (err) {
      setFormError(getErrorMessage(err, "Gagal mencatat peminjaman"));
    } finally {
      setSaving(false);
    }
  }

  if (loadingBooks) return <p>Memuat data...</p>;
  if (booksError) return <p className="text-danger">{booksError}</p>;

  const inputClass = "border rounded-lg p-2 w-full";

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="font-bold">Peminjaman Langsung di Tempat</h2>
        <p className="text-sm text-slate-500">
          Catat peminjaman untuk siswa, guru, staf, atau tamu yang datang langsung. Status
          langsung dipinjam dan stok langsung berkurang.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm">
          Peminjaman <span className="font-semibold">#{success.id}</span> atas nama{" "}
          <span className="font-semibold">{success.borrower_name}</span> berhasil dicatat. Batas
          pengembalian: {formatDate(success.due_date)}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
        {formError && (
          <p className="text-danger text-sm bg-red-50 p-3 rounded-lg whitespace-pre-line">
            {formError}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nama Peminjam</label>
          <input name="borrower_name" value={form.borrower_name} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipe Peminjam</label>
            <select value={form.borrower_type} onChange={handleTypeChange} className={inputClass}>
              {borrowerTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NIS / NIP / KTP (opsional)</label>
            <input name="borrower_identity_number" value={form.borrower_identity_number} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">No. Telepon (opsional)</label>
            <input name="borrower_phone" value={form.borrower_phone} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batas Pengembalian</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              min={toDateInputValue(new Date())}
              max={toDateInputValue(addDays(maxDays(form.borrower_type)))}
              required
              className={inputClass}
            />
            <p className="text-xs text-slate-500 mt-1">
              Maksimal {maxDays(form.borrower_type)} hari untuk tipe ini.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Buku yang Dipinjam</label>
          <div className="flex flex-col gap-2">
            {items.map((item, index) => {
              const selected = books.find((b) => b.id === Number(item.book_id));
              return (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={item.book_id}
                    onChange={(e) => updateItem(index, { book_id: e.target.value, quantity: 1 })}
                    className="border rounded-lg p-2 flex-1 min-w-0"
                  >
                    <option value="">-- Pilih buku --</option>
                    {optionsFor(index).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (sisa {b.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={selected?.stock ?? 1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    className="border rounded-lg p-2 w-20"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      title="Hapus baris"
                      className="p-2 rounded-lg bg-red-50 text-danger hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {items.length < availableBooks.length && (
            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <Plus size={14} /> Tambah buku lain
            </button>
          )}
          {availableBooks.length === 0 && (
            <p className="text-sm text-danger mt-2">Tidak ada buku dengan stok tersedia.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Catat Peminjaman"}
        </button>
      </form>
    </div>
  );
}

export default PeminjamanLangsung;
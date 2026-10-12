import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import { getErrorMessage } from "../utils/getErrorMessage";

const emptyForm = {
  title: "",
  author: "",
  publisher: "",
  publication_year: "",
  isbn: "",
  stock: "",
  description: "",
};

const fields = [
  { name: "title", label: "Judul Buku", type: "text" },
  { name: "author", label: "Penulis", type: "text" },
  { name: "publisher", label: "Penerbit", type: "text" },
  { name: "publication_year", label: "Tahun Terbit", type: "number" },
  { name: "isbn", label: "ISBN", type: "text" },
  { name: "stock", label: "Stok", type: "number" },
];

function KelolaBuku() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function fetchBooks() {
    setLoading(true);
    setError("");
    api
      .get("/staff/books", { params: { per_page: 100 } })
      .then((res) => setBooks(res.data.data ?? []))
      .catch((err) => setError(getErrorMessage(err, "Gagal memuat data buku")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(book) {
    setEditingId(book.id);
    setForm({
      title: book.title ?? "",
      author: book.author ?? "",
      publisher: book.publisher ?? "",
      publication_year: book.publication_year ?? "",
      isbn: book.isbn ?? "",
      stock: book.stock ?? "",
      description: book.description ?? "",
    });
    setCoverFile(null);
    setFormError("");
    setIsModalOpen(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

  const isbnDipakai = books.some(
    (b) => b.isbn === form.isbn.trim() && b.id !== editingId
  );
  if (isbnDipakai) {
    setFormError("ISBN sudah terdaftar pada buku lain");
    return;
  }

  setSaving(true);
  setFormError("");

    // Upload file harus dikirim sebagai FormData (multipart), bukan JSON biasa
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (coverFile) data.append("cover", coverFile);

    let request;
    if (editingId) {
      // Pola umum Laravel: kirim POST dengan _method=PUT agar form-data terbaca
      data.append("_method", "PUT");
      request = api.post(`/staff/books/${editingId}`, data);
    } else {
      request = api.post("/staff/books", data);
    }

    request
      .then(() => {
        setIsModalOpen(false);
        fetchBooks();
      })
      .catch((err) => setFormError(getErrorMessage(err, "Gagal menyimpan data buku")))
      .finally(() => setSaving(false));
  }

  function handleDelete(book) {
    if (!window.confirm(`Yakin ingin menghapus "${book.title}"?`)) return;

    api
      .delete(`/staff/books/${book.id}`)
      .then(() => fetchBooks())
      .catch((err) => alert(getErrorMessage(err, "Gagal menghapus buku")));
  }

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center mb-4">
        <h2 className="font-bold">Manajemen Koleksi Buku</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus size={16} /> Tambah Buku Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {books.length === 0 ? (
          <p className="p-6 text-gray-500">Belum ada data buku.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="p-4 font-semibold">ISBN</th>
                <th className="p-4 font-semibold">Judul Buku</th>
                <th className="p-4 font-semibold">Penulis</th>
                <th className="p-4 font-semibold">Penerbit / Thn</th>
                <th className="p-4 font-semibold">Stok</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-t border-slate-100">
                  <td className="p-4 font-mono text-xs text-slate-500">{book.isbn}</td>
                  <td className="p-4 font-semibold">{book.title}</td>
                  <td className="p-4">{book.author}</td>
                  <td className="p-4 text-slate-500">
                    {book.publisher} ({book.publication_year})
                  </td>
                  <td className={`p-4 font-bold ${book.stock === 0 ? "text-danger" : ""}`}>
                    {book.stock}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(book)}
                        title="Edit"
                        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        title="Hapus"
                        className="p-2 rounded-lg bg-red-50 text-danger hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Buku" : "Tambah Buku Baru"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {formError && (
            <p className="text-danger text-sm bg-red-50 p-2 rounded whitespace-pre-line">
              {formError}
            </p>
          )}

          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                min={f.type === "number" ? 0 : undefined}
                value={form[f.name]}
                onChange={handleChange}
                required
                className="border rounded-lg p-2 w-full"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi (opsional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cover (opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0] ?? null)}
              className="text-sm w-full"
            />
            {editingId && (
              <p className="text-xs text-slate-500 mt-1">
                Kosongkan jika tidak ingin mengganti cover.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KelolaBuku;
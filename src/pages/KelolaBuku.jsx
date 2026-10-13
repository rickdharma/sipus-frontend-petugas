import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import { usePaginatedData } from "../hooks/usePaginatedData";
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
  const table = usePaginatedData("/staff/books", { errorMessage: "Gagal memuat data buku" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
    setSaving(true);
    setFormError("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (coverFile) data.append("cover", coverFile);

    let request;
    if (editingId) {
      data.append("_method", "PUT");
      request = api.post(`/staff/books/${editingId}`, data);
    } else {
      request = api.post("/staff/books", data);
    }

    request
      .then(() => {
        setIsModalOpen(false);
        table.refetch();
      })
      .catch((err) => setFormError(getErrorMessage(err, "Gagal menyimpan data buku")))
      .finally(() => setSaving(false));
  }

  function handleDelete(book) {
    if (!window.confirm(`Yakin ingin menghapus "${book.title}"?`)) return;

    api
      .delete(`/staff/books/${book.id}`)
      .then(() => table.refetch())
      .catch((err) => alert(getErrorMessage(err, "Gagal menghapus buku")));
  }

  const columns = [
    {
      header: "ISBN",
      cell: (b) => <span className="font-mono text-xs text-slate-500">{b.isbn}</span>,
    },
    { header: "Judul Buku", cell: (b) => <span className="font-semibold">{b.title}</span> },
    { header: "Penulis", cell: (b) => b.author },
    {
      header: "Penerbit / Thn",
      cell: (b) => (
        <span className="text-slate-500">
          {b.publisher} ({b.publication_year})
        </span>
      ),
    },
    {
      header: "Stok",
      cell: (b) => <span className={`font-bold ${b.stock === 0 ? "text-danger" : ""}`}>{b.stock}</span>,
    },
    {
      header: "Aksi",
      align: "right",
      cell: (b) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openEditModal(b)}
            title="Edit"
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(b)}
            title="Hapus"
            className="p-2 rounded-lg bg-red-50 text-danger hover:bg-red-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
        <h2 className="font-bold">Manajemen Koleksi Buku</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus size={16} /> Tambah Buku Baru
        </button>
      </div>

      <DataTable
        columns={columns}
        table={table}
        searchable
        searchPlaceholder="Cari judul, penulis, atau ISBN..."
        emptyText="Belum ada data buku."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Buku" : "Tambah Buku Baru"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {formError && (
            <p className="text-danger text-sm bg-red-50 p-2 rounded whitespace-pre-line">{formError}</p>
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
            <label className="block text-sm font-medium mb-1">Cover (opsional, JPG/PNG/WEBP maks 2MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files[0] ?? null)}
              className="text-sm w-full"
            />
            {editingId && (
              <p className="text-xs text-slate-500 mt-1">Kosongkan jika tidak ingin mengganti cover.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border">
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
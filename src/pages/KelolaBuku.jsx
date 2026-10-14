import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import { usePaginatedData } from "../hooks/usePaginatedData";
import { confirmAction, toastSuccess } from "../utils/alert";

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (coverFile) data.append("cover", coverFile);
    if (editingId) data.append("_method", "PUT");

    const { confirmed } = await confirmAction({
      title: editingId ? "Simpan perubahan?" : "Tambah buku baru?",
      text: form.title,
      confirmText: "Ya, simpan",
      action: () => api.post(editingId ? `/staff/books/${editingId}` : "/staff/books", data),
    });

    if (confirmed) {
      setIsModalOpen(false);
      table.refetch();
      toastSuccess(editingId ? "Buku berhasil diperbarui" : "Buku berhasil ditambahkan");
    }
    setSaving(false);
  }

  async function handleDelete(book) {
    const { confirmed } = await confirmAction({
      title: "Hapus buku ini?",
      text: `"${book.title}" akan dihapus dari daftar koleksi.`,
      icon: "warning",
      danger: true,
      confirmText: "Ya, hapus",
      action: () => api.delete(`/staff/books/${book.id}`),
    });

    if (confirmed) {
      table.refetch();
      toastSuccess("Buku berhasil dihapus");
    }
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
        title={editingId ? "Edit Informasi Buku" : "Tambah Buku Baru"}
        subtitle={
          editingId
            ? "Perbarui metadata atau stok buku yang terdaftar."
            : "Lengkapi data buku untuk didaftarkan ke sistem perpustakaan."
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
              <span className="font-bold text-rose-600">✕</span>
              <p className="leading-relaxed whitespace-pre-line font-medium">{formError}</p>
            </div>
          )}

          {/* Judul Buku */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
              Judul Buku <span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Contoh: Laskar Pelangi"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Penulis & Penerbit (2 kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Penulis <span className="text-rose-500">*</span>
              </label>
              <input
                name="author"
                type="text"
                value={form.author}
                onChange={handleChange}
                placeholder="Nama penulis"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Penerbit <span className="text-rose-500">*</span>
              </label>
              <input
                name="publisher"
                type="text"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Nama penerbit"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* Tahun, ISBN, Stok (3 kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Tahun Terbit <span className="text-rose-500">*</span>
              </label>
              <input
                name="publication_year"
                type="number"
                min={1800}
                max={2100}
                value={form.publication_year}
                onChange={handleChange}
                placeholder="Contoh: 2023"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                ISBN <span className="text-rose-500">*</span>
              </label>
              <input
                name="isbn"
                type="text"
                value={form.isbn}
                onChange={handleChange}
                placeholder="978-xxx-xxx"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Jumlah Stok <span className="text-rose-500">*</span>
              </label>
              <input
                name="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
              Sinopsis / Deskripsi Buku <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tuliskan ringkasan isi buku atau catatan kondisi buku..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-y"
            />
          </div>

          {/* Upload Cover */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
              Cover Buku <span className="text-slate-400 font-normal">(opsional, format JPG/PNG/WEBP maks 2MB)</span>
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 transition-all">
              <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all shrink-0">
                Pilih File Gambar
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files[0] ?? null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500 truncate flex-1">
                {coverFile ? coverFile.name : editingId ? "Sudah ada cover (pilih untuk ganti)" : "Belum ada file terpilih"}
              </span>
              {coverFile && (
                <button
                  type="button"
                  onClick={() => setCoverFile(null)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer px-1.5 py-0.5 rounded"
                  title="Batalkan pilihan cover"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-2.5 pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan Data..." : editingId ? "Simpan Perubahan" : "Simpan Buku"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KelolaBuku;
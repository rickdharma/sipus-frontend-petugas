import { ChevronLeft, ChevronRight, Search, SearchX, Inbox, AlertCircle, RotateCw } from "lucide-react";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

// Membuat daftar nomor halaman, mis. [1, "...", 5, 6, 7, "...", 12]
function getPageItems(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) items.push("...");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < last - 1) items.push("...");
  items.push(last);
  return items;
}

function DataTable({
  columns,
  table,
  emptyText = "Tidak ada data.",
  searchable = false,
  searchPlaceholder = "Cari...",
}) {
  const { rows, meta, loading, error, refetch, page, setPage, perPage, setPerPage, search, setSearch } = table;

  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const size = meta?.per_page ?? perPage;
  const total = meta?.total ?? rows.length;
  const from = rows.length === 0 ? 0 : (currentPage - 1) * size + 1;
  const to = rows.length === 0 ? 0 : from + rows.length - 1;

  const alignClass = (col) => (col.align === "right" ? "text-right" : "");

  let body;
  if (error) {
    body = (
      <div className="py-14 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mb-3">
          <AlertCircle size={20} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Gagal Memuat Data</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCw size={13} />
          <span>Coba Muat Ulang</span>
        </button>
      </div>
    );
  } else if (loading && rows.length === 0) {
    body = (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-100 bg-slate-50/30">
              {columns.map((col) => (
                <th key={col.header} className={`p-4 font-semibold ${alignClass(col)}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j} className="p-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (rows.length === 0) {
    if (search) {
      body = (
        <div className="py-14 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 border border-slate-200/80 flex items-center justify-center mb-3">
            <SearchX size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak Ada Hasil Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
            Tidak ditemukan data yang cocok dengan kata kunci{" "}
            <strong className="text-slate-700 font-medium">"{search}"</strong>. Coba periksa kembali ejaan atau gunakan kata kunci lain.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      );
    } else {
      body = (
        <div className="py-14 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 border border-slate-200/80 flex items-center justify-center mb-3">
            <Inbox size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Data Belum Tersedia</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            {emptyText}
          </p>
        </div>
      );
    }
  } else {
    body = (
      <div className={`overflow-x-auto ${loading ? "opacity-50" : ""}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
              {columns.map((col) => (
                <th key={col.header} className={`p-4 font-semibold ${alignClass(col)}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 align-top hover:bg-slate-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.header} className={`p-4 ${alignClass(col)}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-b border-slate-100 bg-slate-50/40">
        {searchable ? (
          <div className="relative sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <span />
        )}

        <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
          <span>Tampilkan</span>
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-7 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all duration-150 hover:border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
          <span>baris</span>
        </label>
      </div>

      {body}

      {!error && rows.length > 0 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm">
          <p className="text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{from}-{to}</span> dari{" "}
            <span className="font-semibold text-slate-700">{total}</span> data
          </p>

          {lastPage > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
                title="Halaman sebelumnya"
              >
                <ChevronLeft size={15} />
              </button>

              {getPageItems(currentPage, lastPage).map((item, i) =>
                item === "..." ? (
                  <span key={`gap-${i}`} className="px-1.5 text-slate-400 text-xs font-mono">
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
                      item === currentPage
                        ? "bg-indigo-600 text-white border border-indigo-600 shadow-indigo-600/20"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
                title="Halaman berikutnya"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
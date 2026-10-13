import { ChevronLeft, ChevronRight, Search } from "lucide-react";

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
      <div className="p-6">
        <p className="text-danger">{error}</p>
        <button onClick={refetch} className="mt-2 text-sm font-semibold text-primary hover:underline">
          Coba lagi
        </button>
      </div>
    );
  } else if (loading && rows.length === 0) {
    body = <p className="p-6 text-slate-500">Memuat data...</p>;
  } else if (rows.length === 0) {
    body = (
      <p className="p-6 text-slate-500">
        {search ? `Tidak ada hasil untuk "${search}".` : emptyText}
      </p>
    );
  } else {
    body = (
      <div className={`overflow-x-auto ${loading ? "opacity-50" : ""}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-400">
              {columns.map((col) => (
                <th key={col.header} className={`p-4 font-semibold ${alignClass(col)}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 align-top">
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
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-b border-slate-100">
        {searchable ? (
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="border rounded-lg py-2 pl-9 pr-3 w-full text-sm"
            />
          </div>
        ) : (
          <span />
        )}

        <label className="flex items-center gap-2 text-sm text-slate-500">
          Tampilkan
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border rounded-lg p-1.5"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          data
        </label>
      </div>

      {body}

      {!error && rows.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <p className="text-slate-500">
            Menampilkan {from}-{to} dari {total} data
          </p>

          {lastPage > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              {getPageItems(currentPage, lastPage).map((item, i) =>
                item === "..." ? (
                  <span key={`gap-${i}`} className="px-2 text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-8 px-2 py-1.5 rounded-lg border ${
                      item === currentPage ? "bg-primary text-white border-primary" : "hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
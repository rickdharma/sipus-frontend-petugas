import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";

export function usePaginatedData(
  endpoint,
  { params = {}, initialPerPage = 10, errorMessage = "Gagal memuat data" } = {}
) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [perPage, setPerPage] = useState(initialPerPage);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const lastRequest = useRef(0);

  // Filter tambahan (mis. status) dijadikan teks supaya perubahannya bisa dideteksi
  const paramsKey = JSON.stringify(params);

  // Halaman otomatis kembali ke 1 kalau filter, jumlah baris, atau kata kunci berubah
  const resetKey = `${paramsKey}|${perPage}|${debouncedSearch}`;
  const page = pageState.key === resetKey ? pageState.page : 1;
  const setPage = useCallback((p) => setPageState({ key: resetKey, page: p }), [resetKey]);

  // Tunggu 400 ms setelah berhenti mengetik baru mencari
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const refetch = useCallback(() => {
    const requestId = ++lastRequest.current;
    setLoading(true);
    setError("");

    const query = { ...JSON.parse(paramsKey), page, per_page: perPage };
    if (debouncedSearch) query.search = debouncedSearch;

    return api
      .get(endpoint, { params: query })
      .then((res) => {
        if (requestId !== lastRequest.current) return; // respons lama diabaikan
        setRows(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch((err) => {
        if (requestId !== lastRequest.current) return;
        setError(getErrorMessage(err, errorMessage));
      })
      .finally(() => {
        if (requestId === lastRequest.current) setLoading(false);
      });
  }, [endpoint, paramsKey, page, perPage, debouncedSearch, errorMessage]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Kalau halaman aktif jadi kosong (mis. item terakhir di halaman itu dihapus), mundur satu halaman
  useEffect(() => {
    if (!loading && meta && page > 1 && rows.length === 0 && page > meta.last_page) {
      setPage(Math.max(meta.last_page, 1));
    }
  }, [loading, meta, rows, page, setPage]);

  return { rows, meta, loading, error, page, setPage, perPage, setPerPage, search, setSearch, refetch };
}
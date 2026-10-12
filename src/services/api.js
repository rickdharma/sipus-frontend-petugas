import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});

// Setiap request otomatis membawa token login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petugas_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau token ditolak server (kedaluwarsa/tidak valid), paksa kembali ke login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginPage = window.location.pathname.startsWith("/login");
    if (error.response?.status === 401 && !isLoginPage) {
      localStorage.removeItem("petugas_token");
      localStorage.removeItem("petugas_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
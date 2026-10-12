import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("petugas_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(userData, token) {
    setUser(userData);
    localStorage.setItem("petugas_user", JSON.stringify(userData));
    localStorage.setItem("petugas_token", token);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Kalau gagal (misal token sudah kedaluwarsa), tetap lanjut bersihkan sisi browser
    }
    setUser(null);
    localStorage.removeItem("petugas_user");
    localStorage.removeItem("petugas_token");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
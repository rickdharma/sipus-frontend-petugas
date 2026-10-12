import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [identityNumber, setIdentityNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    api
      .post("/auth/login", { identity_number: identityNumber.trim(), password })
      .then((res) => {
        const { user, token } = res.data.data;

        // Endpoint login yang sama dipakai siswa, jadi pastikan ini akun petugas
        if (user.role !== "staff") {
          setError("Akun ini bukan akun petugas");
          return;
        }

        login(user, token);
        navigate("/");
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data?.message || "Nomor induk atau password salah");
        } else {
          setError("Tidak dapat terhubung ke server");
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Login Portal Petugas</h1>
        <p className="text-gray-500 text-sm mb-6">Masukkan nomor induk dan password petugas piket</p>

        {error && <p className="text-danger text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}

        <label className="block text-sm font-medium mb-1">Nomor Induk (ID Petugas)</label>
        <input
          type="text"
          value={identityNumber}
          onChange={(e) => setIdentityNumber(e.target.value)}
          required
          className="border rounded p-2 w-full mb-4"
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded p-2 w-full mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-white w-full py-2 rounded disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk Dashboard Petugas"}
        </button>
      </form>
    </div>
  );
}

export default Login;
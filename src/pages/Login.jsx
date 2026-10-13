import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, BookOpen } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LogoImage } from "../components/Logo";
import loginBg from "../assets/login-bg.jpg";

function Login() {
  const [identityNumber, setIdentityNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        // Endpoint login yang sama dipakai siswa, pastikan ini akun petugas
        if (user.role !== "staff") {
          setError("Akun ini bukan akun petugas. Akses hanya untuk staf perpustakaan.");
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Kolom Kiri: Sidebar Form Login Petugas (Kompak & Fokus) */}
      <div className="w-full lg:w-[420px] xl:w-[460px] 2xl:w-[480px] lg:shrink-0 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 border-r border-slate-100 z-10 bg-white">
        {/* Top Branding Header */}
        <div className="flex items-center gap-3">
          <LogoImage size={38} className="rounded-xl shadow-xs" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                SIPUS
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase border border-indigo-200/60 leading-none">
                Staff Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Sistem Informasi Perpustakaan Sekolah
            </p>
          </div>
        </div>

        {/* Center Section: Form */}
        <div className="my-10 lg:my-0 max-w-md w-full mx-auto">
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Silakan masuk menggunakan akun petugas piket untuk mengelola sirkulasi dan katalog buku.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nomor Induk */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Nomor Induk (ID Petugas) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="Contoh: PTG-2024001"
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm pl-10 pr-3.5 py-2.5 transition-all duration-150 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm pl-10 pr-10 py-2.5 transition-all duration-150 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Info */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Akses terproteksi khusus staf perpustakaan berwenang.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
          © 2026 SIPUS • Sistem Informasi Perpustakaan Sekolah
        </div>
      </div>

      {/* Kolom Kanan: Visual Hero Panel Luas (Gedung Sekolah & Suasana Kampus) */}
      <div className="hidden lg:relative lg:flex lg:flex-1 bg-slate-950 overflow-hidden">
        <img
          src={loginBg}
          alt="Gedung SMKS TI ANNISA 2"
          className="absolute inset-0 w-full h-full object-cover object-center scale-102"
        />
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-indigo-950/30" />

        {/* Hero Overlay Content */}
        <div className="relative z-10 mt-auto p-12 lg:p-16 xl:p-20 text-white max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white mb-4">
            <BookOpen size={13} className="text-indigo-300" />
            <span>Pusat Sumber Belajar & Literasi</span>
          </div>

          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight leading-snug text-white">
            "Membuka Gerbang Pengetahuan, Membangun Generasi Gemilang."
          </h2>

          <p className="mt-3 text-sm text-slate-200/90 leading-relaxed font-normal">
            Platform terpadu untuk sirkulasi buku, verifikasi peminjaman daring, dan inventarisasi perpustakaan sekolah.
          </p>

          {/* Feature Badges */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-200">
            <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
              ✓ Sirkulasi Cepat
            </span>
            <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
              ✓ Katalog Terintegrasi
            </span>
            <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
              ✓ Pelacakan Keterlambatan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
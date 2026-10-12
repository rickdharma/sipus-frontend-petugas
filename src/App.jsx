import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KelolaBuku from "./pages/KelolaBuku";
import PermintaanPeminjaman from "./pages/PermintaanPeminjaman";
import PeminjamanLangsung from "./pages/PeminjamanLangsung";
import Pengembalian from "./pages/Pengembalian";
import RiwayatTransaksi from "./pages/RiwayatTransaksi";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/buku" element={<KelolaBuku />} />
              <Route path="/permintaan" element={<PermintaanPeminjaman />} />
              <Route path="/peminjaman-langsung" element={<PeminjamanLangsung />} />
              <Route path="/pengembalian" element={<Pengembalian />} />
              <Route path="/riwayat" element={<RiwayatTransaksi />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
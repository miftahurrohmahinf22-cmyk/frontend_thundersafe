import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import UserRoute from './UserRoute';
import AdminRoute from './AdminRoute';
import LandingLayout from '../layouts/LandingLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import LandingPage from '../pages/Landing/LandingPage';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import PanduanAdmin from '../pages/Auth/PanduanAdmin';
import NotFound from '../pages/NotFound';

// Lazy load User dashboard pages
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Prediksi = lazy(() => import('../pages/Prediksi/Prediksi'));
const Riwayat = lazy(() => import('../pages/Riwayat/Riwayat'));
const PetaRisiko = lazy(() => import('../pages/PetaRisiko/PetaRisiko'));
const Edukasi = lazy(() => import('../pages/Edukasi/Edukasi'));
const DetailEdukasi = lazy(() => import('../pages/Edukasi/DetailEdukasi'));
const Laporan = lazy(() => import('../pages/Laporan/Laporan'));
const Pengaturan = lazy(() => import('../pages/Pengaturan/Pengaturan'));

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const KelolaUser = lazy(() => import('../pages/Admin/KelolaUser'));
const KelolaDataset = lazy(() => import('../pages/Admin/KelolaDataset'));
const ImportDataBMKG = lazy(() => import('../pages/Admin/ImportDataBMKG'));
const KelolaPrediksi = lazy(() => import('../pages/Admin/KelolaPrediksi'));
const KelolaRiwayat = lazy(() => import('../pages/Admin/KelolaRiwayat'));
const KelolaEdukasi = lazy(() => import('../pages/Admin/KelolaEdukasi'));
const KelolaLokasi = lazy(() => import('../pages/Admin/KelolaLokasi'));
const KelolaNotifikasi = lazy(() => import('../pages/Admin/KelolaNotifikasi'));
const Statistik = lazy(() => import('../pages/Admin/Statistik'));
const SystemSettings = lazy(() => import('../pages/Admin/SystemSettings'));

function DashboardLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--border-color)',
        borderTop: '3px solid var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat halaman...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with LandingLayout */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/panduan-admin" element={<PanduanAdmin />} />
      </Route>

      {/* Protected User Dashboard Routes with UserLayout */}
      <Route
        path="/"
        element={
          <UserRoute>
            <UserLayout />
          </UserRoute>
        }
      >
        <Route path="dashboard" element={<Suspense fallback={<DashboardLoader />}><Dashboard /></Suspense>} />
        <Route path="prediksi" element={<Suspense fallback={<DashboardLoader />}><Prediksi /></Suspense>} />
        <Route path="riwayat" element={<Suspense fallback={<DashboardLoader />}><Riwayat /></Suspense>} />
        <Route path="peta-risiko" element={<Suspense fallback={<DashboardLoader />}><PetaRisiko /></Suspense>} />
        <Route path="edukasi" element={<Suspense fallback={<DashboardLoader />}><Edukasi /></Suspense>} />
        <Route path="edukasi/:id" element={<Suspense fallback={<DashboardLoader />}><DetailEdukasi /></Suspense>} />
        <Route path="laporan" element={<Suspense fallback={<DashboardLoader />}><Laporan /></Suspense>} />
        <Route path="pengaturan" element={<Suspense fallback={<DashboardLoader />}><Pengaturan /></Suspense>} />
      </Route>

      {/* Protected Admin Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<DashboardLoader />}><AdminDashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<DashboardLoader />}><KelolaUser /></Suspense>} />
        <Route path="dataset" element={<Suspense fallback={<DashboardLoader />}><KelolaDataset /></Suspense>} />
        <Route path="prediksi" element={<Suspense fallback={<DashboardLoader />}><KelolaPrediksi /></Suspense>} />
        <Route path="import-bmkg" element={<Suspense fallback={<DashboardLoader />}><ImportDataBMKG /></Suspense>} />
        <Route path="import" element={<Navigate to="/admin/import-bmkg" replace />} />
        <Route path="import-data" element={<Navigate to="/admin/import-bmkg" replace />} />
        <Route path="import-csv" element={<Navigate to="/admin/import-bmkg" replace />} />
        <Route path="riwayat" element={<Suspense fallback={<DashboardLoader />}><KelolaRiwayat /></Suspense>} />
        <Route path="edukasi" element={<Suspense fallback={<DashboardLoader />}><KelolaEdukasi /></Suspense>} />
        <Route path="lokasi" element={<Suspense fallback={<DashboardLoader />}><KelolaLokasi /></Suspense>} />
        <Route path="notifikasi" element={<Suspense fallback={<DashboardLoader />}><KelolaNotifikasi /></Suspense>} />
        <Route path="statistik" element={<Suspense fallback={<DashboardLoader />}><Statistik /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<DashboardLoader />}><SystemSettings /></Suspense>} />
        {/* Profile Settings for Admin */}
        <Route path="profile-settings" element={<Suspense fallback={<DashboardLoader />}><Pengaturan /></Suspense>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

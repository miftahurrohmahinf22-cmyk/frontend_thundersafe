import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Zap, Map, FileText, Settings, LogOut, 
  Users, Database, BookOpen, MapPin, Activity, X, Bell, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ role = 'user', isOpen, setIsOpen }) {
  const { logout } = useAuth();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const userRoutes = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Hasil Prediksi', path: '/prediksi', icon: Zap },
    { name: 'Peta Risiko', path: '/peta-risiko', icon: Map },
    { name: 'Riwayat', path: '/riwayat', icon: Activity },
    { name: 'Edukasi', path: '/edukasi', icon: BookOpen },
    { name: 'Laporan', path: '/laporan', icon: FileText },
    { name: 'Pengaturan', path: '/pengaturan', icon: Settings },
  ];

  const adminRoutes = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Data Cuaca', path: '/admin/prediksi', icon: Zap },
    { name: 'Import Data BMKG', path: '/admin/import-bmkg', icon: FileText },
    { name: 'Dataset Training', path: '/admin/dataset', icon: Database },
    { name: 'Kelola User', path: '/admin/users', icon: Users },
    { name: 'Kelola Riwayat', path: '/admin/riwayat', icon: Activity },
    { name: 'Kelola Edukasi', path: '/admin/edukasi', icon: BookOpen },
    { name: 'Kelola Lokasi', path: '/admin/lokasi', icon: MapPin },
    { name: 'Kelola Notifikasi', path: '/admin/notifikasi', icon: Bell },
    { name: 'Statistik', path: '/admin/statistik', icon: BarChart2 },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const routes = role === 'admin' ? adminRoutes : userRoutes;

  const SidebarContent = (
    <div className="h-full flex flex-col w-64 bg-[var(--bg-surface-glass)] backdrop-blur-xl border-r border-[var(--border-color)]">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-[var(--border-color)] justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">Thunder<span className="text-[var(--accent-primary)]">Safe</span></span>
        </div>
        
        {/* Mobile close button */}
        <button className="md:hidden p-2 text-[var(--text-secondary)]" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar flex flex-col gap-1">
        {routes.map((route) => {
          const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/');
          const Icon = route.icon;
          return (
            <Link
              key={route.path}
              to={route.path}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group relative ${
                isActive 
                  ? `bg-[var(--accent-primary)] text-white shadow-md shadow-blue-500/20` 
                  : `text-[var(--text-secondary)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)]`
              }`}
            >
              {isActive && (
                <motion.div layoutId="active-nav" className="absolute inset-0 bg-[var(--accent-primary)] rounded-xl -z-10" />
              )}
              <Icon size={18} className={`relative z-10 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="relative z-10">{route.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 relative z-40 h-screen">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 shadow-2xl"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

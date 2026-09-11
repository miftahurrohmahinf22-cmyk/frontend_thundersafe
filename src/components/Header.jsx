import { useState, useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Bell, User as UserIcon, Settings as SettingsIcon, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getNotifikasi, markAsRead } from '../api/notifikasiApi';

const routeTitles = {
  '/dashboard': 'Ringkasan Dashboard',
  '/prediksi': 'Hasil Prediksi',
  '/peta-risiko': 'Peta Interaktif',
  '/riwayat': 'Riwayat Analisis',
  '/edukasi': 'Pusat Edukasi',
  '/laporan': 'Unduh Laporan',
  '/pengaturan': 'Pengaturan Profil',
  '/admin/dashboard': 'Statistik Global',
  '/admin/users': 'Manajemen Pengguna',
  '/admin/dataset': 'Dataset Training',
  '/admin/prediksi': 'Kelola Data Cuaca',
  '/admin/import-bmkg': 'Import Data BMKG',
  '/admin/riwayat': 'Kelola Riwayat Unduhan',
  '/admin/edukasi': 'Konten Edukasi',
  '/admin/lokasi': 'Stasiun Pemantauan',
  '/admin/notifikasi': 'Kelola Notifikasi Sistem',
  '/admin/statistik': 'Statistik & Analisis',
  '/admin/settings': 'Konfigurasi Sistem',
  '/admin/profile-settings': 'Pengaturan Profil Admin',
};

export default function Header({ setIsSidebarOpen }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const title = routeTitles[location.pathname] || 'Dashboard';

  const loadNotifications = async () => {
    try {
      const res = await getNotifikasi();
      if (res.success) {
        const notifs = res.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.status_baca).length);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Interval real-time sync notifikasi setiap 5 detik
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur-md sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-primary)] hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Actions */}
        <div className="flex items-center gap-2 border-r border-[var(--border-color)] pr-3 md:pr-5">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--border-color)] text-[var(--text-secondary)] transition-colors cursor-pointer">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Notification Bell with Panel Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="p-2 rounded-full hover:bg-[var(--border-color)] text-[var(--text-secondary)] transition-colors relative cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute top-16 sm:top-auto right-3 sm:right-0 left-3 sm:left-auto mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] premium-card bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-2xl overflow-hidden z-[150]">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-base)]/50 flex justify-between items-center">
                  <h3 className="font-extrabold text-sm">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold text-[10px]">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                
                <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-[var(--border-color)]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--text-secondary)] font-medium">
                      Belum ada notifikasi.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isHigh = notif.judul?.toLowerCase().includes('tinggi') || notif.pesan?.toLowerCase().includes('tinggi');
                      const isMed = notif.judul?.toLowerCase().includes('sedang') || notif.pesan?.toLowerCase().includes('sedang');
                      
                      return (
                        <div 
                          key={notif.id} 
                          className={`p-4 text-xs transition-all relative group flex flex-col gap-1.5
                            ${!notif.status_baca ? 'bg-[var(--accent-primary)]/5' : 'hover:bg-[var(--bg-base)]/30'}
                          `}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-extrabold tracking-wide uppercase text-[9px] px-1.5 py-0.5 rounded border
                              ${isHigh ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                isMed ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                'bg-green-500/10 text-green-500 border-green-500/20'}
                            `}>
                              {isHigh ? 'BAHAYA' : isMed ? 'WASPADA' : 'AMAN'}
                            </span>
                            {!notif.status_baca && (
                              <button 
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="p-1 rounded bg-[var(--border-color)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors cursor-pointer"
                                title="Tandai telah dibaca"
                              >
                                <Check size={10} />
                              </button>
                            )}
                          </div>
                          
                          <p className="font-bold text-[var(--text-primary)] leading-snug">{notif.judul || 'Update Data BMKG'}</p>
                          <p className="text-[var(--text-secondary)] leading-relaxed">{notif.pesan}</p>
                          
                          <span className="text-[9px] text-[var(--text-secondary)] font-medium">
                            ⏱️ {new Date(notif.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })} WIB
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile with Clickable Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                {user?.nama || 'Pengguna'}
              </span>
              <span className="text-xs text-[var(--text-secondary)] capitalize">{user?.role || 'User'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-premium p-[2px] active:scale-95 transition-transform">
              <div className="w-full h-full rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-sm font-black border-2 border-[var(--bg-surface)]">
                {(user?.nama?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 premium-card bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-2xl overflow-hidden z-50 py-1.5 text-xs">
              <Link 
                to="/pengaturan" 
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors font-semibold"
              >
                <UserIcon size={14} className="text-[var(--text-secondary)]" />
                Profil Saya
              </Link>
              <Link 
                to="/pengaturan" 
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors font-semibold"
              >
                <SettingsIcon size={14} className="text-[var(--text-secondary)]" />
                Pengaturan
              </Link>
              <div className="border-t border-[var(--border-color)] my-1" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors font-bold text-left cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

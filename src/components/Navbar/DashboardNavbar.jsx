import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/axios';
import { Bell, Menu, User, Settings, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/navbar.css';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;

export default function DashboardNavbar({ toggleSidebar, pageTitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.status_baca).length);
      }
    } catch (err) {
      console.warn("Gagal mengambil notifikasi:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling notifikasi setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/read/${id}`);
      // Perbarui state lokal
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status_baca: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Gagal menandai notifikasi:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-navbar">
      {/* Kiri: Hamburger & Title */}
      <div className="db-navbar-left">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="page-heading-title">{pageTitle || 'Dashboard'}</h1>
      </div>

      {/* Kanan: Notifikasi & Profil Dropdown */}
      <div className="db-navbar-right">
        {/* Notifikasi Bell */}
        <div className="notif-wrapper" ref={notifRef}>
          <button
            className={`notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Peringatan Bahaya Petir</h3>
                {unreadCount > 0 && <span className="notif-count-label">{unreadCount} Baru</span>}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <CheckCircle className="empty-icon" size={28} />
                    <p>Semua aman! Tidak ada peringatan petir terdeteksi.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${notif.status_baca ? 'read' : 'unread'}`}
                      onClick={() => !notif.status_baca && handleMarkAsRead(notif.id)}
                    >
                      <div className="notif-item-icon">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="notif-item-content">
                        <h4>{notif.judul}</h4>
                        <p>{notif.pesan}</p>
                        <span className="notif-time">
                          {new Date(notif.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} WIB
                        </span>
                      </div>
                      {!notif.status_baca && <span className="unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profil Dropdown */}
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button className="profile-trigger-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img
              src={user?.photo_profile || DEFAULT_AVATAR}
              alt="Profile"
              className="user-profile-img"
              onError={e => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
            <span className="user-profile-name-desktop">{user?.nama.split(' ')[0]}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div className="profile-menu-header">
                <p className="pmenu-name">{user?.nama}</p>
                <p className="pmenu-email">{user?.email}</p>
              </div>

              <ul className="profile-menu-items">
                <li onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}>
                  <User size={16} />
                  <span>Profil Saya</span>
                </li>
                <li onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}>
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </li>
                <li className="divider" />
                <li onClick={handleLogout} className="logout-item">
                  <LogOut size={16} />
                  <span>Keluar Akun</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

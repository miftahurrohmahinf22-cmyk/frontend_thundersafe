import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Zap,
  History,
  Map,
  BookOpen,
  Settings,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../../styles/sidebar.css';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;

export default function Sidebar({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/prediction', label: 'Prediksi Risiko', icon: Zap },
    { path: '/history', label: 'Riwayat', icon: History },
    { path: '/map', label: 'Peta Risiko', icon: Map },
    { path: '/education', label: 'Edukasi', icon: BookOpen },
    { path: '/report', label: 'Download Laporan', icon: FileText },
    { path: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      <aside className={`sidebar-container ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate('/')}>
            <Zap className="brand-icon" size={24} fill="currentColor" />
            <span className="brand-text">ThunderSafe</span>
          </div>
          
          {/* Tombol Collapse Desktop */}
          <button className="collapse-btn" onClick={toggleCollapse}>
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu-list">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth <= 1024) toggleSidebar(); // Tutup di mobile
                  }}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="link-icon" size={20} />
                  <span className="link-text">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer (Profile Info & Logout) */}
        <div className="sidebar-footer">
          {user && (
            <div className="user-profile-summary">
              <img
                src={user.photo_profile || DEFAULT_AVATAR}
                alt="Avatar"
                className="user-avatar"
                onError={e => { e.currentTarget.src = DEFAULT_AVATAR; }}
              />
              <div className="user-info">
                <span className="user-name">{user.nama}</span>
                <span className="user-role">{user.role === 'admin' ? 'Administrator' : 'Penganalisis'}</span>
              </div>
            </div>
          )}

          <button className="logout-btn" onClick={handleLogout} title={isCollapsed ? 'Keluar' : ''}>
            <LogOut className="logout-icon" size={20} />
            <span className="logout-text">Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}

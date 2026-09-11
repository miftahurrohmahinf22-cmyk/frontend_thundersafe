
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token'); // Cek status login

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token'); // Logout
      window.location.reload();
    } else {
      navigate('/login'); // Arahkan ke halaman Auth
    }
  };

  return (
    <nav className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4%' }}>
      <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>THUNDERSAFE</div>
      <ul className="nav-links" style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li><a href="#fitur" style={{ textDecoration: 'none', color: '#334155' }}>Fitur</a></li>
        <li><a href="#edukasi" style={{ textDecoration: 'none', color: '#334155' }}>Edukasi</a></li>
        <li><a href="#cuaca" style={{ textDecoration: 'none', color: '#334155' }}>Pantauan Cuaca</a></li>
      </ul>
      <div className="nav-actions">
        <button 
          onClick={handleAuthAction}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid #1e3a8a', background: isLoggedIn ? 'transparent' : '#1e3a8a', color: isLoggedIn ? '#1e3a8a' : '#fff', cursor: 'pointer', fontWeight: '600' }}
        >
          {isLoggedIn ? 'Keluar Dashboard' : 'Masuk / Daftar'}
        </button>
      </div>
    </nav>
  );
}
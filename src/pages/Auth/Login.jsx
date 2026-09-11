import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Bolt, Key } from 'lucide-react';
import '../../styles/login.css';

export default function Login() {
  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isLoggedIn && user) {
      const destination = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    }
    // Isi email tersimpan jika ada
    const remembered = localStorage.getItem('remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, [isLoggedIn, user, navigate]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email tidak boleh kosong.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.';
    if (!password) errors.password = 'Kata sandi tidak boleh kosong.';
    return errors;
  };

  const [coldStartNotice, setColdStartNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setColdStartNotice(false);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    
    // Notice timer for Render cold start (>4s)
    const noticeTimer = setTimeout(() => {
      setColdStartNotice(true);
    }, 4000);

    const result = await login(email.trim().toLowerCase(), password, rememberMe);
    
    clearTimeout(noticeTimer);
    setLoading(false);
    setColdStartNotice(false);

    if (result.success) {
      setSuccess('Login berhasil! Mengalihkan ke dashboard...');
      const destination = result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setError(result.message || 'Email atau kata sandi salah.');
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left-panel">
        <Link to="/" className="auth-brand">
          <span className="text-2xl font-extrabold tracking-tight">Thunder<span className="text-[var(--accent-primary)]">Safe</span></span>
        </Link>

        <div className="auth-hero-content">
          <div className="auth-hero-badge">
            <Bolt size={12} />
            Sistem Peringatan Dini Cerdas
          </div>
          <h1 className="auth-hero-title">
            Lindungi Diri & Aset<br />
            dari <span>Bahaya Petir</span>
          </h1>
          <p className="auth-hero-desc">
            ThunderSafe menggunakan algoritma Naive Bayes canggih untuk memberikan prediksi akurasi tinggi dan peta risiko real-time demi keselamatan operasional Anda.
          </p>
          <div className="auth-feature-list">
            {[
              'Prediksi risiko petir akurasi tinggi',
              'Peta risiko real-time seluruh wilayah',
              'Notifikasi peringatan dini otomatis',
              'Riwayat & laporan PDF lengkap',
            ].map((f) => (
              <div className="auth-feature-item" key={f}>
                <div className="auth-feature-check">
                  <CheckCircle size={12} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Masuk ke Akun</h1>
            <p>Selamat datang kembali! Masukkan kredensial Anda untuk melanjutkan.</p>
          </div>


          {coldStartNotice && loading && (
            <div className="auth-alert info" style={{ marginBottom: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Key size={16} className="animate-spin" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Menghubungkan ke backend Cloud (Render)... Mohon tunggu beberapa detik jika server baru bangun.</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="login-email">Alamat Email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <span className="auth-input-error">
                  <AlertCircle size={12} />{fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="login-password">Kata Sandi</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="auth-input-error">
                  <AlertCircle size={12} />{fieldErrors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot */}
            <div className="auth-form-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ingat email saya
              </label>
              <span
                className="auth-forgot-link"
                onClick={() => alert('Fitur lupa kata sandi belum tersedia. Hubungi admin.')}
                style={{ cursor: 'pointer' }}
              >
                Lupa kata sandi?
              </span>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} id="login-submit-btn">
              {loading ? (
                <>
                  <div className="btn-spinner" />
                  Masuk...
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          <p className="auth-bottom-link" style={{ marginBottom: '0.5rem' }}>
            Belum punya akun?{' '}
            <Link to="/register">Daftar sekarang</Link>
          </p>
          <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ingin hak akses Administrator? </span>
            <Link to="/panduan-admin" style={{ fontSize: '0.78rem', color: '#f97316', fontWeight: 'bold', textDecoration: 'none' }}>Baca Panduan Akses Admin</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

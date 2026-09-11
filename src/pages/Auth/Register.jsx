import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import '../../styles/login.css';

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

const strengthLabels = ['', 'Lemah', 'Sedang', 'Kuat'];
const strengthColors = ['', 'weak', 'medium', 'strong'];

export default function Register() {
  const { register, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const pwStrength = getPasswordStrength(password);

  useEffect(() => {
    if (isLoggedIn && user) {
      const destination = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const validate = () => {
    const errors = {};
    if (!nama.trim() || nama.trim().length < 2) errors.nama = 'Nama harus minimal 2 karakter.';
    if (!email.trim()) errors.email = 'Email tidak boleh kosong.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.';
    if (!password) errors.password = 'Kata sandi tidak boleh kosong.';
    else if (password.length < 6) errors.password = 'Kata sandi minimal 6 karakter.';
    if (!confirmPassword) errors.confirmPassword = 'Konfirmasi kata sandi tidak boleh kosong.';
    else if (password !== confirmPassword) errors.confirmPassword = 'Kata sandi tidak cocok.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await register(nama.trim(), email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      setSuccess('Akun berhasil dibuat! Mengalihkan ke dashboard...');
      const destination = result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setError(result.message || 'Gagal mendaftar. Coba lagi.');
    }
  };

  const clearError = (field) => setFieldErrors(prev => ({ ...prev, [field]: '' }));

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left-panel">
        <Link to="/" className="auth-brand">
          <span className="text-2xl font-extrabold tracking-tight">Thunder<span className="text-[var(--accent-primary)]">Safe</span></span>
        </Link>

        <div className="auth-hero-content">
          <div className="auth-hero-badge">
            Sistem Peringatan Dini Cerdas
          </div>
          <h1 className="auth-hero-title">
            Mulai Pantau<br />
            <span>Risiko Petir</span><br />
            Sekarang
          </h1>
          <p className="auth-hero-desc">
            Bergabunglah dengan ThunderSafe dan dapatkan akses ke sistem prediksi petir 
            dengan teknologi Gaussian Naive Bayes yang akurat untuk Yogyakarta.
          </p>
          <div className="auth-feature-list">
            {[
              'Gratis selamanya untuk pengguna individu',
              'Prediksi real-time dari 6 stasiun cuaca',
              'Dashboard analitik & riwayat lengkap',
              'Export laporan PDF profesional',
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
            <h1>Buat Akun Baru</h1>
            <p>Daftarkan diri Anda untuk mengakses seluruh fitur ThunderSafe.</p>
          </div>

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
            {/* Nama */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-nama">Nama Lengkap</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input
                  id="reg-nama"
                  type="text"
                  className={`auth-input ${fieldErrors.nama ? 'has-error' : ''}`}
                  placeholder="Nama lengkap Anda"
                  value={nama}
                  onChange={(e) => { setNama(e.target.value); clearError('nama'); }}
                  autoComplete="name"
                />
              </div>
              {fieldErrors.nama && (
                <span className="auth-input-error"><AlertCircle size={12} />{fieldErrors.nama}</span>
              )}
            </div>

            {/* Email */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-email">Alamat Email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <span className="auth-input-error"><AlertCircle size={12} />{fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-password">Kata Sandi</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div>
                  <div className="pw-strength-bar">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`pw-strength-segment ${i <= pwStrength ? `active ${strengthColors[pwStrength]}` : ''}`}
                      />
                    ))}
                  </div>
                  {pwStrength > 0 && (
                    <span style={{ fontSize: '0.72rem', color: pwStrength === 1 ? '#ef4444' : pwStrength === 2 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      Kekuatan: {strengthLabels[pwStrength]}
                    </span>
                  )}
                </div>
              )}
              {fieldErrors.password && (
                <span className="auth-input-error"><AlertCircle size={12} />{fieldErrors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-confirm">Konfirmasi Kata Sandi</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`auth-input ${fieldErrors.confirmPassword ? 'has-error' : (confirmPassword && confirmPassword === password ? '' : '')}`}
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button type="button" className="auth-input-toggle" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword === password && (
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={12} /> Kata sandi cocok
                </span>
              )}
              {fieldErrors.confirmPassword && (
                <span className="auth-input-error"><AlertCircle size={12} />{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} id="register-submit-btn">
              {loading ? (
                <><div className="btn-spinner" />Mendaftarkan akun...</>
              ) : (
                <>Buat Akun Sekarang</>
              )}
            </button>
          </form>

          <p className="auth-bottom-link" style={{ marginBottom: '0.5rem' }}>
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
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

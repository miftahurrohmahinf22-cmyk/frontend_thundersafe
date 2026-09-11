import { Link } from 'react-router-dom';
import { ShieldAlert, BookOpen, Key, Users, CheckCircle, Database } from 'lucide-react';
import '../../styles/login.css';

export default function PanduanAdmin() {
  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-form-container" style={{ maxWidth: '650px', width: '100%', margin: '2rem p-6' }}>
        
        {/* Header */}
        <div className="auth-form-header text-center mb-8">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <ShieldAlert size={26} />
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Panduan Akses Admin</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Dokumentasi Hak Akses & Keamanan Sistem ThunderSafe</p>
        </div>

        {/* Content Details */}
        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15 flex gap-3">
            <Info size={20} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong>Pemberitahuan Keamanan:</strong> Halaman ini hanya berfungsi sebagai dokumentasi sistem untuk memandu pengembang dan pengelola database. Tidak ada celah keamanan atau pendaftaran admin langsung dari halaman ini.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                <Users size={16} />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Registrasi Default</h4>
                <p className="text-xs">Seluruh pengguna yang mendaftar melalui halaman registrasi publik otomatis akan mendapatkan hak akses sebagai <strong>User biasa (Role: user)</strong>.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                <Key size={16} />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Tidak Ada Form Registrasi Admin</h4>
                <p className="text-xs">Akun administrator tidak dapat dibuat langsung melalui formulir registrasi frontend demi menjaga integritas dan keamanan data pemantauan petir BMKG.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                <Database size={16} />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Konfigurasi Database Langsung</h4>
                <p className="text-xs">Penentuan hak akses administrator dilakukan secara langsung pada server database PostgreSQL. Operator database harus mengubah nilai kolom <strong>role</strong> menjadi <strong>'admin'</strong> pada tabel <code>"User"</code> untuk pengguna terpilih.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                <CheckCircle size={16} className="text-green-500" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Akun Admin Pengujian (Seeder)</h4>
                <p className="text-xs">
                  Untuk kebutuhan pengujian saat deployment lokal, Anda dapat menggunakan akun admin default yang digenerate otomatis oleh seeder database:<br/>
                  • Email: <strong className="text-[var(--text-primary)] font-mono">admin@thundersafe.com</strong><br/>
                  • Sandi: <strong className="text-[var(--text-primary)] font-mono">admin123</strong>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-between items-center text-xs font-bold">
          <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            ← Kembali ke Login
          </Link>
          <Link to="/register" className="px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] transition-all">
            Daftar Akun User
          </Link>
        </div>

      </div>
    </div>
  );
}

// Simple placeholder import fix for Info icon
function Info(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

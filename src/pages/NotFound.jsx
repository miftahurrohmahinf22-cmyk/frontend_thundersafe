import { Link } from 'react-router-dom';
import { Zap, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {/* Animated Lightning */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(37,99,235,0.15)',
          border: '2px solid rgba(37,99,235,0.3)',
          marginBottom: '2rem',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <Zap size={48} color="#60a5fa" />
        </div>

        <div style={{ fontSize: '6rem', fontWeight: 900, color: '#2563eb', lineHeight: 1, marginBottom: '0.5rem' }}>
          404
        </div>
        <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Halaman Tidak Ditemukan
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: 400, margin: '0 auto 2.5rem' }}>
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem', background: '#2563eb',
            color: '#fff', borderRadius: '10px', fontWeight: 600,
            fontSize: '0.9rem', textDecoration: 'none',
            transition: 'background 0.2s'
          }}>
            <Home size={16} /> Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0', borderRadius: '10px', fontWeight: 600,
              fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

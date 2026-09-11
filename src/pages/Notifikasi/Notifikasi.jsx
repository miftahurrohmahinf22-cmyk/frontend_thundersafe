import { useState, useEffect } from 'react';
import { getNotifikasi, markAsRead } from '../../api/notifikasiApi';
import {
  Bell, BellOff, Zap, AlertTriangle, CheckCircle, Clock,
  RefreshCw, Check, CheckCheck
} from 'lucide-react';

const formatDate = (d) => {
  if (!d) return '-';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getRiskIcon = (risk) => {
  if (risk === 'Tinggi') return <Zap size={18} color="#ef4444" />;
  if (risk === 'Sedang') return <AlertTriangle size={18} color="#f59e0b" />;
  return <CheckCircle size={18} color="#10b981" />;
};

const getRiskColor = (risk) => {
  if (risk === 'Tinggi') return { bg: '#fef2f2', border: '#ef444440', text: '#7f1d1d', dot: '#ef4444' };
  if (risk === 'Sedang') return { bg: '#fffbeb', border: '#f59e0b40', text: '#78350f', dot: '#f59e0b' };
  return { bg: '#ecfdf5', border: '#10b98140', text: '#065f46', dot: '#10b981' };
};

function SkeletonNotif() {
  return (
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: '0.5rem', width: '60%' }} />
        <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, width: '90%' }} />
      </div>
    </div>
  );
}

export default function Notifikasi() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifikasi();
      if (res.success) {
        setNotifications(res.data || []);
      } else {
        setError('Gagal memuat notifikasi.');
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status_baca: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.status_baca);
    if (unread.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(unread.map(n => markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, status_baca: true })));
    } catch (err) {
      console.error(err);
    }
    setMarkingAll(false);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.status_baca;
    if (filter === 'read') return n.status_baca;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.status_baca).length;

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            Notifikasi
            {unreadCount > 0 && !loading && (
              <span style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem', background: '#ef4444', color: '#fff', borderRadius: '999px', fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <p>Peringatan dan informasi prediksi risiko petir untuk akun Anda.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <button
              className="btn-secondary"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              id="mark-all-read-btn"
            >
              {markingAll
                ? <div style={{ width: 14, height: 14, border: '2px solid #e2e8f0', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <CheckCheck size={14} />}
              Tandai Semua Terbaca
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={fetchNotifications}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: 'all', label: `Semua (${notifications.length})` },
          { id: 'unread', label: `Belum Dibaca (${unreadCount})` },
          { id: 'read', label: `Sudah Dibaca (${notifications.length - unreadCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            id={`notif-tab-${tab.id}`}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              border: `1px solid ${filter === tab.id ? '#2563eb' : 'var(--border-color)'}`,
              background: filter === tab.id ? '#eff6ff' : 'var(--card)',
              color: filter === tab.id ? '#2563eb' : 'var(--text-muted)',
              fontSize: '0.82rem', fontWeight: filter === tab.id ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '0.5rem', color: '#7f1d1d', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonNotif key={i} />)
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon">
              {filter === 'unread' ? <Bell size={28} /> : <BellOff size={28} />}
            </div>
            <h3>{filter === 'unread' ? 'Tidak ada notifikasi baru' : 'Tidak ada notifikasi'}</h3>
            <p>
              {filter === 'unread'
                ? 'Semua notifikasi telah dibaca.'
                : 'Notifikasi akan muncul saat ada prediksi risiko sedang atau tinggi.'}
            </p>
          </div>
        ) : (
          filtered.map((notif, idx) => {
            const risk = notif.tingkat_risiko || 'Rendah';
            const colors = getRiskColor(risk);
            const isUnread = !notif.status_baca;
            return (
              <div
                key={notif.id}
                onClick={() => isUnread && handleMarkRead(notif.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: isUnread ? colors.bg : 'transparent',
                  cursor: isUnread ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
              >
                {/* Unread dot */}
                {isUnread && (
                  <div style={{ position: 'absolute', top: '1.15rem', right: '1.25rem', width: 8, height: 8, borderRadius: '50%', background: colors.dot }} />
                )}

                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isUnread ? 'rgba(255,255,255,0.7)' : 'var(--background)', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getRiskIcon(risk)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: isUnread ? 700 : 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {notif.judul}
                    </span>
                    <span className={`risk-badge ${risk === 'Tinggi' ? 'tinggi' : risk === 'Sedang' ? 'sedang' : 'rendah'}`} style={{ fontSize: '0.7rem' }}>
                      {risk}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {notif.pesan}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(notif.created_at)}</span>
                    {isUnread && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', border: '1px solid var(--border-color)', borderRadius: '999px', background: 'var(--card)', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}
                      >
                        <Check size={11} /> Tandai terbaca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Menampilkan {filtered.length} dari {notifications.length} notifikasi (maks. 30 terbaru)
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

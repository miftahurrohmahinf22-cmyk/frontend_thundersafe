import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle,
  X, Send, User, MessageSquare, GripHorizontal, Sparkles, ShieldAlert, Info
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const notifVariants = [
  {
    id: 'danger',
    name: 'Peringatan Bahaya (Tinggi)',
    badge: 'BAHAYA',
    icon: ShieldAlert,
    iconColor: 'text-red-500',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    judul: '[PERINGATAN BAHAYA] Potensi Badai Petir Ekstrem',
    pesan: 'Peringatan dini! Indikasi petir tingkat tinggi terdeteksi di wilayah pengamatan Sleman & DIY. Segera berlindung di dalam bangunan permanen dan jauhi fasilitas luar ruangan.'
  },
  {
    id: 'warning',
    name: 'Waspada Cuaca (Sedang)',
    badge: 'WASPADA',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    judul: '[WASPADA CUACA] Peningkatan Frekuensi Petir',
    pesan: 'Kondisi kelembapan dan kecepatan angin meningkat pesat. Harap berhati-hati bagi warga yang beraktivitas di luar ruangan.'
  },
  {
    id: 'info',
    name: 'Kondisi Aman (Rendah)',
    badge: 'AMAN',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    judul: '[INFO CUACA] Aktivitas Petir Relatif Aman',
    pesan: 'Stasiun BMKG melaporkan aktivitas petir dalam rentang normal. Tetap pantau indikator risiko di dashboard ThunderSafe.'
  }
];

export default function KelolaNotifikasi() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [form, setForm] = useState({ user_id: 'all', judul: '', pesan: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [notifResult, usersResult] = await Promise.allSettled([
        apiClient.get('/admin/notifications'),
        apiClient.get('/admin/users')
      ]);

      if (notifResult.status === 'fulfilled' && notifResult.value?.data) {
        const d = notifResult.value.data;
        if (d.success && Array.isArray(d.data)) {
          setNotifications(d.data);
        } else if (Array.isArray(d)) {
          setNotifications(d);
        } else if (Array.isArray(d.data)) {
          setNotifications(d.data);
        }
      }

      if (usersResult.status === 'fulfilled' && usersResult.value?.data) {
        const d = usersResult.value.data;
        if (d.success && Array.isArray(d.data)) {
          setUsers(d.data);
        } else if (Array.isArray(d)) {
          setUsers(d);
        } else if (Array.isArray(d.data)) {
          setUsers(d.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching notification data:', err);
      setError('Gagal memuat data notifikasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyVariantTemplate = (variant) => {
    setSelectedVariant(variant.id);
    setForm(prev => ({
      ...prev,
      judul: variant.judul,
      pesan: variant.pesan
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.pesan.trim()) {
      setError('Judul dan pesan tidak boleh kosong.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post('/admin/notifications', form);
      if (res.data.success) {
        setSuccess('Notifikasi berhasil dikirim.');
        setShowAddForm(false);
        setForm({ user_id: 'all', judul: '', pesan: '' });
        setSelectedVariant(null);
        fetchData();
      } else {
        setError(res.data.message || 'Gagal mengirim notifikasi.');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      const serverMsg = err.response?.data?.message;
      setError(serverMsg || 'Gagal mengirim notifikasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus log notifikasi ini?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/notifications/${id}`);
      if (res.data.success) {
        setSuccess('Notifikasi berhasil dihapus.');
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        setError(res.data.message || 'Gagal menghapus notifikasi.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Kelola Notifikasi 🔔</h2>
          <p className="text-[var(--text-secondary)]">Kirim notifikasi sistem kustom, varian peringatan bahaya, atau pengumuman global ke pengguna.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-premium text-white flex items-center gap-1.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Plus size={16} /> Buat Notifikasi
          </button>
          <button
            onClick={fetchData}
            className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer text-[var(--text-primary)]"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 3 Template Cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {notifVariants.map((v) => {
            const IconComp = v.icon;
            return (
              <div
                key={v.id}
                onClick={() => {
                  applyVariantTemplate(v);
                  setShowAddForm(true);
                }}
                className="premium-card p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg transition-all group border border-[var(--border-color)] bg-[var(--bg-surface)]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <IconComp size={18} className={v.iconColor} />
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${v.color}`}>
                      {v.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--accent-primary)] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Pakai Template ⚡
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)] mb-1">{v.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{v.pesan}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-medium text-sm flex items-center gap-2">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Notifications Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-base)]/50 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Riwayat Log Notifikasi Terkirim</h3>
          <span className="text-xs text-[var(--text-secondary)] font-semibold">Total: {notifications.length} Log</span>
        </div>
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/30 sticky top-0 z-10">
                <th className="p-4 font-semibold whitespace-nowrap">Penerima</th>
                <th className="p-4 font-semibold whitespace-nowrap">Judul Notifikasi</th>
                <th className="p-4 font-semibold whitespace-nowrap">Isi Pesan</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status Baca</th>
                <th className="p-4 font-semibold whitespace-nowrap">Dikirim Pada</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Memuat log notifikasi...</td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Tidak ada log notifikasi sistem.</td>
                </tr>
              ) : (
                notifications.map((notif) => {
                  const titleMsg = `${notif.judul || ''} ${notif.pesan || ''}`.toLowerCase();
                  const isHigh = titleMsg.includes('bahaya') || titleMsg.includes('tinggi');
                  const isMed = titleMsg.includes('waspada') || titleMsg.includes('sedang');

                  return (
                    <tr key={notif.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold">{notif.user_nama || 'Semua Pengguna'}</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">{notif.user_email || 'Broadcast'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-2 min-w-0">
                          {isHigh ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/10 text-red-500 border border-red-500/20 whitespace-nowrap shrink-0">BAHAYA</span>
                          ) : isMed ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap shrink-0">WASPADA</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap shrink-0">AMAN</span>
                          )}
                          <span className="font-bold min-w-0 break-words">{notif.judul}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs min-w-[200px] max-w-md break-words whitespace-normal leading-relaxed" title={notif.pesan}>{notif.pesan}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase whitespace-nowrap inline-block ${
                          notif.status_baca ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {notif.status_baca ? 'Sudah Baca' : 'Belum Baca'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">{formatDate(notif.created_at)}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(notif.id)}
                          disabled={deletingId === notif.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Log"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl relative z-10 border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-base)]/50 select-none shrink-0">
                <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <Bell className="text-[var(--accent-primary)] shrink-0" size={20} />
                  <span className="truncate">Kirim Notifikasi Baru</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
                {/* Varian Selection Inside Form */}
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-[var(--text-secondary)]">Pilih Varian Template (Opsional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {notifVariants.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => applyVariantTemplate(v)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-1.5 ${
                          selectedVariant === v.id
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                        }`}
                      >
                        <span className="truncate">{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Target Penerima</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all text-xs font-semibold"
                    value={form.user_id}
                    onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                  >
                    <option value="all">📢 Kirim Ke Semua Pengguna (Broadcast)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>👤 {u.nama} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Judul Notifikasi</label>
                  <input
                    type="text" required
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all text-xs"
                    value={form.judul}
                    onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder="Contoh: [PERINGATAN BAHAYA] Potensi Badai Petir Sleman"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Pesan</label>
                  <textarea
                    rows={4} required
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all text-xs leading-relaxed"
                    value={form.pesan}
                    onChange={e => setForm(f => ({ ...f, pesan: e.target.value }))}
                    placeholder="Tulis pesan pengumuman atau instruksi mitigasi..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--border-color)] text-sm font-semibold transition-colors cursor-pointer text-[var(--text-primary)]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-premium text-white text-sm font-semibold shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={14} /> {submitting ? 'Mengirim...' : 'Kirim Sekarang'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

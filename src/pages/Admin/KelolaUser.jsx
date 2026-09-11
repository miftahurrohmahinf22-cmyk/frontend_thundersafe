import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Trash2, Search, RefreshCw, AlertTriangle, CheckCircle,
  UserPlus, Mail, ShieldAlert, X
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function KelolaUser() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/users');
      const d = res.data;
      if (d?.success && Array.isArray(d.data)) {
        setUsers(d.data);
      } else if (Array.isArray(d)) {
        setUsers(d);
      } else if (Array.isArray(d?.data)) {
        setUsers(d.data);
      } else {
        setError('Gagal memuat daftar pengguna.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setSuccess('Pengguna berhasil dihapus.');
        setUsers(prev => prev.filter(u => u.id !== id));
        setShowConfirm(null);
      } else {
        setError(res.data.message || 'Gagal menghapus pengguna.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Kelola Pengguna 👥</h2>
          <p className="text-[var(--text-secondary)]">Lihat daftar, ganti hak akses, atau hapus keanggotaan pengguna ThunderSafe.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer text-[var(--text-primary)]"
        >
          <RefreshCw size={16} />
          Segarkan
        </button>
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

      {/* Search Toolbar */}
      <div className="premium-card p-4 mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/50">
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Terdaftar Pada</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">Memuat data pengguna...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">Tidak ada pengguna ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="p-4 font-bold">{u.nama}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{formatDate(u.created_at)}</td>
                    <td className="p-4 text-center">
                      {u.id === currentUser.id ? (
                        <span className="text-xs text-[var(--text-secondary)] italic">Akun Anda</span>
                      ) : (
                        <button
                          onClick={() => setShowConfirm(u.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl relative z-10 border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={22} />
                Konfirmasi Hapus
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini bersifat permanen dan akan menghapus seluruh data cuaca, riwayat prediksi, notifikasi, serta laporan terkait pengguna ini.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--border-color)] text-sm font-semibold transition-colors cursor-pointer text-[var(--text-primary)]"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(showConfirm)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {deletingId !== null ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

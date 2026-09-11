import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, RefreshCw, AlertTriangle, CheckCircle, Trash2, Download,
  Clock, MapPin, User, Calendar
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function KelolaRiwayat() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/laporan');
      if (res.data.success) {
        setReports(res.data.data || []);
      } else {
        setError('Gagal memuat log riwayat laporan.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus log laporan ini?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/laporan/${id}`);
      if (res.data.success) {
        setSuccess('Log laporan berhasil dihapus.');
        setReports(prev => prev.filter(r => r.id !== id));
      } else {
        setError(res.data.message || 'Gagal menghapus log.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReports = reports.filter(r =>
    r.nama_file.toLowerCase().includes(search.toLowerCase()) ||
    r.user_nama.toLowerCase().includes(search.toLowerCase()) ||
    r.nama_pos.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Kelola Riwayat Laporan 📂</h2>
          <p className="text-[var(--text-secondary)]">Kelola log download laporan PDF yang digenerate oleh pengguna.</p>
        </div>
        <button
          onClick={fetchReports}
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

      {/* Search Bar */}
      <div className="premium-card p-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari file, pengguna, atau stasiun..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/50">
                <th className="p-4 font-semibold">Nama File</th>
                <th className="p-4 font-semibold">Dibuat Oleh</th>
                <th className="p-4 font-semibold">Tingkat Risiko</th>
                <th className="p-4 font-semibold">Confidence</th>
                <th className="p-4 font-semibold">Waktu Download</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Memuat data log laporan...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Tidak ada log laporan ditemukan.</td>
                </tr>
              ) : (
                filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-2">
                      <FileText className="text-[var(--text-secondary)]" size={16} />
                      {item.nama_file}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{item.user_nama}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{item.user_email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        item.tingkat_risiko === 'Tinggi' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        item.tingkat_risiko === 'Sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {item.tingkat_risiko}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{item.probabilitas}%</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{formatDate(item.created_at)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Download File"
                        >
                          <Download size={16} />
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Log"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Plus, Trash2, Search, RefreshCw, AlertTriangle, CheckCircle,
  X, Filter, ChevronLeft, ChevronRight, Sliders
} from 'lucide-react';

const defaultForm = {
  suhu: 28,
  kelembapan: 70,
  kecepatan_angin: 12,
  kecepatan_angin_max: 18,
  tekanan_udara: 1010,
  aktivitas_petir: 5,
  kelas_risiko: 'Rendah'
};

export default function KelolaDataset() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/dataset', {
        params: {
          limit: 20,
          offset: (page - 1) * 20,
          search
        }
      });
      const d = res.data;
      if (d?.success && Array.isArray(d.data)) {
        setData(d.data);
        setTotal(d.total ?? d.data.length);
      } else if (Array.isArray(d)) {
        setData(d);
        setTotal(d.length);
      } else if (Array.isArray(d?.data)) {
        setData(d.data);
        setTotal(d.total ?? d.data.length);
      } else {
        setError('Gagal memuat dataset.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleInputChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post('/admin/dataset', form);
      if (res.data.success) {
        setSuccess('Data latih berhasil ditambahkan.');
        setShowAddForm(false);
        setForm(defaultForm);
        setPage(1);
        fetchData();
      } else {
        setError(res.data.message || 'Gagal menambahkan data latih.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/dataset/${id}`);
      if (res.data.success) {
        setSuccess('Data latih berhasil dihapus.');
        fetchData();
      } else {
        setError(res.data.message || 'Gagal menghapus data.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Kelola Dataset GNB 📊</h2>
          <p className="text-[var(--text-secondary)]">Kelola data training untuk kalkulasi posterior algoritma Naive Bayes.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-premium text-white flex items-center gap-1.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Plus size={16} /> Tambah Data
          </button>
          <button
            onClick={fetchData}
            className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer text-[var(--text-primary)]"
          >
            <RefreshCw size={16} />
          </button>
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

      {/* Toolbar */}
      <div className="premium-card p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari kelas risiko (Rendah, Sedang, Tinggi)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
        <div className="text-sm text-[var(--text-secondary)] font-semibold">
          Menampilkan {data.length} dari {total} entri
        </div>
      </div>

      {/* Dataset Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/50">
                <th className="p-4 font-semibold">Suhu (°C)</th>
                <th className="p-4 font-semibold">Kelembapan (%)</th>
                <th className="p-4 font-semibold">Angin Rata (km/j)</th>
                <th className="p-4 font-semibold">Angin Maks (km/j)</th>
                <th className="p-4 font-semibold">Tekanan (hPa)</th>
                <th className="p-4 font-semibold">Aktivitas Petir</th>
                <th className="p-4 font-semibold">Kelas Risiko</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--text-secondary)]">Memuat data latih...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--text-secondary)]">Tidak ada data latih.</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="p-4 font-bold">{item.suhu}</td>
                    <td className="p-4">{item.kelembapan}</td>
                    <td className="p-4">{item.kecepatan_angin}</td>
                    <td className="p-4">{item.kecepatan_angin_max}</td>
                    <td className="p-4">{item.tekanan_udara}</td>
                    <td className="p-4">{item.aktivitas_petir}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        item.kelas_risiko === 'Tinggi' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        item.kelas_risiko === 'Sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {item.kelas_risiko}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Entri"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-base)]/20 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-primary)]"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <span className="text-xs font-bold text-[var(--text-secondary)]">Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-primary)]"
            >
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Add Modal Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl p-6 md:p-8 rounded-2xl relative z-10 border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <Database className="text-[var(--accent-primary)]" size={24} />
                  Tambah Data Training Baru
                </h3>
                <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-secondary)]">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Suhu (°C)</label>
                    <input
                      type="number" step="0.1" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.suhu}
                      onChange={e => handleInputChange('suhu', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Kelembapan (%)</label>
                    <input
                      type="number" step="1" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.kelembapan}
                      onChange={e => handleInputChange('kelembapan', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Angin Rata (km/j)</label>
                    <input
                      type="number" step="0.1" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.kecepatan_angin}
                      onChange={e => handleInputChange('kecepatan_angin', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Angin Maksimum (km/j)</label>
                    <input
                      type="number" step="0.1" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.kecepatan_angin_max}
                      onChange={e => handleInputChange('kecepatan_angin_max', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Tekanan Udara (hPa)</label>
                    <input
                      type="number" step="0.1" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.tekanan_udara}
                      onChange={e => handleInputChange('tekanan_udara', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Aktivitas Petir (Strikes)</label>
                    <input
                      type="number" step="1" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.aktivitas_petir}
                      onChange={e => handleInputChange('aktivitas_petir', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Kelas Risiko (Target)</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                    value={form.kelas_risiko}
                    onChange={e => handleInputChange('kelas_risiko', e.target.value)}
                  >
                    <option value="Rendah">Rendah / Aman</option>
                    <option value="Sedang">Sedang / Waspada</option>
                    <option value="Tinggi">Tinggi / Bahaya</option>
                  </select>
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
                    className="px-5 py-2 rounded-xl bg-gradient-premium text-white text-sm font-semibold shadow-lg transition-all cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Data'}
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

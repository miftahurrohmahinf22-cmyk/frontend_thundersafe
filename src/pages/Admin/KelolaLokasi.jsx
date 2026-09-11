import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Trash2, Search, RefreshCw, AlertTriangle, CheckCircle,
  X, Compass, Map
} from 'lucide-react';

const defaultForm = {
  nama_pos: '',
  kawasan: '',
  desa: '',
  kecamatan: '',
  kabupaten: '',
  latitude: -7.7156,
  longtitude: 110.3556
};

export default function KelolaLokasi() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/lokasi');
      const d = res.data;
      if (d?.success && Array.isArray(d.data)) {
        setLocations(d.data);
      } else if (Array.isArray(d)) {
        setLocations(d);
      } else if (Array.isArray(d?.data)) {
        setLocations(d.data);
      } else {
        setError('Gagal memuat stasiun pemantauan.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_pos.trim() || !form.kabupaten.trim()) {
      setError('Nama Pos dan Kabupaten tidak boleh kosong.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post('/admin/lokasi', form);
      if (res.data.success) {
        setSuccess('Lokasi pemantauan berhasil ditambahkan.');
        setShowAddForm(false);
        setForm(defaultForm);
        fetchLocations();
      } else {
        setError(res.data.message || 'Gagal menambahkan lokasi.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus stasiun pemantauan ini?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/lokasi/${id}`);
      if (res.data.success) {
        setSuccess('Stasiun pemantauan berhasil dihapus.');
        fetchLocations();
      } else {
        setError(res.data.message || 'Gagal menghapus lokasi.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = locations.filter(l =>
    l.nama_pos.toLowerCase().includes(search.toLowerCase()) ||
    l.kabupaten.toLowerCase().includes(search.toLowerCase()) ||
    l.kawasan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Kelola Lokasi 📍</h2>
          <p className="text-[var(--text-secondary)]">Kelola stasiun cuaca dan koordinat peta simulasi risiko sambaran petir.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-premium text-white flex items-center gap-1.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Plus size={16} /> Tambah Stasiun
          </button>
          <button
            onClick={fetchLocations}
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

      {/* Search Toolbar */}
      <div className="premium-card p-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari stasiun pemantauan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Locations Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/50">
                <th className="p-4 font-semibold">Nama Stasiun / Pos</th>
                <th className="p-4 font-semibold">Kawasan</th>
                <th className="p-4 font-semibold">Kecamatan</th>
                <th className="p-4 font-semibold">Kabupaten</th>
                <th className="p-4 font-semibold">Latitude</th>
                <th className="p-4 font-semibold">Longitude</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">Memuat data lokasi...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">Tidak ada stasiun cuaca ditemukan.</td>
                </tr>
              ) : (
                filtered.map((loc) => (
                  <tr key={loc.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-2">
                      <MapPin className="text-[var(--accent-primary)]" size={16} />
                      {loc.nama_pos}
                    </td>
                    <td className="p-4">{loc.kawasan}</td>
                    <td className="p-4">{loc.kecamatan}</td>
                    <td className="p-4">{loc.kabupaten}</td>
                    <td className="p-4 text-xs font-mono">{parseFloat(loc.latitude).toFixed(4)}</td>
                    <td className="p-4 text-xs font-mono">{parseFloat(loc.longtitude).toFixed(4)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(loc.id)}
                        disabled={deletingId === loc.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Stasiun"
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
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl p-6 md:p-8 rounded-2xl relative z-10 border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <MapPin className="text-[var(--accent-primary)]" size={24} />
                  Tambah Stasiun Cuaca Baru
                </h3>
                <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-secondary)]">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Nama Stasiun / Pos</label>
                    <input
                      type="text" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.nama_pos}
                      onChange={e => setForm(f => ({ ...f, nama_pos: e.target.value }))}
                      placeholder="Contoh: Pos Kaliurang Lereng"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Kawasan</label>
                    <input
                      type="text" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.kawasan}
                      onChange={e => setForm(f => ({ ...f, kawasan: e.target.value }))}
                      placeholder="Contoh: Lereng Gunung / Pusat Kota"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Desa</label>
                    <input
                      type="text" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.desa}
                      onChange={e => setForm(f => ({ ...f, desa: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Kecamatan</label>
                    <input
                      type="text" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.kecamatan}
                      onChange={e => setForm(f => ({ ...f, kecamatan: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Kabupaten</label>
                    <input
                      type="text" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all"
                      value={form.kabupaten}
                      onChange={e => setForm(f => ({ ...f, kabupaten: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Latitude (Koordinat Y)</label>
                    <input
                      type="number" step="0.000001" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all font-mono"
                      value={form.latitude}
                      onChange={e => setForm(f => ({ ...f, latitude: parseFloat(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[var(--text-secondary)]">Longitude (Koordinat X)</label>
                    <input
                      type="number" step="0.000001" required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all font-mono"
                      value={form.longtitude}
                      onChange={e => setForm(f => ({ ...f, longtitude: parseFloat(e.target.value) }))}
                    />
                  </div>
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
                    {submitting ? 'Menyimpan...' : 'Simpan Lokasi'}
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

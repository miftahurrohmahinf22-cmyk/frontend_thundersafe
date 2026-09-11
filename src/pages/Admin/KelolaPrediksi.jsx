import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Search, RefreshCw, AlertTriangle, CheckCircle, Trash2, Eye,
  ChevronLeft, ChevronRight, X, Thermometer, Droplets, Wind, CloudRain,
  Gauge, MapPin, User, Info
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

export default function KelolaPrediksi() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/predictions', {
        params: {
          search,
          filter,
          sort,
          page,
          limit: 15
        }
      });
      if (res?.data?.success) {
        setData(res.data.data || []);
        setTotal(res.data.pagination?.totalItems || 0);
      } else {
        setError(res?.data?.message || 'Gagal memuat data prediksi.');
      }
    } catch (err) {
      console.error('Error fetching admin predictions:', err);
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filter, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus data prediksi ini?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/predictions/${id}`);
      if (res?.data?.success) {
        setSuccess('Data prediksi berhasil dihapus.');
        setSelected(null);
        fetchData();
      } else {
        setError(res?.data?.message || 'Gagal menghapus data.');
      }
    } catch (err) {
      console.error('Error deleting prediction:', err);
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="pb-10 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Kelola Prediksi ⚡</h2>
          <p className="text-[var(--text-secondary)]">Kelola hasil kalkulasi prediksi risiko petir yang dihitung oleh pengguna.</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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

      {/* Toolbar */}
      <div className="premium-card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari stasiun atau pengguna..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">Semua Risiko</option>
            <option value="Rendah">Risiko Rendah</option>
            <option value="Sedang">Risiko Sedang</option>
            <option value="Tinggi">Risiko Tinggi</option>
          </select>

          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="confidence_high">Confidence Tertinggi</option>
            <option value="confidence_low">Confidence Terendah</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/50">
                <th className="p-4 font-semibold">Pengguna</th>
                <th className="p-4 font-semibold">Stasiun Pemantauan</th>
                <th className="p-4 font-semibold">Tingkat Risiko</th>
                <th className="p-4 font-semibold">Confidence</th>
                <th className="p-4 font-semibold">Waktu Prediksi</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Memuat data prediksi...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Tidak ada data prediksi terhitung.</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.hasil_prediksi_id || item.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{item.user_nama || 'Pengguna'}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{item.user_email || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold">{item.nama_pos || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        item.tingkat_risiko === 'Tinggi' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        item.tingkat_risiko === 'Sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {item.tingkat_risiko || 'Rendah'}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{item.probabilitas || 0}%</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{formatDate(item.created_at)}</td>
                    <td className="p-4 text-center flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.hasil_prediksi_id || item.id)}
                        disabled={deletingId === (item.hasil_prediksi_id || item.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Prediksi"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-base)]/20 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-[var(--border-color)] transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <span className="text-xs font-bold text-[var(--text-secondary)]">Halaman {page} dari {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-[var(--border-color)] transition-colors cursor-pointer"
            >
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl p-6 md:p-8 rounded-2xl relative z-10 border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
                <div>
                  <h3 className="text-xl font-extrabold flex items-center gap-2">
                    <Zap className="text-[var(--accent-primary)]" size={24} />
                    Detail Prediksi Risiko
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">ID Prediksi: {selected.hasil_prediksi_id || selected.id || '-'}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-secondary)]">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Weather Parameters (4 Main Features) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Parameter Cuaca</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                      <Thermometer size={16} className="text-red-500" />
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase">Suhu (TAVG)</p>
                        <p className="text-sm font-bold">{selected.suhu !== undefined && selected.suhu !== null ? `${selected.suhu}°C` : '-'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                      <Droplets size={16} className="text-blue-500" />
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase">Kelembapan (RH)</p>
                        <p className="text-sm font-bold">{selected.kelembapan !== undefined && selected.kelembapan !== null ? `${selected.kelembapan}%` : '-'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                      <Wind size={16} className="text-teal-500" />
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase">Angin (FF_AVG)</p>
                        <p className="text-sm font-bold">{selected.kecepatan_angin !== undefined && selected.kecepatan_angin !== null ? `${selected.kecepatan_angin} km/j` : '-'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                      <Wind size={16} className="text-indigo-500" />
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase">Angin Maks (FF_MAX)</p>
                        <p className="text-sm font-bold">{selected.kecepatan_angin_max !== undefined && selected.kecepatan_angin_max !== null ? `${selected.kecepatan_angin_max} km/j` : (selected.kecepatan_angin ? `${(selected.kecepatan_angin * 1.5).toFixed(1)} km/j` : '-')}</p>
                      </div>
                    </div>
                    {selected.tekanan_udara !== undefined && selected.tekanan_udara !== null && (
                      <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2 col-span-2">
                        <Gauge size={16} className="text-purple-500" />
                        <div>
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase">Tekanan Udara (Observasi)</p>
                          <p className="text-sm font-bold">{selected.tekanan_udara} hPa</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prediction Output */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Hasil Klasifikasi GNB</h4>
                  <div className="p-4 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Tingkat Risiko</span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        selected.tingkat_risiko === 'Tinggi' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        selected.tingkat_risiko === 'Sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {selected.tingkat_risiko || 'Rendah'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Confidence</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{selected.probabilitas || 0}%</span>
                    </div>
                    <div className="flex justify-between items-start gap-2 border-t border-[var(--border-color)] pt-3">
                      <MapPin size={16} className="text-[var(--text-secondary)] mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">{selected.nama_pos || 'Stasiun BMKG'}</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">{selected.desa || '-'}, {selected.kecamatan || '-'}, {selected.kabupaten || '-'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start gap-2 border-t border-[var(--border-color)] pt-3">
                      <User size={16} className="text-[var(--text-secondary)] mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">Dihitung Oleh</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">{selected.user_nama || 'Sistem Admin'} ({selected.user_email || 'admin'})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 mb-6 text-sm flex gap-3 text-blue-500">
                <Info size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Rekomendasi Keamanan</p>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{selected.rekomendasi || 'Tetap perhatikan kondisi cuaca secara berkala.'}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--border-color)] text-sm font-semibold transition-colors cursor-pointer text-[var(--text-primary)]"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selected.hasil_prediksi_id || selected.id)}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hapus Prediksi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

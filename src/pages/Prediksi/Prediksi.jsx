import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../../api/hasilPrediksiApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Thermometer, Droplets, Wind, CloudRain, Gauge,
  MapPin, AlertTriangle, CheckCircle, Search, SlidersHorizontal, Info, Eye
} from 'lucide-react';
import { getLokasi } from '../../api/prediksiApi';

export default function Prediksi() {
  const [data, setData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);

  // Load locations for filtering
  useEffect(() => {
    getLokasi().then(res => {
      if (res.success) {
        setLocations(res.data || []);
      }
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const filter = selectedRisk !== 'all' ? selectedRisk : 'all';
      const res = await getHistory({
        search,
        filter,
        locationId: selectedLocation,
        page,
        limit: 10,
        sort: 'newest'
      });
      if (res.success) {
        setData(res.data || []);
        setPagination(res.pagination || { totalItems: (res.data || []).length, totalPages: 1, currentPage: page });
      }
    } catch (err) {
      console.error('Error fetching prediction results:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedLocation, selectedRisk, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(1), 300);
    return () => clearTimeout(timer);
  }, [search, selectedLocation, selectedRisk, fetchData]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskStyles = (risk) => {
    if (!risk) return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', badge: 'bg-green-500/20 text-green-500 border border-green-500/30', label: 'RENDAH', icon: <CheckCircle size={18} /> };
    const r = risk.toLowerCase();
    if (r === 'rendah' || r === 'aman') {
      return {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500/20',
        badge: 'bg-green-500/20 text-green-500 border border-green-500/30',
        label: 'RENDAH',
        icon: <CheckCircle size={18} />
      };
    }
    if (r === 'sedang' || r === 'waspada') {
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-500',
        border: 'border-yellow-500/20',
        badge: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
        label: 'SEDANG',
        icon: <AlertTriangle size={18} />
      };
    }
    return {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      badge: 'bg-red-500/20 text-red-500 border border-red-500/30',
      label: 'TINGGI',
      icon: <Zap size={18} />
    };
  };

  return (
    <div className="pb-10 text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight">Hasil Prediksi Sistem ⚡</h2>
        <p className="text-[var(--text-secondary)]">Daftar lengkap klasifikasi potensi risiko petir otomatis berbasis algoritma Gaussian Naive Bayes.</p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs flex gap-3 items-center mb-6">
        <Info size={16} className="shrink-0" />
        <span>Halaman ini murni bersifat <strong>Monitoring (Read-Only)</strong>. Seluruh data hasil perhitungan dan mitigasi bersumber langsung dari database stasiun BMKG.</span>
      </div>

      {/* Filter and Search Panel */}
      <div className="premium-card p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Cari lokasi stasiun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-color)] text-sm focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-color)] text-sm focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
          >
            <option value="all">Semua Stasiun</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.nama_pos}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-color)] text-sm focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
          >
            <option value="all">Semua Tingkat Risiko</option>
            <option value="Rendah">Aman (Rendah)</option>
            <option value="Sedang">Waspada (Sedang)</option>
            <option value="Tinggi">Bahaya (Tinggi)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/40 font-bold">
                <th className="p-4">No</th>
                <th className="p-4">Tanggal Pengamatan</th>
                <th className="p-4">Stasiun / Lokasi</th>
                <th className="p-4">Status Risiko</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Suhu / Lembap / Tekanan</th>
                <th className="p-4">Rekomendasi</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[var(--text-secondary)]">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
                      Memuat data prediksi...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[var(--text-secondary)]">
                    <Zap size={32} className="mx-auto mb-2 text-[var(--border-color)]" />
                    <p className="font-bold">Tidak ada data hasil prediksi ditemukan</p>
                    <p className="text-[10px]">Data akan diperbarui setelah admin BMKG melakukan import data cuaca terbaru.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const style = getRiskStyles(item.tingkat_risiko);
                  return (
                    <tr key={item.hasil_prediksi_id || idx} className="hover:bg-[var(--bg-base)]/25 transition-colors">
                      <td className="p-4 font-semibold text-[var(--text-secondary)]">{(currentPage - 1) * 10 + idx + 1}</td>
                      <td className="p-4 whitespace-nowrap font-medium">{formatDate(item.created_at)}</td>
                      <td className="p-4">
                        <div className="font-bold">{item.nama_pos}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{item.kawasan} · {item.kabupaten}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                          {item.probabilitas}%
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-[10px] text-[var(--text-secondary)] font-medium">
                          <span>🌡️ {parseFloat(item.suhu).toFixed(1)}°C</span>
                          <span>💧 {parseFloat(item.kelembapan).toFixed(0)}%</span>
                          <span>🌀 {parseFloat(item.tekanan_udara).toFixed(0)} hPa</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate" title={item.rekomendasi}>
                        {item.rekomendasi}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                          title="Detail Data"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-base)]/20 flex justify-between items-center text-xs">
            <span className="text-[var(--text-secondary)] font-medium">
              Menampilkan Halaman <strong>{pagination.currentPage}</strong> dari <strong>{pagination.totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-base)] disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-base)] disabled:opacity-50 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex flex-wrap justify-between items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold">
        <span>Sumber Data: BMKG | Diproses menggunakan Gaussian Naive Bayes</span>
        <span>Update Terakhir: {data.length > 0 ? formatDate(data[0].created_at) : '-'} WIB</span>
      </div>

      {/* Detail Prediction Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="premium-card w-full max-w-lg bg-[var(--bg-surface)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-bold text-lg">Detail Hasil Klasifikasi</h3>
                <button onClick={() => setSelectedItem(null)} className="p-1 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)] cursor-pointer">
                  <span className="text-xl">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className={`p-4 rounded-2xl border ${getRiskStyles(selectedItem.tingkat_risiko).bg} ${getRiskStyles(selectedItem.tingkat_risiko).border} flex items-center gap-4`}>
                  <div className={`w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center border-2 ${getRiskStyles(selectedItem.tingkat_risiko).border}`}>
                    {getRiskStyles(selectedItem.tingkat_risiko).icon}
                  </div>
                  <div>
                    <h4 className={`text-xl font-black ${getRiskStyles(selectedItem.tingkat_risiko).text}`}>
                      RISIKO {getRiskStyles(selectedItem.tingkat_risiko).label}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">Tingkat Kepercayaan: <strong>{selectedItem.probabilitas}%</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Suhu', value: `${parseFloat(selectedItem.suhu).toFixed(1)}°C`, icon: Thermometer },
                    { label: 'Kelembapan', value: `${parseFloat(selectedItem.kelembapan).toFixed(0)}%`, icon: Droplets },
                    { label: 'Angin Rata', value: `${parseFloat(selectedItem.kecepatan_angin).toFixed(1)} km/j`, icon: Wind },
                    { label: 'Angin Maks', value: `${parseFloat(selectedItem.kecepatan_angin_max || (selectedItem.kecepatan_angin * 1.5)).toFixed(1)} km/j`, icon: Wind },
                    { label: 'Tekanan', value: `${parseFloat(selectedItem.tekanan_udara).toFixed(0)} hPa`, icon: Gauge },
                    { label: 'Aktivitas Petir', value: `${selectedItem.aktivitas_petir || 0} sambaran`, icon: Zap }
                  ].map((p, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-center flex flex-col items-center justify-center">
                      <p.icon className="text-[var(--accent-primary)] mb-1" size={16} />
                      <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">{p.label}</span>
                      <span className="font-bold text-xs text-[var(--text-primary)]">{p.value}</span>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-xl border ${getRiskStyles(selectedItem.tingkat_risiko).bg} ${getRiskStyles(selectedItem.tingkat_risiko).border} text-xs leading-relaxed`}>
                  <strong className="block mb-1">Rekomendasi Keselamatan:</strong>
                  {selectedItem.rekomendasi}
                </div>

                <div className="text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3 flex flex-wrap justify-between gap-2">
                  <span>📍 <strong>Stasiun:</strong> {selectedItem.nama_pos} · {selectedItem.kabupaten}</span>
                  <span>📅 <strong>Pengamatan:</strong> {formatDate(selectedItem.created_at)}</span>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-color)] flex justify-end bg-[var(--bg-base)]/50">
                <button onClick={() => setSelectedItem(null)} className="px-4 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-xs cursor-pointer">
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

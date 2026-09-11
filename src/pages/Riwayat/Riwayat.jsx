import { useState, useEffect, useCallback } from 'react';
import { getHistory, deleteHistory } from '../../api/hasilPrediksiApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trash2, Eye, Download, FileText, X, AlertTriangle, 
  CheckCircle, ChevronLeft, ChevronRight, Zap, RefreshCw, Thermometer, 
  Droplets, Wind, CloudRain, Activity
} from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '-';

const getRiskStyles = (risk) => {
  if (!risk) return { bg: '', text: '', border: '', icon: null };
  const r = risk.toLowerCase();
  if (r === 'rendah') return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', icon: <CheckCircle size={16} /> };
  if (r === 'sedang') return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', icon: <AlertTriangle size={16} /> };
  return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', icon: <Zap size={16} /> };
};

export default function Riwayat() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await getHistory({ search, filter, sort, page, limit: 10 });
      if (res.success) {
        setData(res.data || []);
        setPagination(res.pagination || {});
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [search, filter, sort, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(1), 400);
    return () => clearTimeout(timer);
  }, [search, filter, sort, fetchData]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const exportCSV = () => {
    const headers = ['Lokasi', 'Kawasan', 'Kabupaten', 'Risiko', 'Confidence (%)', 'Suhu (°C)', 'Kelembapan (%)', 'Angin Rata (km/j)', 'Angin Maks (km/j)', 'Tekanan (hPa)', 'Waktu'];
    const rows = data.map(r => [
      r.nama_pos, r.kawasan, r.kabupaten, r.tingkat_risiko, r.probabilitas,
      r.suhu, r.kelembapan, r.kecepatan_angin, r.kecepatan_angin_max || (r.kecepatan_angin * 1.5), r.tekanan_udara,
      formatDate(r.created_at)
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `riwayat-thundersafe-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ThunderSafe - Riwayat Prediksi Risiko Petir', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Diekspor: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 28);

    autoTable(doc, {
      startY: 34,
      head: [['Lokasi', 'Kawasan', 'Risiko', 'Confidence', 'Suhu', 'Kelembapan', 'Angin Rata', 'Angin Maks', 'Tekanan', 'Waktu']],
      body: data.map(r => [
        r.nama_pos, r.kawasan, r.tingkat_risiko, `${r.probabilitas}%`,
        `${parseFloat(r.suhu).toFixed(1)}°C`, `${parseFloat(r.kelembapan).toFixed(1)}%`,
        `${parseFloat(r.kecepatan_angin).toFixed(1)} km/j`, `${parseFloat(r.kecepatan_angin_max || (r.kecepatan_angin * 1.5)).toFixed(1)} km/j`,
        `${parseFloat(r.tekanan_udara).toFixed(0)} hPa`, formatDate(r.created_at)
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`riwayat-thundersafe-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Riwayat Analisis Sistem</h2>
        <p className="text-[var(--text-secondary)] text-sm">Data historis seluruh monitoring risiko petir hasil klasifikasi otomatis sistem.</p>
      </div>

      <div className="premium-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-base)] flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input
              type="text"
              placeholder="Cari lokasi..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <select
              className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Risiko</option>
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
            </select>

            <select
              className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="confidence_high">Confidence Tertinggi</option>
              <option value="confidence_low">Confidence Terendah</option>
            </select>

            <div className="flex items-center gap-2 border-l border-[var(--border-color)] pl-3">
              <button onClick={exportCSV} className="p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Export CSV">
                <Download size={18} />
              </button>
              <button onClick={exportPDF} className="p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 transition-colors" title="Export PDF">
                <FileText size={18} />
              </button>
              <button onClick={() => fetchData(currentPage)} className="p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Refresh">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--bg-base)] text-[var(--text-secondary)] text-xs uppercase font-bold border-b border-[var(--border-color)]">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4">Risiko</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Suhu</th>
                <th className="px-6 py-4">Kelembapan</th>
                <th className="px-6 py-4">Angin Rata</th>
                <th className="px-6 py-4">Angin Maks</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-6 h-6 border-2 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <Zap size={40} className="mx-auto text-[var(--border-color)] mb-4" />
                    <h3 className="text-lg font-bold mb-1">Belum ada riwayat prediksi</h3>
                    <p className="text-[var(--text-secondary)]">Lakukan prediksi untuk melihat data historis di sini.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const styles = getRiskStyles(item.tingkat_risiko);
                  return (
                    <tr key={item.hasil_prediksi_id} className="hover:bg-[var(--bg-base)] transition-colors group">
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{(currentPage - 1) * 10 + idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{item.nama_pos}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{item.kawasan} · {item.kabupaten}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles.bg} ${styles.text} ${styles.border}`}>
                          {styles.icon} {item.tingkat_risiko}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                            <div 
                              className="h-full" 
                              style={{ 
                                width: `${item.probabilitas}%`,
                                backgroundColor: item.tingkat_risiko === 'Tinggi' ? '#ef4444' : item.tingkat_risiko === 'Sedang' ? '#eab308' : '#22c55e'
                              }} 
                            />
                          </div>
                          <span className="font-bold text-[var(--text-primary)]">{item.probabilitas}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{parseFloat(item.suhu).toFixed(1)}°C</td>
                      <td className="px-6 py-4">{parseFloat(item.kelembapan).toFixed(0)}%</td>
                      <td className="px-6 py-4">{parseFloat(item.kecepatan_angin).toFixed(1)} km/j</td>
                      <td className="px-6 py-4">{parseFloat(item.kecepatan_angin_max || (item.kecepatan_angin * 1.5)).toFixed(1)} km/j</td>
                      <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">{formatDate(item.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedItem(item)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors" title="Detail">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[var(--border-color)] flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)]">
            Menampilkan <span className="font-bold text-[var(--text-primary)]">{data.length > 0 ? (currentPage - 1) * 10 + 1 : 0}–{Math.min(currentPage * 10, pagination.totalItems || 0)}</span> dari {pagination.totalItems || 0}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const page = start + i;
              if (page > totalPages) return null;
              return (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                    currentPage === page 
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white font-bold' 
                      : 'border-[var(--border-color)] hover:bg-[var(--bg-base)]'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-lg bg-[var(--bg-surface)] overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-base)]">
                <h3 className="font-bold text-lg">Detail Prediksi</h3>
                <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)]">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6">
                <div className={`p-4 rounded-2xl flex items-center gap-4 mb-6 border ${getRiskStyles(selectedItem.tingkat_risiko).bg} ${getRiskStyles(selectedItem.tingkat_risiko).border}`}>
                  <div className={`w-14 h-14 rounded-full bg-[var(--bg-surface)] flex items-center justify-center border-4 ${getRiskStyles(selectedItem.tingkat_risiko).border} ${getRiskStyles(selectedItem.tingkat_risiko).text}`}>
                    {getRiskStyles(selectedItem.tingkat_risiko).icon}
                  </div>
                  <div>
                    <h4 className={`text-2xl font-black ${getRiskStyles(selectedItem.tingkat_risiko).text}`}>Risiko {selectedItem.tingkat_risiko}</h4>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Confidence: {selectedItem.probabilitas}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Suhu', value: `${parseFloat(selectedItem.suhu).toFixed(1)}°C`, icon: Thermometer },
                    { label: 'Kelembapan', value: `${parseFloat(selectedItem.kelembapan).toFixed(1)}%`, icon: Droplets },
                    { label: 'Angin Rata', value: `${parseFloat(selectedItem.kecepatan_angin).toFixed(1)} km/j`, icon: Wind },
                    { label: 'Angin Maks', value: `${parseFloat(selectedItem.kecepatan_angin_max || (selectedItem.kecepatan_angin * 1.5)).toFixed(1)} km/j`, icon: Wind },
                    { label: 'Tekanan', value: `${parseFloat(selectedItem.tekanan_udara).toFixed(0)} hPa`, icon: Activity },
                    { label: 'Petir', value: `${selectedItem.aktivitas_petir || 0} strikes`, icon: Zap },
                  ].map(m => (
                    <div key={m.label} className="bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <m.icon size={16} className="text-[var(--accent-primary)] mb-1" />
                      <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">{m.label}</div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-xl text-sm border ${getRiskStyles(selectedItem.tingkat_risiko).bg} ${getRiskStyles(selectedItem.tingkat_risiko).border} ${getRiskStyles(selectedItem.tingkat_risiko).text} mb-6`}>
                  <strong className="block mb-1">Rekomendasi Tindakan:</strong>
                  {selectedItem.rekomendasi}
                </div>

                <div className="text-xs text-[var(--text-secondary)]">
                  <strong>Lokasi:</strong> {selectedItem.nama_pos} · {selectedItem.kawasan} · {selectedItem.kabupaten}
                  <br />
                  <strong>Waktu:</strong> {formatDate(selectedItem.created_at)}
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-base)]">
                <button onClick={() => setSelectedItem(null)} className="px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] font-medium cursor-pointer">
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex flex-wrap justify-between items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold">
        <span>Sumber Data: BMKG | Diproses menggunakan Gaussian Naive Bayes</span>
        <span>Update Terakhir: {data.length > 0 ? formatDate(data[0].created_at) : '-'} WIB</span>
      </div>
    </div>
  );
}

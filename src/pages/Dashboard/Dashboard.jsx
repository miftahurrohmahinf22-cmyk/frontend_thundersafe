import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../api/dashboardApi';
import { motion } from 'framer-motion';
import {
  Zap, BarChart2, MapPin, TrendingUp,
  AlertTriangle, CheckCircle, Wind, Droplets,
  Thermometer, Activity, Clock, RefreshCw, FileText, CloudLightning,
  Map, BookOpen, ShieldAlert
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

const getRiskStyles = (risk) => {
  if (!risk) return { bg: 'bg-green-500/10 text-green-500 border-green-500/20', text: 'text-green-500', border: 'border-green-500/20', label: 'AMAN', colorCode: '#22c55e' };
  const r = risk.toLowerCase();
  if (r === 'rendah' || r === 'aman') {
    return { bg: 'bg-green-500/10 text-green-500 border-green-500/20', text: 'text-green-500', border: 'border-green-500/20', label: 'AMAN', colorCode: '#22c55e' };
  }
  if (r === 'sedang' || r === 'waspada') {
    return { bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/20', label: 'WASPADA', colorCode: '#eab308' };
  }
  return { bg: 'bg-red-500/10 text-red-500 border-red-500/20', text: 'text-red-500', border: 'border-red-500/20', label: 'BAHAYA', colorCode: '#ef4444' };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError('');
    try {
      const res = await getDashboardStats();
      if (res && res.success) {
        setHistory(res.data || []);
      } else {
        setError('Gagal memuat data dashboard.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPrediksi = Array.isArray(history) ? history.length : 0;
  const risikoTinggi = Array.isArray(history) ? history.filter(h => h && h.tingkat_risiko === 'Tinggi').length : 0;
  const risikoSedang = Array.isArray(history) ? history.filter(h => h && h.tingkat_risiko === 'Sedang').length : 0;
  const risikoRendah = Array.isArray(history) ? history.filter(h => h && h.tingkat_risiko === 'Rendah').length : 0;

  const latestFive = Array.isArray(history) ? [...history].slice(0, 5) : [];
  const chartData = Array.isArray(history) ? [...history].slice(0, 7).reverse() : [];
  const latestRisk = Array.isArray(history) && history.length > 0 ? history[0] : null;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="pb-10 text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1">{greet()}, {user?.nama?.split(' ')[0] || 'Pengguna'}! 👋</h2>
          <p className="text-[var(--text-secondary)] text-sm">Monitoring parameter cuaca dan tingkat risiko petir realtime di wilayah Anda.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Segarkan Data
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">Menghubungkan ke pusat observasi petir...</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* Top Monitoring Summary */}
          {latestRisk && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Status Risiko Saat Ini */}
              <div className="lg:col-span-2 premium-card p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--accent-primary)] opacity-5 rounded-full blur-[60px] pointer-events-none" />
                
                {/* Radial Gauge */}
                <div className="relative shrink-0">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="62" stroke="var(--border-color)" strokeWidth="8" fill="none" className="opacity-30" />
                    <circle 
                      cx="72" cy="72" r="62" 
                      stroke={getRiskStyles(latestRisk.tingkat_risiko).colorCode} 
                      strokeWidth="8" fill="none" 
                      strokeDasharray="389.56" 
                      strokeDashoffset={389.56 - (389.56 * parseFloat(latestRisk.probabilitas || 0)) / 100} 
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{latestRisk.probabilitas || 0}%</span>
                    <span className="text-[9px] text-[var(--text-secondary)] font-bold tracking-wider uppercase">Confidence</span>
                  </div>
                </div>

                {/* Status & Recommendation */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getRiskStyles(latestRisk.tingkat_risiko).bg} ${getRiskStyles(latestRisk.tingkat_risiko).text} border ${getRiskStyles(latestRisk.tingkat_risiko).border}`}>
                      RISIKO {getRiskStyles(latestRisk.tingkat_risiko).label}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-semibold flex items-center gap-1">
                      <MapPin size={12} className="text-[var(--accent-primary)]" />
                      {latestRisk.nama_pos}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-extrabold mb-1">Rekomendasi Mitigasi</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {latestRisk.rekomendasi || 'Kondisi wilayah saat ini tergolong aman. Tetap pantau cuaca berkala.'}
                    </p>
                  </div>

                  <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 pt-2 border-t border-[var(--border-color)]">
                    <Clock size={10} />
                    <span>Update Terakhir: <strong>{formatDate(latestRisk.created_at)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Parameter BMKG Terbaru */}
              <div className="premium-card p-6 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Activity size={16} className="text-[var(--accent-primary)]" />
                  Parameter BMKG Terbaru
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Suhu Udara', value: `${parseFloat(latestRisk.suhu || 0).toFixed(1)}°C`, icon: Thermometer },
                    { label: 'Kelembapan', value: `${parseFloat(latestRisk.kelembapan || 0).toFixed(0)}%`, icon: Droplets },
                    { label: 'Kecepatan Angin', value: `${parseFloat(latestRisk.kecepatan_angin || 0).toFixed(1)} km/j`, icon: Wind },
                    { label: 'Tekanan Udara', value: `${parseFloat(latestRisk.tekanan_udara || 0).toFixed(0)} hPa`, icon: Activity },
                  ].map((param, idx) => (
                    <div key={idx} className="bg-[var(--bg-base)]/50 p-3 rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                      <param.icon size={16} className="text-[var(--accent-primary)] shrink-0" />
                      <div>
                        <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">{param.label}</p>
                        <p className="text-sm font-black">{param.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* Ringkasan Statistik */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Total Analisis', sublabel: 'Sistem', value: totalPrediksi, icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Jumlah Bahaya', sublabel: '(Tinggi)', value: risikoTinggi, icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Jumlah Waspada', sublabel: '(Sedang)', value: risikoSedang, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
              { label: 'Jumlah Aman', sublabel: '(Rendah)', value: risikoRendah, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
            ].map((stat, idx) => (
              <div key={idx} className="premium-card p-3 sm:p-5 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 min-w-0 overflow-hidden">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon size={18} className="sm:hidden" />
                  <stat.icon size={22} className="hidden sm:block" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-[9px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-tight sm:tracking-wider leading-tight truncate">
                    {stat.label} <span className="hidden sm:inline">{stat.sublabel}</span>
                  </p>
                  <h4 className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">{stat.value}</h4>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Chart & Latest Activity) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Grafik Tren Risiko */}
              <motion.div variants={itemVariants} className="premium-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <TrendingUp className="text-[var(--accent-primary)]" size={18} />
                    Tren Analisis Risiko 7 Hari Terakhir
                  </h3>
                </div>

                {chartData.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <BarChart2 size={36} className="text-[var(--border-color)] mb-2" />
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Belum tersedia data grafik tren</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar pb-2">
                    <div className="h-44 min-w-[300px] flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-[var(--border-color)] pb-2 relative">
                    {chartData.map((item, i) => {
                      if (!item) return null;
                      const prob = parseFloat(item.probabilitas || 0);
                      const h = Math.max(15, (prob / 100) * 100);
                      const riskStyle = getRiskStyles(item.tingkat_risiko);
                      
                      return (
                        <div key={i} className="flex flex-col items-center gap-2 group relative flex-1 h-full justify-end">
                          <div 
                            className="w-full max-w-[32px] rounded-t-lg transition-all duration-300 group-hover:opacity-85"
                            style={{ height: `${h}%`, backgroundColor: riskStyle.colorCode }}
                          />
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">
                            {formatDate(item.created_at).slice(0, 6)}
                          </span>
                          
                          {/* Tooltip */}
                          <div className="absolute -top-10 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-lg rounded-xl py-1.5 px-2.5 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {item.probabilitas}% - Risiko {riskStyle.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </motion.div>

              {/* Aktivitas Terbaru */}
              <motion.div variants={itemVariants} className="premium-card overflow-hidden">
                <div className="p-5 border-b border-[var(--border-color)]">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Clock className="text-[var(--accent-primary)]" size={18} />
                    Riwayat Analisis Sistem Terbaru
                  </h3>
                </div>
                
                {latestFive.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-secondary)]">Tidak ada log aktivitas.</div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[520px] text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[var(--bg-base)]/40 text-[var(--text-secondary)] font-bold">
                          <th className="px-6 py-3 border-b border-[var(--border-color)]">Stasiun / Lokasi</th>
                          <th className="px-6 py-3 border-b border-[var(--border-color)]">Status Risiko</th>
                          <th className="px-6 py-3 border-b border-[var(--border-color)]">Confidence</th>
                          <th className="px-6 py-3 border-b border-[var(--border-color)]">Waktu Observasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {latestFive.map((item, idx) => {
                          if (!item) return null;
                          const style = getRiskStyles(item.tingkat_risiko);
                          return (
                            <tr key={item.hasil_prediksi_id || idx} className="hover:bg-[var(--bg-base)]/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold">{item.nama_pos}</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{item.kabupaten}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${style.bg} ${style.text} border ${style.border}`}>
                                  {style.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden max-w-[60px]">
                                    <div className="h-full" style={{ width: `${item.probabilitas || 0}%`, backgroundColor: style.colorCode }} />
                                  </div>
                                  <span className="font-bold text-[10px]">{item.probabilitas || 0}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                                {formatDate(item.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column (Shortcuts) */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="premium-card p-6">
                <h3 className="text-base font-extrabold mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-[var(--accent-primary)]" size={18} />
                  Navigasi Cepat
                </h3>
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/peta-risiko" 
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-[var(--bg-base)]/20 hover:bg-[var(--bg-base)]/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Map size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Peta Risiko</h4>
                      <p className="text-[9px] text-[var(--text-secondary)]">Lihat pemetaan persebaran risiko petir spasial</p>
                    </div>
                  </Link>

                  <Link 
                    to="/edukasi" 
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-[var(--bg-base)]/20 hover:bg-[var(--bg-base)]/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Pusat Edukasi</h4>
                      <p className="text-[9px] text-[var(--text-secondary)]">Tips keselamatan & mitigasi sambaran petir</p>
                    </div>
                  </Link>

                  <Link 
                    to="/laporan" 
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-[var(--bg-base)]/20 hover:bg-[var(--bg-base)]/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Download Laporan</h4>
                      <p className="text-[9px] text-[var(--text-secondary)]">Ekspor data historis cuaca ke PDF/CSV</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex flex-wrap justify-between items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold">
            <span>Sumber Data: BMKG | Diproses menggunakan Gaussian Naive Bayes</span>
            <span>Update Terakhir: {latestRisk ? formatDate(latestRisk.created_at) : '-'} WIB</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

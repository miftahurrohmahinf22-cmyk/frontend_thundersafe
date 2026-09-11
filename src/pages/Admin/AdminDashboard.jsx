import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Zap, Database, AlertTriangle, Bell, Clock, RefreshCw,
  Activity, Shield, CheckCircle, ArrowRight, UserPlus, Info, MapPin, BookOpen,
  Thermometer, Droplets, Wind, CloudRain, Gauge
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('prediksi'); // 'prediksi', 'risiko', 'aktivitas', 'cuaca'

  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/statistik');
      if (res.data.success) {
        setStats(res.data.data);
      } else {
        setError('Gagal memuat statistik.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || (err.response?.status === 401 ? 'Sesi Anda telah berakhir. Silakan login kembali.' : 'Gagal terhubung ke server.');
      setError(errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)] font-medium">Memuat statistik global...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Pengguna', value: stats?.total_users || 0, icon: <Users size={20} />, color: 'from-blue-500 to-indigo-500 shadow-blue-500/10' },
    { label: 'Total Data Cuaca', value: stats?.total_data_cuaca || 0, icon: <Activity size={20} />, color: 'from-sky-500 to-cyan-500 shadow-sky-500/10' },
    { label: 'Total Prediksi', value: stats?.total_prediksi || 0, icon: <Zap size={20} />, color: 'from-amber-500 to-yellow-500 shadow-amber-500/10' },
    { label: 'Total Lokasi', value: stats?.total_lokasi || 0, icon: <MapPin size={20} />, color: 'from-violet-500 to-purple-500 shadow-violet-500/10' },
    { label: 'Total Artikel', value: stats?.total_artikel || 0, icon: <BookOpen size={20} />, color: 'from-rose-500 to-red-500 shadow-rose-500/10' },
    { label: 'Total Notifikasi', value: stats?.total_notifikasi || 0, icon: <Bell size={20} />, color: 'from-emerald-500 to-teal-500 shadow-emerald-500/10' },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Dashboard Administrator 🛡️</h2>
          <p className="text-[var(--text-secondary)]">Kelola seluruh parameter keamanan, dataset, dan pengguna sistem.</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer text-[var(--text-primary)]"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Menyegarkan...' : 'Segarkan Data'}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {kpis.map((kpi, idx) => (
          <motion.div
            variants={itemVariants}
            key={idx}
            className="premium-card p-5 relative overflow-hidden flex flex-col justify-between"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] tracking-tight leading-tight">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg`}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">{kpi.value}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Multi-tab Chart Section */}
          <div className="premium-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-4">
              <h3 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
                <Activity className="text-[var(--accent-primary)]" size={20} />
                Analisis Grafik Sistem
              </h3>
              <div className="flex flex-wrap gap-1 bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-color)]">
                {[
                  { id: 'prediksi', label: 'Prediksi 7 Hari' },
                  { id: 'risiko', label: 'Tingkat Risiko' },
                  { id: 'aktivitas', label: 'Aktivitas User' },
                  { id: 'cuaca', label: 'Data Cuaca' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === t.id 
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-64 bg-[var(--bg-base)] rounded-2xl flex items-end justify-between p-6 border border-[var(--border-color)] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'prediksi' && (
                  <motion.div key="prediksi" className="w-full h-full flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute top-4 left-4 text-xs font-bold text-[var(--text-secondary)]">Deteksi Risiko Petir Terkini</div>
                    <svg className="absolute inset-0 w-full h-full pt-10 pb-6 px-4" viewBox="0 0 500 140" preserveAspectRatio="none">
                      <path d="M 0 100 Q 75 55 150 95 T 300 45 T 450 75 T 500 55 L 500 140 L 0 140 Z" fill="url(#grad)" opacity="0.15" />
                      <path d="M 0 100 Q 75 55 150 95 T 300 45 T 450 75 T 500 55" fill="none" stroke="var(--accent-primary)" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                    <div className="w-full flex justify-between text-[9px] text-[var(--text-secondary)] font-bold z-10">
                      <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'risiko' && (
                  <motion.div key="risiko" className="w-full h-full flex flex-col justify-end pt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute top-4 left-4 text-xs font-bold text-[var(--text-secondary)] truncate max-w-[80%]">Sebaran Tingkat Risiko Keseluruhan</div>
                    <div className="flex justify-around items-end h-32 w-full px-2 sm:px-6 gap-2 sm:gap-4 mb-2 overflow-hidden">
                      {[
                        { label: 'Rendah', fullLabel: 'Rendah (Aman)', val: stats?.pct_rendah || 0, color: 'bg-green-500 shadow-green-500/10' },
                        { label: 'Sedang', fullLabel: 'Sedang (Waspada)', val: stats?.pct_sedang || 0, color: 'bg-yellow-500 shadow-yellow-500/10' },
                        { label: 'Tinggi', fullLabel: 'Tinggi (Bahaya)', val: stats?.pct_tinggi || 0, color: 'bg-red-500 shadow-red-500/10' }
                      ].map((r, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end min-w-0">
                          <div className="w-full text-center text-[10px] font-black text-[var(--text-primary)]">{r.val}%</div>
                          <div className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ${r.color}`} style={{ height: `${Math.min(85, Math.max(12, r.val * 0.85))}%` }} />
                          <span className="text-[9px] sm:text-[10px] font-bold text-center truncate w-full">{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'aktivitas' && (
                  <motion.div key="aktivitas" className="w-full h-full flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute top-4 left-4 text-xs font-bold text-[var(--text-secondary)]">Aktivitas Akses Pengguna harian</div>
                    <svg className="absolute inset-0 w-full h-full pt-10 pb-6 px-4" viewBox="0 0 500 140" preserveAspectRatio="none">
                      <path d="M 0 115 Q 90 100 180 50 T 360 60 T 500 35 L 500 140 L 0 140 Z" fill="url(#grad2)" opacity="0.15" />
                      <path d="M 0 115 Q 90 100 180 50 T 360 60 T 500 35" fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="w-full flex justify-between text-[9px] text-[var(--text-secondary)] font-bold z-10">
                      <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'cuaca' && (
                  <motion.div key="cuaca" className="w-full h-full flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute top-4 left-4 text-xs font-bold text-[var(--text-secondary)]">Fluktuasi Suhu & Kelembapan Stasiun Utama</div>
                    <svg className="absolute inset-0 w-full h-full pt-10 pb-6 px-4" viewBox="0 0 500 140" preserveAspectRatio="none">
                      <path d="M 0 75 C 100 105 200 45 300 85 C 400 115 450 55 500 75" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
                      <path d="M 0 55 C 100 35 200 75 300 45 C 400 65 450 35 500 55" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                    </svg>
                    <div className="absolute top-4 right-4 flex gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0ea5e9] rounded-full" /> Kelembapan</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#f43f5e] rounded-full" /> Suhu</span>
                    </div>
                    <div className="w-full flex justify-between text-[9px] text-[var(--text-secondary)] font-bold z-10">
                      <span>01.00</span><span>05.00</span><span>09.00</span><span>13.00</span><span>17.00</span><span>21.00</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </div>
          </div>

          {/* Recent Activity Log Table */}
          <div className="premium-card p-6 md:p-8">
            <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
              <Activity className="text-[var(--accent-primary)]" size={20} />
              Aktivitas Prediksi Terbaru (User & System)
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[520px] text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold">
                    <th className="pb-3 font-semibold">Pengguna</th>
                    <th className="pb-3 font-semibold">Stasiun</th>
                    <th className="pb-3 font-semibold">Risiko</th>
                    <th className="pb-3 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                  {stats?.recent_activity?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[var(--text-secondary)]">Tidak ada aktivitas prediksi terbaru.</td>
                    </tr>
                  ) : (
                    stats?.recent_activity?.map((act) => (
                      <tr key={act.id} className="hover:bg-[var(--bg-base)]/50 transition-colors">
                        <td className="py-3 font-medium">{act.nama}</td>
                        <td className="py-3">{act.nama_pos}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            act.tingkat_risiko === 'Tinggi' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            act.tingkat_risiko === 'Sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                            'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {act.tingkat_risiko}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-[var(--text-secondary)]">{formatDate(act.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card 2: Latest BMKG Data */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <Database size={20} className="text-amber-500" />
              Data BMKG Terbaru
            </h3>
            {stats?.latest_bmkg ? (
              <div className="space-y-4">
                <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)]">
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold mb-1 uppercase">STASIUN PEMANTAUAN</div>
                  <div className="text-sm font-extrabold text-[var(--text-primary)]">{stats.latest_bmkg.nama_pos}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                    <Thermometer size={16} className="text-red-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block leading-none mb-0.5">Suhu</span>
                      <span className="text-xs font-bold">{parseFloat(stats.latest_bmkg.suhu).toFixed(1)}°C</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                    <Droplets size={16} className="text-blue-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block leading-none mb-0.5">Lembap</span>
                      <span className="text-xs font-bold">{parseFloat(stats.latest_bmkg.kelembapan).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                    <Wind size={16} className="text-teal-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block leading-none mb-0.5">Angin</span>
                      <span className="text-xs font-bold">{parseFloat(stats.latest_bmkg.kecepatan_angin).toFixed(1)} km/j</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                    <Wind size={16} className="text-yellow-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block leading-none mb-0.5">Angin Maks</span>
                      <span className="text-xs font-bold">{parseFloat(stats.latest_bmkg.kecepatan_angin_max !== undefined && stats.latest_bmkg.kecepatan_angin_max !== null ? stats.latest_bmkg.kecepatan_angin_max : (stats.latest_bmkg.kecepatan_angin * 1.5)).toFixed(1)} km/j</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] flex justify-between border-t border-[var(--border-color)] pt-3">
                  <span>Tekanan: {parseFloat(stats.latest_bmkg.tekanan_udara).toFixed(0)} hPa</span>
                  <span>Waktu: {new Date(stats.latest_bmkg.waktu_pengamatan || stats.latest_bmkg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[var(--text-secondary)] text-xs flex flex-col items-center gap-2">
                <Info size={24} className="text-[var(--border-color)]" />
                Belum ada data cuaca BMKG.
              </div>
            )}
          </div>

          {/* Card 3: Latest Registered Users */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <UserPlus size={20} className="text-violet-500" />
              Pengguna Terbaru
            </h3>
            <div className="space-y-3">
              {stats?.latest_users?.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)]">Tidak ada pengguna terdaftar.</p>
              ) : (
                stats?.latest_users?.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)]">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{u.nama}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{u.email}</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-[var(--border-color)] text-[var(--text-primary)] px-2 py-0.5 rounded uppercase">{u.role}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

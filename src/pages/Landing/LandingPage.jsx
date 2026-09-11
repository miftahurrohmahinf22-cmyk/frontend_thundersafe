import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  CloudLightning, Shield, Map, Activity, Zap, ChevronRight, Menu, X,
  ArrowRight, Sun, Moon, CheckCircle, AlertTriangle, Compass, BookOpen, Clock,
  MapPin
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Import Assets
import petirlandcape from '../../assets/backgrounds/petirlandcape (2).jpg';
import petirpotret from '../../assets/images/petirpotret.jpg';
import dataakurat from '../../assets/images/dataakurat.jpg';

// Animated Counter component
function Counter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const match = value.match(/\d+/);
    if (!match) {
      setCount(value);
      return;
    }
    const end = parseInt(match[0], 10);
    const suffix = value.replace(match[0], '');
    const prefix = value.split(match[0])[0] || '';
    
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    
    let timer = setInterval(() => {
      start += 1;
      setCount(`${prefix}${start}${suffix}`);
      if (start === end) {
        clearInterval(timer);
      }
    }, Math.max(incrementTime, 15));

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function LandingPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.7]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.98]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Fitur', href: '#fitur' },
    { name: 'Edukasi', href: '#edukasi' },
    { name: 'Peta', href: '#peta' },
    { name: 'Kontak', href: '#kontak' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-x-hidden transition-colors duration-500 relative selection:bg-blue-500 selection:text-white">
      {/* Animated Aurora Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[var(--accent-primary)] opacity-[0.04] dark:opacity-[0.08] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-secondary)] opacity-[0.03] dark:opacity-[0.06] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-panel border-b border-[var(--border-color)] py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <span className="text-2xl font-black tracking-tight drop-shadow-md">
              <span className={scrolled ? "text-[var(--text-primary)]" : "text-white"}>Thunder</span>
              <span className="text-orange-500">Safe</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map(item => (
              <a 
                key={item.name} 
                href={item.href}
                className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative group transition-colors"
              >
                {item.name}
                <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            
            <div className="flex items-center gap-4 border-l border-[var(--border-color)] pl-6">
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-full hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-primary)]"
                title="Ganti Tema"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {isLoggedIn && user ? (
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                  className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:scale-105 hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  Dashboard <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold hover:text-[var(--accent-primary)] transition-colors">Log In</Link>
                  <Link 
                    to="/register" 
                    className="px-6 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] text-sm font-bold hover:scale-105 hover:shadow-lg transition-all"
                  >
                    Mulai
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-primary)]"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2.5 rounded-xl hover:bg-[var(--border-color)] transition-colors text-[var(--text-primary)]"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full glass-panel border-b border-[var(--border-color)] p-6 flex flex-col gap-4 z-40 bg-[var(--bg-surface)]"
            >
              {menuItems.map(item => (
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {item.name}
                </a>
              ))}
              <div className="h-[1px] bg-[var(--border-color)] my-2" />
              <div className="flex flex-col gap-3">
                {isLoggedIn && user ? (
                  <Link 
                    to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center rounded-xl bg-orange-500 text-white font-bold shadow-lg"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 text-center font-bold text-[var(--text-primary)]">Log In</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-xl bg-gradient-premium text-white font-bold shadow-lg">Mulai</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION (Background Image + Dark dramatic overlay matching reference) --- */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 pt-48 pb-32 px-6 flex flex-col items-center text-center justify-center min-h-[95vh] text-white overflow-hidden"
      >
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src={petirlandcape} 
            alt="Hero Background Lightning" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0b1329] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400">Sistem Peringatan Dini Cerdas</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] text-white">
            Lindungi Diri & Aset <br />
            dari <span className="text-orange-500">Bahaya Petir</span>
          </h1>

          <p className="text-base md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            ThunderSafe menggunakan algoritma Naive Bayes canggih untuk memberikan prediksi akurasi tinggi dan peta risiko real-time demi keselamatan operasional Anda.
          </p>

          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="px-8 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2 justify-center cursor-pointer relative z-20 inline-flex"
          >
            Mulai Prediksi
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.section>

      {/* --- SOLUSI KEAMANAN TERINTEGRASI --- */}
      <section id="fitur" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[var(--text-primary)]">Solusi Keamanan Terintegrasi</h2>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-2xl mx-auto font-medium">
            Kami menggabungkan data meteorologi dengan kecerdasan buatan untuk menghadirkan mitigasi risiko yang proaktif.
          </p>
        </motion.div>

        {/* Bento Grid layout matching reference exactly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Prediksi Akurat (Wide - takes 2 cols) */}
          <div className="md:col-span-2 premium-card p-8 flex flex-col md:flex-row justify-between gap-8 items-start md:items-center bg-[var(--bg-surface)] border-[var(--border-color)]">
            <div className="flex-1 space-y-6">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-[var(--text-primary)] shadow-sm">
                <CloudLightning className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Prediksi Akurat (Naive Bayes)</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  Algoritma kami menganalisis kelembapan, suhu, dan tekanan udara secara real-time untuk memberikan probabilitas kejadian petir dengan tingkat presisi tinggi.
                </p>
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                  <CheckCircle size={14} className="text-orange-500" />
                  Analisis Data Multi-parameter
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                  <CheckCircle size={14} className="text-orange-500" />
                  Pembaruan Per Menit
                </div>
              </div>
            </div>
            {/* Visual Radar Mockup */}
            <div className="w-full md:w-56 h-36 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
              <Compass className="animate-spin text-slate-600" size={56} style={{ animationDuration: '15s' }} />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[8px] font-mono text-slate-500">
                <span>RADAR.ACTIVE</span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Card 2: Peta Risiko (Narrow) */}
          <div className="md:col-span-1 premium-card p-8 flex flex-col justify-between gap-6 bg-[var(--bg-surface)] border-[var(--border-color)]">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Peta Risiko Real-time</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  Visualisasi spasial yang menunjukkan area dengan tingkat kerawanan petir tinggi secara langsung di perangkat Anda.
                </p>
              </div>
            </div>
            {/* Mockup Map Pin */}
            <div className="h-28 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-secondary)]">
              <MapPin size={24} className="text-orange-500 animate-bounce" />
            </div>
          </div>

          {/* Card 3: Edukasi Keselamatan (Narrow) */}
          <div id="edukasi" className="md:col-span-1 premium-card p-8 flex flex-col justify-between gap-8 bg-[var(--bg-surface)] border-[var(--border-color)]">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-[var(--text-primary)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Edukasi Keselamatan</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  Pelajari prosedur standar keselamatan saat terjadi badai petir untuk meminimalkan risiko cedera dan kerusakan fatal.
                </p>
              </div>
            </div>
            <Link 
              to="/edukasi"
              className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              Pelajari Selengkapnya →
            </Link>
          </div>

          {/* Card 4: Metrics (Wide - takes 2 cols) */}
          <div className="md:col-span-2 premium-card p-8 bg-[#0c1424] text-white border-none flex flex-col md:flex-row items-center justify-around gap-8 relative overflow-hidden">
            {/* Faint Shield Background decoration */}
            <Shield size={180} className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] text-white pointer-events-none" />

            {[
              { value: '98%', label: 'Akurasi Prediksi' },
              { value: '24/7', label: 'Monitoring Aktif' },
              { value: '500+', label: 'Aset Terlindungi' },
              { value: '< 2s', label: 'Latensi Notifikasi' }
            ].map((metric, i) => (
              <div key={i} className="text-center space-y-1.5 z-10">
                <h4 className="text-3xl md:text-4xl font-black text-orange-400">
                  <Counter value={metric.value} />
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MENGAPA KESADARAN PETIR SANGAT KRUSIAL --- */}
      <section id="peta" className="relative z-10 py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Visual image with overlay warning card */}
        <div className="relative">
          <img 
            src={petirpotret} 
            alt="Ilustrasi Sambaran Petir" 
            className="w-full h-[580px] rounded-3xl object-cover shadow-2xl border border-[var(--border-color)]"
          />
          <div className="absolute bottom-6 left-6 right-6 p-5 glass-panel rounded-2xl bg-white/95 dark:bg-slate-900/95 border-white/10 shadow-2xl">
            <p className="text-red-500 font-extrabold text-xs flex items-center gap-1.5 mb-1.5">
              <AlertTriangle size={14} /> Peringatan Risiko Tinggi
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Berdasarkan data 2023, kerusakan aset akibat petir meningkat 15% pada area tanpa sistem prediksi.
            </p>
          </div>
        </div>

        {/* Right content list */}
        <div className="space-y-8 text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[var(--text-primary)]">Mengapa Kesadaran Petir Sangat Krusial?</h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium leading-relaxed">
              Petir bukan sekadar fenomena alam, melainkan ancaman nyata bagi infrastruktur digital dan keselamatan jiwa. Aegis Risk hadir untuk mengubah data mentah menjadi tindakan preventif yang menyelamatkan.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { id: '01', title: 'Perlindungan Infrastruktur', desc: 'Mencegah lonjakan listrik yang dapat merusak perangkat elektronik sensitif di pusat data atau pabrik.' },
              { id: '02', title: 'Keselamatan Personel', desc: 'Memberikan waktu evakuasi yang cukup bagi pekerja lapangan sebelum badai mencapai puncaknya.' },
              { id: '03', title: 'Efisiensi Biaya', desc: 'Mengurangi biaya perbaikan darurat dan downtime operasional akibat kerusakan petir.' }
            ].map(item => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-sm shrink-0 border border-orange-500/20">
                  {item.id}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[var(--text-primary)] mb-1">{item.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="bg-orange-500 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden text-white text-center">
          <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black mb-4 relative z-10">Siap Menghadapi Musim Badai dengan Tenang?</h2>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-semibold relative z-10">
            Bergabunglah dengan ribuan pengguna yang telah mempercayakan keselamatan aset mereka pada teknologi prediksi ThunderSafe.
          </p>
          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="px-8 py-4 rounded-xl bg-[#0c1424] hover:bg-[#121f37] text-white font-bold hover:scale-105 transition-all shadow-xl cursor-pointer relative z-20 inline-block"
          >
            Daftar Sekarang
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="kontak" className="relative z-10 bg-[var(--bg-surface)] border-t border-[var(--border-color)] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Thunder<span className="text-orange-500">Safe</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium max-w-xs">
              Platform analisis keselamatan cuaca berbasis kecerdasan prediktif terintegrasi.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[var(--text-primary)] mb-6 uppercase tracking-wider">Layanan</h4>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)] font-bold">
              <li><Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Prediksi Cuaca</Link></li>
              <li><Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Analisis Risiko</Link></li>
              <li><Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Integrasi API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[var(--text-primary)] mb-6 uppercase tracking-wider">Perusahaan</h4>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)] font-bold">
              <li><a href="#fitur" className="hover:text-[var(--text-primary)] transition-colors">Tentang Kami</a></li>
              <li><Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[var(--text-primary)] mb-6 uppercase tracking-wider">Kontak</h4>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)] font-bold">
              <li className="leading-relaxed">📍 Jl Kabupaten no.km.5.5,2,sendangadi,kec Melati,kabupaten Sleman</li>
              <li>✉️ support@miftahurahmah.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-[var(--border-color)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-secondary)] font-bold">
          <p>© 2026 ThunderSafe. Semua hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Instagram</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
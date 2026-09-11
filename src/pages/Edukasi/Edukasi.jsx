import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEdukasi } from '../../api/edukasiApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, ArrowRight, Clock, AlertTriangle,
  Shield, Info, RefreshCw
} from 'lucide-react';

const CATEGORY_META = {
  'Semua': { icon: <BookOpen size={16} />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'Panduan': { icon: <Shield size={16} />, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  'Mitigasi': { icon: <AlertTriangle size={16} />, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  'Informasi': { icon: <Info size={16} />, color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
};

const READING_MINS = [3, 4, 5, 6, 7, 8];

function SkeletonCard() {
  return (
    <div className="premium-card overflow-hidden animate-pulse">
      <div className="h-48 bg-[var(--border-color)]" />
      <div className="p-6">
        <div className="h-4 bg-[var(--border-color)] rounded w-1/3 mb-4" />
        <div className="h-5 bg-[var(--border-color)] rounded w-3/4 mb-3" />
        <div className="h-4 bg-[var(--border-color)] rounded w-full mb-6" />
        <div className="flex justify-between border-t border-[var(--border-color)] pt-4">
          <div className="h-3 bg-[var(--border-color)] rounded w-1/4" />
          <div className="h-3 bg-[var(--border-color)] rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function Edukasi() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const categories = ['Semua', 'Panduan', 'Mitigasi', 'Informasi'];

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEdukasi();
      if (res.success) {
        setArticles(res.data || []);
      } else {
        setError('Gagal memuat artikel edukasi.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filtered = articles.filter(a => {
    const matchSearch = !search || a.judul.toLowerCase().includes(search.toLowerCase()) || a.isi.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'Semua' || a.kategori === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Pusat Edukasi</h2>
        <p className="text-[var(--text-secondary)]">Pelajari cara melindungi diri dari bahaya sambaran petir dengan panduan dan informasi terpercaya.</p>
      </div>

      {/* Toolbar */}
      <div className="premium-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari panduan atau informasi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full md:w-auto">
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] || CATEGORY_META['Informasi'];
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap shrink-0 ${
                  isActive 
                    ? `${meta.color} shadow-sm` 
                    : `bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]`
                }`}
              >
                {meta.icon} {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
          <button onClick={fetchArticles} className="px-3 py-1.5 border border-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
            <RefreshCw size={12} /> Coba Lagi
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-center premium-card"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tidak ada artikel ditemukan</h3>
              <p className="text-[var(--text-secondary)] mb-6">Coba gunakan kata kunci lain atau ubah filter kategori.</p>
              <button onClick={() => { setSearch(''); setCategory('Semua'); }} className="px-6 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] font-bold hover:scale-105 transition-transform">
                Reset Filter
              </button>
            </motion.div>
          ) : (
            filtered.map((article, idx) => {
              const meta = CATEGORY_META[article.kategori] || CATEGORY_META['Informasi'];
              const readTime = READING_MINS[idx % READING_MINS.length];
              const excerpt = article.isi?.length > 120 ? article.isi.substring(0, 120) + '...' : article.isi;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={article.id}
                >
                  <Link to={`/edukasi/${article.id}`} className="block h-full group">
                    <div className="premium-card h-full flex flex-col overflow-hidden">
                      {/* Image */}
                      <div className="relative h-48 bg-[var(--border-color)] overflow-hidden">
                        <img 
                          src={article.gambar} 
                          alt={article.judul} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 ${meta.color} bg-[var(--bg-surface-glass)]`}>
                          {meta.icon} {article.kategori}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
                          {article.judul}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1 line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                        
                        <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                            <Clock size={14} /> {readTime} menit baca
                          </span>
                          <span className="flex items-center gap-1 text-[var(--accent-primary)] font-bold group-hover:translate-x-1 transition-transform">
                            Selengkapnya <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Info Banner */}
      {!loading && filtered.length > 0 && (
        <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-1">Sumber Terpercaya</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Seluruh artikel edukasi dan panduan keselamatan petir disusun berdasarkan standar dari Badan Meteorologi Klimatologi dan Geofisika (BMKG) serta standar keamanan internasional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

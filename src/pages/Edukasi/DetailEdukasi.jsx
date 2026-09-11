import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import {
  ArrowLeft, Clock, Tag, BookOpen, AlertTriangle, Share2, 
  CheckCircle2, Info, ArrowUpRight
} from 'lucide-react';

const CATEGORY_META = {
  'Panduan': { color: '#10b981', bg: '#ecfdf5' },
  'Mitigasi': { color: '#f59e0b', bg: '#fffbeb' },
  'Informasi': { color: '#7c3aed', bg: '#f5f3ff' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

// Map dynamic content (Tips, Warnings, Conclusions) based on title keywords
const getExtraContent = (title = '') => {
  const t = title.toLowerCase();
  
  if (t.includes('definisi') || t.includes('sains')) {
    return {
      tips: [
        'Pantau kondisi prakiraan radar cuaca di ThunderSafe secara berkala sebelum merencanakan kegiatan outdoor.',
        'Pahami bahwa suara guntur terdengar belakangan setelah kilatan cahaya; jika guntur terdengar, badai sudah dekat.',
        'Segera mengevakuasi diri apabila awan Cumulonimbus kelabu tebal mulai membubung tinggi.'
      ],
      warning: 'Jangan meremehkan mendung tanpa hujan! Petir dapat menyambar sejauh 10 mil dari pusat badai utama meskipun di lokasi Anda belum turun hujan deras.',
      conclusion: 'Petir merupakan pelepasan energi muatan listrik atmosfer berskala besar akibat ketidakseimbangan ion awan-bumi. Memahami bahaya fisika petir secara ilmiah membantu kita bersikap waspada dan tidak mengabaikan mitigasi keselamatan.'
    };
  }
  
  if (t.includes('evakuasi') || t.includes('prosedur')) {
    return {
      tips: [
        'Segera masuk ke dalam mobil logam tertutup jika terjebak di luar; roda karet tidak melindungi, tetapi bodi logam merambatkan petir ke tanah (Sangkar Faraday).',
        'Lakukan Posisi Jongkok Petir jika terjebak di lapangan terbuka: kaki rapat, kepala menunduk, tangan menutup telinga.',
        'Hentikan semua aktivitas pekerjaan di area terbuka (sawah, atap gedung, menara pemancar) saat tanda badai petir muncul.'
      ],
      warning: 'JANGAN berlindung di bawah pohon tunggal yang tinggi atau gubuk terbuka di tengah sawah. Pohon tinggi merupakan titik sambaran utama petir!',
      conclusion: 'Evakuasi dini yang terstruktur ke bangunan permanen kokoh atau mobil beratap logam tertutup merupakan perlindungan terbaik dari ancaman petir. Menjauhi objek tinggi dan tempat terbuka meminimalkan probabilitas tersambar.'
    };
  }

  return {
    tips: [
      'Cabut seluruh kabel daya (TV, kulkas, komputer) dan router internet dari stopkontak dinding sebelum badai petir memuncak.',
      'Pasang perangkat Surge Arrester berkualitas tinggi pada panel instalasi listrik utama rumah Anda.',
      'Terapkan aturan 30 menit: tetap berada di dalam ruangan hingga 30 menit berlalu sejak suara guntur terakhir terdengar.'
    ],
    warning: 'Hindari mandi, mencuci piring, atau menyentuh keran air yang terhubung pipa logam saat badai petir, karena arus listrik petir dapat merambat melalui saluran air.',
    conclusion: 'Mengamankan perangkat digital di rumah memerlukan pemutusan fisik (cabut kabel) guna menghindari rambatan tegangan tinggi (surge). Mengikuti protokol keselamatan 30 menit setelah badai menjamin proteksi jiwa secara penuh.'
  };
};

export default function DetailEdukasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [otherArticles, setOtherArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.pageYOffset / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Article Detail & Other Articles
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/edukasi/${id}`);
        if (res.data.success) {
          setArticle(res.data.data);
          
          // Fetch other articles for Related/Recent sections
          const allRes = await apiClient.get('/edukasi');
          if (allRes.data.success) {
            setOtherArticles(allRes.data.data.filter(a => a.id !== id));
          }
        } else {
          setError('Artikel tidak ditemukan.');
        }
      } catch {
        setError('Gagal memuat artikel. Periksa koneksi Anda.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const meta = article ? (CATEGORY_META[article.kategori] || CATEGORY_META['Informasi']) : {};
  const extras = article ? getExtraContent(article.judul) : { tips: [], warning: '', conclusion: '' };

  // Dynamic related articles (same category if possible)
  const related = otherArticles
    .filter(a => a.kategori === article?.kategori)
    .slice(0, 2);
  const recent = otherArticles.slice(0, 3);

  return (
    <div className="pb-10 relative">
      {/* Scroll Progress Bar */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: `${scrollProgress}%`,
          height: '4px', backgroundColor: 'var(--accent-primary)', zIndex: 9999,
          transition: 'width 0.1s ease-out'
        }} 
      />

      {/* Back Button */}
      <button
        onClick={() => navigate('/edukasi')}
        className="flex items-center gap-2 mb-6 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-0 bg-transparent cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Edukasi
      </button>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-[var(--border-color)] rounded-2xl" />
          <div className="h-8 bg-[var(--border-color)] rounded w-3/4" />
          <div className="h-4 bg-[var(--border-color)] rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-4 bg-[var(--border-color)] rounded w-full" />
            <div className="h-4 bg-[var(--border-color)] rounded w-5/6" />
          </div>
        </div>
      ) : error ? (
        <div className="premium-card p-12 text-center flex flex-col items-center">
          <AlertTriangle className="text-red-500 mb-4" size={40} />
          <h3 className="text-xl font-bold mb-2">Artikel Tidak Ditemukan</h3>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <Link to="/edukasi" className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-xl font-bold">
            Kembali ke Edukasi
          </Link>
        </div>
      ) : article && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Image & Badge */}
            {article.gambar && (
              <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-[var(--border-color)] shadow-xl">
                <img
                  src={article.gambar}
                  alt={article.judul}
                  className="w-full h-full object-cover"
                  onError={e => e.currentTarget.parentElement.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-3 items-center">
                  <span 
                    className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase border text-white backdrop-blur-md"
                    style={{ backgroundColor: `${meta.color}20`, borderColor: `${meta.color}50` }}
                  >
                    {article.kategori}
                  </span>
                </div>
              </div>
            )}

            {/* Title & Writer Metadata */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-snug">
                {article.judul}
              </h1>
              
              <div className="flex flex-wrap gap-2 sm:gap-x-4 sm:gap-y-2 items-center text-xs text-[var(--text-secondary)] font-medium border-y border-[var(--border-color)] py-3">
                <span className="truncate">Penulis: <strong className="text-[var(--text-primary)]">Tim Pakar ThunderSafe</strong></span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1 shrink-0"><Clock size={14} /> ±5 menit baca</span>
                <span className="hidden sm:inline">•</span>
                <span className="shrink-0">Diterbitkan: {formatDate(article.created_at)}</span>
                
                <button
                  onClick={handleShare}
                  className="sm:ml-auto glass-panel px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-primary)] shrink-0"
                >
                  <Share2 size={12} /> {copied ? 'Link disalin!' : 'Bagikan'}
                </button>
              </div>
            </div>

            {/* Article Text Paragraphs */}
            <div className="premium-card p-6 md:p-8 space-y-6">
              {article.isi?.split('\n\n').map((para, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-[var(--text-secondary)] font-medium">
                  {para}
                </p>
              ))}
            </div>

            {/* Tips Keselamatan */}
            {extras.tips.length > 0 && (
              <div className="premium-card p-6 md:p-8 border-l-4 border-green-500 bg-green-500/5">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" size={20} />
                  Tips Keselamatan Penting
                </h3>
                <ul className="space-y-3">
                  {extras.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Peringatan Penting */}
            {extras.warning && (
              <div className="premium-card p-6 md:p-8 border-l-4 border-yellow-500 bg-yellow-500/5">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} />
                  Peringatan Penting
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  {extras.warning}
                </p>
              </div>
            )}

            {/* Kesimpulan */}
            {extras.conclusion && (
              <div className="premium-card p-6 md:p-8 border-l-4 border-blue-500 bg-blue-500/5">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <Info className="text-blue-500" size={20} />
                  Kesimpulan & Rangkuman
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  {extras.conclusion}
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="p-6 bg-gradient-premium rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-extrabold text-lg">Ingin memantau stasiun risiko cuaca Yogyakarta?</h4>
                <p className="text-xs text-white/80">Lihat sebaran tingkat kerawanan petir real-time stasiun BMKG.</p>
              </div>
              <Link to="/peta-risiko" className="px-5 py-3 rounded-xl bg-white text-[var(--accent-primary)] font-bold text-sm hover:scale-[1.03] transition-all whitespace-nowrap shadow-md">
                Lihat Peta Risiko →
              </Link>
            </div>

          </div>

          {/* Sidebar Panels (Right) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Artikel Terkait */}
            {related.length > 0 && (
              <div className="premium-card p-6">
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-4 uppercase tracking-wider">Artikel Terkait</h3>
                <div className="space-y-4">
                  {related.map(art => (
                    <Link key={art.id} to={`/edukasi/${art.id}`} className="flex gap-3 group">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--border-color)] shrink-0">
                        <img src={art.gambar} alt={art.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 leading-snug">
                          {art.judul}
                        </h4>
                        <span className="text-[10px] text-[var(--text-secondary)] font-semibold mt-1 block">{art.kategori}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Artikel Terbaru */}
            {recent.length > 0 && (
              <div className="premium-card p-6">
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-4 uppercase tracking-wider">Artikel Terbaru</h3>
                <div className="space-y-4">
                  {recent.map(art => (
                    <Link key={art.id} to={`/edukasi/${art.id}`} className="flex justify-between items-center group py-2 border-b border-[var(--border-color)] last:border-0 last:pb-0">
                      <div className="pr-2">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                          {art.judul}
                        </h4>
                        <span className="text-[9px] text-[var(--text-secondary)] font-medium mt-0.5 block">{formatDate(art.created_at)}</span>
                      </div>
                      <ArrowUpRight size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Info Banner */}
            <div className="premium-card p-6 bg-blue-500/5 border border-blue-500/10 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
              <p className="font-bold text-[var(--text-primary)]">Mengapa Edukasi Ini Penting?</p>
              <p>Meningkatnya fenomena cuaca ekstrim dan pertumbuhan awan petir Cumulonimbus membutuhkan kedisiplinan mitigasi mandiri. Memahami prosedur evakuasi terbukti meminimalkan risiko sambaran fatal hingga 90%.</p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

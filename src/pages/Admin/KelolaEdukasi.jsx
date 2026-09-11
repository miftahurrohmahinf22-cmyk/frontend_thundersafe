import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, Search, RefreshCw, AlertTriangle, CheckCircle,
  X, FileText, Image as ImageIcon, Upload, GripHorizontal
} from 'lucide-react';

const defaultForm = {
  judul: '',
  isi: '',
  gambar: ''
};

export default function KelolaEdukasi() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran berkas gambar maksimal 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, gambar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/edukasi');
      const d = res.data;
      if (d?.success && Array.isArray(d.data)) {
        setArticles(d.data);
      } else if (Array.isArray(d)) {
        setArticles(d);
      } else if (Array.isArray(d?.data)) {
        setArticles(d.data);
      } else {
        setError('Gagal memuat artikel.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.isi.trim()) {
      setError('Judul dan isi artikel tidak boleh kosong.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post('/admin/edukasi', form);
      if (res.data.success) {
        setSuccess('Artikel edukasi berhasil ditambahkan.');
        setShowAddForm(false);
        setForm(defaultForm);
        fetchArticles();
      } else {
        setError(res.data.message || 'Gagal menambahkan artikel.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/admin/edukasi/${id}`);
      if (res.data.success) {
        setSuccess('Artikel berhasil dihapus.');
        fetchArticles();
      } else {
        setError(res.data.message || 'Gagal menghapus artikel.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = articles.filter(a =>
    a.judul.toLowerCase().includes(search.toLowerCase()) ||
    a.isi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Kelola Edukasi 📘</h2>
          <p className="text-[var(--text-secondary)]">Kelola artikel panduan keselamatan, mitigasi petir, dan prosedur evakuasi.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-premium text-white flex items-center gap-1.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Plus size={16} /> Tambah Artikel
          </button>
          <button
            onClick={fetchArticles}
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
      <div className="premium-card p-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-10 text-[var(--text-secondary)]">Memuat artikel...</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full text-center py-10 text-[var(--text-secondary)]">Tidak ada artikel edukasi.</p>
        ) : (
          filtered.map(article => (
            <div key={article.id} className="premium-card flex flex-col overflow-hidden relative group">
              <div className="h-44 bg-[var(--border-color)] relative overflow-hidden">
                <img
                  src={article.gambar}
                  alt={article.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold mb-2 line-clamp-2 text-[var(--text-primary)]">{article.judul}</h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-6">{article.isi}</p>
                </div>
                <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-4">
                  <span className="text-[10px] text-[var(--text-secondary)]">ID: {article.id.slice(0, 8)}</span>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Article Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              drag
              dragMomentum={false}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl relative z-10 border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl overflow-hidden"
            >
              {/* Draggable Header */}
              <div className="p-5 md:p-6 border-b border-[var(--border-color)] flex items-center justify-between cursor-grab active:cursor-grabbing bg-[var(--bg-base)]/50 select-none shrink-0">
                <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2.5">
                  <BookOpen className="text-[var(--accent-primary)]" size={22} />
                  Tambah Artikel Edukasi Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-2 rounded-xl hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-[var(--text-secondary)]">Judul Artikel</label>
                  <input
                    type="text" required
                    className="w-full p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all text-sm"
                    value={form.judul}
                    onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder="Masukkan judul artikel..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-[var(--text-secondary)]">Unggah Gambar Cover (Manual)</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md">
                        <Upload size={16} /> Pilih File Gambar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-[var(--text-secondary)] font-medium">atau masukkan URL langsung:</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://... (opsional jika memilih file di atas)"
                      className="w-full p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all text-xs"
                      value={form.gambar}
                      onChange={e => setForm(f => ({ ...f, gambar: e.target.value }))}
                    />

                    {form.gambar && (
                      <div className="mt-2 relative w-full h-44 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black/20 group">
                        <img src={form.gambar} alt="Preview Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, gambar: '' }))}
                            className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold shadow-lg"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm">Preview Cover</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-[var(--text-secondary)]">Isi Artikel</label>
                  <textarea
                    rows={6} required
                    className="w-full p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all text-sm leading-relaxed"
                    value={form.isi}
                    onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
                    placeholder="Tulis materi edukasi keselamatan..."
                  />
                </div>

                {/* Footer buttons inside form for submit trigger */}
                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)] shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--border-color)] text-sm font-semibold transition-colors cursor-pointer text-[var(--text-primary)]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-premium text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Artikel'}
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

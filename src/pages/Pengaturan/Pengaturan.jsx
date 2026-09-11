import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Shield, Save, Eye, EyeOff, Camera, Upload, Trash2,
  CheckCircle, AlertTriangle, ChevronRight, Mail, Zap, Sliders, Sun, Moon
} from 'lucide-react';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md font-medium text-sm ${
        type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
      }`}
    >
      {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
      {msg}
    </motion.div>
  );
}

const TABS = [
  { id: 'profil', label: 'Profil Saya', icon: User },
  { id: 'keamanan', label: 'Keamanan Akun', icon: Lock },
  { id: 'notifikasi', label: 'Preferensi Notifikasi', icon: Bell },
  { id: 'tampilan', label: 'Tampilan Aplikasi', icon: Sliders },
];

export default function Pengaturan() {
  const { user, updateProfile, changePassword } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profil');
  const [toast, setToast] = useState(null);

  // Profil state
  const [nama, setNama] = useState(user?.nama || '');
  const [photoPreview, setPhotoPreview] = useState(user?.photo_profile || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih berkas gambar yang valid (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      showToast('Foto profil dipilih. Klik "Simpan Perubahan" untuk menyimpan.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Foto profil dihapus. Klik "Simpan Perubahan" untuk memperbarui.');
  };

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // Notif preferences (local only for demo)
  const [notifPrefs, setNotifPrefs] = useState({
    risikoTinggi: true,
    risikoSedang: true,
    risikoRendah: false,
    emailDigest: false,
  });

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleSaveProfil = async (e) => {
    e.preventDefault();
    if (!nama.trim()) { showToast('Nama tidak boleh kosong.', 'error'); return; }
    setSavingProfile(true);
    const res = await updateProfile(nama.trim(), photoPreview);
    setSavingProfile(false);
    if (res.success) {
      showToast('Profil berhasil diperbarui!');
    } else {
      showToast(res.message || 'Gagal memperbarui profil.', 'error');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Lengkapi semua kolom kata sandi.', 'error'); return;
    }
    if (newPassword.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'error'); return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok.', 'error'); return;
    }
    setSavingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setSavingPass(false);
    if (res.success) {
      showToast('Kata sandi berhasil diubah!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      showToast(res.message || 'Gagal mengubah kata sandi.', 'error');
    }
  };

  return (
    <div className="pb-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Pengaturan Akun</h2>
        <p className="text-[var(--text-secondary)]">Kelola informasi pribadi, keamanan, dan preferensi aplikasi Anda.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="premium-card p-3 sticky top-28">
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto custom-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold relative group whitespace-nowrap lg:whitespace-normal ${
                      isActive 
                        ? 'text-white' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div layoutId="active-tab" className="absolute inset-0 bg-[var(--accent-primary)] rounded-xl -z-10 shadow-lg shadow-blue-500/20" />
                    )}
                    <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-[var(--accent-primary)] transition-colors'} />
                    <span className="relative z-10">{tab.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto hidden lg:block opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* === PROFIL TAB === */}
              {activeTab === 'profil' && (
                <div className="premium-card overflow-hidden">
                  <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <User className="text-[var(--accent-primary)]" /> Profil Publik
                    </h3>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 p-4 sm:p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl overflow-hidden min-w-0">
                      <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        title="Klik untuk upload foto profil"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-premium">
                          <img
                            src={photoPreview || DEFAULT_AVATAR}
                            alt="Foto Profil"
                            className="w-full h-full rounded-full object-cover bg-[var(--bg-surface)] border-4 border-[var(--bg-surface)]"
                            onError={e => { e.currentTarget.src = DEFAULT_AVATAR; }}
                          />
                        </div>
                        <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center border-2 border-[var(--bg-surface)] shadow-lg group-hover:scale-110 transition-transform">
                          <Camera size={13} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-1 truncate">{user?.nama}</h4>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 break-all">{user?.email}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold border inline-flex items-center gap-1.5 ${user?.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                            {user?.role === 'admin' ? <Shield size={12} /> : <Zap size={12} />}
                            {user?.role === 'admin' ? 'Administrator' : 'Pengguna Standar'}
                          </span>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                          >
                            <Upload size={12} /> Upload Foto
                          </button>

                          {photoPreview && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 size={12} /> Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfil} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                            <User size={14} /> Nama Lengkap
                          </label>
                          <input
                            type="text"
                            value={nama}
                            onChange={e => setNama(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                            <Mail size={14} /> Alamat Email
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] opacity-60 cursor-not-allowed outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                          {savingProfile ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><Save size={18} /> Simpan Perubahan</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* === KEAMANAN TAB === */}
              {activeTab === 'keamanan' && (
                <div className="premium-card overflow-hidden">
                  <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Lock className="text-red-500" /> Keamanan Akun
                    </h3>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="mb-8 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm font-medium flex gap-3 items-start">
                      <Shield size={20} className="shrink-0 mt-0.5" />
                      <p>Pastikan Anda menggunakan kata sandi yang kuat (minimal 8 karakter, kombinasi huruf besar, angka, dan simbol) untuk menjaga keamanan akun ThunderSafe Anda.</p>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-6 max-w-2xl">
                      {[
                        { id: 'old', label: 'Kata Sandi Lama', value: oldPassword, setter: setOldPassword, show: showOld, toggleShow: () => setShowOld(v => !v) },
                        { id: 'new', label: 'Kata Sandi Baru', value: newPassword, setter: setNewPassword, show: showNew, toggleShow: () => setShowNew(v => !v) },
                        { id: 'confirm', label: 'Konfirmasi Kata Sandi Baru', value: confirmPassword, setter: setConfirmPassword, show: showNew, toggleShow: null },
                      ].map((f) => (
                        <div key={f.id} className="space-y-2">
                          <label className="text-sm font-bold text-[var(--text-secondary)]">{f.label}</label>
                          <div className="relative">
                            <input
                              type={f.show ? 'text' : 'password'}
                              value={f.value}
                              onChange={e => f.setter(e.target.value)}
                              placeholder={`Masukkan ${f.label.toLowerCase()}`}
                              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all"
                            />
                            {f.toggleShow && (
                              <button 
                                type="button" 
                                onClick={f.toggleShow} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                              >
                                {f.show ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            )}
                          </div>
                          {f.id === 'new' && newPassword && (
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4].map(n => {
                                let color = 'bg-[var(--border-color)]';
                                if (newPassword.length >= n * 2) {
                                  color = newPassword.length < 8 ? 'bg-yellow-500' : 'bg-green-500';
                                }
                                return <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${color}`} />;
                              })}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="pt-4 border-t border-[var(--border-color)]">
                        <button
                          type="submit"
                          disabled={savingPass}
                          className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                          {savingPass ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><Lock size={18} /> Perbarui Kata Sandi</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* === NOTIFIKASI TAB === */}
              {activeTab === 'notifikasi' && (
                <div className="premium-card overflow-hidden">
                  <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Bell className="text-yellow-500" /> Pengaturan Notifikasi
                    </h3>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="space-y-4">
                      {[
                        { key: 'risikoTinggi', label: 'Peringatan Risiko Tinggi', desc: 'Notifikasi instan saat terdeteksi risiko sambaran petir tinggi (Bahaya).', urgent: true },
                        { key: 'risikoSedang', label: 'Peringatan Risiko Sedang', desc: 'Notifikasi saat terdeteksi risiko sambaran petir sedang (Waspada).' },
                        { key: 'risikoRendah', label: 'Info Kondisi Aman', desc: 'Pemberitahuan berkala saat kondisi cuaca kembali aman.' },
                        { key: 'emailDigest', label: 'Ringkasan Email Mingguan', desc: 'Laporan ringkasan aktivitas dan cuaca yang dikirim via email setiap akhir pekan.' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-base)] hover:border-[var(--accent-primary)] transition-colors">
                          <div className="pr-4">
                            <h4 className="font-bold flex items-center gap-2 mb-1">
                              {item.urgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                              {item.label}
                            </h4>
                            <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                          </div>
                          
                          <button
                            onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                            className={`relative w-14 h-7 rounded-full shrink-0 transition-colors duration-300 ${
                              notifPrefs[item.key] ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-color)]'
                            }`}
                          >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                              notifPrefs[item.key] ? 'translate-x-8' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
                      <button
                        onClick={() => showToast('Preferensi notifikasi berhasil disimpan!')}
                        className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Save size={18} /> Simpan Preferensi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAMPILAN TAB === */}
              {activeTab === 'tampilan' && (
                <div className="premium-card overflow-hidden">
                  <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sun className="text-[var(--accent-primary)]" /> Tampilan Aplikasi
                    </h3>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-base)] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold mb-1">Tema Aplikasi</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Pilih antara tema Terang (Light Mode) atau Gelap (Dark Mode).</p>
                      </div>
                      
                      <button
                        onClick={toggleTheme}
                        className="px-6 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold flex items-center gap-2 hover:bg-[var(--border-color)] transition-colors cursor-pointer"
                      >
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

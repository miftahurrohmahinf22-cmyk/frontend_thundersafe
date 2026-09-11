import { useState, useEffect } from 'react';
import { apiClient } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Save, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert,
  Server, Sliders, ToggleLeft, ToggleRight, Info
} from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      } else {
        setError('Gagal memuat pengaturan.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (field) => {
    setSettings(s => ({ ...s, [field]: !s[field] }));
  };

  const handleNumberChange = (field, val) => {
    setSettings(s => ({ ...s, [field]: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.put('/admin/settings', settings);
      if (res.data.success) {
        setSuccess('Pengaturan sistem berhasil disimpan.');
        setSettings(res.data.data);
      } else {
        setError(res.data.message || 'Gagal menyimpan pengaturan.');
      }
    } catch {
      setError('Gagal mengirim data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)] font-medium">Memuat konfigurasi sistem...</p>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">System Settings ⚙️</h2>
          <p className="text-[var(--text-secondary)]">Konfigurasi ambang batas, model Naive Bayes, status operasional, dan parameter sistem.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer text-[var(--text-primary)]"
        >
          <RefreshCw size={16} />
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Model Threshold Parameters */}
        <div className="premium-card p-6 md:p-8">
          <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
            <Sliders className="text-[var(--accent-primary)]" size={20} />
            Konfigurasi Ambang Batas Naive Bayes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Ambang Batas Risiko Tinggi (%)
              </label>
              <div className="relative">
                <input
                  type="number" min="1" max="100" required
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none font-bold"
                  value={settings?.threshold_high}
                  onChange={e => handleNumberChange('threshold_high', e.target.value)}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--text-secondary)]">%</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)]">Posterior Probability di atas batas ini diklasifikasi sebagai Tinggi (Bahaya).</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Ambang Batas Risiko Sedang (%)
              </label>
              <div className="relative">
                <input
                  type="number" min="1" max="100" required
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none font-bold"
                  value={settings?.threshold_medium}
                  onChange={e => handleNumberChange('threshold_medium', e.target.value)}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--text-secondary)]">%</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)]">Posterior Probability di atas batas ini diklasifikasi sebagai Sedang (Waspada).</p>
            </div>
          </div>
        </div>

        {/* Global Operations System Settings */}
        <div className="premium-card p-6 md:p-8">
          <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
            <Server className="text-emerald-500" size={20} />
            Pengaturan Operasional Global
          </h3>
          <div className="divide-y divide-[var(--border-color)]">
            {/* Maintenance Mode Toggle */}
            <div className="flex justify-between items-center py-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Mode Pemeliharaan (Maintenance)</h4>
                <p className="text-xs text-[var(--text-secondary)]">Kunci akses pengguna biasa dan alihkan halaman ke pemeliharaan.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('maintenance_mode')}
                className="text-[var(--accent-primary)] focus:outline-none cursor-pointer"
              >
                {settings?.maintenance_mode ? (
                  <ToggleRight size={44} className="text-red-500" />
                ) : (
                  <ToggleLeft size={44} className="text-[var(--text-secondary)]" />
                )}
              </button>
            </div>

            {/* Alert System Toggle */}
            <div className="flex justify-between items-center py-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Sistem Peringatan Dini Aktif</h4>
                <p className="text-xs text-[var(--text-secondary)]">Aktifkan pengiriman push notification peringatan risiko secara real-time.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('alert_system_active')}
                className="text-[var(--accent-primary)] focus:outline-none cursor-pointer"
              >
                {settings?.alert_system_active ? (
                  <ToggleRight size={44} className="text-green-500" />
                ) : (
                  <ToggleLeft size={44} className="text-[var(--text-secondary)]" />
                )}
              </button>
            </div>

            {/* Sync Interval */}
            <div className="flex justify-between items-center py-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Interval Sinkronisasi Data BMKG (Menit)</h4>
                <p className="text-xs text-[var(--text-secondary)]">Tenggat waktu update data stasiun terintegrasi.</p>
              </div>
              <div className="w-24">
                <input
                  type="number" min="5" max="360" required
                  className="w-full p-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] text-center text-sm font-bold outline-none"
                  value={settings?.data_sync_interval}
                  onChange={e => handleNumberChange('data_sync_interval', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notification Block */}
        <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-sm flex gap-3 text-red-500">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold mb-1">Perhatian Keamanan</p>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Perubahan pada ambang batas model Naive Bayes akan berdampak langsung pada seluruh kalkulasi prediksi risiko baru secara instan di sisi pengguna. Lakukan penyesuaian secara hati-hati.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-premium text-white font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}

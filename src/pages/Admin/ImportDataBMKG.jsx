import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../api/axios';
import {
  Upload, FileText, CheckCircle, AlertTriangle, RefreshCw, X, 
  ChevronLeft, FileSpreadsheet, Play, AlertCircle, Database, Check,
  BarChart2, Layers, Cpu, CheckSquare, Activity, Sliders, Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';

const formatNum = (val, decimals = 1, suffix = '') => {
  if (val === null || val === undefined || val === '') return '-';
  const num = parseFloat(val);
  return isNaN(num) ? '-' : `${num.toFixed(decimals)}${suffix}`;
};

export default function ImportDataBMKG() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [validCSVTexts, setValidCSVTexts] = useState([]);
  const [parsedRowCount, setParsedRowCount] = useState(0);
  
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [mlInfo, setMlInfo] = useState(null);
  const [loadingMlInfo, setLoadingMlInfo] = useState(true);

  const fileInputRef = useRef(null);

  // Fetch ML Pipeline Info on mount
  const fetchMlInfo = async () => {
    try {
      setLoadingMlInfo(true);
      const res = await apiClient.get('/admin/ml-info');
      if (res?.data?.success) {
        setMlInfo(res.data.pipeline);
      }
    } catch (err) {
      console.warn('Gagal memuat ML info:', err);
    } finally {
      setLoadingMlInfo(false);
    }
  };

  useEffect(() => {
    fetchMlInfo();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.csv'));
      if (selectedFiles.length > 0) {
        handleFileSelect(selectedFiles);
      } else {
        setError('Hanya mendukung berkas dengan format .csv');
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(Array.from(e.target.files));
    }
  };

  const handleFileSelect = (selectedFiles) => {
    setError('');
    setUploadResult(null);
    setFiles(selectedFiles);
    
    let totalRows = 0;
    const texts = [];

    let readCount = 0;
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result || '';
        texts.push(text);
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length > 1) totalRows += (lines.length - 1);
        
        readCount++;
        if (readCount === selectedFiles.length) {
          setValidCSVTexts(texts);
          setParsedRowCount(totalRows);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleReset = (e) => {
    if (e) e.preventDefault();
    setFiles([]);
    setValidCSVTexts([]);
    setParsedRowCount(0);
    setError('');
    setUploadResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async (e) => {
    if (e) e.preventDefault();

    if (validCSVTexts.length === 0 || files.length === 0) {
      setError('Harap pilih berkas CSV yang valid terlebih dahulu.');
      return;
    }

    const combinedCSVText = validCSVTexts.join('\n');
    const filenameLabel = files.map(f => f.name).join(', ');

    setImporting(true);
    setError('');
    setUploadResult(null);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress(p => (p >= 85 ? 85 : p + 10));
    }, 150);

    try {
      const response = await apiClient.post('/admin/import-csv', {
        csvText: combinedCSVText,
        filename: filenameLabel
      }, { timeout: 120000 });

      clearInterval(interval);
      setProgress(100);

      if (response?.data && response?.data?.success) {
        const insertedCount = response.data.insertedCount || response.data.summary?.insertedDataCuaca || parsedRowCount || 0;
        const resultsList = Array.isArray(response.data.data) ? response.data.data : [];

        setUploadResult({
          success: true,
          filename: filenameLabel,
          insertedCount: insertedCount,
          results: resultsList,
          message: response.data.message || `Berkas CSV "${filenameLabel}" berhasil diunggah dan diklasifikasi.`
        });

        // Refresh dynamic pipeline info from server
        fetchMlInfo();

        setFiles([]);
        setValidCSVTexts([]);
        setParsedRowCount(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const errorMsg = response?.data?.message || 'Upload gagal. Silakan periksa file.';
        setError(errorMsg);
      }
    } catch (err) {
      clearInterval(interval);
      console.error("UPLOAD CSV ERROR:", err);
      setError(err.response?.data?.message || 'Upload gagal. Periksa koneksi ke server.');
    } finally {
      setImporting(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="pb-10 text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Import Data BMKG & Evaluasi ML 📥</h2>
          <p className="text-[var(--text-secondary)]">Unggah data observasi BMKG (Stasiun Sleman), klasterisasi K-Means (K=3), split 80:20, dan latih model Gaussian Naive Bayes 5-Fitur.</p>
        </div>
        <Link
          to="/admin/dashboard"
          className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--border-color)] transition-all cursor-pointer"
        >
          <ChevronLeft size={16} /> Kembali
        </Link>
      </div>


      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Uploader & Column Guide */}
        <div className="xl:col-span-1 space-y-6">
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload size={18} className="text-[var(--accent-primary)]" />
              Unggah Berkas Data BMKG (.csv)
            </h3>

            {/* Drag and Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px]
                ${dragActive ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-[var(--bg-base)]/50'}
              `}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />
              
              <FileSpreadsheet size={44} className="text-[var(--text-secondary)] mb-3" />
              <p className="text-sm font-semibold mb-1">Seret & lepas berkas CSV di sini</p>
              <p className="text-xs text-[var(--text-secondary)] mb-4">(Stasiun Geofisika Sleman)</p>
              <button
                type="button"
                className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Pilih Berkas CSV
              </button>
            </div>

            {/* Selected Files Card */}
            {files.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <FileText size={18} className="text-emerald-500 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold truncate text-[var(--text-primary)]">
                        {files.map(f => f.name).join(', ')}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">Total {parsedRowCount} baris data diproses</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleReset} className="p-1 hover:bg-[var(--border-color)] rounded-lg text-red-500 cursor-pointer" title="Reset file">
                    <X size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || validCSVTexts.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-premium text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {importing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  {importing ? 'Memproses ML Pipeline...' : 'Jalankan Metodologi ML & Import'}
                </button>
              </div>
            )}
          </div>

          {/* 5 Feature Standard Specification Card */}
          <div className="premium-card p-6">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Cpu size={16} className="text-[var(--accent-primary)]" />
              5 Fitur Utama Penelitian (Wajib Digunakan)
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              Model Machine Learning ThunderSafe memproses seluruh 5 fitur meteorologi tanpa eliminasi:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex justify-between items-center">
                <span className="font-semibold">1. Suhu (°C)</span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">suhu_avg_°C / suhu</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex justify-between items-center">
                <span className="font-semibold">2. Kelembapan (%)</span>
                <span className="text-[10px] font-mono text-blue-500 font-bold">rh_avg_% / kelembapan</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex justify-between items-center">
                <span className="font-semibold">3. Tekanan Udara (hPa)</span>
                <span className="text-[10px] font-mono text-purple-500 font-bold">pp_qfe_mb / tekanan_udara</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex justify-between items-center">
                <span className="font-semibold">4. Kecepatan Angin Rata-rata (km/j)</span>
                <span className="text-[10px] font-mono text-cyan-500 font-bold">ff_avg_km/jm / kecepatan_angin</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex justify-between items-center">
                <span className="font-semibold">5. Kecepatan Angin Maksimum (km/j)</span>
                <span className="text-[10px] font-mono text-yellow-500 font-bold">ff_max_knot / kecepatan_angin_max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation & Model Inspection Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Loading Indicator */}
          {importing && (
            <div className="premium-card p-6 border-l-4 border-l-[var(--accent-primary)]">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw size={20} className="animate-spin text-[var(--accent-primary)]" />
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Memproses Pipeline Machine Learning...</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Validasi 5 Fitur → Drop missing 8888 → K-Means K=3 → Split 80:20 → Training GNB → Evaluasi Testing.</p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-[var(--border-color)] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-premium transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}


          {/* ERROR ALERT */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="flex-1">
                <strong className="block font-bold text-sm mb-0.5">✕ Terjadi Kesalahan</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* EVALUASI MODEL TESTING (213 Testing Data) */}
          {mlInfo?.evaluation && (
            <div className="premium-card p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2 pb-4 border-b border-[var(--border-color)]">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" />
                  Evaluasi Performa Model GNB ({mlInfo.testingDataCount ?? mlInfo.evaluation.totalTest ?? 104} Data Testing)
                </h3>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-black">
                  Akurasi: {mlInfo.evaluation.accuracy}%
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block mb-1">Akurasi Global</span>
                  <span className="text-2xl font-black text-emerald-500">{mlInfo.evaluation.accuracy}%</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block mb-1">Macro Precision</span>
                  <span className="text-2xl font-black text-blue-500">{mlInfo.evaluation.macroPrecision}%</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block mb-1">Macro Recall</span>
                  <span className="text-2xl font-black text-purple-500">{mlInfo.evaluation.macroRecall}%</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block mb-1">Macro F1-Score</span>
                  <span className="text-2xl font-black text-yellow-500">{mlInfo.evaluation.macroF1Score}%</span>
                </div>
              </div>

              {/* 3x3 Confusion Matrix */}
              <div>
                <h4 className="font-bold text-xs uppercase text-[var(--text-secondary)] mb-3">Confusion Matrix (3x3 Class)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs">
                    <thead>
                      <tr className="bg-[var(--bg-base)] font-bold border-b border-[var(--border-color)]">
                        <th className="p-2.5 text-left">Actual \ Predicted</th>
                        <th className="p-2.5 text-green-500">Pred: Rendah</th>
                        <th className="p-2.5 text-yellow-500">Pred: Sedang</th>
                        <th className="p-2.5 text-red-500">Pred: Tinggi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] font-medium">
                      <tr>
                        <td className="p-2.5 text-left font-bold text-green-500">Actual: Rendah</td>
                        <td className="p-2.5 bg-green-500/10 font-black text-green-600 dark:text-green-400">{mlInfo.evaluation.confusionMatrix?.Rendah?.Rendah ?? 0} (TP)</td>
                        <td className="p-2.5">{mlInfo.evaluation.confusionMatrix?.Rendah?.Sedang ?? 0}</td>
                        <td className="p-2.5">{mlInfo.evaluation.confusionMatrix?.Rendah?.Tinggi ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-left font-bold text-yellow-500">Actual: Sedang</td>
                        <td className="p-2.5">{mlInfo.evaluation.confusionMatrix?.Sedang?.Rendah ?? 0}</td>
                        <td className="p-2.5 bg-yellow-500/10 font-black text-yellow-600 dark:text-yellow-400">{mlInfo.evaluation.confusionMatrix?.Sedang?.Sedang ?? 0} (TP)</td>
                        <td className="p-2.5">{mlInfo.evaluation.confusionMatrix?.Sedang?.Tinggi ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-left font-bold text-red-500">Actual: Tinggi</td>
                        <td className="p-2.5">{mlInfo.evaluation.confusionMatrix?.Tinggi?.Rendah ?? 0}</td>
                        <td className="p-2.5">{mlInfo.evaluation.confusionMatrix?.Tinggi?.Sedang ?? 0}</td>
                        <td className="p-2.5 bg-red-500/10 font-black text-red-600 dark:text-red-400">{mlInfo.evaluation.confusionMatrix?.Tinggi?.Tinggi ?? 0} (TP)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CENTROID K-MEANS 3 CLUSTER */}
          {mlInfo && Array.isArray(mlInfo.centroids) && (
            <div className="premium-card p-5">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Sliders size={16} className="text-purple-500" />
                Centroid K-Means (K=3, 5 Fitur Meteorologi Main Dataset)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-base)] font-bold border-b border-[var(--border-color)]">
                      <th className="p-2.5">Cluster Index</th>
                      <th className="p-2.5">Label Risiko</th>
                      <th className="p-2.5">Suhu (°C)</th>
                      <th className="p-2.5">Kelembapan (%)</th>
                      <th className="p-2.5">Tekanan (hPa)</th>
                      <th className="p-2.5">Angin Rata (km/j)</th>
                      <th className="p-2.5">Angin Maks (km/j)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {mlInfo.centroids.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-base)]/50">
                        <td className="p-2.5 font-bold">Cluster {c.clusterIndex}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.assignedLabel === 'Rendah' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            c.assignedLabel === 'Sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {c.assignedLabel}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono">{formatNum(c.values?.suhu, 2)}</td>
                        <td className="p-2.5 font-mono">{formatNum(c.values?.kelembapan, 2)}</td>
                        <td className="p-2.5 font-mono">{formatNum(c.values?.tekanan_udara, 2)}</td>
                        <td className="p-2.5 font-mono">{formatNum(c.values?.kecepatan_angin, 2)}</td>
                        <td className="p-2.5 font-mono font-bold text-yellow-500">{formatNum(c.values?.kecepatan_angin_max, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL HASIL OBSERVASI UTAMA */}
          {uploadResult && uploadResult.success && Array.isArray(uploadResult.results) && (
            <div className="premium-card overflow-hidden">
              <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-base)]/50 flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Database size={16} className="text-emerald-500" />
                  Hasil Observasi & Klasifikasi Risiko (Disimpan ke PostgreSQL)
                </h4>
                <span className="text-xs text-[var(--text-secondary)] font-semibold">
                  {uploadResult.insertedCount} data berhasil disimpan
                </span>
              </div>

              <div className="overflow-x-auto max-h-[380px] custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-base)]/80 font-bold sticky top-0 z-10">
                      <th className="p-3">No</th>
                      <th className="p-3">Stasiun / Lokasi</th>
                      <th className="p-3">Suhu (°C)</th>
                      <th className="p-3">Angin Maks</th>
                      <th className="p-3">Tekanan</th>
                      <th className="p-3">Kelembapan</th>
                      <th className="p-3">Angin Rata</th>
                      <th className="p-3">Hasil Prediksi</th>
                      <th className="p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {uploadResult.results.map((item, i) => {
                      if (!item || typeof item !== 'object') return null;
                      const risikoLower = (item.tingkat_risiko || '').toLowerCase();
                      return (
                        <tr key={item.hasil_prediksi_id || i} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                          <td className="p-3 font-semibold text-[var(--text-secondary)]">{i + 1}</td>
                          <td className="p-3 font-bold">{item.nama_pos || '-'}</td>
                          <td className="p-3">{formatNum(item.suhu, 1, '°C')}</td>
                          <td className="p-3">{formatNum(item.kecepatan_angin_max, 1, ' km/j')}</td>
                          <td className="p-3">{formatNum(item.tekanan_udara, 0, ' hPa')}</td>
                          <td className="p-3">{formatNum(item.kelembapan, 0, '%')}</td>
                          <td className="p-3">{formatNum(item.kecepatan_angin, 1, ' km/j')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              risikoLower === 'rendah' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                              risikoLower === 'sedang' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                              'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {item.tingkat_risiko || 'Rendah'}
                            </span>
                          </td>
                          <td className="p-3 font-bold">{item.probabilitas || 0}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}


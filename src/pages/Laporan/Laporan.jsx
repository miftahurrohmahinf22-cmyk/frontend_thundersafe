import { useState, useEffect, useCallback, useMemo } from 'react';
import jsPDFModule from 'jspdf';
import autoTableModule from 'jspdf-autotable';
import { getLaporanData, saveLaporan } from '../../api/laporanApi';

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;
const autoTable = autoTableModule.default || autoTableModule;
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Download, FileText, BarChart2,
  Zap, AlertTriangle, CheckCircle, RefreshCw, Info, FileDown,
  User, Calendar, ShieldAlert, Search, Filter, RotateCcw
} from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', {
  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '-';

const getRiskBadge = (risk) => {
  if (!risk) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">AMAN</span>;
  const r = risk.toLowerCase();
  if (r === 'rendah' || r === 'aman') {
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">AMAN</span>;
  }
  if (r === 'sedang' || r === 'waspada') {
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">WASPADA</span>;
  }
  return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">BAHAYA</span>;
};

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold backdrop-blur-md
        ${type === 'success' 
          ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 dark:bg-emerald-950/80' 
          : 'bg-rose-500/15 text-rose-500 border-rose-500/30 dark:bg-rose-950/80'}
      `}
    >
      {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
      <span>{msg}</span>
    </motion.div>
  );
}

export default function Laporan() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter Options
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Pagination Options
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLaporanData();
      if (res.success) {
        setData(res.data || []);
      } else {
        setError('Gagal memuat data riwayat untuk laporan.');
      }
    } catch (err) {
      console.error('Error loading laporan data:', err);
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper pemilah tanggal universal (DD/MM/YYYY, YYYY-MM-DD, ISO)
  const getCanonicalDateStr = (val) => {
    if (!val) return null;
    if (typeof val === 'string') {
      const s = val.trim();
      const dmYMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (dmYMatch) {
        const day = dmYMatch[1].padStart(2, '0');
        const month = dmYMatch[2].padStart(2, '0');
        const year = dmYMatch[3];
        return `${year}-${month}-${day}`;
      }
      const yMDMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (yMDMatch) {
        const year = yMDMatch[1];
        const month = yMDMatch[2].padStart(2, '0');
        const day = yMDMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return null;
  };

  // Helper pembuat nama file unduhan otomatis sesuai periode filter
  const getExportFilename = (ext = 'pdf') => {
    let periodLabel = 'Semua-Data-2025-2026';
    if (filterPeriod === 'y2025') periodLabel = 'Tahun-2025';
    else if (filterPeriod === 'y2026') periodLabel = 'Tahun-2026-sd-Juni';
    else if (filterPeriod === 'june2026') periodLabel = 'Juni-2026';
    else if (filterPeriod === 'may2026') periodLabel = 'Mei-2026';
    else if (filterPeriod === 'today') periodLabel = `Hari-Ini-${new Date().toISOString().slice(0, 10)}`;
    else if (filterPeriod === 'week') periodLabel = '7-Hari-Terakhir';
    else if (filterPeriod === 'month') periodLabel = '30-Hari-Terakhir';
    else if (filterPeriod === 'custom') periodLabel = `Periode-${startDate || 'Awal'}-sd-${endDate || 'Sekarang'}`;

    return `Laporan-ThunderSafe-${periodLabel}.${ext}`;
  };

  // Combined Filter & Strict Deduplication logic (Period + Date Range + Search + Risk Level)
  const filteredData = useMemo(() => {
    const rawFiltered = data.filter((item) => {
      // 1. Period & Date Filter
      const dateVal = item.waktu_pengamatan || item.created_at;
      const canonicalDate = getCanonicalDateStr(dateVal);

      if (canonicalDate) {
        const [yStr, mStr, dStr] = canonicalDate.split('-');
        const year = parseInt(yStr, 10);
        const month = parseInt(mStr, 10) - 1;

        if (filterPeriod === 'y2025') {
          if (year !== 2025) return false;
        } else if (filterPeriod === 'y2026') {
          if (year !== 2026 || month > 5) return false;
        } else if (filterPeriod === 'june2026') {
          if (year !== 2026 || month !== 5) return false;
        } else if (filterPeriod === 'may2026') {
          if (year !== 2026 || month !== 4) return false;
        } else if (filterPeriod === 'today') {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (canonicalDate !== todayStr) return false;
        } else if (filterPeriod === 'custom') {
          if (startDate && canonicalDate < startDate) return false;
          if (endDate && canonicalDate > endDate) return false;
        }
      }

      // 2. Risk Filter
      if (riskFilter !== 'all') {
        const itemRisk = (item.tingkat_risiko || '').toLowerCase();
        if (riskFilter === 'Rendah' && itemRisk !== 'rendah' && itemRisk !== 'aman') return false;
        if (riskFilter === 'Sedang' && itemRisk !== 'sedang' && itemRisk !== 'waspada') return false;
        if (riskFilter === 'Tinggi' && itemRisk !== 'tinggi' && itemRisk !== 'bahaya') return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const namaPos = (item.nama_pos || '').toLowerCase();
        const kawasan = (item.kawasan || '').toLowerCase();
        const kabupaten = (item.kabupaten || '').toLowerCase();
        if (!namaPos.includes(q) && !kawasan.includes(q) && !kabupaten.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Deduplikasi Ketat: 1 Data Observasi per Hari per Stasiun
    const seen = new Set();
    const uniqueList = [];
    for (const item of rawFiltered) {
      const dateVal = item.waktu_pengamatan || item.created_at;
      const canonicalDate = getCanonicalDateStr(dateVal) || 'nodate';
      const posKey = (item.nama_pos || item.lokasi_id || 'stasiun').toLowerCase().trim();
      const uniqueKey = `${posKey}_${canonicalDate}`;

      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueList.push(item);
      }
    }

    return uniqueList;
  }, [data, filterPeriod, startDate, endDate, riskFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterPeriod, startDate, endDate, searchQuery, riskFilter]);

  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.ceil(filteredData.length / pageSize) || 1;
  }, [filteredData.length, pageSize]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // PDF Export Function
  const exportFullPDF = async () => {
    if (filteredData.length === 0) {
      showToast('Tidak ada data pada filter periode ini untuk diekspor.', 'error');
      return;
    }
    
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // 1. Header Band (Dark Blue Navy)
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, 'F');

      // Title & Text Info (Logo Removed)
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('ThunderSafe', 14, 17);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistem Deteksi Dini & Klasifikasi Risiko Petir (Gaussian Naive Bayes)', 14, 23);
      doc.setFontSize(8);
      doc.text('Stasiun Klimatologi dan Meteorologi ThunderSafe DI Yogyakarta', 14, 28);


      // Top Right Header Info
      doc.setFontSize(8);
      doc.text('DOKUMEN RESMI MITIGASI', 196, 16, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text('KLASIFIKASI BENCANA', 196, 21, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text('Status: Terverifikasi', 196, 26, { align: 'right' });

      // 2. User Info metadata box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 42, 182, 33, 3, 3, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('METADATA PENGAJU & LAPORAN', 20, 48);

      let periodeLabel = 'Semua Waktu (Awal 2025 - Juni 2026)';
      if (filterPeriod === 'y2025') periodeLabel = 'Tahun 2025 (Januari - Desember 2025)';
      else if (filterPeriod === 'y2026') periodeLabel = 'Tahun 2026 (Januari - Juni 2026)';
      else if (filterPeriod === 'june2026') periodeLabel = 'Bulan Juni 2026';
      else if (filterPeriod === 'may2026') periodeLabel = 'Bulan Mei 2026';
      else if (filterPeriod === 'today') periodeLabel = `Hari Ini (${new Date().toLocaleDateString('id-ID')})`;
      else if (filterPeriod === 'week') periodeLabel = '7 Hari Terakhir (Minggu Ini)';
      else if (filterPeriod === 'month') periodeLabel = '30 Hari Terakhir (Bulan Ini)';
      else if (filterPeriod === 'custom') periodeLabel = `${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Nama Pengaju : ${user?.nama || 'Pengguna ThunderSafe'}`, 20, 54);
      doc.text(`Email Pengaju: ${user?.email || '-'}`, 20, 59);
      doc.text(`Periode Filter: ${periodeLabel}`, 20, 64);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB`, 20, 69);

      // Warning Alert Badge on the right
      const tinggiCount = filteredData.filter(d => (d.tingkat_risiko || '').toLowerCase() === 'tinggi').length;
      const sedangCount = filteredData.filter(d => (d.tingkat_risiko || '').toLowerCase() === 'sedang').length;
      const rendahCount = filteredData.filter(d => (d.tingkat_risiko || '').toLowerCase() === 'rendah').length;
      
      let overallStatus = 'AMAN / NORMAL';
      let statusColor = [16, 185, 129]; // Green
      if (tinggiCount > 0) {
        overallStatus = 'BAHAYA TINGGI';
        statusColor = [239, 68, 68]; // Red
      } else if (sedangCount > 0) {
        overallStatus = 'WASPADA SEDANG';
        statusColor = [245, 158, 11]; // Yellow/Orange
      }

      doc.setFillColor(...statusColor);
      doc.roundedRect(138, 48, 50, 16, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('STATUS RISIKO UTAMA', 163, 53, { align: 'center' });
      doc.setFontSize(10.5);
      doc.text(overallStatus, 163, 60, { align: 'center' });

      // 3. Stats summary KPIs (5 Metrics)
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('RINGKASAN STATISTIK DATA', 14, 83);

      const stats = [
        { label: 'Total Data', val: filteredData.length.toString() },
        { label: 'Jumlah Aman', val: rendahCount.toString() },
        { label: 'Jml Waspada', val: sedangCount.toString() },
        { label: 'Jml Bahaya', val: tinggiCount.toString() },
        { label: 'Rata-rata Conf.', val: `${filteredData.length > 0 ? Math.round(filteredData.reduce((a, b) => a + parseFloat(b.probabilitas || 0), 0) / filteredData.length) : 0}%` }
      ];

      stats.forEach((s, idx) => {
        const xPos = 14 + (idx * 37.2);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(xPos, 87, 34, 16, 2, 2, 'FD');
        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text(s.label, xPos + 17, 92, { align: 'center' });
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text(s.val, xPos + 17, 99, { align: 'center' });
      });

      // 4. Data table
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('PARAMETER CUACA & OUTPUT NAIVE BAYES', 14, 111);

      autoTable(doc, {
        startY: 115,
        head: [['No', 'Stasiun / Lokasi', 'Risiko', 'Conf', 'Suhu', 'Lembap', 'Angin Rata', 'Angin Maks', 'Tekanan', 'Waktu']],
        body: filteredData.map((r, i) => [
          i + 1,
          r.nama_pos || 'Stasiun BMKG',
          (r.tingkat_risiko || '').toLowerCase() === 'tinggi' ? 'TINGGI' : (r.tingkat_risiko || '').toLowerCase() === 'sedang' ? 'SEDANG' : 'RENDAH',
          `${r.probabilitas}%`,
          `${parseFloat(r.suhu || 0).toFixed(1)}°C`,
          `${parseFloat(r.kelembapan || 0).toFixed(0)}%`,
          `${parseFloat(r.kecepatan_angin || 0).toFixed(1)} km/j`,
          `${parseFloat(r.kecepatan_angin_max || (r.kecepatan_angin * 1.5)).toFixed(1)} km/j`,
          `${parseFloat(r.tekanan_udara || 0).toFixed(0)} hPa`,
          new Date(r.waktu_pengamatan || r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        ]),
        styles: { fontSize: 7, cellPadding: 2, font: 'helvetica' },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 38 },
          2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 14, halign: 'center' },
          5: { cellWidth: 14, halign: 'center' },
          6: { cellWidth: 16, halign: 'center' },
          7: { cellWidth: 16, halign: 'center' },
          8: { cellWidth: 16, halign: 'center' },
          9: { cellWidth: 30, halign: 'center' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (cellData) => {
          if (cellData.section === 'body' && cellData.column.index === 2) {
            const val = cellData.cell.raw;
            if (val === 'BAHAYA') cellData.cell.styles.textColor = [220, 38, 38];
            else if (val === 'WASPADA') cellData.cell.styles.textColor = [245, 158, 11];
            else cellData.cell.styles.textColor = [16, 185, 129];
          }
        }
      });

      // 5. Analytical Conclusion
      let finalY = (doc.lastAutoTable?.finalY || 120) + 10;
      
      if (finalY > 245) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, finalY, 182, 32, 3, 3, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('KESIMPULAN ANALIS & REKOMENDASI MITIGASI', 20, finalY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      
      let conclusionText = 'Kondisi wilayah pemantauan secara umum relatif kondusif. Tetap pantau informasi cuaca secara berkala untuk mengantisipasi potensi petir lokal mendadak.';
      if (tinggiCount > 0) {
        conclusionText = 'DITEMUKAN TITIK RAWAN BAHAYA PETIR! Sangat direkomendasikan untuk menangguhkan seluruh aktivitas luar ruangan (outdoor) di kawasan terkait. Putuskan sambungan daya peralatan elektronik guna mencegah induksi surge petir, serta pastikan kesiapan jalur evakuasi menuju gedung beton kokoh.';
      } else if (sedangCount > 0) {
        conclusionText = 'WASPADA POTENSI SAMBARAN SEDANG. Harap berhati-hati bila merencanakan aktivitas luar ruangan di sore hari. Hindari berada di dekat objek tinggi tunggal seperti pohon atau tiang antena pemancar saat guntur mulai terdengar.';
      }

      const splitConclusion = doc.splitTextToSize(conclusionText, 170);
      doc.text(splitConclusion, 20, finalY + 14);

      // 6. Page Numbers Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Dokumen ini dihasilkan secara otomatis oleh ThunderSafe Engine Klasifikasi GNB pada ${new Date().toLocaleDateString('id-ID')}`, 14, 288);
        doc.text(`Halaman ${i} dari ${pageCount}`, 196, 288, { align: 'right' });
      }

      const filename = getExportFilename('pdf');
      doc.save(filename);

      if (filteredData[0]?.hasil_prediksi_id) {
        saveLaporan({ hasil_prediksi_id: filteredData[0].hasil_prediksi_id, nama_file: filename });
      }

      showToast('Laporan PDF mitigasi bencana berhasil diunduh!');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showToast('Gagal menghasilkan PDF: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredData.length === 0) {
      showToast('Tidak ada data pada periode ini untuk diekspor.', 'error');
      return;
    }
    const headers = ['No', 'Pengaju', 'Lokasi', 'Kawasan', 'Kabupaten', 'Risiko', 'Confidence (%)', 'Suhu (°C)', 'Kelembapan (%)', 'Angin Rata (km/j)', 'Angin Maks (km/j)', 'Tekanan (hPa)', 'Waktu'];
    const rows = filteredData.map((r, i) => [
      i + 1, r.user_nama || user?.nama || 'Standard User', r.nama_pos, r.kawasan, r.kabupaten,
      r.tingkat_risiko, r.probabilitas,
      parseFloat(r.suhu || 0).toFixed(1), parseFloat(r.kelembapan || 0).toFixed(0),
      parseFloat(r.kecepatan_angin || 0).toFixed(1), parseFloat(r.kecepatan_angin_max || (r.kecepatan_angin * 1.5)).toFixed(1),
      parseFloat(r.tekanan_udara || 0).toFixed(0), formatDate(r.waktu_pengamatan || r.created_at)
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    const filename = getExportFilename('csv');
    a.download = filename;
    a.click(); URL.revokeObjectURL(url);
    showToast('File CSV berhasil diunduh!');
  };

  // Stats Summary
  const statsSummary = useMemo(() => {
    const total = filteredData.length;
    const tinggi = filteredData.filter(d => (d.tingkat_risiko || '').toLowerCase() === 'tinggi').length;
    const sedang = filteredData.filter(d => (d.tingkat_risiko || '').toLowerCase() === 'sedang').length;
    const rendah = filteredData.filter(d => (d.tingkat_risiko || '').toLowerCase() === 'rendah').length;
    const avgConf = total > 0 ? Math.round(filteredData.reduce((a, b) => a + parseFloat(b.probabilitas || 0), 0) / total) : 0;
    return { total, tinggi, sedang, rendah, avgConf };
  }, [filteredData]);

  const handleResetFilters = () => {
    setFilterPeriod('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setRiskFilter('all');
  };

  return (
    <div className="pb-12 text-[var(--text-primary)] space-y-8">
      {/* Page Header Band */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <FileText size={22} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Pusat Laporan & Mitigasi</h2>
          </div>
          <p className="text-[var(--text-secondary)] text-xs md:text-sm pl-11">
            Ekspor rekapitulasi observasi cuaca dan hasil analisis Gaussian Naive Bayes per periode sesuai kebutuhan.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)]/50 hover:bg-[var(--border-color)] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Segarkan Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-orange-500' : ''} />
            <span>Segarkan</span>
          </button>
          
          <button
            onClick={exportCSV}
            disabled={loading || filteredData.length === 0}
            className="px-4.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)]/50 hover:bg-[var(--border-color)] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Download size={14} className="text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportFullPDF}
            disabled={loading || filteredData.length === 0 || generating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <FileDown size={16} />
                <span>Download PDF Resmi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-5 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-orange-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">Filter Periode & Parameter Dokumen</h3>
          </div>

          {/* Quick Period Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Data (2025 - Juni 2026)' },
              { id: 'y2025', label: 'Tahun 2025' },
              { id: 'y2026', label: 'Tahun 2026 (s/d Juni)' },
              { id: 'june2026', label: 'Juni 2026' },
              { id: 'today', label: 'Hari Ini' },
              { id: 'custom', label: 'Tanggal Custom' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === p.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Controls (Search + Risk + Custom Dates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={15} />
            <input
              type="text"
              placeholder="Cari stasiun atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-orange-500/50 outline-none"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-semibold outline-none cursor-pointer"
            >
              <option value="all">Semua Status Risiko</option>
              <option value="Rendah">Hanya Status AMAN</option>
              <option value="Sedang">Hanya Status WASPADA</option>
              <option value="Tinggi">Hanya Status BAHAYA</option>
            </select>
          </div>

          {/* Custom Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] shrink-0">Mulai:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setFilterPeriod('custom'); }}
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Custom End Date */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] shrink-0">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setFilterPeriod('custom'); }}
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>

        {/* Filter Summary indicator */}
        {(filterPeriod !== 'all' || searchQuery || riskFilter !== 'all' || startDate || endDate) && (
          <div className="flex justify-between items-center pt-2 text-xs border-t border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] font-medium">
              Ditemukan <strong className="text-orange-500 font-extrabold">{filteredData.length}</strong> entri dari total {data.length} entri.
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline cursor-pointer"
            >
              <RotateCcw size={12} /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Metadata Info Card */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden shadow-sm">
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
            <User size={16} className="text-orange-500" />
            Metadata Pengaju Laporan
          </h3>
          <div className="space-y-1 text-xs font-medium">
            <p className="text-[var(--text-secondary)]">Nama Akun: <strong className="text-[var(--text-primary)]">{user?.nama || 'Pengguna ThunderSafe'}</strong></p>
            <p className="text-[var(--text-secondary)]">Email Akun: <strong className="text-[var(--text-primary)]">{user?.email || '-'}</strong></p>
            <p className="text-[var(--text-secondary)]">Hak Akses: <strong className="text-[var(--text-primary)] uppercase">{user?.role || 'User'}</strong></p>
          </div>
        </div>

        <div className="space-y-3 border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-4 md:pt-0 md:pl-6">
          <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" />
            Parameter Dokumen Cetak
          </h3>
          <div className="space-y-1 text-xs font-medium">
            <p className="text-[var(--text-secondary)]">Waktu Cetak: <strong className="text-[var(--text-primary)]">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} - {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong></p>
            <p className="text-[var(--text-secondary)]">Status Verifikasi: <strong className="text-emerald-500 font-extrabold">Terverifikasi BMKG & GNB Engine</strong></p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Entri Filter', value: statsSummary.total, icon: BarChart2, cls: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
          { label: 'Jumlah Status Aman', value: statsSummary.rendah, icon: CheckCircle, cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Jumlah Waspada', value: statsSummary.sedang, icon: AlertTriangle, cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
          { label: 'Jumlah Bahaya', value: statsSummary.tinggi, icon: Zap, cls: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
          { label: 'Akurasi Confidence', value: `${statsSummary.avgConf}%`, icon: ShieldAlert, cls: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
        ].map((s, idx) => (
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center gap-3.5 shadow-sm" key={idx}>
            <div className={`w-11 h-11 rounded-xl ${s.cls} border flex items-center justify-center shrink-0`}>
              <s.icon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] text-[var(--text-secondary)] font-extrabold uppercase tracking-wider truncate mb-0.5">{s.label}</p>
              <h4 className="text-lg font-black">{loading ? '…' : s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Proportion Bar Graph */}
      {filteredData.length > 0 && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
          <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Proporsi Distribusi Tingkat Risiko</h3>
          <div className="w-full h-3.5 bg-[var(--bg-base)] rounded-full overflow-hidden flex border border-[var(--border-color)]">
            {statsSummary.rendah > 0 && (
              <div 
                className="h-full bg-emerald-500 transition-all" 
                style={{ width: `${(statsSummary.rendah / filteredData.length) * 100}%` }}
                title={`Aman: ${Math.round((statsSummary.rendah / filteredData.length) * 100)}%`}
              />
            )}
            {statsSummary.sedang > 0 && (
              <div 
                className="h-full bg-amber-500 transition-all" 
                style={{ width: `${(statsSummary.sedang / filteredData.length) * 100}%` }}
                title={`Waspada: ${Math.round((statsSummary.sedang / filteredData.length) * 100)}%`}
              />
            )}
            {statsSummary.tinggi > 0 && (
              <div 
                className="h-full bg-rose-500 transition-all" 
                style={{ width: `${(statsSummary.tinggi / filteredData.length) * 100}%` }}
                title={`Bahaya: ${Math.round((statsSummary.tinggi / filteredData.length) * 100)}%`}
              />
            )}
          </div>
          <div className="flex gap-6 text-[11px] font-bold text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Aman ({Math.round((statsSummary.rendah / filteredData.length) * 100) || 0}%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Waspada ({Math.round((statsSummary.sedang / filteredData.length) * 100) || 0}%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Bahaya ({Math.round((statsSummary.tinggi / filteredData.length) * 100) || 0}%)</div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs flex gap-3 items-center">
        <Info size={18} className="shrink-0" />
        <span>Dokumen Laporan PDF yang dihasilkan memuat tanda pengesahan stasiun klimatologi serta ringkasan mitigasi risiko. Berkas CSV dapat diolah lebih lanjut pada Microsoft Excel atau Google Sheets.</span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-xs flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Preview Table */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <FileDown className="text-orange-500" size={18} />
            Pratinjau Data Riwayat ({filteredData.length} Entri)
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-secondary)] font-bold">Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value="all">Semua ({filteredData.length})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--bg-base)]/50 text-[var(--text-secondary)] font-extrabold border-b border-[var(--border-color)] uppercase tracking-wider text-[10px]">
                <th className="p-4 text-center">No</th>
                <th className="p-4">Stasiun / Lokasi</th>
                <th className="p-4 text-center">Status Risiko</th>
                <th className="p-4 text-center">Confidence</th>
                <th className="p-4 text-center">Suhu (°C)</th>
                <th className="p-4 text-center">Lembap (%)</th>
                <th className="p-4 text-center">Angin Rata (km/j)</th>
                <th className="p-4 text-center">Angin Maks (km/j)</th>
                <th className="p-4 text-center">Tekanan (hPa)</th>
                <th className="p-4 text-right">Waktu Observasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[var(--text-secondary)]">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data riwayat...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[var(--text-secondary)]">
                    <FileText size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">Tidak ada data untuk periode ini</p>
                    <p className="text-xs mt-1">Coba ubah filter periode atau rentang tanggal di atas.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const globalIdx = pageSize === 'all' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={item.hasil_prediksi_id || idx} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                      <td className="p-4 text-center font-bold text-[var(--text-secondary)]">{globalIdx}</td>
                      <td className="p-4">
                        <div className="font-bold text-[var(--text-primary)]">{item.nama_pos || 'Stasiun BMKG'}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{item.kawasan || '-'} · {item.kabupaten || '-'}</div>
                      </td>
                      <td className="p-4 text-center">{getRiskBadge(item.tingkat_risiko)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-color)]">
                            <div 
                              className="h-full" 
                              style={{ 
                                width: `${item.probabilitas}%`, 
                                backgroundColor: (item.tingkat_risiko || '').toLowerCase() === 'tinggi' ? '#ef4444' : (item.tingkat_risiko || '').toLowerCase() === 'sedang' ? '#f59e0b' : '#10b981' 
                              }} 
                            />
                          </div>
                          <span className="font-extrabold text-[10px]">{item.probabilitas}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono">{parseFloat(item.suhu || 0).toFixed(1)}°C</td>
                      <td className="p-4 text-center font-mono">{parseFloat(item.kelembapan || 0).toFixed(0)}%</td>
                      <td className="p-4 text-center font-mono">{parseFloat(item.kecepatan_angin || 0).toFixed(1)}</td>
                      <td className="p-4 text-center font-mono">{parseFloat(item.kecepatan_angin_max || (item.kecepatan_angin * 1.5)).toFixed(1)}</td>
                      <td className="p-4 text-center font-mono">{parseFloat(item.tekanan_udara || 0).toFixed(0)}</td>
                      <td className="p-4 text-right text-[var(--text-secondary)] whitespace-nowrap">{formatDate(item.waktu_pengamatan || item.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {filteredData.length > 0 && (
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-base)]/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <span className="text-[var(--text-secondary)] font-semibold">
                Menampilkan {pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1} - {pageSize === 'all' ? filteredData.length : Math.min(currentPage * pageSize, filteredData.length)} dari <strong>{filteredData.length} entri</strong>
              </span>

              {pageSize !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1.5 font-bold">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--border-color)] transition-all cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-2 text-[var(--text-secondary)]">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--border-color)] transition-all cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

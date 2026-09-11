import { useState, useEffect, useRef } from 'react';
import { getPetaRisiko } from '../../api/petaRisikoApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, RefreshCw, Zap, AlertTriangle, CheckCircle,
  Thermometer, Droplets, Wind, CloudRain, Activity, Info, 
  Settings2, X
} from 'lucide-react';

const RISK_COLOR = {
  Rendah: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', hex: '#22c55e' },
  Sedang: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', hex: '#eab308' },
  Tinggi: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', hex: '#ef4444' },
};

const getRiskIcon = (risk) => {
  if (risk === 'Tinggi') return <Zap size={16} />;
  if (risk === 'Sedang') return <AlertTriangle size={16} />;
  return <CheckCircle size={16} />;
};

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export default function PetaRisiko() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [simulate, setSimulate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const leafletRef = useRef(null);

  const loadLeaflet = () => {
    return new Promise((resolve, reject) => {
      if (window.L) { resolve(window.L); return; }

      if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const fetchData = async (showRefresh = false, sim = simulate) => {
    if (showRefresh) setRefreshing(true);
    setError('');
    try {
      const res = await getPetaRisiko(sim);
      if (res.success) {
        setLocations(res.data || []);
      } else {
        setError('Gagal memuat data peta risiko.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (locations.length === 0 || !mapRef.current) return;

    let cancelled = false;

    loadLeaflet().then(L => {
      if (cancelled || !mapRef.current) return;
      leafletRef.current = L;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [-7.73, 110.33],
          zoom: 11,
          zoomControl: false,
          attributionControl: false
        });

        // Add custom zoom control position
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

        // Modern CartoDB Positron theme for Leaflet
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(mapInstanceRef.current);
      }

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      locations.forEach(loc => {
        const risk = loc.current?.tingkat_risiko || 'Rendah';
        const hex = RISK_COLOR[risk].hex;

        const iconHtml = `
          <div class="relative w-10 h-10 -ml-5 -mt-5 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full animate-ping opacity-30" style="background-color: ${hex}"></div>
            <div class="relative z-10 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center" style="background-color: ${hex}">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                ${risk === 'Tinggi' ? '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' : 
                  risk === 'Sedang' ? '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' : 
                  '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({ html: iconHtml, className: '' });

        const marker = L.marker([loc.latitude, loc.longtitude], { icon })
          .addTo(mapInstanceRef.current);

        marker.on('click', () => {
          setSelected(loc);
          mapInstanceRef.current.flyTo([loc.latitude, loc.longtitude], 14, { duration: 1.5, easeLinearity: 0.25 });
        });
        
        markersRef.current.push(marker);
      });

      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);

    }).catch(() => setError('Gagal memuat peta.'));

    return () => { cancelled = true; };
  }, [locations]);

  // Handle window resize for Leaflet map size invalidation
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSimulateToggle = () => {
    const newSim = !simulate;
    setSimulate(newSim);
    setLoading(true);
    fetchData(false, newSim);
  };

  const stats = {
    total: locations.length,
    tinggi: locations.filter(l => l.current?.tingkat_risiko === 'Tinggi').length,
    sedang: locations.filter(l => l.current?.tingkat_risiko === 'Sedang').length,
    rendah: locations.filter(l => l.current?.tingkat_risiko === 'Rendah').length,
  };

  return (
    <div className="pb-10 min-h-screen lg:h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">Peta Risiko Interaktif</h2>
          <p className="text-[var(--text-secondary)]">Pemantauan real-time stasiun cuaca wilayah Yogyakarta.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true, false)}
            disabled={refreshing || loading}
            className="glass-panel w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--border-color)] transition-colors cursor-pointer"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2 shrink-0">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Map Container - Height explicitly set for mobile & tablet */}
        <div className="w-full h-[420px] lg:h-full lg:flex-1 premium-card relative overflow-hidden flex flex-col shrink-0 lg:shrink min-h-[400px] lg:min-h-0">
          {loading && (
            <div className="absolute inset-0 bg-[var(--bg-surface-glass)] backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin mb-4" />
              <p className="font-semibold text-[var(--text-primary)]">Sinkronisasi Sensor...</p>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full min-h-[400px] bg-[var(--border-color)] z-0" />
          
          {/* Legend Map Overlay */}
          <div className="absolute bottom-6 left-6 z-10 glass-panel px-4 py-3 rounded-xl flex items-center gap-4 text-xs font-bold shadow-lg">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Rendah</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Sedang</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Tinggi</div>
          </div>
        </div>

        {/* Right: Sidebar Stations & Detail */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0 overflow-hidden">
          
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="premium-card p-3 text-center bg-red-500/5 border-red-500/20">
              <div className="text-xl font-bold text-red-500">{stats.tinggi}</div>
              <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Bahaya</div>
            </div>
            <div className="premium-card p-3 text-center bg-yellow-500/5 border-yellow-500/20">
              <div className="text-xl font-bold text-yellow-500">{stats.sedang}</div>
              <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Waspada</div>
            </div>
            <div className="premium-card p-3 text-center bg-green-500/5 border-green-500/20">
              <div className="text-xl font-bold text-green-500">{stats.rendah}</div>
              <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Aman</div>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {selected ? (
              /* Selected Detail Panel */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="premium-card flex flex-col h-full overflow-hidden"
              >
                <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-start bg-[var(--bg-base)]">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{selected.nama_pos}</h3>
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <MapPin size={12} /> {selected.kawasan}, {selected.kabupaten}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-secondary)]">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                  <div className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${RISK_COLOR[selected.current?.tingkat_risiko || 'Rendah'].bg} ${RISK_COLOR[selected.current?.tingkat_risiko || 'Rendah'].border}`}>
                    <div>
                      <div className="text-xs font-bold uppercase mb-1 text-[var(--text-secondary)]">Status Saat Ini</div>
                      <div className={`text-lg font-black ${RISK_COLOR[selected.current?.tingkat_risiko || 'Rendah'].text} flex items-center gap-2`}>
                        {getRiskIcon(selected.current?.tingkat_risiko)}
                        RISIKO {selected.current?.tingkat_risiko?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Suhu', val: `${selected.current?.suhu}°C`, icon: Thermometer },
                      { label: 'Kelembapan', val: `${selected.current?.kelembapan}%`, icon: Droplets },
                      { label: 'Angin Rata', val: `${selected.current?.kecepatan_angin} km/j`, icon: Wind },
                      { label: 'Angin Maks', val: `${selected.current?.kecepatan_angin_max !== undefined && selected.current?.kecepatan_angin_max !== null ? selected.current?.kecepatan_angin_max : (selected.current?.kecepatan_angin ? (selected.current?.kecepatan_angin * 1.5).toFixed(1) : '-')} km/j`, icon: Wind },
                      { label: 'Tekanan', val: `${selected.current?.tekanan_udara} hPa`, icon: Activity },
                      { label: 'Petir', val: `${selected.current?.aktivitas_petir}x`, icon: Zap },
                    ].map(m => (
                      <div key={m.label} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold uppercase">
                          <m.icon size={14} className="text-[var(--accent-primary)]" />
                          {m.label}
                        </div>
                        <div className="font-bold text-sm">{m.val}</div>
                      </div>
                    ))}
                  </div>

                  {selected.current?.rekomendasi && (
                    <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] text-sm">
                      <div className="flex gap-2 items-center text-[var(--text-primary)] font-bold mb-2">
                        <Info size={16} className="text-[var(--accent-primary)]" /> Saran Mitigasi
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{selected.current.rekomendasi}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Stations List Panel */
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="premium-card flex flex-col h-full overflow-hidden"
              >
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-base)] flex items-center gap-2 font-bold text-sm text-[var(--text-secondary)] uppercase">
                  <Settings2 size={16} /> Daftar Stasiun ({locations.length})
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {locations.map(loc => {
                    const risk = loc.current?.tingkat_risiko || 'Rendah';
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          setSelected(loc);
                          mapInstanceRef.current?.flyTo([loc.latitude, loc.longtitude], 14, { duration: 1.5 });
                        }}
                        className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base)] hover:border-[var(--accent-primary)] cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-sm group-hover:text-[var(--accent-primary)] transition-colors">{loc.nama_pos}</div>
                            <div className="text-[10px] text-[var(--text-secondary)]">{loc.kabupaten}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${RISK_COLOR[risk].bg} ${RISK_COLOR[risk].text} ${RISK_COLOR[risk].border}`}>
                            {getRiskIcon(risk)} {risk}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                          <span>{loc.current?.suhu}°C</span> •
                          <span>{loc.current?.kelembapan}%</span> •
                          <span>{loc.current?.kecepatan_angin} km/j</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex flex-wrap justify-between items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold shrink-0">
        <span>Sumber Data: BMKG | Diproses menggunakan Gaussian Naive Bayes</span>
        <span>Update Terakhir: {locations.length > 0 && locations[0].current ? new Date(locations[0].current.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'} WIB</span>
      </div>
    </div>
  );
}

export default function Statistik({ dataCuaca, loading }) {
  return (
    <section id="cuaca" className="stats-section">
      <div className="section-heading">
        <p className="eyebrow">Pantauan Cuaca</p>
        <h2>Status cuaca terkini dari sumber terhubung</h2>
      </div>

      <div className="weather-grid">
        {loading ? (
          <p className="muted">Menghubungkan ke API stasiun cuaca...</p>
        ) : (
          <>
            <div className="weather-card">
              <h3>{dataCuaca?.suhu || 28}°C</h3>
              <p>Temperatur Udara</p>
            </div>
            <div className="weather-card">
              <h3>{dataCuaca?.kelembaban || 82}%</h3>
              <p>Kelembaban</p>
            </div>
            <div className="weather-card">
              <h3>{dataCuaca?.status || "Waspada"}</h3>
              <p>Status Risiko</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

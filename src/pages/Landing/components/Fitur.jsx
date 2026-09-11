import dataAkuratImg from "../../../assets/images/dataakurat.jpg";

export default function Fitur() {
  return (
    <section className="overview-section">
      <div className="section-heading">
        <h2>Solusi Keamanan Terintegrasi</h2>
        <p>
          Kami menggabungkan data meteorologi dengan kecerdasan buatan untuk
          menghadirkan mitigasi risiko yang proaktif.
        </p>
      </div>

      <div className="bento-grid-top">
        <article
          className="feature-card main-feature-card row-layout"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="feature-card-main-left">
            <div className="feature-card-top">
              <div className="feature-card-icon">📈</div>
              <div>
                <div className="feature-label">Data Akurat</div>
                <h3>Prediksi Akurat (Naive Bayes)</h3>
              </div>
            </div>
            <p>
              Algoritma kami menganalisis kelembapan, suhu, dan tekanan udara
              secara real-time untuk memberikan probabilitas kejadian petir
              dengan tingkat presisi tinggi.
            </p>
            <div className="feature-detail-list">
              <span>🔹 Analisis data multi-parameter</span>
              <span>🔹 Pembaruan per menit</span>
            </div>
          </div>
          <div className="feature-card-image-wrapper">
            <img
              src={dataAkuratImg}
              alt="Data Akurat"
              className="feature-card-image"
            />
          </div>
        </article>

        <article
          className="feature-card small-feature-card"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="feature-card-top">
            <div className="feature-card-icon">🗺️</div>
            <div>
              <div className="feature-label">Peta Real-time</div>
              <h3>Peta Risiko Real-time</h3>
            </div>
          </div>
          <p>
            Visualisasi spasial yang menunjukkan area dengan tingkat kerawanan
            petir tinggi secara langsung di perangkat Anda.
          </p>
          <div className="map-preview-box">
            <div className="map-preview-icon">📍</div>
          </div>
        </article>
      </div>

      <div className="bento-grid-bottom">
        <article
          className="feature-card education-card"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="feature-card-top">
            <div className="feature-card-icon">📘</div>
            <div>
              <div className="feature-label">Edukasi Keselamatan</div>
              <h3>Panduan Proteksi Lengkap</h3>
            </div>
          </div>
          <p>
            Pelajari prosedur standar keselamatan saat terjadi badai petir untuk
            meminimalkan risiko cedera dan kerusakan fatal.
          </p>
          <a href="#history" className="feature-link">
            Pelajari Selengkapnya →
          </a>
        </article>

        <article
          className="stats-dark-block"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="stat-item">
            <h3>98%</h3>
            <p>Akurasi Prediksi</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Monitoring Aktif</p>
          </div>
          <div className="stat-item">
            <h3>500+</h3>
            <p>Aset Terlindungi</p>
          </div>
          <div className="stat-item">
            <h3>&lt; 2s</h3>
            <p>Latensi Notifikasi</p>
          </div>
        </article>
      </div>
    </section>
  );
}

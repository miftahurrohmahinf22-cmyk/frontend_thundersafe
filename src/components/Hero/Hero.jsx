import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1
            className="hero-title"
            style={{ color: "#0f172a", fontWeight: "800" }}
          >
            Sistem Deteksi & Pantauan Cuaca Ekstrem Real-Time
          </h1>
          <p
            style={{
              margin: "1.5rem 0 2.5rem 0",
              fontSize: "1.15rem",
              color: "#475569",
              lineHeight: "1.7",
            }}
          >
            Lindungi aktivitas dan aset Anda dari risiko cuaca ekstrem. Dapatkan
            hasil prediksi berbasis kecerdasan buatan, notifikasi dini, dan peta
            risiko yang akurat dalam satu platform terintegrasi.
          </p>
          <div
            className="hero-buttons"
            style={{ display: "flex", gap: "1rem" }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "0.8rem 2rem",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Buka Dashboard
            </button>
            <a
              href="#fitur"
              style={{
                padding: "0.8rem 2rem",
                background: "#f1f5f9",
                color: "#334155",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1000"
            alt="ThunderSafe Platform Preview"
            className="hero-photo"
          />
        </div>
      </div>
    </section>
  );
}

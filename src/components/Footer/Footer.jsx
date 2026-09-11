import { useNavigate, Link } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();
  return (
    <section className="cta-banner">
      <h2>Siap Menghadapi Musim Badai dengan Tenang?</h2>
      <p>
        Bergabunglah dengan jaringan pantauan ThunderSafe untuk pemantauan
        mitigasi real-time terbaik.
      </p>
      <button className="dark-btn" onClick={() => navigate("/register")}>
        Daftar Sekarang
      </button>
    </section>
  );
}

export default function Footer() {
  return (
    <div className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>ThunderSafe</h2>
          <p>
            Platform analisis keselamatan cuaca berbasis kecerdasan prediktif
            terintegrasi.
          </p>
        </div>
        <div className="footer-col">
          <h4>Layanan</h4>
          <ul>
            <li>
              <Link to="/prediksi">Prediksi Cuaca</Link>
            </li>
            <li>
              <Link to="/peta-risiko">Analisis Risiko</Link>
            </li>
            <li>
              <Link to="/api">Integrasi API</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Perusahaan</h4>
          <ul>
            <li>
              <Link to="/about">Tentang Kami</Link>
            </li>
            <li>
              <Link to="/privacy">Kebijakan Privasi</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Kontak</h4>
          <ul style={{ color: "#64748b", fontSize: "0.9rem" }}>
            <li>
              📍 Jl Kabupaten no.km.5.5,2,sendangadi,kec Melati,kabupaten Sleman
            </li>
            <li>✉️ support@miftahurahmah.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 ThunderSafe. Semua hak cipta dilindungi.</p>
        <div className="footer-social">
          <a href="#">Twitter</a>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
        </div>
      </div>
    </div>
  );
}

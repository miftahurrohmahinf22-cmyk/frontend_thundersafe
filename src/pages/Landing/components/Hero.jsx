import { useNavigate } from "react-router-dom";
import petirlandcape from "../../../assets/backgrounds/petirlandcape.jpg";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: `linear-gradient(270deg, rgba(15, 23, 42, 0.8) 20%, rgba(15, 23, 42, 0.35) 60%, rgba(15, 23, 42, 0.92) 100%), url(${petirlandcape})`,
      }}
    >
      <div className="hero-copy">
        <p className="eyebrow">Sistem Peringatan Dini Cerdas</p>
        <h1>
          Lindungi Diri & Aset dari <span>Bahaya Petir</span>
        </h1>
        <p className="hero-text">
          ThunderSafe menggunakan algoritma Naive Bayes canggih untuk memberikan
          prediksi akurasi tinggi dan peta risiko real-time demi keselamatan
          operasional Anda.
        </p>
        <button className="primary-btn" onClick={() => navigate("/register")}>
          Mulai Prediksi
        </button>
      </div>
    </section>
  );
}

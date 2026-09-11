import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="cta-banner">
      <h2>Siap Menghadapi Musim Badai dengan Tenang?</h2>
      <p>Bergabunglah dengan ribuan pengguna yang telah mempercayakan keselamatan aset mereka pada teknologi prediksi ThunderSafe.</p>
      <button className="dark-btn" onClick={() => navigate("/register")}>
        Daftar Sekarang
      </button>
    </section>
  );
}
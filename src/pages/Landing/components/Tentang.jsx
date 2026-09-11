import petirpotret from "../../../assets/images/petirpotret.jpg";

export default function Tentang() {
  return (
    <section className="info-section" id="history">
      <div className="info-visual-container">
        <img src={petirpotret} alt="Ilustrasi Petir" className="info-img" />
        <div className="info-floating-card">
          <p
            style={{
              color: "#ef4444",
              margin: "0 0 4px",
              fontWeight: "800",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ Peringatan Risiko Tinggi
          </p>
          <small style={{ color: "#64748b" }}>
            Berdasarkan data 2023, kerusakan aset akibat petir meningkat 15%
            pada area tanpa sistem prediksi.
          </small>
        </div>
      </div>

      <div className="info-content">
        <h2>Mengapa Kesadaran Petir Sangat Krusial?</h2>
        <p className="sub-text">
          Petir bukan sekadar fenomena alam, melainkan ancaman nyata bagi
          infrastruktur digital dan keselamatan jiwa. Aegis Risk hadir untuk
          mengubah data mentah menjadi tindakan preventif yang terukur.
        </p>

        <div className="info-list">
          <article>
            <div className="num-lead">01</div>
            <div>
              <h3>Perlindungan Infrastruktur</h3>
              <p>
                Mencegah lonjakan listrik destruktif yang berpotensi merusak
                server pusat data sensitif.
              </p>
            </div>
          </article>
          <article>
            <div className="num-lead">02</div>
            <div>
              <h3>Keselamatan Personel</h3>
              <p>
                Memberikan ambang batas waktu evakuasi memadai bagi pekerja
                teknis di lapangan.
              </p>
            </div>
          </article>
          <article>
            <div className="num-lead">03</div>
            <div>
              <h3>Efisiensi Biaya</h3>
              <p>
                Memangkas pengeluaran pemeliharaan darurat akibat kerusakan
                sistem penangkal pasif.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

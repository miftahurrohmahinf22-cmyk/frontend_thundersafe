const steps = [
  "Pantau parameter cuaca terkini melalui dashboard.",
  "Lihat status risiko berdasarkan lokasi yang dipilih.",
  "Gunakan edukasi mitigasi untuk mengurangi dampak bahaya.",
];

export default function CaraKerja() {
  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="eyebrow">Cara Kerja</p>
        <h2>Proses sederhana dari data sampai tindakan</h2>
      </div>
      <div className="card-grid">
        {steps.map((step, index) => (
          <article key={step} className="info-card">
            <h3>0{index + 1}</h3>
            <p>{step}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

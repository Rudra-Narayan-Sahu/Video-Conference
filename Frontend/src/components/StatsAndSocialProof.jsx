import React from 'react';

export default function StatsAndSocialProof() {
  const stats = [
    { number: "99.99%", label: "Uptime Reliability SLA" },
    { number: "< 25ms", label: "Average Global Latency" },
    { number: "15M+", label: "Monthly Call Minutes" },
    { number: "100%", label: "Encrypted WebRTC Streams" }
  ];

  const companies = [
    "Vercel", "Linear", "Stripe", "Figma", "Supabase", "Retool"
  ];

  return (
    <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '30px' }}>
      {/* Logos Strip */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '16px' }}>
          POWERING VIDEO COLLABORATION FOR TEAMS WORLDWIDE
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 'clamp(16px, 4vw, 36px)', opacity: 0.75 }}>
          {companies.map((c, i) => (
            <span key={i} style={{ fontSize: 'clamp(14px, 2.5vw, 17px)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="stats-grid">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

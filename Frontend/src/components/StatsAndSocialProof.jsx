import React from 'react';
import { Star } from 'lucide-react';

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
    <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      {/* Logos Strip */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '18px' }}>
          POWERING VIDEO COLLABORATION FOR TEAMS WORLDWIDE
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '36px', opacity: 0.7 }}>
          {companies.map((c, i) => (
            <span key={i} style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)' }}>
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

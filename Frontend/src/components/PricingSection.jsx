import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingSection({ onSelectPlan }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      badge: "Free",
      price: "0",
      period: "per user / month",
      desc: "For individuals and small groups needing reliable quick meetings.",
      features: [
        "Up to 50 participants per call",
        "Unlimited 1-on-1 meetings",
        "45-minute group meeting duration",
        "1080p HD Video & Audio",
        "In-meeting chat & screen sharing"
      ],
      cta: "Get Started Free",
      isPopular: false
    },
    {
      name: "Pro Team",
      badge: "Popular",
      price: isAnnual ? "12" : "15",
      period: "per user / month",
      desc: "For growing engineering and product teams that require unlimited meetings.",
      features: [
        "Up to 250 participants per call",
        "Unlimited meeting duration",
        "1080p & 4K 60FPS Video",
        "Full screen & window sharing",
        "Encrypted room access codes",
        "Priority customer support"
      ],
      cta: "Start Free Trial",
      isPopular: true
    },
    {
      name: "Enterprise",
      badge: "Custom",
      price: isAnnual ? "29" : "35",
      period: "per user / month",
      desc: "For organizations requiring dedicated infrastructure and administrative controls.",
      features: [
        "Up to 1,000+ participants",
        "Dedicated regional SFU routing",
        "SAML SSO & Admin management",
        "99.99% SLA guarantee",
        "Custom domain branding",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="section-container">
      <div className="section-header">
        <div className="section-tag">
          <span>Pricing</span>
        </div>
        <h2 className="section-title">
          Simple, predictable pricing
        </h2>
        <p className="section-description">
          Start for free, upgrade when your team needs more capacity and duration.
        </p>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: !isAnnual ? '#fff' : 'var(--text-secondary)', fontWeight: 500 }}>
            Monthly
          </span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '9999px',
              background: isAnnual ? '#3b82f6' : 'var(--border-default)',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <div 
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                transform: isAnnual ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.15s ease'
              }}
            />
          </button>
          <span style={{ fontSize: '13px', color: isAnnual ? '#fff' : 'var(--text-secondary)', fontWeight: 500 }}>
            Annual (Save 20%)
          </span>
        </div>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, idx) => (
          <div 
            key={idx} 
            className={`pricing-card ${plan.isPopular ? 'featured' : ''}`}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{plan.name}</span>
                {plan.isPopular && (
                  <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>$</span>
                <span style={{ fontSize: '36px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{plan.price}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/{plan.period}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', minHeight: '36px' }}>
                {plan.desc}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '24px', flex: 1 }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <Check size={14} className="text-emerald-400" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => onSelectPlan(plan.name)}
              className={plan.isPopular ? "btn-primary" : "btn-secondary"}
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

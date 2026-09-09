import React from 'react';
import { Video } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-app)', padding: '36px 20px', paddingBottom: 'max(36px, calc(var(--sab) + 20px))' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
            <Video size={16} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>AuraMeet</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• WebRTC Platform</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#demo" className="nav-link">Demo</a>
          <a href="#security" className="nav-link">Security</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 AuraMeet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

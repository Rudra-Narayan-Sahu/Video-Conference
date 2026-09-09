import React from 'react';
import { 
  ShieldCheck, 
  Share2, 
  Zap, 
  Lock, 
  MessageSquare
} from 'lucide-react';

export default function BentoFeatures() {
  return (
    <section id="features" className="section-container">
      <div className="section-header">
        <div className="section-tag">
          <span>Enterprise Capabilities</span>
        </div>
        <h2 className="section-title">
          Built for reliability, speed, and privacy
        </h2>
        <p className="section-description">
          A modern WebRTC architecture designed to deliver low-latency audio/video streaming directly across peer endpoints.
        </p>
      </div>

      <div className="bento-grid">
        {/* Card 1: Direct P2P WebRTC Mesh */}
        <div className="bento-card bento-col-span-2">
          <div>
            <div className="bento-icon-wrapper">
              <Zap size={20} />
            </div>
            <h3 className="bento-card-title">Low-Latency WebRTC Peer Mesh</h3>
            <p className="bento-card-desc" style={{ maxWidth: '520px' }}>
              Direct browser-to-browser peer connections minimize latency down to under 25ms. Video and audio tracks stream directly between participants without intermediary transcoding hops.
            </p>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>&lt; 25ms</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Direct P2P Latency</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>1080p / 4K</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Adaptive VP9 Resolution</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>0 Plugins</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>100% In-Browser</div>
            </div>
          </div>
        </div>

        {/* Card 2: End-to-End Encryption */}
        <div id="security" className="bento-card">
          <div>
            <div className="bento-icon-wrapper">
              <Lock size={20} />
            </div>
            <h3 className="bento-card-title">DTLS / SRTP Encryption</h3>
            <p className="bento-card-desc">
              All peer streams are encrypted end-to-end using standard AES-256 cipher suites. Your video and voice are private by design.
            </p>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
            <ShieldCheck size={15} />
            <span>Zero-Knowledge Architecture</span>
          </div>
        </div>

        {/* Card 3: Screen Sharing */}
        <div className="bento-card">
          <div>
            <div className="bento-icon-wrapper">
              <Share2 size={20} />
            </div>
            <h3 className="bento-card-title">HD Screen Sharing</h3>
            <p className="bento-card-desc">
              Share your entire display, application window, or browser tab with full audio pass-through and seamless track switching.
            </p>
          </div>

          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            ✓ 60 FPS Presentation Mode
          </div>
        </div>

        {/* Card 4: In-Meeting Real-Time Chat (Col Span 2) */}
        <div className="bento-card bento-col-span-2">
          <div>
            <div className="bento-icon-wrapper">
              <MessageSquare size={20} />
            </div>
            <h3 className="bento-card-title">Integrated In-Call Messaging</h3>
            <p className="bento-card-desc" style={{ maxWidth: '520px' }}>
              Real-time messaging powered by Socket.IO allows team members to share links, notes, and questions without interrupting the speaker.
            </p>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>✓ Room-isolated messaging</span>
            <span>✓ Unread counter badges</span>
            <span>✓ Live timestamping</span>
          </div>
        </div>
      </div>
    </section>
  );
}

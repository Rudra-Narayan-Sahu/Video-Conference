import React, { useState } from 'react';
import { 
  Grid, 
  UserCheck, 
  ScreenShare, 
  Send
} from 'lucide-react';

export default function MeetingPlayground() {
  const [activeTab, setActiveTab] = useState('grid');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sarah Chen', text: 'Has everyone checked the new deployment branch?', time: '10:42 AM', isSelf: false },
    { id: 2, sender: 'Alex Rivera', text: 'Yes, ping test shows under 20ms across regions.', time: '10:43 AM', isSelf: true },
    { id: 3, sender: 'Marcus Vance', text: 'All UI components are approved and merged.', time: '10:44 AM', isSelf: false }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    setChatMessages([...chatMessages, newMsg]);
    setInputText('');
  };

  return (
    <section id="demo" className="section-container">
      <div className="section-header">
        <div className="section-tag">
          <span>Live Preview</span>
        </div>
        <h2 className="section-title">
          Flexible meeting layouts
        </h2>
        <p className="section-description">
          Toggle between grid layouts, active speaker spotlights, and screen sharing to suit your workflow.
        </p>
      </div>

      <div className="panel" style={{ padding: 'clamp(14px, 3vw, 20px)' }}>
        {/* Layout Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div className="playground-tabs">
            <button 
              className={`btn-ghost ${activeTab === 'grid' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '13px', background: activeTab === 'grid' ? 'var(--bg-app)' : 'transparent', color: activeTab === 'grid' ? '#fff' : 'var(--text-secondary)', borderRadius: '6px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab('grid')}
            >
              <Grid size={14} />
              Grid View
            </button>
            <button 
              className={`btn-ghost ${activeTab === 'spotlight' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '13px', background: activeTab === 'spotlight' ? 'var(--bg-app)' : 'transparent', color: activeTab === 'spotlight' ? '#fff' : 'var(--text-secondary)', borderRadius: '6px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab('spotlight')}
            >
              <UserCheck size={14} />
              Speaker View
            </button>
            <button 
              className={`btn-ghost ${activeTab === 'screenshare' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '13px', background: activeTab === 'screenshare' ? 'var(--bg-app)' : 'transparent', color: activeTab === 'screenshare' ? '#fff' : 'var(--text-secondary)', borderRadius: '6px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab('screenshare')}
            >
              <ScreenShare size={14} />
              Screen Share
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Room ID: aur-product-sync</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="playground-layout-grid">
          {/* Main Stage */}
          <div style={{ background: '#0a0c10', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden', padding: activeTab === 'grid' ? '10px' : '0', minHeight: '260px' }}>
            {activeTab === 'grid' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', height: '100%', minHeight: '240px' }}>
                {["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"].map((img, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#11141c', aspectRatio: '16 / 9' }}>
                    <img src={img} alt="Participant" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'spotlight' && (
              <div style={{ position: 'relative', height: '100%', minHeight: '280px' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80" alt="Speaker" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#fff' }}>
                  Sarah Chen (Speaking)
                </div>
              </div>
            )}

            {activeTab === 'screenshare' && (
              <div style={{ height: '100%', minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                <div className="brand-icon" style={{ width: '40px', height: '40px', marginBottom: '12px' }}>
                  <ScreenShare size={20} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Alex Rivera is sharing screen</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>1080p 60 FPS presentation stream</p>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="chat-sidebar" style={{ borderRadius: '12px', minHeight: '260px' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              Meeting Chat
            </div>

            <div className="chat-messages" style={{ maxHeight: '260px' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble ${msg.isSelf ? 'sent' : 'received'}`}>
                  <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>
                    {msg.sender} • {msg.time}
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }}>
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message..."
                style={{
                  flex: 1,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: 0
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '7px 12px', borderRadius: '6px', flexShrink: 0 }}>
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

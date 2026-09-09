import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Settings2,
  ArrowRight
} from 'lucide-react';

export default function DevicePreviewModal({ isOpen, onClose, onConfirmJoin, roomCode }) {
  const [userName, setUserName] = useState('Alex Carter');
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(60);

  useEffect(() => {
    if (!isOpen || !micEnabled) {
      setAudioLevel(0);
      return;
    }
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(30 + Math.random() * 50));
    }, 250);
    return () => clearInterval(interval);
  }, [isOpen, micEnabled]);

  if (!isOpen) return null;

  const handleJoin = () => {
    onConfirmJoin({
      userName: userName.trim() || 'Guest User',
      micEnabled,
      camEnabled,
      roomCode: roomCode || 'general-meeting'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings2 size={16} className="text-blue-400" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Audio & Video Check</span>
          </div>
          <button 
            onClick={onClose}
            className="btn-ghost" 
            style={{ padding: '6px', borderRadius: '50%' }}
            aria-label="Close Preview Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 'clamp(14px, 3vw, 20px)' }}>
          {/* Camera View Area */}
          <div style={{ 
            position: 'relative', 
            aspectRatio: '16 / 9', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            background: '#0d0f14',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            {camEnabled ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" 
                  alt="Camera Preview" 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#10b981' }}>
                  ● Camera Active
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <VideoOff size={32} style={{ marginBottom: '6px' }} />
                <p style={{ fontSize: '13px' }}>Camera is Off</p>
              </div>
            )}

            {/* Quick in-preview toggles */}
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setMicEnabled(!micEnabled)}
                className={`dock-btn ${!micEnabled ? 'off' : ''}`}
                style={{ width: '36px', height: '36px' }}
                title={micEnabled ? 'Mute' : 'Unmute'}
                aria-label="Toggle Mic"
              >
                {micEnabled ? <Mic size={15} /> : <MicOff size={15} />}
              </button>
              <button 
                onClick={() => setCamEnabled(!camEnabled)}
                className={`dock-btn ${!camEnabled ? 'off' : ''}`}
                style={{ width: '36px', height: '36px' }}
                title={camEnabled ? 'Turn Off' : 'Turn On'}
                aria-label="Toggle Camera"
              >
                {camEnabled ? <Video size={15} /> : <VideoOff size={15} />}
              </button>
            </div>
          </div>

          {/* Mic Volume Meter */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Volume2 size={13} />
                Mic Audio Level
              </span>
              <span style={{ color: micEnabled ? '#10b981' : '#f87171' }}>
                {micEnabled ? 'Working' : 'Muted'}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${audioLevel}%`, 
                  background: '#10b981',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Display Name Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Your Name:
            </label>
            <input 
              type="text" 
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex Carter"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={onClose}
              className="btn-secondary" 
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleJoin}
              className="btn-primary" 
              style={{ flex: 2, padding: '10px', fontSize: '14px' }}
            >
              Join Meeting
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  MessageSquare, 
  Hand, 
  PhoneOff, 
  ArrowRight, 
  Users, 
  Settings, 
  Plus,
  ShieldCheck
} from 'lucide-react';

export default function HeroSection({ onStartInstantMeeting, onJoinMeeting, onOpenGreenRoom }) {
  const [meetingCode, setMeetingCode] = useState('');
  
  // Interactive Mockup State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSpeakerIndex(prev => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      onJoinMeeting(meetingCode.trim());
    }
  };

  const participants = [
    {
      name: "Alex Rivera",
      role: "Engineering Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      muted: false
    },
    {
      name: "Marcus Vance",
      role: "Product Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      muted: true
    },
    {
      name: "Sarah Chen",
      role: "VP Engineering",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      muted: false
    },
    {
      name: "Elena Rostova",
      role: "Research",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      muted: false
    }
  ];

  return (
    <section className="hero-section">
      <div className="bg-grid"></div>

      {/* Pill Badge */}
      <div className="hero-pill">
        <span className="pulse-online"></span>
        <span>Secure WebRTC Video Conferencing • Sub-30ms Latency</span>
      </div>

      {/* Headline */}
      <h1 className="hero-title">
        Video meetings built for modern collaboration
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        High-definition video, crystal-clear spatial audio, screen sharing, and real-time chat. No downloads, no plugins, just seamless calls in your browser.
      </p>

      {/* Action Bar */}
      <div className="action-bar">
        <button 
          onClick={onStartInstantMeeting}
          className="btn-primary" 
          style={{ padding: '12px 24px', fontSize: '15px' }}
        >
          <Plus size={18} />
          New Meeting
        </button>

        <button
          onClick={onOpenGreenRoom}
          className="btn-secondary"
          style={{ padding: '12px 18px', fontSize: '14px' }}
        >
          <Settings size={16} />
          Device Check
        </button>

        <form onSubmit={handleJoinSubmit} className="join-input-group">
          <input 
            type="text"
            className="join-input"
            placeholder="Enter a meeting code or link"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Join
          </button>
        </form>
      </div>

      {/* Clean Meeting Client Mockup */}
      <div className="mockup-container">
        <div className="mockup-frame">
          <div className="mockup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Meeting: #team-standup-sync</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#9ca3af' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} />
                <span>4 in call</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <ShieldCheck size={14} />
                <span>End-to-End Encrypted</span>
              </div>
            </div>
          </div>

          <div className="mockup-content">
            {/* 4 Participant Grid */}
            <div className="video-grid">
              {participants.map((p, idx) => {
                const isSpeaking = activeSpeakerIndex === idx;
                return (
                  <div 
                    key={p.name} 
                    className={`video-tile ${isSpeaking ? 'active-speaker' : ''}`}
                  >
                    <img 
                      src={p.avatar} 
                      alt={p.name} 
                      className="video-tile-img"
                    />
                    <div className="video-overlay">
                      <div className="participant-name-tag">
                        <span>{p.name}</span>
                        {isSpeaking && <span style={{ color: '#10b981', fontSize: '10px' }}>• Speaking</span>}
                      </div>

                      <div className={`tile-badge-icon ${p.muted ? 'muted' : ''}`}>
                        {p.muted ? <MicOff size={12} /> : <Mic size={12} className="text-emerald-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Dock */}
            <div className="control-dock">
              <button 
                className={`dock-btn ${!isMicOn ? 'off' : ''}`}
                onClick={() => setIsMicOn(!isMicOn)}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button 
                className={`dock-btn ${!isVideoOn ? 'off' : ''}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button 
                className="dock-btn"
                title="Share Screen"
                onClick={() => {}}
              >
                <Share2 size={18} />
              </button>

              <button 
                className={`dock-btn ${isHandRaised ? 'active' : ''}`}
                onClick={() => setIsHandRaised(!isHandRaised)}
                title="Raise Hand"
              >
                <Hand size={18} />
              </button>

              <button 
                className="dock-btn"
                title="Chat"
                onClick={() => {}}
              >
                <MessageSquare size={18} />
              </button>

              <button 
                className="dock-btn danger"
                title="Leave Meeting"
                onClick={() => {}}
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

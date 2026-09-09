import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';
import { 
  Video, 
  Plus, 
  Clock, 
  Calendar, 
  LogOut, 
  Copy, 
  Check, 
  Users
} from 'lucide-react';

function HomeComponent() {
  const navigate = useNavigate();
  const { user, logout, getHistory, addToActivity } = useAuth();
  
  const [meetingCode, setMeetingCode] = useState('');
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistory();
        setRecentMeetings(history.slice(0, 4));
      } catch (e) {
        console.error("Failed to load recent meetings", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleStartInstantMeeting = async () => {
    const randomCode = 'aur-' + Math.floor(100 + Math.random() * 900) + '-' + Math.random().toString(36).substring(2, 6);
    await addToActivity(randomCode);
    navigate(`/${randomCode}`);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    const cleanCode = meetingCode.trim().replace(/\s+/g, '-');
    if (cleanCode) {
      navigate(`/${cleanCode}`);
    }
  };

  const handleCopy = (code) => {
    const link = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container" style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <header className="navbar-wrapper">
        <nav className="navbar">
          <Link to="/" className="brand-logo">
            <div className="brand-icon">
              <Video size={18} />
            </div>
            <span>AuraMeet</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/history" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '13px' }}>
              <Clock size={15} />
              <span>History</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '12px', color: '#fff', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.username}
            </div>

            <button onClick={handleLogout} className="btn-ghost" style={{ color: '#f87171', padding: '6px 8px' }} title="Logout" aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Body */}
      <main className="section-container" style={{ maxWidth: '1000px', paddingTop: 'clamp(20px, 4vw, 40px)' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Welcome, {user?.name || user?.username}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Start a meeting or enter a code to join an existing session.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '32px' }}>
          {/* Instant Meeting */}
          <div className="panel" style={{ padding: 'clamp(18px, 3vw, 24px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="brand-icon" style={{ width: '40px', height: '40px', marginBottom: '14px' }}>
                <Plus size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Start a New Meeting</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Create a high-definition room with screen sharing and invite team members.
              </p>
            </div>

            <button 
              onClick={handleStartInstantMeeting}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '18px', padding: '11px', fontSize: '14px' }}
            >
              Start Instant Meeting
            </button>
          </div>

          {/* Join with ID */}
          <div className="panel" style={{ padding: 'clamp(18px, 3vw, 24px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="bento-icon-wrapper" style={{ width: '40px', height: '40px', marginBottom: '14px' }}>
                <Users size={18} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Join with a Code</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Enter the room ID or meeting invitation link to connect.
              </p>
            </div>

            <form onSubmit={handleJoinMeeting} style={{ marginTop: '18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="e.g. aur-782-x9k"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                style={{
                  flex: '1 1 160px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: 0
                }}
              />
              <button 
                type="submit" 
                className="btn-secondary" 
                style={{ padding: '9px 16px', fontSize: '13px' }}
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} className="text-blue-400" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Recent Meetings</h3>
            </div>
            <Link to="/history" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>
              View all history →
            </Link>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading recent meetings...
            </div>
          ) : recentMeetings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentMeetings.map((m, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '12px 14px',
                    background: 'var(--bg-app)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
                      <Video size={14} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.meetingCode}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(m.date || m.createdAt).toLocaleDateString()} at {new Date(m.date || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleCopy(m.meetingCode)}
                      className="btn-ghost" 
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      title="Copy Link"
                      aria-label="Copy meeting link"
                    >
                      {copiedCode === m.meetingCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedCode === m.meetingCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/${m.meetingCode}`)}
                      className="btn-primary" 
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                    >
                      Re-Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <Calendar size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px' }}>No meeting activity recorded yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomeComponent);

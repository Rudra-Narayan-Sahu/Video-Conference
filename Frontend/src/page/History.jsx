import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';
import { Video, Copy, Check, ArrowLeft, Search, Calendar, RefreshCw } from 'lucide-react';

function HistoryComponent() {
  const navigate = useNavigate();
  const { getHistory } = useAuth();
  
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setMeetings(data);
    } catch (err) {
      console.error("Error fetching meeting history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCopy = (code) => {
    const link = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredMeetings = meetings.filter(m => 
    (m.meetingCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container" style={{ minHeight: '100dvh', paddingBottom: '60px' }}>
      {/* Header */}
      <header className="navbar-wrapper">
        <nav className="navbar">
          <Link to="/home" className="brand-logo">
            <div className="brand-icon">
              <Video size={18} />
            </div>
            <span>AuraMeet</span>
          </Link>

          <Link to="/home" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="section-container" style={{ maxWidth: '900px', paddingTop: 'clamp(20px, 4vw, 40px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Meeting History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Previous meetings associated with your account.
            </p>
          </div>

          <button 
            onClick={fetchMeetings} 
            className="btn-ghost" 
            style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '6px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by meeting code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '9px 14px 9px 38px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading history...
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredMeetings.map((m, idx) => (
              <div 
                key={idx} 
                className="panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
                    <Video size={15} />
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
                    style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid var(--border-default)' }}
                    aria-label="Copy meeting code"
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
          <div className="panel" style={{ padding: '44px 20px', textAlign: 'center' }}>
            <Calendar size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No meeting history found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(HistoryComponent);

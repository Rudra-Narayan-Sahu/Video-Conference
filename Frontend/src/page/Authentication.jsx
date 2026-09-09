import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Video, Lock, User, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function Authentication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, error, setError } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/home';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isSignUp) {
      if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password.length < 4) {
        setError('Password must be at least 4 characters long');
        return;
      }
      setLoading(true);
      const res = await register(formData.name.trim(), formData.username.trim(), formData.password);
      setLoading(false);

      if (res.success) {
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      }
    } else {
      if (!formData.username.trim() || !formData.password.trim()) {
        setError('Please provide both username and password');
        return;
      }
      setLoading(true);
      const res = await login(formData.username.trim(), formData.password);
      setLoading(false);

      if (res.success) {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="bg-grid"></div>

      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '36px', position: 'relative', zIndex: 10, boxShadow: 'var(--shadow-lg)' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '16px' }}>
            <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
              <Video size={20} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>AuraMeet</span>
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {isSignUp ? 'Create an account' : 'Sign in to your account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isSignUp 
              ? 'Start hosting encrypted meetings in seconds' 
              : 'Enter your credentials to access your meetings'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-app)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-default)', marginBottom: '18px' }}>
          <button 
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: !isSignUp ? 'var(--bg-surface-elevated)' : 'transparent',
              color: !isSignUp ? '#fff' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: isSignUp ? 'var(--bg-surface-elevated)' : 'transparent',
              color: isSignUp ? '#fff' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fca5a5',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#34d399',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <CheckCircle size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 500 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  name="name"
                  required={isSignUp}
                  placeholder="Alex Rivera"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '10px 12px 10px 36px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 500 }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                name="username"
                required
                placeholder="alex_rivera"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '10px 12px 10px 36px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '10px 36px 10px 36px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '11px', marginTop: '6px' }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Video, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onOpenNewMeeting }) {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Video size={18} />
          </div>
          <span>AuraMeet</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li>
            <a href="#features" className="nav-link">Features</a>
          </li>
          <li>
            <a href="#demo" className="nav-link">Live Demo</a>
          </li>
          <li>
            <a href="#security" className="nav-link">Security</a>
          </li>
          <li>
            <a href="#pricing" className="nav-link">Pricing</a>
          </li>
          <li>
            <a href="#faq" className="nav-link">FAQ</a>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <Link to="/home" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Dashboard ({user?.name || user?.username})
            </Link>
          ) : (
            <Link to="/auth" className="btn-ghost" style={{ fontSize: '13px' }}>
              Sign In
            </Link>
          )}

          <button 
            onClick={onOpenNewMeeting}
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            New Meeting
          </button>
        </div>
      </nav>
    </header>
  );
}

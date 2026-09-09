import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Menu, X, Plus, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onOpenNewMeeting }) {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileNewMeeting = () => {
    setIsMobileMenuOpen(false);
    onOpenNewMeeting();
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
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

        {/* Desktop Action Buttons */}
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

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <ul className="mobile-nav-links">
              <li>
                <a href="#features" className="mobile-nav-link" onClick={handleMobileLinkClick}>
                  Features
                </a>
              </li>
              <li>
                <a href="#demo" className="mobile-nav-link" onClick={handleMobileLinkClick}>
                  Live Demo
                </a>
              </li>
              <li>
                <a href="#security" className="mobile-nav-link" onClick={handleMobileLinkClick}>
                  Security
                </a>
              </li>
              <li>
                <a href="#pricing" className="mobile-nav-link" onClick={handleMobileLinkClick}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="mobile-nav-link" onClick={handleMobileLinkClick}>
                  FAQ
                </a>
              </li>
            </ul>

            <div className="mobile-nav-actions">
              {isAuthenticated ? (
                <Link 
                  to="/home" 
                  className="btn-secondary" 
                  onClick={handleMobileLinkClick}
                  style={{ width: '100%', padding: '10px 16px', fontSize: '14px' }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard ({user?.name || user?.username})
                </Link>
              ) : (
                <Link 
                  to="/auth" 
                  className="btn-secondary" 
                  onClick={handleMobileLinkClick}
                  style={{ width: '100%', padding: '10px 16px', fontSize: '14px' }}
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              )}

              <button 
                onClick={handleMobileNewMeeting}
                className="btn-primary" 
                style={{ width: '100%', padding: '10px 16px', fontSize: '14px' }}
              >
                <Plus size={16} />
                New Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

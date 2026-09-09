import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Video } from 'lucide-react';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07080e',
          color: '#fff'
        }}>
          <div className="brand-icon animate-pulse-glow" style={{ width: '54px', height: '54px', marginBottom: '16px' }}>
            <Video size={28} />
          </div>
          <div style={{ fontSize: '15px', color: '#94a3b8' }}>Verifying session...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <Component {...props} />;
  };
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../utils/webrtcConfig';

// Create dedicated API client instance with timeout & defaults
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup Axios Interceptors
  useEffect(() => {
    // Request interceptor: Attach current token
    const reqInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const activeToken = token || localStorage.getItem('token');
        if (activeToken) {
          config.headers['Authorization'] = `Bearer ${activeToken}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    // Response interceptor: Handle 401 Unauthorized & 429 Rate limits
    const resInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;

          // If unauthorized or token expired, cleanly log out to prevent corrupted states
          if (status === 401 && (data?.error === 'TokenExpired' || data?.error === 'InvalidToken')) {
            console.warn('[Auth] Session token invalid or expired. Resetting credentials.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken('');
            setUser(null);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(reqInterceptor);
      apiClient.interceptors.response.eject(resInterceptor);
    };
  }, [token]);

  // Login handler
  const login = async (username, password) => {
    setError('');
    try {
      const response = await apiClient.post('/api/v1/users/login', {
        username,
        password
      });

      if (response.data && response.data.token) {
        const receivedToken = response.data.token;
        const loggedUser = response.data.user || { username, name: username };

        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        setToken(receivedToken);
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (err) {
      let errMsg = 'Invalid username or password';
      if (err.response?.status === 429) {
        errMsg = err.response.data?.message || 'Too many attempts. Please wait 15 minutes before trying again.';
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Register handler
  const register = async (name, username, password) => {
    setError('');
    try {
      const response = await apiClient.post('/api/v1/users/register', {
        name,
        username,
        password
      });

      if (response.data) {
        const receivedToken = response.data.token;
        const registeredUser = response.data.user || { name, username };

        if (receivedToken) {
          localStorage.setItem('token', receivedToken);
          localStorage.setItem('user', JSON.stringify(registeredUser));
          setToken(receivedToken);
          setUser(registeredUser);
        }
        return { success: true, message: response.data.message };
      }
      throw new Error('Registration failed');
    } catch (err) {
      let errMsg = 'Registration failed';
      if (err.response?.status === 429) {
        errMsg = err.response.data?.message || 'Too many attempts. Please try again later.';
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  // Add meeting to user history
  const addToActivity = async (meetingCode) => {
    if (!meetingCode) return;
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return;

    try {
      await apiClient.post('/api/v1/users/add_to_activity', {
        meetingCode
      });
    } catch (err) {
      console.warn('Could not log meeting activity:', err.response?.data?.message || err.message);
    }
  };

  // Get user meeting history
  const getHistory = async () => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return [];

    try {
      const response = await apiClient.get('/api/v1/users/get_all_activity');
      return response.data || [];
    } catch (err) {
      console.warn('Could not fetch history:', err.response?.data?.message || err.message);
      return [];
    }
  };

  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    addToActivity,
    getHistory,
    isAuthenticated: Boolean(token && user)
  }), [user, token, loading, error]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

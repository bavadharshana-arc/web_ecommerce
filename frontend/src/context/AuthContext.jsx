import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('shopnexus_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('shopnexus_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          setToken(savedToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth expiration events
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('shopnexus_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('shopnexus_auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.data) {
        const { user: userData, token: jwtToken } = response.data;
        localStorage.setItem('shopnexus_token', jwtToken);
        localStorage.setItem('shopnexus_user', JSON.stringify(userData));
        setUser(userData);
        setToken(jwtToken);
        return { success: true, user: userData };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid email or password',
        errors: error.errors,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.success && response.data) {
        const { user: newUser, token: jwtToken } = response.data;
        localStorage.setItem('shopnexus_token', jwtToken);
        localStorage.setItem('shopnexus_user', JSON.stringify(newUser));
        setUser(newUser);
        setToken(jwtToken);
        return { success: true, user: newUser };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please check inputs.',
        errors: error.errors,
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('shopnexus_user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
        errors: error.errors,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('shopnexus_token');
    localStorage.removeItem('shopnexus_user');
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
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

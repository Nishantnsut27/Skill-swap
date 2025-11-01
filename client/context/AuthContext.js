import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to sync user:', error);
      api.clearToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (stored) {
      api.setToken(stored);
      setToken(stored);
      syncUser();
    } else {
      setLoading(false);
    }
  }, [syncUser]);

  const login = useCallback(async (payload) => {
    const response = await api.post('/auth/login', payload);
    api.setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await api.post('/auth/register', payload);
    api.setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh: syncUser }),
    [user, token, loading, login, register, logout, syncUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}

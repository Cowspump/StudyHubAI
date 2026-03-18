import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import DB from '../utils/db';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DB.init();
    const saved = DB.get('currentUser');
    const token = DB.get('auth_token');
    if (saved && token) setUser(saved);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      DB.set('auth_token', data.token);
      DB.set('currentUser', data.user);
      setUser(data.user);
      return { user: data.user };
    } catch (err) {
      return { error: err.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (name, email, password, groupId) => {
    try {
      await authApi.register({
        name,
        email,
        password,
        role: 'student',
        groupId,
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Registration failed' };
    }
  }, []);

  const verifyEmailCode = useCallback(async (email, code) => {
    try {
      await authApi.verifyEmailCode({ email, code });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Verification failed' };
    }
  }, []);

  const logout = useCallback(() => {
    DB.remove('currentUser');
    DB.remove('auth_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const users = DB.get('users') || [];
    const idx = users.findIndex((u) => u.id === updatedData.id);
    if (idx !== -1) users[idx] = { ...users[idx], ...updatedData };
    DB.set('users', users);
    DB.set('currentUser', updatedData);
    setUser(updatedData);
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, verifyEmailCode, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

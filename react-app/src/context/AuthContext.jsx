import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import DB from '../utils/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DB.init();
    const saved = DB.get('currentUser');
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const users = DB.get('users') || [];
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return null;
    DB.set('currentUser', found);
    setUser(found);
    return found;
  }, []);

  const register = useCallback((name, email, password, groupId) => {
    const users = DB.get('users') || [];
    if (users.find((u) => u.email === email)) return { error: 'Бұл email тіркелген' };
    const newUser = {
      id: 'stu-' + DB.generateId(),
      email,
      password,
      name,
      role: 'student',
      groupId,
    };
    users.push(newUser);
    DB.set('users', users);
    DB.set('currentUser', newUser);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    DB.remove('currentUser');
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
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

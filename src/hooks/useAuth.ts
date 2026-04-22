import { useState, useCallback } from 'react';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'IgnacioSeCas@';
const AUTH_KEY = 'despedida_admin_auth';

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}

import { useState, useCallback, useEffect } from 'react';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? 'admin';
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS ?? '';
const AUTH_KEY = 'despedida_admin_auth';
const AUTH_CHANGED_EVENT = 'despedida_admin_auth_changed';

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function setAdminAuthSession(isAdmin: boolean) {
  if (isAdmin) {
    localStorage.setItem(AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
  emitAuthChanged();
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  useEffect(() => {
    const syncAuthState = () => {
      setIsAdmin(localStorage.getItem(AUTH_KEY) === 'true');
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    };
  }, []);

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setAdminAuthSession(true);
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAdminAuthSession(false);
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}

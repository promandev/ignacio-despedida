import { useState, useCallback, useEffect } from 'react';
import type { ThemeName } from '../types';

const ADMIN_USER = import.meta.env.VITE_AUTH_USER_1 ?? 'admin';
const ADMIN_PASS = import.meta.env.VITE_AUTH_CRED_1 ?? '';
const AUTH_KEY = 'despedida_admin_auth';
const AUTH_CHANGED_EVENT = 'despedida_admin_auth_changed';
const ADMIN_PREVIEW_KEY = 'admin_preview_theme';
const ADMIN_PREVIEW_EVENT = 'admin_preview_theme_changed';

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function setAdminAuthSession(isAdmin: boolean) {
  if (isAdmin) {
    sessionStorage.setItem(AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ADMIN_PREVIEW_KEY);
  }
  emitAuthChanged();
}

/** Read the admin's local-only preview theme (sessionStorage). */
export function getAdminPreviewTheme(): ThemeName {
  return (sessionStorage.getItem(ADMIN_PREVIEW_KEY) as ThemeName) || 'carmena';
}

/** Set the admin preview theme locally (no Firebase sync). */
export function setAdminPreviewThemeStorage(theme: ThemeName) {
  sessionStorage.setItem(ADMIN_PREVIEW_KEY, theme);
  window.dispatchEvent(new Event(ADMIN_PREVIEW_EVENT));
}

/** Hook to reactively track the admin preview theme. */
export function useAdminPreviewTheme() {
  const [previewTheme, setPreviewTheme] = useState<ThemeName>(getAdminPreviewTheme);

  useEffect(() => {
    const sync = () => setPreviewTheme(getAdminPreviewTheme());
    window.addEventListener(ADMIN_PREVIEW_EVENT, sync);
    return () => window.removeEventListener(ADMIN_PREVIEW_EVENT, sync);
  }, []);

  const setThemePreview = useCallback((theme: ThemeName) => {
    setAdminPreviewThemeStorage(theme);
    setPreviewTheme(theme);
  }, []);

  return { previewTheme, setThemePreview };
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  useEffect(() => {
    const syncAuthState = () => {
      setIsAdmin(sessionStorage.getItem(AUTH_KEY) === 'true');
    };

    // Only same-tab events (sessionStorage has no cross-tab sync)
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    return () => {
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

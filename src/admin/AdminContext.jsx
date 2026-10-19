import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_DICT } from '../i18n/admin-dict';
import { api, getToken, setToken } from './api';

const AdminContext = createContext(null);

function pick(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? node : node[part]), dict);
}

/* Provides admin auth state + a `t()` translator scoped to the URL language. */
export function AdminProvider({ lang, children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    api('/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const on401 = () => { setToken(null); setUser(null); };
    window.addEventListener('namadmin:401', on401);
    return () => window.removeEventListener('namadmin:401', on401);
  }, []);

  useEffect(() => {
    if (!getToken()) { setReady(true); return undefined; }
    api('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setReady(true));
    return undefined;
  }, []);

  const login = useCallback(async (username, password) => {
    const r = await api('/auth/login', { method: 'POST', body: { username, password } });
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const t = useCallback(
    (key) => pick(ADMIN_DICT[lang] ?? ADMIN_DICT.fa, key) ?? pick(ADMIN_DICT.fa, key) ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ user, ready, login, logout, lang, t }),
    [user, ready, login, logout, lang, t]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

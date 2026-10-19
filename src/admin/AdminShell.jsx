import { Navigate, Outlet, useParams } from 'react-router-dom';
import { LangProvider, LANGS, DEFAULT_LANG } from '../i18n';
import { AdminProvider } from './AdminContext';

function savedLang() {
  try {
    const v = localStorage.getItem('nemachin_lang');
    return LANGS.includes(v) ? v : DEFAULT_LANG;
  } catch { return DEFAULT_LANG; }
}

/* Entry for /:lang/admin — validates the language segment, wraps admin
   routes in the site's LangProvider (dir + fonts) and the admin auth context. */
export default function AdminShell() {
  const { lang } = useParams();
  if (!LANGS.includes(lang)) return <Navigate to={`/${savedLang()}/admin`} replace />;
  return (
    <LangProvider lang={lang}>
      <AdminProvider lang={lang}>
        <Outlet />
      </AdminProvider>
    </LangProvider>
  );
}

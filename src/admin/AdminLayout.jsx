import { useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { to } from '../i18n';

/* Sidebar + guarded content frame for the CMS (no public site header/footer).
   The sidebar naturally sits on the right for RTL (fa/ar) and left for EN
   because it is the first flex child. */
export default function AdminLayout() {
  const { user, ready, logout, lang, t } = useAdmin();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const menu = useMemo(() => [
    { to: '', key: 'dashboard' },
    { to: 'products', key: 'products' },
    { to: 'categories', key: 'categories' },
    { to: 'news', key: 'news' },
    { to: 'media', key: 'media' },
    { to: 'announcements', key: 'announcements' },
    { to: 'theme', key: 'theme' },
    { to: 'orders', key: 'orders' },
    { to: 'messages', key: 'messages' },
    { to: 'users', key: 'users' },
  ], []);

  if (!ready) {
    return <div className="admin-frame admin-frame--loading">{t('common.loading')}</div>;
  }
  if (!user) {
    return <Navigate to={to('/admin/login', lang)} replace />;
  }

  const base = `/${lang}/admin`;

  return (
    <div className="admin-frame" data-nav={navOpen ? 'open' : ''}>
      <aside className="admin-side">
        <div className="admin-side__brand">
          <span className="admin-side__name">{t('brand')}</span>
          <span className="admin-side__sub">{t('control')}</span>
        </div>
        <nav className="admin-side__nav">
          {menu.map((m) => (
            <NavLink
              key={m.key}
              to={m.to ? `${base}/${m.to}` : base}
              end={m.to === ''}
              className={({ isActive }) => `admin-side__item${isActive ? ' is-active' : ''}`}
              onClick={() => setNavOpen(false)}
            >
              <AdminIcon name={m.key} />
              <span>{t(`nav.${m.key}`)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-side__foot">
          <Link className="admin-side__item admin-side__item--muted" to={to('/', lang)}>
            <AdminIcon name="back" />
            <span>{t('common.backToSite')}</span>
          </Link>
          <button type="button" className="admin-side__item admin-side__item--muted" onClick={logout}>
            <AdminIcon name="logout" />
            <span>{t('nav.logout')}</span>
          </button>
          <div className="admin-side__user">{user.name || user.username}</div>
        </div>
      </aside>
      <div className="admin-main">
        <button
          type="button"
          className="admin-burger"
          aria-label="menu"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <Outlet />
      </div>
    </div>
  );
}

/* Minimal inline icon set for the sidebar (kept local to the admin). */
export function AdminIcon({ name, size = 18 }) {
  const p = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    products: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4" /><path d="M12 11v10" /></>,
    categories: <><rect x="3" y="4" width="6" height="5" rx="1" /><rect x="15" y="15" width="6" height="5" rx="1" /><path d="M9 6.5h5a2 2 0 012 2v6" /></>,
    news: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h10M7 16h6" /></>,
    media: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M3.5 18l5-5 3.5 3.5 3-3 5.5 5.5" /></>,
    announcements: <><path d="M3 10v4l12 4V6L3 10z" /><path d="M15 8a4 4 0 010 8" /><path d="M18 5.5a8 8 0 010 13" /></>,
    theme: <><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 000 16 5 5 0 000-16z" fill="currentColor" /></>,
    orders: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    messages: <><path d="M3 5h18v12H8l-5 4V5z" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17.5" cy="9" r="2.5" /><path d="M15.5 14.5a5 5 0 016 5" /></>,
    logout: <><path d="M9 4H5v16h4" /><path d="M14 8l4 4-4 4" /><path d="M8 12h10" /></>,
    back: <><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>,
  }[name];
  return (
    <svg
      className="admin-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {p}
    </svg>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Landing view: metric cards + content status + active modules (per mockup). */
export default function AdminDashboard() {
  const { t } = useAdmin();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/dashboard/stats').then(setStats).catch(() => {});
  }, []);

  const cards = stats
    ? [
        { key: 'products', value: stats.products, hint: t('dashboard.manageHint') },
        { key: 'categories', value: stats.categories, hint: t('dashboard.structureHint') },
        { key: 'orders', value: stats.orders, hint: t('dashboard.ordersHint') },
        { key: 'messages', value: stats.messages, hint: t('dashboard.messagesHint') },
      ]
    : [];

  const contentRows = stats
    ? [
        `${stats.products} ${t('dashboard.products')}`,
        `${stats.categories} ${t('dashboard.categories')}`,
        `${stats.news} ${t('dashboard.news')}`,
        `${stats.mediaFiles} ${t('dashboard.media')}`,
        `${stats.messagesUnread} ${t('dashboard.unread')}`,
        `${stats.ordersNew} ${t('dashboard.newOrders')}`,
      ]
    : [];

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.dashboard')}</p>
        <h1 className="admin-page__title">{t('nav.dashboard')}</h1>
      </header>

      <div className="admin-cards">
        {cards.map((c) => (
          <div key={c.key} className="admin-card admin-card--metric">
            <span className="admin-card__label">{t(`nav.${c.key}`)}</span>
            <strong className="admin-card__value">{stats ? c.value : '—'}</strong>
            <span className="admin-card__hint">{c.hint}</span>
          </div>
        ))}
      </div>

      <div className="admin-panels">
        <section className="admin-panel">
          <h2 className="admin-panel__title">{t('dashboard.contentStatus')}</h2>
          <ul className="admin-rows">
            {contentRows.map((r) => (
              <li key={r} className="admin-row">
                <span className="admin-row__dot" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        </section>
        <section className="admin-panel">
          <h2 className="admin-panel__title">{t('dashboard.activeModules')}</h2>
          <ul className="admin-rows">
            {t('dashboard.modules').map((m) => (
              <li key={m} className="admin-row">
                <span className="admin-row__dot admin-row__dot--gold" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

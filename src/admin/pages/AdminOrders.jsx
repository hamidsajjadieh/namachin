import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Order requests submitted from the site's product inquiry forms. */
export default function AdminOrders() {
  const { t, lang } = useAdmin();
  const [rows, setRows] = useState(null);

  const load = useCallback(() => api('/orders').then(setRows).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (row, status) => {
    await api(`/orders/${row.id}`, { method: 'PUT', body: { status } });
    load();
  };
  const remove = async (row) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await api(`/orders/${row.id}`, { method: 'DELETE' });
    load();
  };

  const statuses = [
    ['new', t('orders.statusNew')],
    ['review', t('orders.statusReview')],
    ['done', t('orders.statusDone')],
  ];

  const df = new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-EG' : 'en-US');

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.orders')}</p>
        <h1 className="admin-page__title">{t('nav.orders')}</h1>
        <p className="admin-page__sub">
          {t('orders.manage')}
          {rows && <span className="admin-page__count"> · {rows.length} {t('common.items')}</span>}
        </p>
      </header>

      <div className="admin-panel admin-panel--table">
        {rows === null ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">{t('common.none')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('orders.customer')}</th>
                <th>{t('orders.phone')}</th>
                <th>{t('orders.product')}</th>
                <th>{t('orders.date')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="admin-table__title">{r.name}</span>
                    {r.message && <span className="admin-table__code">{r.message.slice(0, 60)}</span>}
                  </td>
                  <td className="ltr">{r.phone}</td>
                  <td>{r.product || '—'}</td>
                  <td>{df.format(new Date(r.created_at))}</td>
                  <td>
                    <select
                      className="admin-input"
                      value={r.status}
                      onChange={(e) => setStatus(r, e.target.value)}
                    >
                      {statuses.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    <button type="button" className="admin-iconbtn" title={t('common.delete')} onClick={() => remove(r)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

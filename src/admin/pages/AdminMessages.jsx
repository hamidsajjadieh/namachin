import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Consultations & messages — view, mark read, delete. */
export default function AdminMessages() {
  const { t, lang } = useAdmin();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);

  const load = useCallback(() => api('/messages').then(setRows).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (row) => {
    await api(`/messages/${row.id}/read`, { method: 'PUT' });
    load();
  };
  const remove = async (row) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await api(`/messages/${row.id}`, { method: 'DELETE' });
    setOpen(null);
    load();
  };

  const df = new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-EG' : 'en-US');

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.messages')}</p>
        <h1 className="admin-page__title">{t('nav.messages')}</h1>
        <p className="admin-page__sub">
          {t('messages.manage')}
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
                <th>{t('messages.from')}</th>
                <th>{t('common.status')}</th>
                <th>{t('orders.date')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.is_read ? '' : 'is-unread'}>
                  <td>
                    <span className="admin-table__title">{r.name}</span>
                    <span className="admin-table__code ltr">{r.contact}</span>
                  </td>
                  <td>
                    <span className={`admin-badge${r.is_read ? '' : ' admin-badge--unread'}`}>
                      {r.is_read ? t('messages.read') : t('messages.unread')}
                    </span>
                  </td>
                  <td>{df.format(new Date(r.created_at))}</td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-iconbtn" title={t('messages.open')} onClick={() => { setOpen(r); if (!r.is_read) markRead(r); }}>👁</button>
                      <button type="button" className="admin-iconbtn" title={t('common.delete')} onClick={() => remove(r)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="admin-modal" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="admin-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <span className="admin-caps">ADMIN / {t('caps.messages')}</span>
              <button type="button" className="admin-modal__close" onClick={() => setOpen(null)} aria-label="close">✕</button>
            </div>
            <h2 className="admin-modal__title">{open.name}</h2>
            <p className="admin-msg__meta ltr">{open.contact}</p>
            <div className="admin-msg__body">{open.body || '—'}</div>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => remove(open)}>{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

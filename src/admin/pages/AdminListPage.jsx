import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Shared list/modal page used by News and Announcements. */
export default function AdminListPage({ kind }) {
  const { t } = useAdmin();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const isNews = kind === 'news';

  const load = useCallback(() => api(`/${kind}`).then(setRows).catch(() => {}), [kind]);
  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await api(`/${kind}/${row.id}`, { method: 'DELETE' });
    load();
  };

  const save = async (data) => {
    const payload = isNews
      ? { title: data.title, cover_url: data.cover_url, excerpt: data.excerpt, body: data.body, published: data.published }
      : { title: data.title, body: data.body, active: data.active };
    try {
      if (editing === 'new') await api(`/${kind}`, { method: 'POST', body: payload });
      else await api(`/${kind}/${data.id}`, { method: 'PUT', body: payload });
      setEditing(null);
      setError('');
      load();
    } catch {
      setError(t('common.required'));
    }
  };

  const fields = isNews
    ? [
        { key: 'title', label: t('common.title'), full: true },
        { key: 'cover_url', label: t('news.cover'), full: true },
        { key: 'excerpt', label: t('news.excerpt'), textarea: true, full: true },
        { key: 'body', label: t('news.body'), textarea: true, full: true },
      ]
    : [
        { key: 'title', label: t('common.title'), full: true },
        { key: 'body', label: t('announcement.body'), textarea: true, full: true },
      ];

  const caps = isNews ? t('caps.news') : t('caps.announcements');
  const manage = isNews ? t('news.manage') : t('announcement.manage');

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {caps}</p>
        <h1 className="admin-page__title">{t(`nav.${kind === 'news' ? 'news' : 'announcements'}`)}</h1>
        <p className="admin-page__sub">
          {manage}
          {rows && <span className="admin-page__count"> · {rows.length} {t('common.items')}</span>}
        </p>
      </header>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--accent" onClick={() => setEditing('new')}>
          {t('common.new')}
        </button>
      </div>

      <div className="admin-panel admin-panel--table">
        {rows === null ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">{t('common.none')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('common.title')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const activeFlag = isNews ? r.published : r.active;
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="admin-table__title">{r.title}</span>
                      <span className="admin-table__code">{(r.created_at || '').slice(0, 10)}</span>
                    </td>
                    <td>
                      <span className={`admin-badge${activeFlag ? '' : ' admin-badge--off'}`}>
                        {activeFlag ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-iconbtn" title={t('common.delete')} onClick={() => remove(r)}>✕</button>
                        <button type="button" className="admin-iconbtn" title={t('common.edit')} onClick={() => setEditing(r)}>✎</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ItemModal
          value={editing === 'new' ? { title: '', body: '', excerpt: '', cover_url: '', published: 1, active: 1 } : editing}
          fields={fields}
          caps={`EDIT / ${caps}`}
          title={t('product.editTitle')}
          error={error}
          isNews={isNews}
          onClose={() => { setEditing(null); setError(''); }}
          onSave={save}
        />
      )}
    </div>
  );
}

function ItemModal({ value, fields, caps, title, error, isNews, onClose, onSave }) {
  const { t } = useAdmin();
  const [form, setForm] = useState({ ...value, published: !!value.published, active: !!value.active });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__card">
        <div className="admin-modal__head">
          <span className="admin-caps">{caps}</span>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <h2 className="admin-modal__title">{title}</h2>
        <div className="admin-grid2">
          {fields.map((f) => (
            <label key={f.key} className={`admin-field${f.full ? ' admin-field--full' : ''}`}>
              <span>{f.label}</span>
              {f.textarea ? (
                <textarea rows={f.key === 'body' ? 8 : 3} value={form[f.key] ?? ''} onChange={set(f.key)} />
              ) : (
                <input value={form[f.key] ?? ''} onChange={set(f.key)} />
              )}
            </label>
          ))}
          <label className="admin-check admin-field--full">
            <input
              type="checkbox"
              checked={isNews ? form.published : form.active}
              onChange={(e) => setForm((v) => ({ ...v, [isNews ? 'published' : 'active']: e.target.checked }))}
            />
            <span>{isNews ? t('common.published') : t('announcement.show')}</span>
          </label>
        </div>
        {error && <p className="admin-modal__error">{error}</p>}
        <div className="admin-modal__foot">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>{t('common.save')}</button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

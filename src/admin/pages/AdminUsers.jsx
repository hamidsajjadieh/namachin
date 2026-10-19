import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Admin user management: create/edit admins, change passwords, delete. */
export default function AdminUsers() {
  const { t, user } = useAdmin();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => api('/users').then(setRows).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await api(`/users/${row.id}`, { method: 'DELETE' });
      setError('');
    } catch (e) {
      setError(e.message);
    }
    load();
  };

  const save = async (data) => {
    const payload = { username: data.username, name: data.name, role: data.role };
    if (data.password) payload.password = data.password;
    try {
      if (editing === 'new') await api('/users', { method: 'POST', body: payload });
      else await api(`/users/${data.id}`, { method: 'PUT', body: payload });
      setEditing(null);
      setError('');
      load();
    } catch (e) {
      setError(e.message === 'username_taken' ? t('product.codeTaken') : t('common.required'));
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.users')}</p>
        <h1 className="admin-page__title">{t('nav.users')}</h1>
        <p className="admin-page__sub">{t('users.manage')}</p>
      </header>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--accent" onClick={() => setEditing('new')}>
          {t('common.new')}
        </button>
      </div>

      <div className="admin-panel admin-panel--table">
        {rows === null ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('users.username')}</th>
                <th>{t('users.name')}</th>
                <th>{t('users.role')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="ltr">{r.username}</td>
                  <td>{r.name || '—'}</td>
                  <td>{r.role === 'editor' ? t('users.roleEditor') : t('users.roleAdmin')}</td>
                  <td>
                    <div className="admin-actions">
                      {r.id !== user?.id && (
                        <button type="button" className="admin-iconbtn" title={t('common.delete')} onClick={() => remove(r)}>🗑</button>
                      )}
                      <button type="button" className="admin-iconbtn" title={t('common.edit')} onClick={() => setEditing(r)}>✎</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <UserModal
          value={editing === 'new' ? { username: '', name: '', role: 'admin', password: '' } : editing}
          isNew={editing === 'new'}
          error={error}
          onClose={() => { setEditing(null); setError(''); }}
          onSave={save}
        />
      )}
    </div>
  );
}

function UserModal({ value, isNew, error, onClose, onSave }) {
  const { t } = useAdmin();
  const [form, setForm] = useState({ ...value, password: '' });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__card">
        <div className="admin-modal__head">
          <span className="admin-caps">EDIT / USER</span>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <h2 className="admin-modal__title">{isNew ? t('common.new') : t('product.editTitle')}</h2>
        <div className="admin-grid2">
          <label className="admin-field">
            <span>{t('users.username')}</span>
            <input value={form.username} onChange={set('username')} />
          </label>
          <label className="admin-field">
            <span>{t('users.name')}</span>
            <input value={form.name ?? ''} onChange={set('name')} />
          </label>
          <label className="admin-field">
            <span>{t('users.role')}</span>
            <select value={form.role} onChange={set('role')}>
              <option value="admin">{t('users.roleAdmin')}</option>
              <option value="editor">{t('users.roleEditor')}</option>
            </select>
          </label>
          <label className="admin-field">
            <span>{isNew ? t('users.password') : t('users.newPassword')}</span>
            <input type="password" value={form.password} onChange={set('password')} />
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

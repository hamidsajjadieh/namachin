import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Category tree with unlimited nesting: add root / sub, rename, delete. */
export default function AdminCategories() {
  const { t } = useAdmin();
  const [rows, setRows] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => api('/categories').then(setRows).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const children = (parentId) => (rows || []).filter((c) => (c.parent_id ?? null) === parentId);

  const addRoot = async () => {
    if (!newName.trim()) return;
    await api('/categories', { method: 'POST', body: { name: newName } });
    setNewName('');
    load();
  };
  const addSub = async (parent) => {
    const name = window.prompt(`${t('category.addSub')} — ${parent.name}`);
    if (!name?.trim()) return;
    await api('/categories', { method: 'POST', body: { name, parent_id: parent.id } });
    load();
  };
  const rename = async (cat) => {
    if (!newName.trim()) return;
    await api(`/categories/${cat.id}`, { method: 'PUT', body: { name: newName } });
    setEditingId(null);
    setNewName('');
    load();
  };
  const remove = async (cat) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await api(`/categories/${cat.id}`, { method: 'DELETE' });
      setError('');
    } catch {
      setError(t('category.notEmpty'));
    }
    load();
  };

  const renderRow = (cat, depth) => (
    <li key={cat.id}>
      <div className="admin-cat" style={{ paddingInlineStart: `${depth * 22 + 4}px` }}>
        {editingId === cat.id ? (
          <>
            <input
              className="admin-cat__edit"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button type="button" className="admin-iconbtn" onClick={() => rename(cat)}>✓</button>
            <button type="button" className="admin-iconbtn" onClick={() => setEditingId(null)}>✕</button>
          </>
        ) : (
          <>
            <span className="admin-cat__name">{cat.name}</span>
            <span className="admin-cat__count">{cat.product_count ?? 0}</span>
            <div className="admin-actions">
              <button type="button" className="admin-iconbtn" title={t('category.addSub')} onClick={() => addSub(cat)}>＋</button>
              <button
                type="button"
                className="admin-iconbtn"
                title={t('common.edit')}
                onClick={() => { setEditingId(cat.id); setNewName(cat.name); }}
              >✎</button>
              <button type="button" className="admin-iconbtn" title={t('common.delete')} onClick={() => remove(cat)}>🗑</button>
            </div>
          </>
        )}
      </div>
      {children(cat.id).length > 0 && (
        <ul className="admin-cats">{children(cat.id).map((c) => renderRow(c, depth + 1))}</ul>
      )}
    </li>
  );

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.categories')}</p>
        <h1 className="admin-page__title">{t('nav.categories')}</h1>
        <p className="admin-page__sub">{t('category.manage')}</p>
      </header>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRoot()}
          placeholder={t('category.newRoot')}
        />
        <button type="button" className="admin-btn admin-btn--accent" onClick={addRoot}>
          {t('category.newRoot')}
        </button>
      </div>
      {error && <p className="admin-modal__error">{error}</p>}

      <div className="admin-panel admin-panel--table">
        {rows === null ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">{t('category.empty')}</p>
        ) : (
          <ul className="admin-cats">
            {children(null).map((c) => renderRow(c, 0))}
          </ul>
        )}
      </div>
    </div>
  );
}

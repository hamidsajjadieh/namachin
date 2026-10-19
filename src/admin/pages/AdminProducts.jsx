import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

const EMPTY = {
  code: '', name_fa: '', name_en: '', name_ar: '', base_color: '', color_hex: '',
  category_id: null, length: '', width: '', thickness: '', absorption: '',
  resistance: '', image_url: '', published: 1,
};

/* Products list + edit/create modal (fields match the reference mockup). */
export default function AdminProducts() {
  const { t } = useAdmin();
  const [rows, setRows] = useState(null);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // product | 'new'
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const list = await api(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    setRows(list);
  }, [search]);

  useEffect(() => { load().catch(() => {}); }, [load]);
  useEffect(() => { api('/categories').then(setCats).catch(() => {}); }, []);

  const remove = async (row) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await api(`/products/${row.id}`, { method: 'DELETE' });
    load();
  };

  const save = async (data) => {
    const payload = {
      ...data,
      category_id: data.category_id || null,
      length: data.length || null,
      width: data.width || null,
      thickness: data.thickness || null,
      published: data.published ? 1 : 0,
    };
    try {
      if (editing === 'new') await api('/products', { method: 'POST', body: payload });
      else await api(`/products/${data.id}`, { method: 'PUT', body: payload });
      setEditing(null);
      setError('');
      load();
    } catch (e) {
      setError(e.message === 'UNIQUE constraint failed: products.code' ? t('product.codeTaken') : t('common.required'));
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.products')}</p>
        <h1 className="admin-page__title">{t('nav.products')}</h1>
        <p className="admin-page__sub">
          {t('product.manage')}
          {rows && <span className="admin-page__count"> · {rows.length} {t('common.items')}</span>}
        </p>
      </header>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--accent" onClick={() => setEditing('new')}>
          {t('common.new')}
        </button>
        <label className="admin-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
          />
        </label>
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
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="admin-table__title">{r.name_fa}</span>
                    <span className="admin-table__code">{r.code}</span>
                  </td>
                  <td>
                    <span className={`admin-badge${r.published ? '' : ' admin-badge--off'}`}>
                      {r.published ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-iconbtn" title={t('common.delete')} onClick={() => remove(r)}>✕</button>
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
        <ProductModal
          value={editing === 'new' ? EMPTY : editing}
          cats={cats}
          error={error}
          title={editing === 'new' ? t('product.newTitle') : t('product.editTitle')}
          caps={`EDIT / PRODUCT`}
          onClose={() => { setEditing(null); setError(''); }}
          onSave={save}
        />
      )}
    </div>
  );
}

export function ProductModal({ value, cats, title, caps, onClose, onSave, error }) {
  const { t } = useAdmin();
  const [form, setForm] = useState({ ...value, published: !!value.published });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const fields = [
    ['name_fa', t('product.name')],
    ['code', t('product.code')],
    ['base_color', t('product.baseColor')],
    ['category_id', t('product.category')],
    ['length', t('product.length')],
    ['color_hex', t('product.colorCode')],
    ['thickness', t('product.thickness')],
    ['width', t('product.width')],
    ['absorption', t('product.absorption')],
    ['resistance', t('product.resistance')],
  ];

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__card">
        <div className="admin-modal__head">
          <span className="admin-caps">{caps}</span>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <h2 className="admin-modal__title">{title}</h2>
        <div className="admin-grid2">
          {fields.map(([key, label]) => (
            <label key={key} className="admin-field">
              <span>{label}</span>
              {key === 'category_id' ? (
                <select value={form.category_id ?? ''} onChange={set(key)}>
                  <option value="">{t('product.uncategorized')}</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.indent ?? ''}{c.name}</option>
                  ))}
                </select>
              ) : key === 'color_hex' ? (
                <span className="admin-colorwrap">
                  <input value={form.color_hex} onChange={set(key)} placeholder="#C18E57" />
                  <span className="admin-swatch" style={{ background: form.color_hex || 'transparent' }} />
                </span>
              ) : (
                <input value={form[key] ?? ''} onChange={set(key)} />
              )}
            </label>
          ))}
          <label className="admin-field admin-field--full">
            <span>{t('product.image')}</span>
            <input value={form.image_url ?? ''} onChange={set('image_url')} />
          </label>
          {form.image_url ? (
            <div className="admin-field admin-field--full">
              <img className="admin-thumb" src={form.image_url} alt="" />
            </div>
          ) : null}
          <label className="admin-check admin-field--full">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <span>{t('common.published')}</span>
          </label>
        </div>
        {error && <p className="admin-modal__error">{error}</p>}
        <div className="admin-modal__foot">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>
            {t('common.save')}
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

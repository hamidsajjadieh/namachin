import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Theme & season settings — persisted via the settings API. */
export default function AdminTheme() {
  const { t } = useAdmin();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api('/settings').then((s) => setForm({
      accent: s.accent || '#b08d57',
      announcementActive: !!s.announcementActive,
      announcementText: s.announcementText || '',
    })).catch(() => {});
  }, []);

  if (!form) return <div className="admin-page"><p className="admin-empty">{t('common.loading')}</p></div>;

  const save = async () => {
    const merged = { ...form, heroVideoEnabled: true };
    await api('/settings', { method: 'PUT', body: merged });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.theme')}</p>
        <h1 className="admin-page__title">{t('nav.theme')}</h1>
        <p className="admin-page__sub">{t('theme.manage')}</p>
      </header>

      <div className="admin-panel">
        <div className="admin-grid2">
          <label className="admin-field">
            <span>{t('theme.accent')}</span>
            <span className="admin-colorwrap">
              <input value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} />
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(form.accent) ? form.accent : '#b08d57'}
                onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
              />
            </span>
          </label>
          <div className="admin-field">
            <span>{t('theme.announcementBar')}</span>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.announcementActive}
                onChange={(e) => setForm((f) => ({ ...f, announcementActive: e.target.checked }))}
              />
              <span>{t('theme.showBar')}</span>
            </label>
          </div>
          <label className="admin-field admin-field--full">
            <span>{t('theme.announcementText')}</span>
            <input value={form.announcementText} onChange={(e) => setForm((f) => ({ ...f, announcementText: e.target.value }))} />
          </label>
        </div>
        <div className="admin-modal__foot">
          <button type="button" className="admin-btn admin-btn--primary" onClick={save}>{t('common.save')}</button>
          {saved && <span className="admin-saved">{t('theme.saved')}</span>}
        </div>
      </div>
    </div>
  );
}

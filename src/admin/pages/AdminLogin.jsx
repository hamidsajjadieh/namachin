import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { to } from '../../i18n';

export default function AdminLogin() {
  const { user, login, lang, t } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={to('/admin', lang)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate(to('/admin', lang));
    } catch {
      setError(t('login.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <div className="admin-login__brand">
          <span className="admin-login__name">{t('brand')}</span>
          <span className="admin-login__sub">{t('control')}</span>
        </div>
        <p className="admin-login__caps">ADMIN / {t('caps.login')}</p>
        <h1 className="admin-login__title">{t('login.title')}</h1>
        <label className="admin-field">
          <span>{t('login.username')}</span>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className="admin-field">
          <span>{t('login.password')}</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-login__error">{error}</p>}
        <button className="admin-btn admin-btn--primary" type="submit" disabled={busy}>
          {t('login.submit')}
        </button>
        <p className="admin-login__hint">{t('login.hint')}</p>
      </form>
    </div>
  );
}

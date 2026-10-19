import { useState } from 'react';
import { useI18n } from '../i18n';
import { CheckIcon } from './Icons';

/*
 * Inquiry/request form with localized validation. Submissions are stored
 * locally (ready to be swapped for a real API endpoint later).
 */
export default function InquiryForm({ productCode = null }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t('contactPage.nameReq');
    if (!form.phone.trim()) errs.phone = t('contactPage.phoneReq');
    else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim()))
      errs.phone = t('contactPage.phoneInvalid');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t('contactPage.emailInvalid');
    if (!form.message.trim()) errs.message = t('contactPage.messageReq');
    setErrors(errs);
    if (Object.keys(errs).length) return;

    /* Product inquiries land in the admin's Order Requests; general contact
       form messages land in Consultations & Messages. LocalStorage is only a
       fallback when the API is unreachable. */
    try {
      const endpoint = productCode ? '/api/public/order-request' : '/api/public/message';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          productCode
            ? { name: form.name, phone: form.phone, email: form.email, product: productCode, message: form.message }
            : { name: form.name, contact: form.phone || form.email, subject: productCode || '', body: form.message }
        ),
      });
      if (!res.ok) throw new Error('api_failed');
    } catch {
      try {
        const list = JSON.parse(localStorage.getItem('nemachin_inquiries') || '[]');
        list.push({ ...form, productCode, date: new Date().toISOString() });
        localStorage.setItem('nemachin_inquiries', JSON.stringify(list));
      } catch {
        /* storage unavailable */
      }
    }
    setDone(true);
    setForm({ name: '', phone: '', email: '', message: '' });
  };

  const field = (key, label, type = 'text', required = false) => (
    <div className={`field${errors[key] ? ' has-error' : ''}`}>
      <label htmlFor={`inq-${key}`}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={`inq-${key}`}
          value={form[key]}
          onChange={set(key)}
          rows={4}
          aria-invalid={Boolean(errors[key])}
        />
      ) : (
        <input
          id={`inq-${key}`}
          type={type}
          value={form[key]}
          onChange={set(key)}
          aria-invalid={Boolean(errors[key])}
        />
      )}
      {errors[key] && <p className="field__error">{errors[key]}</p>}
    </div>
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-row">
        {field('name', t('contactPage.name'), 'text', true)}
        {field('phone', t('contactPage.phone'), 'tel', true)}
      </div>
      {field('email', t('contactPage.email'), 'email')}
      {field('message', t('contactPage.message'), 'textarea', true)}
      <div>
        <button type="submit" className="btn btn--primary">
          {t('contactPage.submit')}
        </button>
      </div>
      {done && (
        <p className="form-success" role="status">
          <CheckIcon size={18} />
          {t('contactPage.success')}
        </p>
      )}
    </form>
  );
}

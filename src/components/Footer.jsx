import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n, to } from '../i18n';
import { COMPANY } from '../data/company';
import { LogoMark } from './Header';
import {
  ClockIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TelegramIcon,
  WhatsappIcon,
} from './Icons';

const QUICK_LINKS = [
  { key: 'home', path: '' },
  { key: 'products', path: '/products' },
  { key: 'projects', path: '/projects' },
  { key: 'about', path: '/about' },
  { key: 'agencies', path: '/agencies' },
  { key: 'contact', path: '/contact' },
];

const SOCIALS = [
  { Icon: InstagramIcon, url: 'https://instagram.com/nemachin.brick', label: 'Instagram' },
  { Icon: TelegramIcon, url: 'https://t.me/nemachinbrick', label: 'Telegram' },
  { Icon: LinkedinIcon, url: 'https://linkedin.com/company/nemachin-brick', label: 'LinkedIn' },
  { Icon: WhatsappIcon, url: 'https://wa.me/983135493001', label: 'WhatsApp' },
];

export default function Footer() {
  const { t, fmt, lang } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem('nemachin_newsletter') || '[]');
      if (!list.includes(email)) list.push(email);
      localStorage.setItem('nemachin_newsletter', JSON.stringify(list));
    } catch {
      /* storage unavailable */
    }
    setStatus('ok');
    setEmail('');
  };

  const year = fmt(new Date().getFullYear());

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link className="logo" to={to('', lang)} aria-label={t('brand.name')}>
              <span className="logo__mark">
                <LogoMark />
              </span>
              <span className="logo__name">
                {t('brand.name')}
                <small>{t('brand.latin')}</small>
              </span>
            </Link>
            <p className="footer__desc">{t('footer.desc')}</p>
            <p className="footer__title" style={{ marginBottom: '0.6rem' }}>
              {t('footer.followUs')}
            </p>
            <div className="socials">
              {SOCIALS.map(({ Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <h3 className="footer__title">{t('footer.navTitle')}</h3>
            <div className="footer__links">
              {QUICK_LINKS.map((item) => (
                <Link key={item.key} to={to(item.path, lang)}>
                  {item.key === 'contact' ? t('header.request') : t(`nav.${item.key}`)}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <h3 className="footer__title">{t('footer.contactTitle')}</h3>
            <ul className="footer__contact">
              <li>
                <PhoneIcon size={15} />
                <a className="ltr" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
              </li>
              <li>
                <MailIcon size={15} />
                <a className="ltr" href={COMPANY.emailHref}>{COMPANY.email}</a>
              </li>
              <li>
                <PinIcon size={15} />
                {t('contactBlock.addressValue')}
              </li>
              <li>
                <ClockIcon size={15} />
                {t('contactPage.hoursValue')}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="footer__title">{t('footer.newsletterTitle')}</h3>
            <p style={{ fontSize: '0.92rem', marginBottom: '0.2rem' }}>
              {t('footer.newsletterDesc')}
            </p>
            <form className="newsletter" onSubmit={subscribe} noValidate>
              <label htmlFor="newsletter-email" className="visually-hidden">
                {t('footer.emailPlaceholder')}
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus(null);
                }}
              />
              <button type="submit">{t('footer.subscribe')}</button>
            </form>
            {status === 'ok' && <p className="newsletter-msg">{t('footer.subscribed')}</p>}
            {status === 'error' && (
              <p className="newsletter-msg" style={{ color: '#e8927c' }}>
                {t('footer.emailInvalid')}
              </p>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} — {t('footer.rights')}</span>
          <span className="ltr" style={{ letterSpacing: '0.25em' }}>
            NEMACHIN BRICK FACTORY
          </span>
        </div>
      </div>
    </footer>
  );
}

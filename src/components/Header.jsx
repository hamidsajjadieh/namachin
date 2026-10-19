import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useI18n, LANGS, LANG_LABELS, to } from '../i18n';
import { COMPANY } from '../data/company';
import { ChevronDown, ChevronLeft, GlobeIcon, PhoneIcon } from './Icons';

export const NAV_ITEMS = [
  { key: 'home', path: '' },
  { key: 'products', path: '/products' },
  { key: 'projects', path: '/projects' },
  { key: 'facade', path: '/facade-design' },
  { key: 'articles', path: '/articles' },
  { key: 'magazine', path: '/magazine' },
  { key: 'agencies', path: '/agencies' },
  { key: 'about', path: '/about' },
];

export function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M14 20h36M14 32h36M14 44h36M23 14v6M41 14v6M32 26v6M50 26v6M23 38v6M41 38v6"
        stroke="#c9a96b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Switch language while preserving the current route, params and query */
function useLangSwitch() {
  const location = useLocation();
  const navigate = useNavigate();
  return (l) => {
    const parts = location.pathname.split('/');
    parts[1] = l;
    navigate(parts.join('/') + location.search);
  };
}

function LangSwitcher() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const switchTo = useLangSwitch();

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="lang-menu" ref={ref}>
      <button
        type="button"
        className="lang-menu__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('header.language')}
        onClick={() => setOpen((o) => !o)}
      >
        <GlobeIcon size={15} />
        {LANG_LABELS[lang]}
        <ChevronDown size={13} />
      </button>
      <ul
        className={`lang-menu__list${open ? ' is-open' : ''}`}
        role="listbox"
        aria-label={t('header.language')}
      >
        {LANGS.map((l) => (
          <li key={l} role="option" aria-selected={l === lang}>
            <button
              type="button"
              lang={l}
              className={`lang-menu__item${l === lang ? ' is-current' : ''}`}
              onClick={() => {
                setOpen(false);
                switchTo(l);
              }}
            >
              {LANG_LABELS[l]}
              {l === lang && <span aria-hidden="true">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Header() {
  const { lang, t } = useI18n();
  const location = useLocation();
  const switchTo = useLangSwitch();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    /* Stay transparent while the scroll-video hero is pinned on screen */
    const onScroll = () =>
      setScrolled(window.scrollY > 40 && !document.body.dataset.heroActive);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close the mobile drawer on navigation */
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isHome =
    location.pathname === `/${lang}` || location.pathname === `/${lang}/`;
  const clear = isHome && !scrolled;

  return (
    <>
      <a className="skip-link" href="#main">{t('header.skip')}</a>
      <header
        className={`header ${clear ? 'header--clear' : 'header--solid'}`}
      >
        <div className="container header__inner">
          <Link className="logo" to={to('', lang)} aria-label={t('brand.name')}>
            <span className="logo__mark">
              <LogoMark />
            </span>
            <span className="logo__name">
              {t('brand.name')}
              <small>{t('brand.latin')}</small>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                to={to(item.path, lang)}
                end={item.path === ''}
                className={({ isActive }) =>
                  `nav__link${isActive ? ' is-active' : ''}`
                }
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <LangSwitcher />
            <a className="header__phone" href={COMPANY.phoneHref}>
              <PhoneIcon size={15} />
              <span className="ltr">{COMPANY.phone}</span>
            </a>
            <Link className="btn btn--sm btn--primary" to={to('/contact', lang)}>
              {t('header.request')}
            </Link>
            <button
              type="button"
              className={`hamburger${menuOpen ? ' is-open' : ''}`}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={to(item.path, lang)}
              end={item.path === ''}
              className={({ isActive }) =>
                `mobile-menu__link${isActive ? ' is-active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {t(`nav.${item.key}`)}
              <ChevronLeft size={18} className="icon-flip" />
            </NavLink>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <Link className="btn btn--gold" to={to('/contact', lang)} onClick={() => setMenuOpen(false)}>
            {t('header.request')}
          </Link>
          <a className="header__phone" href={COMPANY.phoneHref}>
            <PhoneIcon size={16} />
            <span className="ltr">{COMPANY.phone}</span>
          </a>
          <div className="mobile-menu__langs">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                className={l === lang ? 'is-current' : ''}
                onClick={() => switchTo(l)}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

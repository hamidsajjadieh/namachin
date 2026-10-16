import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { fa } from './fa';
import { en } from './en';
import { ar } from './ar';

export const LANGS = ['fa', 'en', 'ar'];
export const DEFAULT_LANG = 'fa';

const dictionaries = { fa, en, ar };
const LOCALES = { fa: 'fa-IR', en: 'en-US', ar: 'ar' };
const DIRS = { fa: 'rtl', en: 'ltr', ar: 'rtl' };

export const LANG_LABELS = { fa: 'فارسی', en: 'English', ar: 'العربية' };

const pick = (obj, key) =>
  key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const LangContext = createContext(null);

export function LangProvider({ lang, children }) {
  const dir = DIRS[lang] ?? 'rtl';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem('nemachin_lang', lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const t = useCallback(
    (key) => pick(dictionaries[lang], key) ?? pick(dictionaries.en, key) ?? key,
    [lang]
  );

  /* Pick a localized field from a shared data record: tr(product.name) */
  const tr = useCallback(
    (obj) => (obj && typeof obj === 'object' && lang in obj ? obj[lang] : obj),
    [lang]
  );

  const nf = useMemo(() => new Intl.NumberFormat(LOCALES[lang]), [lang]);
  const df = useMemo(
    () => new Intl.DateTimeFormat(LOCALES[lang], { year: 'numeric', month: 'long', day: 'numeric' }),
    [lang]
  );

  const fmt = useCallback((n) => nf.format(n), [nf]);
  const fmtDate = useCallback((iso) => df.format(new Date(iso)), [df]);

  const value = useMemo(
    () => ({ lang, dir, locale: LOCALES[lang], t, tr, fmt, fmtDate }),
    [lang, dir, t, tr, fmt, fmtDate]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useI18n must be used within LangProvider');
  return ctx;
}

/* Build a localized href: to('/products', lang) => '/fa/products' */
export const to = (path, lang) => `/${lang}${path === '/' ? '' : path}`;

/* Set document title/description + hreflang alternate links per language */
export function useDocumentMeta(title, description) {
  const { lang } = useI18n();
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
    document.head
      .querySelectorAll('link[data-hreflang]')
      .forEach((n) => n.remove());
    for (const l of LANGS) {
      const link = document.createElement('link');
      const url = new URL(window.location.href);
      const parts = url.pathname.split('/');
      parts[1] = l;
      url.pathname = parts.join('/');
      link.rel = 'alternate';
      link.hreflang = l;
      link.dataset.hreflang = l;
      link.href = url.toString();
      document.head.appendChild(link);
    }
  }, [title, description, lang]);
}

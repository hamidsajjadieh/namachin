import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n, useDocumentMeta } from '../i18n';
import {
  COLORS,
  DIMENSIONS,
  GROUP_KEYS,
  MAX_PRICE,
  PRODUCTS,
  dimLabel,
} from '../data/products';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { ChevronDown, SearchIcon } from '../components/Icons';

const MIN_PRICE = 500000;

export default function Products() {
  const { t, tr, fmt } = useI18n();
  useDocumentMeta(t('meta.products.title'), t('meta.products.desc'));
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get('q') ?? '';
  const group = params.get('group') ?? '';
  const color = params.get('color') ?? '';
  const dim = params.get('dim') ?? '';
  const maxPrice = Number(params.get('max') ?? MAX_PRICE);
  const featured = params.get('fav') === '1';
  const sort = params.get('sort') ?? 'recommended';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = PRODUCTS.filter(
      (p) =>
        (!needle ||
          tr(p.name).toLowerCase().includes(needle) ||
          p.code.toLowerCase().includes(needle)) &&
        (!group || p.group === group) &&
        (!color || p.color === color) &&
        (!dim || dimLabel(p.dims) === dim) &&
        p.price <= maxPrice &&
        (!featured || p.featured)
    );
    if (sort === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'newest') list = [...list].reverse();
    else list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [q, group, color, dim, maxPrice, featured, sort, tr]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('brand.tag')}</p>
          <h1>{t('productsPage.title')}</h1>
          <p>{t('productsPage.sub')}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container catalog">
          {/* ---------- Filters ---------- */}
          <aside
            className={`filters${filtersOpen ? '' : ' is-collapsed'}`}
            aria-label={t('productsPage.filtersToggle')}
          >
            <button
              type="button"
              className="filters-toggle"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((o) => !o)}
            >
              {t('productsPage.filtersToggle')}
              <ChevronDown size={16} />
            </button>

            <div className="filters__group">
              <label className="filters__title" htmlFor="product-search">
                {t('productsPage.searchLabel')}
              </label>
              <div className="search-box">
                <SearchIcon size={16} />
                <input
                  id="product-search"
                  type="search"
                  value={q}
                  placeholder={t('productsPage.searchPlaceholder')}
                  onChange={(e) => setParam('q', e.target.value)}
                />
              </div>
            </div>

            <div className="filters__group">
              <p className="filters__title">{t('productsPage.colorTitle')}</p>
              <div className="swatches">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`swatch${color === c.key ? ' is-active' : ''}`}
                    style={{ background: c.hex }}
                    title={t(`colors.${c.key}`)}
                    aria-label={t(`colors.${c.key}`)}
                    aria-pressed={color === c.key}
                    onClick={() => setParam('color', color === c.key ? '' : c.key)}
                  />
                ))}
              </div>
            </div>

            <div className="filters__group">
              <p className="filters__title">{t('productsPage.groupTitle')}</p>
              <div className="filter-list">
                {GROUP_KEYS.map((g) => (
                  <label key={g}>
                    <input
                      type="checkbox"
                      checked={group === g}
                      onChange={() => setParam('group', group === g ? '' : g)}
                    />
                    {t(`groups.${g}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__group">
              <p className="filters__title">{t('productsPage.dimensionTitle')}</p>
              <div className="filter-list">
                {DIMENSIONS.map((d) => (
                  <label key={d}>
                    <input
                      type="checkbox"
                      checked={dim === d}
                      onChange={() => setParam('dim', dim === d ? '' : d)}
                    />
                    <span className="ltr">{d} mm</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__group">
              <p className="filters__title">
                {t('productsPage.priceTitle')}
                <span className="range-val">{fmt(maxPrice)}</span>
              </p>
              <input
                type="range"
                className="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={50000}
                value={maxPrice}
                aria-label={t('productsPage.priceTitle')}
                onChange={(e) => setParam('max', e.target.value)}
              />
            </div>

            <div className="filters__group">
              <label className="filter-list" style={{ border: 0 }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={() => setParam('fav', featured ? '' : '1')}
                />
                {t('productsPage.featuredOnly')}
              </label>
            </div>

            <button
              type="button"
              className="filters__clear"
              onClick={() => setParams(new URLSearchParams())}
            >
              {t('productsPage.clear')}
            </button>
          </aside>

          {/* ---------- Results ---------- */}
          <div>
            <div className="results-bar">
              <p className="results-bar__count">
                {fmt(results.length)} {t('productsPage.resultsSuffix')}
              </p>
              <label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--ink-3)' }}>
                  {t('productsPage.sortLabel')}
                </span>
                <select
                  value={sort}
                  onChange={(e) => setParam('sort', e.target.value === 'recommended' ? '' : e.target.value)}
                >
                  {Object.entries(t('productsPage.sortOptions')).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {results.length ? (
              <div className="results-grid">
                {results.map((p, i) => (
                  <Reveal key={p.code} delay={(i % 4) * 0.06}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>{t('productsPage.noResults')}</h3>
                <p>{t('productsPage.noResultsHint')}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

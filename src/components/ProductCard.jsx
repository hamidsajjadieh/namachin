import { Link } from 'react-router-dom';
import { useI18n, to } from '../i18n';
import { useFavorites } from './FavoritesProvider';
import { ArrowRight, HeartIcon } from './Icons';

/* Favorite/heart button — floating (cards) or inline (detail page) */
export function FavBtn({ code, variant = 'float', name }) {
  const { t } = useI18n();
  const { isFav, toggle } = useFavorites();
  const active = isFav(code);
  const label = active ? t('detail.favorited') : t('detail.favorite');

  if (variant === 'inline') {
    return (
      <button
        type="button"
        className={`fav-btn fav-btn--inline${active ? ' is-active' : ''}`}
        onClick={() => toggle(code)}
        aria-pressed={active}
        aria-label={`${label} — ${name}`}
      >
        <HeartIcon size={17} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`fav-btn${active ? ' is-active' : ''}`}
      onClick={() => toggle(code)}
      aria-pressed={active}
      aria-label={`${label} — ${name}`}
      title={label}
    >
      <HeartIcon size={18} />
    </button>
  );
}

export default function ProductCard({ product }) {
  const { t, tr, fmt, lang } = useI18n();
  const name = tr(product.name);
  const href = to(`/products/${product.code}`, lang);

  return (
    <article className="card product-card">
      <FavBtn code={product.code} name={name} />
      <Link to={href} className="card__img" tabIndex={-1} aria-hidden="true">
        <img src={product.images[0]} alt="" loading="lazy" />
      </Link>
      <div className="card__body">
        <span
          className="product-card__tag"
          style={{ '--swatch': product.colorHex }}
        >
          {t(`groups.${product.group}`)}
        </span>
        <h3 className="product-card__name">
          <Link to={href}>{name}</Link>
        </h3>
        <p className="product-card__code ltr">{product.code}</p>
        <div className="product-card__foot">
          <span className="product-card__price">
            {fmt(product.price)}{' '}
            <small>{t('detail.perM2')}</small>
          </span>
          <Link to={href} className="article-card__more" aria-label={`${t('common.readMore')} — ${name}`}>
            {t('common.readMore')}
            <ArrowRight size={14} className="icon-flip" />
          </Link>
        </div>
      </div>
    </article>
  );
}

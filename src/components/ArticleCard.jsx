import { Link } from 'react-router-dom';
import { useI18n, to } from '../i18n';
import { ArrowRight, CalendarIcon, ClockIcon } from './Icons';

export default function ArticleCard({ article }) {
  const { t, tr, fmtDate, lang } = useI18n();
  const href = to(`/articles/${article.slug}`, lang);
  const title = tr(article.title);

  return (
    <article className="card article-card">
      <Link to={href} className="card__img" tabIndex={-1} aria-hidden="true">
        <img src={article.image} alt="" loading="lazy" />
      </Link>
      <div className="card__body">
        <p className="article-card__date ltr-context">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <CalendarIcon size={13} />
            {fmtDate(article.date)}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ClockIcon size={13} />
            {article.minutes} {t('articlesPage.readTime')}
          </span>
        </p>
        <h3 className="article-card__title">
          <Link to={href}>{title}</Link>
        </h3>
        <p className="article-card__excerpt">{tr(article.excerpt)}</p>
        <Link to={href} className="article-card__more">
          {t('common.readMore')}
          <ArrowRight size={14} className="icon-flip" />
        </Link>
      </div>
    </article>
  );
}

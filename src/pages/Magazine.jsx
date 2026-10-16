import { Link } from 'react-router-dom';
import { useI18n, useDocumentMeta, to } from '../i18n';
import { ARTICLES } from '../data/articles';
import ArticleCard from '../components/ArticleCard';
import Reveal from '../components/Reveal';
import CtaSection from '../components/CtaSection';
import { ArrowRight, CalendarIcon, ClockIcon } from '../components/Icons';

export default function Magazine() {
  const { t, tr, fmtDate, lang } = useI18n();
  useDocumentMeta(t('meta.magazine.title'), t('meta.magazine.desc'));

  const [featured, ...rest] = ARTICLES;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('nav.magazine')}</p>
          <h1>{t('magazine.title')}</h1>
          <p>{t('magazine.sub')}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          {/* Featured article — editorial split */}
          <Reveal>
            <div className="magazine-hero">
              <Link to={to(`/articles/${featured.slug}`, lang)} className="card__img" aria-hidden="true" tabIndex={-1}>
                <img src={featured.image} alt="" />
              </Link>
              <div className="magazine-hero__text">
                <p className="kicker">{t('magazine.featuredLabel')}</p>
                <h2>
                  <Link to={to(`/articles/${featured.slug}`, lang)}>
                    {tr(featured.title)}
                  </Link>
                </h2>
                <p>{tr(featured.excerpt)}</p>
                <p className="article-meta">
                  <span>
                    <CalendarIcon size={15} />
                    {fmtDate(featured.date)}
                  </span>
                  <span>
                    <ClockIcon size={15} />
                    {featured.minutes} {t('articlesPage.readTime')}
                  </span>
                </p>
                <Link
                  to={to(`/articles/${featured.slug}`, lang)}
                  className="article-card__more"
                >
                  {t('common.readMore')}
                  <ArrowRight size={15} className="icon-flip" />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="articles-grid">
            {rest.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 0.08}>
                <ArticleCard article={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

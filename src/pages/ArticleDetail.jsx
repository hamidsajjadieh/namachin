import { Link, useParams } from 'react-router-dom';
import { useI18n, useDocumentMeta, to } from '../i18n';
import { getArticle } from '../data/articles';
import Breadcrumb from '../components/Breadcrumb';
import CtaSection from '../components/CtaSection';
import Reveal from '../components/Reveal';
import NotFound from './NotFound';
import { ArrowRight, CalendarIcon, ClockIcon } from '../components/Icons';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { t, tr, fmtDate, lang } = useI18n();
  const article = getArticle(slug);

  useDocumentMeta(
    article ? `${tr(article.title)} | ${t('brand.name')}` : t('meta.articles.title'),
    article ? tr(article.excerpt) : t('meta.articles.desc')
  );

  if (!article) return <NotFound />;

  const title = tr(article.title);

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: to('', lang) },
          { label: t('nav.articles'), to: to('/articles', lang) },
          { label: title },
        ]}
      />

      <div className="container" style={{ paddingTop: '0.5rem' }}>
        <div className="article-body" style={{ maxWidth: '860px' }}>
          <Reveal>
            <p className="kicker">{t('nav.articles')}</p>
            <h1 className="title-lg" style={{ marginTop: '0.6rem' }}>
              {title}
            </h1>
            <p className="article-meta">
              <span>
                <CalendarIcon size={15} />
                {fmtDate(article.date)}
              </span>
              <span>
                <ClockIcon size={15} />
                {article.minutes} {t('articlesPage.readTime')}
              </span>
            </p>
          </Reveal>

          <Reveal>
            <div className="article-hero">
              <img src={article.image} alt={title} />
            </div>
          </Reveal>

          <Reveal>
            <div className="article-body">
              {tr(article.body).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>

          <Link to={to('/articles', lang)} className="article-card__more" style={{ marginTop: '1rem' }}>
            {t('articlesPage.backToArticles')}
            <ArrowRight size={15} className="icon-flip" />
          </Link>
        </div>
      </div>

      <CtaSection />
    </>
  );
}

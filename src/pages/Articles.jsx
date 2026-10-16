import { useI18n, useDocumentMeta } from '../i18n';
import { ARTICLES } from '../data/articles';
import ArticleCard from '../components/ArticleCard';
import Reveal from '../components/Reveal';
import CtaSection from '../components/CtaSection';

export default function Articles() {
  const { t } = useI18n();
  useDocumentMeta(t('meta.articles.title'), t('meta.articles.desc'));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('nav.articles')}</p>
          <h1>{t('articlesPage.title')}</h1>
          <p>{t('articlesPage.sub')}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="articles-grid">
            {ARTICLES.map((a, i) => (
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

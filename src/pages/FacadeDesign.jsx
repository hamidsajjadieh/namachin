import { Link } from 'react-router-dom';
import { useI18n, useDocumentMeta, to } from '../i18n';
import { IMG } from '../data/company';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import CtaSection from '../components/CtaSection';
import { ArrowRight } from '../components/Icons';

export default function FacadeDesign() {
  const { t, lang } = useI18n();
  useDocumentMeta(t('meta.facade.title'), t('meta.facade.desc'));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('brand.tag')}</p>
          <h1>{t('facadePage.title')}</h1>
          <p>{t('facadePage.sub')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-grid__text">
            <p className="kicker">{t('facadePage.title')}</p>
            <h2 className="title-lg">{t('facadePage.ctaTitle')}</h2>
            <p>{t('facadePage.ctaSub')}</p>
            <Link className="btn btn--outline" to={to('/contact', lang)}>
              {t('header.request')}
              <ArrowRight size={16} className="icon-flip" />
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="about-images">
            <div className="about-images__main">
              <img src={IMG.facadeHero} alt={t('facadePage.title')} loading="lazy" />
            </div>
            <div className="about-images__secondary">
              <img src={IMG.facadeSecondary} alt="" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--tint" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <SectionHeading title={t('facadePage.title')} />
          <div className="steps">
            {t('facadePage.steps').map((step, i) => (
              <Reveal key={step.title} className="step" delay={i * 0.08}>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

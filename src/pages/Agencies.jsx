import { Link } from 'react-router-dom';
import { useI18n, useDocumentMeta, to } from '../i18n';
import { TEAM } from '../data/team';
import Reveal from '../components/Reveal';
import TeamCard from '../components/TeamCard';
import SectionHeading from '../components/SectionHeading';
import { ArrowRight, HandshakeIcon, TruckIcon } from '../components/Icons';

export default function Agencies() {
  const { t, lang } = useI18n();
  useDocumentMeta(t('meta.agencies.title'), t('meta.agencies.desc'));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('team.label')}</p>
          <h1>{t('agenciesPage.title')}</h1>
          <p>{t('agenciesPage.sub')}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.08}>
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Become an agent */}
      <section className="section section--tint">
        <div className="container about-grid">
          <Reveal className="about-grid__text">
            <p className="kicker">{t('agenciesPage.coverageTitle')}</p>
            <h2 className="title-lg">{t('agenciesPage.becomeTitle')}</h2>
            <p>{t('agenciesPage.becomeDesc')}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--ink-2)' }}>
              <TruckIcon size={18} />
              {t('agenciesPage.coverageDesc')}
            </p>
            <Link className="btn btn--primary" to={to('/contact', lang)}>
              {t('agenciesPage.becomeCta')}
              <ArrowRight size={16} className="icon-flip" />
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="about-images">
            <div className="about-images__main">
              <img
                src="https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt={t('agenciesPage.title')}
                loading="lazy"
              />
            </div>
            <div className="about-images__secondary">
              <img
                src="https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt=""
                loading="lazy"
              />
            </div>
            <span className="float-btn" aria-hidden="true">
              <HandshakeIcon size={24} />
            </span>
          </Reveal>
        </div>
      </section>
    </>
  );
}

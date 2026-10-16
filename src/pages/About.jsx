import { useI18n, useDocumentMeta } from '../i18n';
import { IMG } from '../data/company';
import { TEAM } from '../data/team';
import Reveal from '../components/Reveal';
import TeamCard from '../components/TeamCard';
import SectionHeading from '../components/SectionHeading';
import CtaSection from '../components/CtaSection';
import { CheckIcon } from '../components/Icons';

const VALUE_ICONS = [CheckIcon, CheckIcon, CheckIcon];

export default function About() {
  const { t, fmt } = useI18n();
  useDocumentMeta(t('meta.about.title'), t('meta.about.desc'));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('about.label')}</p>
          <h1>{t('aboutPage.title')}</h1>
          <p>{t('aboutPage.sub')}</p>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-grid__text">
            <p className="kicker">{t('aboutPage.storyTitle')}</p>
            <h2 className="title-lg">{t('about.title')}</h2>
            <p>{t('aboutPage.story1')}</p>
            <p>{t('aboutPage.story2')}</p>
          </Reveal>
          <Reveal delay={0.15} className="about-images">
            <div className="about-images__main">
              <img src={IMG.aboutStory} alt={t('aboutPage.title')} loading="lazy" />
            </div>
            <div className="about-images__secondary">
              <img src={IMG.aboutSecondary} alt="" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="container" aria-label={t('about.label')}>
        <Reveal className="stats">
          {t('about.stats').map((s) => (
            <div key={s.label} className="stats__item">
              <p className="stats__num">
                {fmt(s.value)}
                <em>{s.suffix}</em>
              </p>
              <p className="stats__label">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Values */}
      <section className="section section--tint">
        <div className="container">
          <SectionHeading title={t('aboutPage.valuesTitle')} />
          <div className="values-grid">
            {t('aboutPage.values').map((v, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <Reveal key={v.title} className="value-card" delay={i * 0.08}>
                  {Icon && <Icon size={24} />}
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <SectionHeading
            label={t('team.label')}
            title={t('aboutPage.teamTitle')}
            sub={t('team.sub')}
          />
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.08}>
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

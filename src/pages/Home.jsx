import { Link } from 'react-router-dom';
import { useI18n, useDocumentMeta, to } from '../i18n';
import { IMG } from '../data/company';
import { PROJECTS } from '../data/projects';
import { TEAM } from '../data/team';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Carousel from '../components/Carousel';
import ProjectCard from '../components/ProjectCard';
import TeamCard from '../components/TeamCard';
import CtaSection from '../components/CtaSection';
import ScrollHeroVideo from '../components/ScrollHeroVideo';
import {
  ArrowRight,
  ArrowUpRight,
  CertificateIcon,
  ChartIcon,
  FactoryIcon,
  HandshakeIcon,
  LeafIcon,
  ShieldIcon,
  SupportIcon,
  ToolsIcon,
  TruckIcon,
  WalletIcon,
} from '../components/Icons';

const WHY_ICONS = [FactoryIcon, WalletIcon, SupportIcon, TruckIcon];
const SERVICE_ICONS = [FactoryIcon, ChartIcon, HandshakeIcon, SupportIcon, ToolsIcon];
const BADGE_ICONS = [ShieldIcon, CertificateIcon, LeafIcon];

export default function Home() {
  const { t, fmt, lang } = useI18n();
  useDocumentMeta(t('meta.home.title'), t('meta.home.desc'));

  return (
    <>
      {/* ---------- Hero: scroll-scrubbed 3D video ---------- */}
      <ScrollHeroVideo
        src="/videos/hero-scroll.mp4"
        srcFallback="/videos/hero-scroll.webm"
        poster={IMG.hero}
        alt={t('home.heroTitle')}
        footer={
          <div className="container hero__badges-inner">
            {t('home.badges').map((badge, i) => {
              const Icon = BADGE_ICONS[i];
              return (
                <span key={badge} className="hero-badge">
                  <Icon size={20} />
                  {badge}
                </span>
              );
            })}
          </div>
        }
      >
        <p className="kicker hero__kicker">{t('home.heroKicker')}</p>
        <h1 className="hero__title">{t('home.heroTitle')}</h1>
        <p className="hero__sub">{t('home.heroSub')}</p>
        <div className="hero__cta">
          <Link className="btn btn--light" to={to('/products', lang)}>
            {t('home.heroCta1')}
            <ArrowRight size={16} className="icon-flip" />
          </Link>
          <Link className="btn btn--ghost-light" to={to('/contact', lang)}>
            {t('home.heroCta2')}
          </Link>
        </div>
      </ScrollHeroVideo>

      {/* ---------- Who we are ---------- */}
      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-grid__text">
            <p className="kicker">{t('about.label')}</p>
            <h2 className="title-lg">{t('about.title')}</h2>
            <p>{t('about.body')}</p>
            <Link className="btn btn--outline" to={to('/about', lang)}>
              {t('about.cta')}
              <ArrowRight size={16} className="icon-flip" />
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="about-images">
            <div className="about-images__main">
              <img src={IMG.aboutMain} alt={t('about.title')} loading="lazy" />
            </div>
            <div className="about-images__secondary">
              <img src={IMG.aboutSecondary} alt="" loading="lazy" />
            </div>
            <Link
              className="float-btn"
              to={to('/about', lang)}
              aria-label={t('about.cta')}
            >
              <ArrowUpRight size={22} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
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

      {/* ---------- Featured projects ---------- */}
      <section className="section section--tint">
        <div className="container">
          <SectionHeading
            label={t('featured.label')}
            title={t('featured.title')}
            sub={t('featured.sub')}
          />
          <Reveal>
            <Carousel ariaLabel={t('featured.title')}>
              {PROJECTS.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </Carousel>
          </Reveal>
          <div className="text-center" style={{ marginTop: '2.2rem' }}>
            <Link className="btn btn--outline" to={to('/projects', lang)}>
              {t('featured.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="section">
        <div className="container">
          <SectionHeading
            label={t('services.label')}
            title={t('services.title')}
            sub={t('services.sub')}
          />
          <div className="services-grid">
            {t('services.items').map((item, i) => {
              const Icon = SERVICE_ICONS[i] ?? FactoryIcon;
              return (
                <Reveal
                  key={item.title}
                  className="service-card"
                  delay={(i % 3) * 0.08}
                >
                  <span className="service-card__num">0{i + 1}</span>
                  <Icon size={26} />
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Why choose Nemachin ---------- */}
      <section className="section section--navy">
        <div className="container">
          <SectionHeading
            label={t('why.label')}
            title={t('why.title')}
          />
          <div className="why-grid">
            {t('why.items').map((item, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <Reveal key={item.title} className="why-item" delay={i * 0.08}>
                  <Icon size={28} />
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Agencies / team ---------- */}
      <section className="section">
        <div className="container">
          <SectionHeading
            label={t('team.label')}
            title={t('team.title')}
            sub={t('team.sub')}
          />
          <div className="team-grid">
            {TEAM.map((member, i) => (
              <Reveal key={member.id} delay={i * 0.08}>
                <TeamCard member={member} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <CtaSection />
    </>
  );
}

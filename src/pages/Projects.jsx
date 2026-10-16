import { useI18n, useDocumentMeta } from '../i18n';
import { PROJECTS } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import CtaSection from '../components/CtaSection';

export default function Projects() {
  const { t } = useI18n();
  useDocumentMeta(t('meta.projects.title'), t('meta.projects.desc'));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('featured.label')}</p>
          <h1>{t('projectsPage.title')}</h1>
          <p>{t('projectsPage.sub')}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="projects-grid">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

import { Link } from 'react-router-dom';
import { useI18n, to } from '../i18n';
import { getProduct } from '../data/products';
import { ArrowRight, PinIcon } from './Icons';

export default function ProjectCard({ project }) {
  const { t, tr, fmt, lang } = useI18n();
  const brick = getProduct(project.brickCode);
  const name = tr(project.name);

  const priceText =
    project.priceM == null
      ? t('projectsPage.callForPrice')
      : lang === 'en'
        ? `$${project.priceM}M`
        : `${fmt(project.priceM)} ${t('common.millionUsd')}`;

  return (
    <article className="card project-card">
      <div className="card__img">
        <img src={project.image} alt={name} loading="lazy" />
      </div>
      <div className="project-card__body">
        <h3 className="project-card__name">{name}</h3>
        <ul className="project-card__meta">
          <li>
            <PinIcon size={15} />
            {tr(project.location)}
          </li>
          <li>
            <span aria-hidden="true" style={{ fontSize: '0.85rem' }}>₴</span>
            {priceText}
          </li>
        </ul>
        {brick && (
          <Link
            className="project-card__brick"
            to={to(`/products/${brick.code}`, lang)}
          >
            {t('projectsPage.brickUsed')}: {tr(brick.name)}
            <ArrowRight size={13} className="icon-flip" />
          </Link>
        )}
      </div>
    </article>
  );
}

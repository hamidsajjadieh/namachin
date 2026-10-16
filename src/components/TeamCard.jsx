import { useI18n } from '../i18n';
import { COMPANY } from '../data/company';
import { MailIcon, PhoneIcon } from './Icons';

export default function TeamCard({ member }) {
  const { tr } = useI18n();
  const name = tr(member.name);

  return (
    <article className="card team-card">
      <div className="card__img">
        <img src={member.image} alt={name} loading="lazy" />
      </div>
      <div className="team-card__body">
        <h3 className="team-card__name">{name}</h3>
        <p className="team-card__role">{tr(member.role)}</p>
        <div className="team-card__contact">
          <a href={COMPANY.phoneHref} aria-label={`${name} — ${COMPANY.phone}`}>
            <PhoneIcon size={15} />
          </a>
          <a href={COMPANY.emailHref} aria-label={`${name} — ${COMPANY.email}`}>
            <MailIcon size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
